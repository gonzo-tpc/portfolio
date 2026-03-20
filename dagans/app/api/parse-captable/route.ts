import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { headers, rows, companyId, companyName } = await req.json()

    if (!headers || !rows) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
    }

    const tablePreview = [
      headers.join(' | '),
      '---',
      ...rows.slice(0, 30).map((row: Record<string, unknown>) =>
        headers.map((h: string) => String(row[h] ?? '')).join(' | ')
      )
    ].join('\n')

    const prompt = `You are analyzing a venture capital cap table or investment document. Extract the key investment data from this spreadsheet.

Company context: ${companyName || companyId || 'unknown'}

Spreadsheet data:
${tablePreview}

Extract and return a JSON object with this exact structure. Use null for any field you cannot determine with reasonable confidence, and add a "flags" array with questions for any uncertain fields.

{
  "company_name": "string or null",
  "round_name": "string (e.g. Seed, Series A, Series B) or null",
  "date": "YYYY-MM-DD or null",
  "security_type": "SAFE, Note, Preferred, Common, or null",
  "round_size": number or null,
  "civ_amount": number or null (the amount THIS fund invested),
  "post_money_valuation": number or null,
  "civ_ownership_pct": number or null (percentage, e.g. 5.2 not 0.052),
  "civ_shares": number or null,
  "pps": number or null (price per share),
  "current_mark": number or null (current value of investment),
  "co_investors": [
    { "name": "string", "amount": number or null, "ownership_pct": number or null }
  ],
  "flags": [
    { "field": "field_name", "question": "What does X mean?", "options": ["option1", "option2"] }
  ],
  "confidence": "high" | "medium" | "low",
  "notes": "any other observations about the data"
}`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response' }, { status: 500 })
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response', raw: content.text }, { status: 500 })
    }

    const extracted = JSON.parse(jsonMatch[0])
    return NextResponse.json({ success: true, data: extracted })

  } catch (err) {
    console.error('parse-captable error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
