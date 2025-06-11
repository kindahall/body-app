'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import LanguageSelector from '@/components/LanguageSelector'
import { 
  ArrowLeft,
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  BookOpen,
  Shield,
  CreditCard,
  User,
  Settings,
  Bug,
  Heart,
  ChevronDown,
  ChevronUp,
  Send,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Lightbulb,
  FileText,
  Video,
  Download,
  Zap
} from 'lucide-react'

export default function SupportPage() {
  const intl = useIntl()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  })

  const supportCategories = [
    {
      category: intl.formatMessage({ id: 'supportPage.categories.gettingStarted.category' }),
      description: intl.formatMessage({ id: 'supportPage.categories.gettingStarted.description' }),
      icon: BookOpen,
      color: "blue",
      topics: intl.formatMessage({ id: 'supportPage.categories.gettingStarted.topics' }).split('|')
    },
    {
      category: intl.formatMessage({ id: 'supportPage.categories.accountSecurity.category' }),
      description: intl.formatMessage({ id: 'supportPage.categories.accountSecurity.description' }),
      icon: Shield,
      color: "green",
      topics: intl.formatMessage({ id: 'supportPage.categories.accountSecurity.topics' }).split('|')
    },
    {
      category: intl.formatMessage({ id: 'supportPage.categories.creditsPayments.category' }),
      description: intl.formatMessage({ id: 'supportPage.categories.creditsPayments.description' }),
      icon: CreditCard,
      color: "purple",
      topics: intl.formatMessage({ id: 'supportPage.categories.creditsPayments.topics' }).split('|')
    },
    {
      category: intl.formatMessage({ id: 'supportPage.categories.features.category' }),
      description: intl.formatMessage({ id: 'supportPage.categories.features.description' }),
      icon: Settings,
      color: "orange",
      topics: intl.formatMessage({ id: 'supportPage.categories.features.topics' }).split('|')
    },
    {
      category: intl.formatMessage({ id: 'supportPage.categories.technical.category' }),
      description: intl.formatMessage({ id: 'supportPage.categories.technical.description' }),
      icon: Bug,
      color: "red",
      topics: intl.formatMessage({ id: 'supportPage.categories.technical.topics' }).split('|')
    },
    {
      category: intl.formatMessage({ id: 'supportPage.categories.wellbeing.category' }),
      description: intl.formatMessage({ id: 'supportPage.categories.wellbeing.description' }),
      icon: Heart,
      color: "pink",
      topics: intl.formatMessage({ id: 'supportPage.categories.wellbeing.topics' }).split('|')
    }
  ]

  const faqData = [
    {
      category: intl.formatMessage({ id: 'supportPage.faq.categories.general' }),
      questions: [
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.general.q1.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.general.q1.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.general.q2.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.general.q2.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.general.q3.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.general.q3.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.general.q4.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.general.q4.answer' })
        }
      ]
    },
    {
      category: intl.formatMessage({ id: 'supportPage.faq.categories.account' }),
      questions: [
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.account.q1.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.account.q1.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.account.q2.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.account.q2.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.account.q3.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.account.q3.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.account.q4.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.account.q4.answer' })
        }
      ]
    },
    {
      category: intl.formatMessage({ id: 'supportPage.faq.categories.credits' }),
      questions: [
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.credits.q1.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.credits.q1.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.credits.q2.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.credits.q2.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.credits.q3.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.credits.q3.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.credits.q4.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.credits.q4.answer' })
        }
      ]
    },
    {
      category: intl.formatMessage({ id: 'supportPage.faq.categories.technical' }),
      questions: [
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.technical.q1.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.technical.q1.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.technical.q2.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.technical.q2.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.technical.q3.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.technical.q3.answer' })
        },
        {
          question: intl.formatMessage({ id: 'supportPage.faq.questions.technical.q4.question' }),
          answer: intl.formatMessage({ id: 'supportPage.faq.questions.technical.q4.answer' })
        }
      ]
    }
  ]

  const quickLinks: Array<{
    title: string;
    description: string;
    icon: any;
    color: string;
    link?: string;
    action?: string;
  }> = [
    {
      title: intl.formatMessage({ id: 'supportPage.quickLinks.guideStart' }),
      description: intl.formatMessage({ id: 'supportPage.quickLinks.guideStartDesc' }),
      icon: BookOpen,
      action: "guide-start",
      color: "blue"
    },
    {
      title: intl.formatMessage({ id: 'supportPage.quickLinks.securityCenter' }),
      description: intl.formatMessage({ id: 'supportPage.quickLinks.securityCenterDesc' }),
      icon: Shield,
      action: "security-center",
      color: "green"
    },
    {
      title: intl.formatMessage({ id: 'supportPage.quickLinks.privacyPolicy' }),
      description: intl.formatMessage({ id: 'supportPage.quickLinks.privacyPolicyDesc' }),
      icon: FileText,
      link: "/confidentialite",
      color: "purple"
    },
    {
      title: intl.formatMessage({ id: 'supportPage.quickLinks.termsOfService' }),
      description: intl.formatMessage({ id: 'supportPage.quickLinks.termsOfServiceDesc' }),
      icon: FileText,
      link: "/conditions",
      color: "orange"
    },
    {
      title: intl.formatMessage({ id: 'supportPage.quickLinks.videoTutorials' }),
      description: intl.formatMessage({ id: 'supportPage.quickLinks.videoTutorialsDesc' }),
      icon: Video,
      action: "tutorials",
      color: "red"
    },
    {
      title: intl.formatMessage({ id: 'supportPage.quickLinks.apiDocumentation' }),
      description: intl.formatMessage({ id: 'supportPage.quickLinks.apiDocumentationDesc' }),
      icon: ExternalLink,
      action: "api-docs",
      color: "gray"
    }
  ]

  const contactMethods = [
    {
      method: intl.formatMessage({ id: 'supportPage.contactMethods.emailSupport' }),
      description: intl.formatMessage({ id: 'supportPage.contactMethods.emailSupportDesc' }),
      icon: Mail,
      contact: "support@bodycount.app",
      availability: intl.formatMessage({ id: 'supportPage.contactMethods.emailSupportAvailability' })
    },
    {
      method: intl.formatMessage({ id: 'supportPage.contactMethods.emailUrgency' }),
      description: intl.formatMessage({ id: 'supportPage.contactMethods.emailUrgencyDesc' }),
      icon: AlertCircle,
      contact: "security@bodycount.app",
      availability: intl.formatMessage({ id: 'supportPage.contactMethods.emailUrgencyAvailability' })
    },
    {
      method: intl.formatMessage({ id: 'supportPage.contactMethods.liveChat' }),
      description: intl.formatMessage({ id: 'supportPage.contactMethods.liveChatDesc' }),
      icon: MessageCircle,
      contact: intl.formatMessage({ id: 'supportPage.contactMethods.liveChatContact' }),
      availability: intl.formatMessage({ id: 'supportPage.contactMethods.liveChatAvailability' })
    }
  ]

  const filteredFaqs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(faq => 
      searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simuler l'envoi du formulaire via email
      const emailBody = `
Nouveau message de support depuis BodyCount

Nom: ${contactForm.name}
Email: ${contactForm.email}
Catégorie: ${contactForm.category}
Sujet: ${contactForm.subject}

Message:
${contactForm.message}

---
Envoyé depuis le centre d'aide BodyCount
Date: ${new Date().toLocaleString('fr-FR')}
      `.trim()

      const mailtoLink = `mailto:support@bodycount.app?subject=${encodeURIComponent(`[${contactForm.category.toUpperCase()}] ${contactForm.subject}`)}&body=${encodeURIComponent(emailBody)}`
      
      // Ouvrir le client email
      window.open(mailtoLink)
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSubmitMessage(intl.formatMessage({ id: 'supportPage.contact.form.successMessage' }))
      
      // Reset du formulaire après succès
      setTimeout(() => {
        setContactForm({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: 'general'
        })
        setSubmitMessage('')
      }, 5000)
      
    } catch (error) {
      setSubmitMessage(intl.formatMessage({ id: 'supportPage.contact.form.errorMessage' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'reset-password':
        window.open('/auth?action=reset', '_blank')
        break
      case 'download-data':
        window.open('/settings?tab=data', '_blank')
        break
      case 'security-center':
        window.open('/settings?tab=account', '_blank')
        break
      case 'buy-credits':
        window.open('/credits', '_blank')
        break
      case 'guide-start':
        setSubmitMessage('📖 Le guide de démarrage sera bientôt disponible !')
        setTimeout(() => setSubmitMessage(''), 3000)
        break
      case 'tutorials':
        setSubmitMessage('🎥 Les tutoriels vidéo arrivent bientôt !')
        setTimeout(() => setSubmitMessage(''), 3000)
        break
      case 'api-docs':
        setSubmitMessage('🔧 Documentation API en préparation pour 2025')
        setTimeout(() => setSubmitMessage(''), 3000)
        break
      case 'discord':
        window.open('https://discord.gg/bodycount', '_blank')
        break
      case 'live-chat':
        setSubmitMessage('💬 Chat en direct bientôt disponible ! En attendant, utilisez le formulaire ci-dessous.')
        setTimeout(() => setSubmitMessage(''), 4000)
        break
      default:
        break
    }
  }

  const handleCategoryClick = (category: string) => {
    // Filter FAQs by category
    const categoryMap: { [key: string]: string } = {
      'Prise en Main': 'Général',
      'Compte et Sécurité': 'Compte', 
      'Crédits et Paiements': 'Crédits',
      'Fonctionnalités': 'Technique',
      'Problème Technique': 'Technique',
      'Bien-être': 'Général'
    }
    
    const faqCategory = categoryMap[category] || 'Général'
    setSearchQuery(faqCategory.toLowerCase())
    
    // Scroll to FAQ section
    const faqSection = document.getElementById('faq-section')
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/" 
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FormattedMessage id="supportPage.header.backToHome" />
            </Link>
            <LanguageSelector />
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <HelpCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              <FormattedMessage id="supportPage.header.title" />
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              <FormattedMessage id="supportPage.header.subtitle" />
            </p>
            
            {/* Barre de recherche */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Rechercher dans l'aide (ex: mot de passe, crédits, sécurité...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Section de recherche */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="supportPage.categories.title" />
            </h2>
            <div className="relative max-w-xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={intl.formatMessage({ id: 'supportPage.search.placeholder' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category.category)}
                  className="group bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-left"
                >
                  <div className={`bg-${category.color}-100 dark:bg-${category.color}-900/30 p-3 rounded-full w-fit mb-4`}>
                    <Icon className={`h-6 w-6 text-${category.color}-600 dark:text-${category.color}-400`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors">
                    {category.category}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {category.topics.map((topic, idx) => (
                      <span key={idx} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                        {topic}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Liens rapides */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            <FormattedMessage id="supportPage.quickLinks.title" />
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => {
              const Icon = link.icon
              
              if (link.link) {
                return (
                  <Link key={index} href={link.link} className="group">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform group-hover:scale-105">
                      <div className={`bg-${link.color}-100 dark:bg-${link.color}-900/30 p-3 rounded-full w-fit mb-4`}>
                        <Icon className={`h-6 w-6 text-${link.color}-600 dark:text-${link.color}-400`} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                )
              } else {
                return (
                  <button 
                    key={index} 
                    onClick={() => handleQuickAction(link.action!)}
                    className="group text-left"
                  >
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform group:hover:scale-105">
                      <div className={`bg-${link.color}-100 dark:bg-${link.color}-900/30 p-3 rounded-full w-fit mb-4`}>
                        <Icon className={`h-6 w-6 text-${link.color}-600 dark:text-${link.color}-400`} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {link.description}
                      </p>
                    </div>
                  </button>
                )
              }
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq-section" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="supportPage.faq.title" />
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              <FormattedMessage id="supportPage.faq.subtitle" />
            </p>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                <FormattedMessage id="supportPage.search.noResults" />
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFaqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setOpenFaq(openFaq === index ? null : index)}
                          className="w-full flex items-center justify-between p-6 text-left"
                        >
                          <span className="text-lg font-medium text-gray-900 dark:text-white pr-4">
                            {faq.question}
                          </span>
                          {openFaq === index ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {openFaq === index && (
                          <div className="px-6 pb-6">
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Méthodes de contact */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="supportPage.contactMethods.title" />
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              <FormattedMessage id="supportPage.contact.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              const handleContactClick = () => {
                const emailSupport = intl.formatMessage({ id: 'supportPage.contactMethods.emailSupport' })
                const emailUrgency = intl.formatMessage({ id: 'supportPage.contactMethods.emailUrgency' })
                const liveChat = intl.formatMessage({ id: 'supportPage.contactMethods.liveChat' })
                
                switch (method.method) {
                  case emailSupport:
                    window.open('mailto:support@bodycount.app?subject=Demande de support depuis le centre d\'aide', '_blank')
                    break
                  case emailUrgency:
                    window.open('mailto:security@bodycount.app?subject=Problème de sécurité urgent', '_blank')
                    break
                  case liveChat:
                    handleQuickAction('live-chat')
                    break
                }
              }
              
              return (
                <button 
                  key={index} 
                  onClick={handleContactClick}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:border-2 hover:border-emerald-300 dark:hover:border-emerald-600 border-2 border-transparent"
                >
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {method.method}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {method.description}
                  </p>
                  <div className="space-y-1">
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">
                      {method.contact}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {method.availability}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Messages de feedback */}
          {submitMessage && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
              <p className="text-blue-800 dark:text-blue-200 text-center font-medium">
                {submitMessage}
              </p>
            </div>
          )}

          {/* Formulaire de contact */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              <FormattedMessage id="supportPage.contact.title" />
            </h3>
            
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FormattedMessage id="supportPage.contact.form.name" />
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FormattedMessage id="supportPage.contact.form.email" />
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FormattedMessage id="supportPage.contact.form.category" />
                  </label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="general">{intl.formatMessage({ id: 'supportPage.categories.gettingStarted.category' })}</option>
                    <option value="technical">{intl.formatMessage({ id: 'supportPage.categories.technical.category' })}</option>
                    <option value="account">{intl.formatMessage({ id: 'supportPage.categories.accountSecurity.category' })}</option>
                    <option value="billing">{intl.formatMessage({ id: 'supportPage.categories.creditsPayments.category' })}</option>
                    <option value="feature">{intl.formatMessage({ id: 'supportPage.categories.features.category' })}</option>
                    <option value="security">{intl.formatMessage({ id: 'supportPage.categories.wellbeing.category' })}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FormattedMessage id="supportPage.contact.form.subject" />
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FormattedMessage id="supportPage.contact.form.message" />
                </label>
                <textarea
                  required
                  rows={6}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span><FormattedMessage id="supportPage.contact.form.sending" /></span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span><FormattedMessage id="supportPage.contact.form.send" /></span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            <FormattedMessage id="supportPage.finalSection.title" />
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            <FormattedMessage id="supportPage.finalSection.description" />
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 rounded-xl p-6">
              <Clock className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">
                <FormattedMessage id="supportPage.finalSection.features.quickResponse.title" />
              </h3>
              <p className="text-sm text-gray-300">
                <FormattedMessage id="supportPage.finalSection.features.quickResponse.description" />
              </p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">
                <FormattedMessage id="supportPage.finalSection.features.expertTeam.title" />
              </h3>
              <p className="text-sm text-gray-300">
                <FormattedMessage id="supportPage.finalSection.features.expertTeam.description" />
              </p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <Zap className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">
                <FormattedMessage id="supportPage.finalSection.features.proactiveSupport.title" />
              </h3>
              <p className="text-sm text-gray-300">
                <FormattedMessage id="supportPage.finalSection.features.proactiveSupport.description" />
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="mailto:support@bodycount.app" 
              className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FormattedMessage id="supportPage.finalSection.contactSupport" />
            </a>
            <Link
              href="/auth"
              className="text-gray-300 hover:text-white transition-colors underline"
            >
              <FormattedMessage id="supportPage.finalSection.backToAccount" />
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-400">
            <p><FormattedMessage id="supportPage.finalSection.footer" /></p>
          </div>
        </div>
      </section>
    </div>
  )
} 