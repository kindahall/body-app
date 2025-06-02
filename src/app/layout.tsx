import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/AuthHandlerMCP'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BodyCount - Track Your Relationships',
  description: 'A modern app to track romantic, sexual, and friendship relationships with AI-powered insights.',
  keywords: ['relationships', 'dating', 'tracking', 'insights', 'AI'],
  authors: [{ name: 'BodyCount Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#ec4899',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'BodyCount - Track Your Relationships',
    description: 'A modern app to track romantic, sexual, and friendship relationships with AI-powered insights.',
    type: 'website',
    locale: 'en_US',
    siteName: 'BodyCount',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BodyCount - Track Your Relationships',
    description: 'A modern app to track romantic, sexual, and friendship relationships with AI-powered insights.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
