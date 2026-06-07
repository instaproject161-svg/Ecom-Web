import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: { default: 'Ecom-Web - Premium Online Shopping', template: '%s | Ecom-Web' },
  description: 'Discover premium products at unbeatable prices.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen">
        <Providers>
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
