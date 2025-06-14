'use client'

import Link from 'next/link'
import { FormattedMessage } from 'react-intl'
import { Mail } from 'lucide-react'

export default function Footer() {
  return (
    <>
      {/* Footer */}
      <footer className="px-4 py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BodyCount</h3>
              <p className="text-gray-400">
                <FormattedMessage id="footer.description" />
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4"><FormattedMessage id="menu.product" /></h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/fonctionnalites" className="hover:text-white transition-colors"><FormattedMessage id="menu.features" /></Link></li>
                <li><Link href="/tarifs" className="hover:text-white transition-colors"><FormattedMessage id="menu.pricing" /></Link></li>
                <li><Link href="/securite" className="hover:text-white transition-colors"><FormattedMessage id="menu.security" /></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4"><FormattedMessage id="menu.company" /></h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/a-propos" className="hover:text-white transition-colors"><FormattedMessage id="menu.about" /></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4"><FormattedMessage id="menu.legal" /></h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/confidentialite" className="hover:text-white transition-colors"><FormattedMessage id="menu.privacy" /></Link></li>
                <li><Link href="/conditions" className="hover:text-white transition-colors"><FormattedMessage id="menu.terms" /></Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors"><FormattedMessage id="menu.support" /></Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              <FormattedMessage id="footer.copyright" />
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="https://twitter.com/bodycount_app" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </Link>
              <Link href="https://instagram.com/bodycount_app" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Instagram
              </Link>
              <Link href="https://discord.gg/bodycount" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Discord
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Feedback Badge */}
      <Link 
        href="mailto:feedback@bodycount.app" 
        className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
      >
        <Mail className="w-6 h-6" />
      </Link>
    </>
  )
} 