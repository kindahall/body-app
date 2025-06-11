'use client'

import Link from 'next/link'
import { FormattedMessage, useIntl } from 'react-intl'
import LanguageSelector from '@/components/LanguageSelector'
import { 
  ArrowLeft,
  Heart,
  Users,
  Target,
  Shield,
  Lightbulb,
  Globe,
  Award,
  Calendar,
  MapPin,
  Mail,
  Linkedin,
  Twitter,
  Eye,
  BookOpen,
  Star,
  MessageCircle,
  Brain,
  Zap,
  TrendingUp,
  Quote
} from 'lucide-react'

export default function AboutPage() {
  const intl = useIntl()

  const milestones = [
    {
      year: "2024",
      title: intl.formatMessage({ id: 'aboutPage.milestones.2024_launch.title' }),
      description: intl.formatMessage({ id: 'aboutPage.milestones.2024_launch.description' }),
      icon: Zap
    },
    {
      year: "2024",
      title: intl.formatMessage({ id: 'aboutPage.milestones.2024_credits.title' }),
      description: intl.formatMessage({ id: 'aboutPage.milestones.2024_credits.description' }),
      icon: Star
    },
    {
      year: "2025",
      title: intl.formatMessage({ id: 'aboutPage.milestones.2025_mobile.title' }),
      description: intl.formatMessage({ id: 'aboutPage.milestones.2025_mobile.description' }),
      icon: Globe
    },
    {
      year: "2025",
      title: intl.formatMessage({ id: 'aboutPage.milestones.2025_communities.title' }),
      description: intl.formatMessage({ id: 'aboutPage.milestones.2025_communities.description' }),
      icon: Users
    }
  ]

  const values = [
    {
      icon: Shield,
      title: intl.formatMessage({ id: 'aboutPage.values.privacy.title' }),
      description: intl.formatMessage({ id: 'aboutPage.values.privacy.description' }),
      color: "bg-blue-500"
    },
    {
      icon: Heart,
      title: intl.formatMessage({ id: 'aboutPage.values.wellbeing.title' }),
      description: intl.formatMessage({ id: 'aboutPage.values.wellbeing.description' }),
      color: "bg-pink-500"
    },
    {
      icon: Eye,
      title: intl.formatMessage({ id: 'aboutPage.values.introspection.title' }),
      description: intl.formatMessage({ id: 'aboutPage.values.introspection.description' }),
      color: "bg-purple-500"
    },
    {
      icon: Users,
      title: intl.formatMessage({ id: 'aboutPage.values.community.title' }),
      description: intl.formatMessage({ id: 'aboutPage.values.community.description' }),
      color: "bg-green-500"
    }
  ]

  const teamMembers = [
    {
      name: intl.formatMessage({ id: 'aboutPage.team.founder.name' }),
      role: intl.formatMessage({ id: 'aboutPage.team.founder.role' }),
      description: intl.formatMessage({ id: 'aboutPage.team.founder.description' }),
      image: "/team/jimmy.jpg",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "jimmy@bodycount.app"
      }
    },
    {
      name: intl.formatMessage({ id: 'aboutPage.team.ai.name' }),
      role: intl.formatMessage({ id: 'aboutPage.team.ai.role' }),
      description: intl.formatMessage({ id: 'aboutPage.team.ai.description' }),
      image: "/team/ai-team.jpg",
      social: {
        email: "ai@bodycount.app"
      }
    },
    {
      name: intl.formatMessage({ id: 'aboutPage.team.security.name' }),
      role: intl.formatMessage({ id: 'aboutPage.team.security.role' }),
      description: intl.formatMessage({ id: 'aboutPage.team.security.description' }),
      image: "/team/security-team.jpg",
      social: {
        email: "security@bodycount.app"
      }
    }
  ]

  const stats = [
    {
      number: intl.formatMessage({ id: 'aboutPage.stats.users.number' }),
      label: intl.formatMessage({ id: 'aboutPage.stats.users.label' }),
      description: intl.formatMessage({ id: 'aboutPage.stats.users.description' })
    },
    {
      number: intl.formatMessage({ id: 'aboutPage.stats.analyses.number' }),
      label: intl.formatMessage({ id: 'aboutPage.stats.analyses.label' }),
      description: intl.formatMessage({ id: 'aboutPage.stats.analyses.description' })
    },
    {
      number: intl.formatMessage({ id: 'aboutPage.stats.uptime.number' }),
      label: intl.formatMessage({ id: 'aboutPage.stats.uptime.label' }),
      description: intl.formatMessage({ id: 'aboutPage.stats.uptime.description' })
    },
    {
      number: intl.formatMessage({ id: 'aboutPage.stats.breaches.number' }),
      label: intl.formatMessage({ id: 'aboutPage.stats.breaches.label' }),
      description: intl.formatMessage({ id: 'aboutPage.stats.breaches.description' })
    }
  ]

  const testimonials = [
    {
      quote: intl.formatMessage({ id: 'aboutPage.testimonials.marie.quote' }),
      author: intl.formatMessage({ id: 'aboutPage.testimonials.marie.author' }),
      role: intl.formatMessage({ id: 'aboutPage.testimonials.marie.role' })
    },
    {
      quote: intl.formatMessage({ id: 'aboutPage.testimonials.thomas.quote' }),
      author: intl.formatMessage({ id: 'aboutPage.testimonials.thomas.author' }),
      role: intl.formatMessage({ id: 'aboutPage.testimonials.thomas.role' })
    },
    {
      quote: intl.formatMessage({ id: 'aboutPage.testimonials.sophie.quote' }),
      author: intl.formatMessage({ id: 'aboutPage.testimonials.sophie.author' }),
      role: intl.formatMessage({ id: 'aboutPage.testimonials.sophie.role' })
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/" 
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FormattedMessage id="aboutPage.header.backToHome" />
            </Link>
            <LanguageSelector />
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Heart className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              <FormattedMessage id="aboutPage.header.title" />
            </h1>
            <p className="text-xl text-pink-100 max-w-3xl mx-auto">
              <FormattedMessage id="aboutPage.header.subtitle" />
            </p>
          </div>
        </div>
      </header>

      {/* Notre Mission */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            <FormattedMessage id="aboutPage.mission.title" />
          </h2>
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-pink-200 dark:border-pink-800">
            <Quote className="h-12 w-12 text-pink-500 mx-auto mb-6" />
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              "<FormattedMessage id="aboutPage.mission.quote" />"
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <FormattedMessage id="aboutPage.mission.description" />
            </p>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="aboutPage.values.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="aboutPage.values.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-6">
                    <div className={`${value.color} p-4 rounded-xl shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="aboutPage.milestones.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="aboutPage.milestones.subtitle" />
            </p>
          </div>

          <div className="relative">
            {/* Ligne temporelle */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon
                return (
                  <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    {/* Point sur la timeline */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg z-10 top-1/2">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    {/* Contenu */}
                    <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-semibold text-pink-500 mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="aboutPage.stats.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="aboutPage.stats.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-lg">
                <div className="text-4xl font-bold text-pink-500 mb-2">
                  {stat.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {stat.label}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Équipe */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="aboutPage.team.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="aboutPage.team.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-pink-500 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {member.description}
                </p>
                <div className="flex justify-center space-x-3">
                  {member.social.email && (
                    <a href={`mailto:${member.social.email}`} className="text-gray-400 hover:text-pink-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-pink-500 transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a href={member.social.twitter} className="text-gray-400 hover:text-pink-500 transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="aboutPage.testimonials.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="aboutPage.testimonials.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                <Quote className="h-8 w-8 text-pink-500 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Future */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            <FormattedMessage id="vision.title" />
          </h2>
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
            <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-6" />
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              <FormattedMessage id="vision.description" />
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              <FormattedMessage id="vision.goal" />
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <Globe className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  <FormattedMessage id="vision.expansion.title" />
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <FormattedMessage id="vision.expansion.description" />
                </p>
              </div>
              <div className="text-center">
                <Brain className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  <FormattedMessage id="vision.ai.title" />
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <FormattedMessage id="vision.ai.description" />
                </p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  <FormattedMessage id="vision.community.title" />
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <FormattedMessage id="vision.community.description" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            <FormattedMessage id="contact.title" />
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            <FormattedMessage id="contact.subtitle" />
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link 
              href="/auth" 
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FormattedMessage id="contact.button" />
            </Link>
            <a
              href="mailto:hello@bodycount.app"
              className="text-gray-300 hover:text-white transition-colors underline"
            >
              <FormattedMessage id="contact.email" />
            </a>
          </div>
          
          <div className="text-sm text-gray-400">
            <p><FormattedMessage id="contact.footer" /></p>
          </div>
        </div>
      </section>
    </div>
  )
}