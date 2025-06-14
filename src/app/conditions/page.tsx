'use client'

import Link from 'next/link'
import { FormattedMessage, useIntl } from 'react-intl'
import LanguageSelector from '@/components/LanguageSelector'
import { 
  ArrowLeft,
  FileText,
  Shield,
  Users,
  CreditCard,
  AlertTriangle,
  Check,
  X,
  Scale,
  Globe,
  Mail,
  Calendar,
  Lock,
  Heart,
  Gavel,
  Info,
  UserCheck,
  Ban,
  RefreshCw,
  Eye,
  Coins
} from 'lucide-react'

export default function TermsPage() {
  const intl = useIntl()

  const serviceFeatures = [
    {
      feature: intl.formatMessage({ id: 'termsPage.serviceDescription.features.privateJournal.feature' }),
      description: intl.formatMessage({ id: 'termsPage.serviceDescription.features.privateJournal.description' }),
      icon: Lock
    },
    {
      feature: intl.formatMessage({ id: 'termsPage.serviceDescription.features.anonymousConfessions.feature' }),
      description: intl.formatMessage({ id: 'termsPage.serviceDescription.features.anonymousConfessions.description' }),
      icon: Eye
    },
    {
      feature: intl.formatMessage({ id: 'termsPage.serviceDescription.features.aiAnalysis.feature' }),
      description: intl.formatMessage({ id: 'termsPage.serviceDescription.features.aiAnalysis.description' }),
      icon: Heart
    },
    {
      feature: intl.formatMessage({ id: 'termsPage.serviceDescription.features.creditSystem.feature' }),
      description: intl.formatMessage({ id: 'termsPage.serviceDescription.features.creditSystem.description' }),
      icon: Coins
    }
  ]

  const userObligations = [
    {
      title: intl.formatMessage({ id: 'termsPage.userObligations.responsibleUse.title' }),
      description: intl.formatMessage({ id: 'termsPage.userObligations.responsibleUse.description' }),
      icon: UserCheck,
      details: intl.formatMessage({ id: 'termsPage.userObligations.responsibleUse.details' }).split('|')
    },
    {
      title: intl.formatMessage({ id: 'termsPage.userObligations.authenticContent.title' }),
      description: intl.formatMessage({ id: 'termsPage.userObligations.authenticContent.description' }),
      icon: Check,
      details: intl.formatMessage({ id: 'termsPage.userObligations.authenticContent.details' }).split('|')
    },
    {
      title: intl.formatMessage({ id: 'termsPage.userObligations.accountSecurity.title' }),
      description: intl.formatMessage({ id: 'termsPage.userObligations.accountSecurity.description' }),
      icon: Shield,
      details: intl.formatMessage({ id: 'termsPage.userObligations.accountSecurity.details' }).split('|')
    }
  ]

  const prohibitedUses = intl.formatMessage({ id: 'termsPage.prohibitedUses.list' }).split('|')

  const paymentTerms = [
    {
      aspect: intl.formatMessage({ id: 'termsPage.paymentTerms.payment.aspect' }),
      description: intl.formatMessage({ id: 'termsPage.paymentTerms.payment.description' }),
      details: intl.formatMessage({ id: 'termsPage.paymentTerms.payment.details' }).split('|')
    },
    {
      aspect: intl.formatMessage({ id: 'termsPage.paymentTerms.credits.aspect' }),
      description: intl.formatMessage({ id: 'termsPage.paymentTerms.credits.description' }),
      details: intl.formatMessage({ id: 'termsPage.paymentTerms.credits.details' }).split('|')
    },
    {
      aspect: intl.formatMessage({ id: 'termsPage.paymentTerms.refunds.aspect' }),
      description: intl.formatMessage({ id: 'termsPage.paymentTerms.refunds.description' }),
      details: intl.formatMessage({ id: 'termsPage.paymentTerms.refunds.details' }).split('|')
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/" 
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FormattedMessage id="termsPage.header.backToHome" />
            </Link>
            <LanguageSelector />
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              <FormattedMessage id="termsPage.header.title" />
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              <FormattedMessage id="termsPage.header.subtitle" />
            </p>
            <div className="mt-6 text-sm text-purple-200">
              <p><FormattedMessage id="termsPage.header.lastUpdate" /></p>
              <p><FormattedMessage id="termsPage.header.effectiveDate" /></p>
            </div>
          </div>
        </div>
      </header>

      {/* Introduction */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 mb-12">
            <div className="flex items-start space-x-4">
              <Info className="h-8 w-8 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  <FormattedMessage id="termsPage.introduction.welcome" />
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <FormattedMessage id="termsPage.introduction.description" />
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="termsPage.introduction.acceptance" />
                </p>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              1. <FormattedMessage id="termsPage.serviceDescription.title" />
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              <FormattedMessage id="termsPage.serviceDescription.description" />
            </p>
          </div>
        </div>
      </section>

      {/* Fonctionnalités du service */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="termsPage.additionalSections.servicesTitle" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="termsPage.additionalSections.servicesSubtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-lg">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-full w-fit mx-auto mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.feature}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comptes utilisateurs */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            2. <FormattedMessage id="termsPage.additionalSections.userAccountsTitle" />
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <UserCheck className="h-6 w-6 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  <FormattedMessage id="termsPage.additionalSections.accountCreation.title" />
                </h3>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                {intl.formatMessage({ id: 'termsPage.additionalSections.accountCreation.requirements' }).split('|').map((requirement, index) => (
                  <li key={index}>• {requirement}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="h-6 w-6 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  <FormattedMessage id="termsPage.additionalSections.intellectualProperty.title" />
                </h3>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                {intl.formatMessage({ id: 'termsPage.additionalSections.intellectualProperty.rights' }).split('|').map((right, index) => (
                  <li key={index}>• {right}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Obligations utilisateur */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              3. <FormattedMessage id="termsPage.userObligations.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="termsPage.userObligations.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userObligations.map((obligation, index) => {
              const Icon = obligation.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                      <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {obligation.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    {obligation.description}
                  </p>
                  <ul className="space-y-2">
                    {obligation.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Utilisations interdites */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            4. <FormattedMessage id="termsPage.prohibitedUses.title" />
          </h2>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-3 mb-6">
              <Ban className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-200">
                  <FormattedMessage id="termsPage.additionalSections.prohibitedUsesWarning" />
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  <FormattedMessage id="termsPage.additionalSections.prohibitedUsesDescription" />
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {prohibitedUses.map((use, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-800 dark:text-red-200">{use}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Conditions de paiement */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              5. <FormattedMessage id="termsPage.additionalSections.creditSystemTitle" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="termsPage.additionalSections.creditSystemSubtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {paymentTerms.map((term, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {term.aspect}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  {term.description}
                </p>
                <ul className="space-y-2">
                  {term.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Limitations et responsabilité */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                6. <FormattedMessage id="termsPage.additionalSections.liabilityTitle" />
              </h2>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
                <div className="space-y-3 text-sm text-amber-800 dark:text-amber-200">
                  {intl.formatMessage({ id: 'termsPage.additionalSections.liabilityConditions' }).split('|').map((condition, index) => (
                    <p key={index}>• {condition}</p>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                7. <FormattedMessage id="termsPage.additionalSections.terminationTitle" />
              </h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <RefreshCw className="h-8 w-8 text-blue-500 mb-4" />
                <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                  {intl.formatMessage({ id: 'termsPage.additionalSections.terminationConditions' }).split('|').map((condition, index) => (
                    <p key={index}>• {condition}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loi applicable et juridiction */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Scale className="h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  8. <FormattedMessage id="termsPage.additionalSections.applicableLawTitle" />
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                {intl.formatMessage({ id: 'termsPage.additionalSections.applicableLawDescription' }).split('.').filter(item => item.trim()).map((text, index) => (
                  <p key={index}>{text.trim()}.</p>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  9. <FormattedMessage id="termsPage.additionalSections.modificationsTitle" />
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                {intl.formatMessage({ id: 'termsPage.additionalSections.modificationsDescription' }).split('.').filter(item => item.trim()).map((text, index) => (
                  <p key={index}>{text.trim()}.</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              10. <FormattedMessage id="termsPage.additionalSections.contactTitle" />
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              <FormattedMessage id="termsPage.additionalSections.contactDescription" />
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 justify-center">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    <FormattedMessage id="termsPage.additionalSections.generalQuestions" />
                  </p>
                  <a href="mailto:legal@bodycount.app" className="text-blue-600 dark:text-blue-400 hover:underline">
                    legal@bodycount.app
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 justify-center">
                <Gavel className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    <FormattedMessage id="termsPage.additionalSections.legalAffairs" />
                  </p>
                  <a href="mailto:support@bodycount.app" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@bodycount.app
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {intl.formatMessage({ id: 'termsPage.additionalSections.companyInfo' }).split('|').map((info, index) => (
                  <div key={index}>
                    {index === 0 ? <strong>{info}</strong> : info}
                    {index < 2 && <br />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            <FormattedMessage id="termsPage.additionalSections.callToActionTitle" />
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            <FormattedMessage id="termsPage.additionalSections.callToActionDescription" />
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/auth" 
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FormattedMessage id="termsPage.additionalSections.createAccount" />
            </Link>
            <Link
              href="/confidentialite"
              className="text-gray-300 hover:text-white transition-colors underline"
            >
              <FormattedMessage id="termsPage.additionalSections.privacyPolicy" />
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-400">
            <p><FormattedMessage id="termsPage.additionalSections.features" /></p>
          </div>
        </div>
      </section>
    </div>
  )
} 