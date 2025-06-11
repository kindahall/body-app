'use client'

import Link from 'next/link'
import { 
  Shield, 
  Lock, 
  Heart, 
  Star, 
  Download, 
  Check, 
  ArrowRight, 
  Smartphone, 
  Zap, 
  Users,
  Mail,
  BookOpen,
  Eye
} from 'lucide-react'
import { FormattedMessage } from 'react-intl'

// Dynamic imports for heavy components
import ScreenshotsCarousel from '@/components/landing/ScreenshotsCarousel'
import FAQAccordion from '@/components/landing/FAQAccordion'
import CookieConsent from '@/components/landing/CookieConsent'
import OptimizedImage from '@/components/ui/OptimizedImage'
import LanguageSelector from '@/components/LanguageSelector'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Top Bar */}
      <header className="w-full px-4 py-3 flex justify-between items-center">
        <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          <FormattedMessage id="app.version" />
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <Link 
            href="/auth" 
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            <FormattedMessage id="auth.login" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-sky-500/10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Brand Name */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                BodyCount
              </h1>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-white/30 dark:border-gray-600/30">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <FormattedMessage id="app.subtitle" />
              </span>
            </div>
          </div>
          
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            <FormattedMessage id="app.description" />
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link 
              href="/auth" 
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FormattedMessage id="buttons.getStarted" />
            </Link>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium">30 <FormattedMessage id="credits.free" /></span>
            </div>
          </div>
          
          {/* Hero Screenshot */}
          <div className="mt-16 relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
              <OptimizedImage 
                src="/hero.png" 
                alt="Capture d'écran de l'application BodyCount - Tableau de bord de l'application montrant les fonctionnalités principales"
                width={1200}
                height={800}
                priority
                quality={90}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
                placeholder="blur"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="px-4 py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            <FormattedMessage id="features.title" />
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Heart className="w-12 h-12 text-pink-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                <FormattedMessage id="features.confessions.title" />
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                <FormattedMessage id="features.confessions.description" />
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <BookOpen className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                <FormattedMessage id="features.journal.title" />
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                <FormattedMessage id="features.journal.description" />
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Eye className="w-12 h-12 text-sky-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                <FormattedMessage id="features.mirror.title" />
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                <FormattedMessage id="features.mirror.description" />
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Star className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                <FormattedMessage id="features.wishlist.title" />
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                <FormattedMessage id="features.wishlist.description" />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Apps Coming Soon */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-8" />
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            <FormattedMessage id="mobile.title" />
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            <FormattedMessage id="mobile.description" />
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">📱</span>
              </div>
              <div className="text-left">
                <div className="text-xs"><FormattedMessage id="mobile.appStore" /></div>
                <div className="font-semibold"><FormattedMessage id="mobile.appStoreName" /></div>
              </div>
            </div>
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">▶</span>
              </div>
              <div className="text-left">
                <div className="text-xs"><FormattedMessage id="mobile.googlePlay" /></div>
                <div className="font-semibold"><FormattedMessage id="mobile.googlePlayName" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Carousel */}
      <section className="px-4 py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            <FormattedMessage id="screenshots.title" />
          </h2>
          <ScreenshotsCarousel />
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            <FormattedMessage id="pricing.title" />
          </h2>
          
          {/* Système d'explication des crédits */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 mb-12 border border-yellow-200 dark:border-yellow-800">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                <FormattedMessage id="pricing.howItWorks" />
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                <FormattedMessage id="pricing.description" />
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">30</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <FormattedMessage id="pricing.startingCredits" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">10</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <FormattedMessage id="pricing.creditsPerAnalysis" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">+1</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <FormattedMessage id="pricing.freeCreditsDaily" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <FormattedMessage id="pricing.bonus" />
              </p>
            </div>
          </div>

          {/* Packs de crédits */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Pack Petit */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  <FormattedMessage id="pricing.smallPack" />
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <FormattedMessage id="pricing.smallPackDescription" />
                </p>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  4,99€
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  50 <FormattedMessage id="credits.credits" />
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    5 <FormattedMessage id="pricing.features.aiAnalyses" />
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <FormattedMessage id="pricing.features.noExpiration" />
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <FormattedMessage id="pricing.features.oneTimePurchase" />
                  </span>
                </li>
              </ul>
              <Link 
                href="/auth" 
                className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-colors"
              >
                <FormattedMessage id="buttons.buy" />
              </Link>
            </div>

            {/* Pack Moyen - Populaire */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 rounded-2xl shadow-xl text-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                <FormattedMessage id="pricing.popular" />
              </div>
              <div className="text-center">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👑</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  <FormattedMessage id="pricing.mediumPack" />
                </h3>
                <p className="opacity-90 mb-4">
                  <FormattedMessage id="pricing.mediumPackDescription" />
                </p>
                <div className="text-4xl font-bold mb-2">
                  11,99€
                </div>
                <div className="text-lg opacity-90 mb-6">
                  150 <FormattedMessage id="credits.credits" />
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-white" />
                  <span>15 <FormattedMessage id="pricing.features.aiAnalyses" /></span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-white" />
                  <span><FormattedMessage id="pricing.features.bestValue" /></span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-white" />
                  <span><FormattedMessage id="pricing.features.noSubscription" /></span>
                </li>
              </ul>
              <Link 
                href="/auth" 
                className="block w-full text-center bg-white text-purple-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <FormattedMessage id="buttons.buy" />
              </Link>
            </div>

            {/* Pack Grand */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  <FormattedMessage id="pricing.largePack" />
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <FormattedMessage id="pricing.largePackDescription" />
                </p>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  29,99€
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  500 <FormattedMessage id="credits.credits" />
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    50 <FormattedMessage id="pricing.features.aiAnalyses" />
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <FormattedMessage id="pricing.features.maxSavings" />
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    <FormattedMessage id="pricing.features.advancedUsers" />
                  </span>
                </li>
              </ul>
              <Link 
                href="/auth" 
                className="block w-full text-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors"
              >
                <FormattedMessage id="buttons.buy" />
              </Link>
            </div>
          </div>

          {/* Note importante */}
          <div className="mt-12 text-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                <FormattedMessage id="freeSection.title" />
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                <FormattedMessage id="freeSection.description" />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            <FormattedMessage id="faq.title" />
          </h2>
          <FAQAccordion />
        </div>
      </section>

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  )
}
