import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: { default: 'StayFlow', template: '%s — StayFlow' },
  description: 'Personal productivity dashboard',
  applicationName: 'StayFlow',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f18' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
