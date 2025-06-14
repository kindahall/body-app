import { Metadata } from 'next'
import AuthForm from '@/components/auth/AuthForm'
import LanguageSelector from '@/components/LanguageSelector'

export const metadata: Metadata = {
  title: 'BodyCount · Se connecter ou Créer un compte',
  description: 'Accédez à votre journal intime numérique privé. Connectez-vous à votre compte existant ou créez-en un nouveau.',
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 relative">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Brand Side */}
            <div className="lg:w-1/2 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-8 lg:p-12 flex flex-col justify-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    BodyCount
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  Votre journal intime numérique privé pour la croissance personnelle et les expériences intimes.
                </p>
                <div className="hidden lg:block">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span>Confidentialité Totale</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Chiffrement de Bout en Bout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                      <span>Croissance Personnelle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Sans Jugement</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Side */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <AuthForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}