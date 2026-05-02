import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: { default: 'StayFlow', template: '%s — StayFlow' },
  description: 'Personal productivity dashboard',
  applicationName: 'StayFlow',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0eee9' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1612' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
