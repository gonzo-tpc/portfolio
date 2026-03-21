import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'CIV Portfolio', description: 'CIV Portfolio Management' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', background: '#0a0a0f' }}>
        <nav style={{ background: '#13131a', borderBottom: '1px solid #2a2a3a', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/civ-logo.png" alt="CIV" style={{ height: 28, width: 'auto' }} />
          </a>
          <span style={{ color: '#2a2a3a' }}>|</span>
          <span style={{ color: '#8888aa', fontSize: 14 }}>Portfolio</span>
        </nav>
        <main style={{ padding: '32px', maxWidth: 1280, margin: '0 auto' }}>{children}</main>
      </body>
    </html>
  )
}
