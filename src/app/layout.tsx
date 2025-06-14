import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/AuthHandlerMCP'
import MobileNavigation from '@/components/MobileNavigation'
import CreditsBadge from '@/components/CreditsBadge'
import { Toaster } from 'react-hot-toast'
import QueryProvider from '@/providers/QueryProvider'
import IntlProvider from '@/providers/IntlProvider'
import ConditionalFooter from '@/components/ConditionalFooter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BodyCount - Votre journal intime privé',
  description: 'Votre journal intime numérique privé pour la croissance personnelle et l\'auto-réflexion. Documentez vos expériences intimes, confessions et évolution personnelle en toute confidentialité.',
  keywords: ['journal intime', 'croissance personnelle', 'confessions', 'développement personnel', 'IA', 'réflexion', 'privé'],
  authors: [{ name: 'BodyCount Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'BodyCount - Votre journal intime privé',
    description: 'Votre journal intime numérique privé pour la croissance personnelle et l\'auto-réflexion. Documentez vos expériences intimes, confessions et évolution personnelle en toute confidentialité.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'BodyCount',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BodyCount - Votre journal intime privé',
    description: 'Votre journal intime numérique privé pour la croissance personnelle et l\'auto-réflexion. Documentez vos expériences intimes, confessions et évolution personnelle en toute confidentialité.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <QueryProvider>
          <IntlProvider>
            <AuthProvider>
              <MobileNavigation />
              <CreditsBadge />
              {children}
              <ConditionalFooter />
              <Toaster 
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </AuthProvider>
          </IntlProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
