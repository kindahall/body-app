'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

// Pages du dashboard (authentifiées) qui ne doivent PAS avoir le footer
const DASHBOARD_ROUTES = [
  '/home',
  '/add-relationship',
  '/profiles',
  '/insights',
  '/settings',
  '/confessions',
  '/journal',
  '/mirror',
  '/wishlist',
  '/credits',
  '/charts',
  '/relations',
  '/support'
]

// Fonction pour vérifier si la route actuelle est une page du dashboard
const isDashboardRoute = (pathname: string): boolean => {
  // Vérifie les routes exactes du dashboard
  if (DASHBOARD_ROUTES.includes(pathname)) {
    return true
  }
  
  // Vérifie les routes dynamiques du dashboard (ex: /relations/123)
  if (pathname.startsWith('/relations/') && pathname.length > '/relations/'.length) {
    return true
  }
  
  return false
}

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Ne pas afficher le footer sur les pages du dashboard
  if (isDashboardRoute(pathname)) {
    return null
  }
  
  // Afficher le footer sur toutes les autres pages (publiques)
  return <Footer />
} 