import type { Metadata } from 'next'
import Image from 'next/image'
import './globals.css'
export const metadata: Metadata = { title: 'CIV Portfolio', description: 'CIV Portfolio Management' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', background: '#0a0a0f' }}>
        <nav style={{ background: 'linear-gradient(180deg, #0d0d14 0%, #0a0a0f 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12, backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <Image src="/civ-logo.png" alt="CIV" width={80} height={28} priority style={{ height: 28, width: 'auto', background: '#000', padding: '4px 8px', borderRadius: 6 }} />
          </a>
          <span style={{ color: '#2a2a3a' }}>|</span>
          <span style={{ color: '#8888aa', fontSize: 14 }}>Portfolio</span>
        </nav>
        <main style={{ padding: '32px', maxWidth: 1280, margin: '0 auto' }}>{children}</main>
      </body>
    </html>
  )
}
