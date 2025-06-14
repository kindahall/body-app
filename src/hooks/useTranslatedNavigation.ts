import { useIntl } from 'react-intl'
import { 
  Home, 
  Plus, 
  Users, 
  BarChart3, 
  Settings, 
  MessageCircle, 
  BookOpen, 
  Heart, 
  Star
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  icon: any
  path: string
}

export function useTranslatedNavigation() {
  const intl = useIntl()

  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: intl.formatMessage({ id: 'navigation.home' }),
      icon: Home,
      path: '/home'
    },
    {
      id: 'ajouter',
      label: intl.formatMessage({ id: 'navigation.add' }),
      icon: Plus,
      path: '/add-relationship'
    },
    {
      id: 'profils',
      label: intl.formatMessage({ id: 'navigation.profiles' }),
      icon: Users,
      path: '/profiles'
    },
    {
      id: 'analyse',
      label: intl.formatMessage({ id: 'navigation.insights' }),
      icon: BarChart3,
      path: '/insights'
    },
    {
      id: 'parametres',
      label: intl.formatMessage({ id: 'navigation.settings' }),
      icon: Settings,
      path: '/settings'
    }
  ]

  const analysisItems: NavigationItem[] = [
    {
      id: 'confessions',
      label: intl.formatMessage({ id: 'navigation.confessions' }),
      icon: MessageCircle,
      path: '/confessions'
    },
    {
      id: 'journal',
      label: intl.formatMessage({ id: 'navigation.journal' }),
      icon: BookOpen,
      path: '/journal'
    },
    {
      id: 'miroir',
      label: intl.formatMessage({ id: 'navigation.mirror' }),
      icon: Heart,
      path: '/mirror'
    },
    {
      id: 'wishlist',
      label: intl.formatMessage({ id: 'navigation.wishlist' }),
      icon: Star,
      path: '/wishlist'
    }
  ]

  return { navigationItems, analysisItems }
} 