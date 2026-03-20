import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'CIV Portfolio', description: 'CIV Portfolio Management' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', background: '#0a0a0f' }}>
        <nav style={{ background: '#13131a', borderBottom: '1px solid #2a2a3a', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ background: '#22c55e', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#000', fontWeight: 800, fontSize: 16 }}>C</span>
            </div>
            <span style={{ color: '#f0f0f5', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>CIV</span>
          </a>
          <span style={{ color: '#2a2a3a' }}>|</span>
          <span style={{ color: '#8888aa', fontSize: 14 }}>Portfolio</span>
        </nav>
        <main style={{ padding: '32px', maxWidth: 1280, margin: '0 auto' }}>{children}</main>
      </body>
    </html>
  )
}
