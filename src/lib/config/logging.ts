import { LogLevel, LoggingConfig } from '../types/logging'

// Configuration par défaut selon l'environnement
const getDefaultConfig = (): LoggingConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'

  if (isDevelopment) {
    return {
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableRemoteLogging: false,
      contexts: {
        'API': LogLevel.DEBUG,
        'AUTH': LogLevel.DEBUG,
        'USER': LogLevel.INFO,
        'PERF': LogLevel.DEBUG,
        'ADD_RELATIONSHIP': LogLevel.DEBUG,
        'AI_INSIGHTS': LogLevel.DEBUG,
        'RELATION_STATS': LogLevel.DEBUG,
        'STRIPE': LogLevel.INFO,
        'SUPABASE': LogLevel.WARN
      }
    }
  }

  if (isProduction) {
    return {
      level: LogLevel.ERROR,
      enableConsole: false,
      enableRemoteLogging: true,
      contexts: {
        'API': LogLevel.ERROR,
        'AUTH': LogLevel.WARN,
        'USER': LogLevel.INFO,
        'PERF': LogLevel.NONE,
        'ADD_RELATIONSHIP': LogLevel.ERROR,
        'AI_INSIGHTS': LogLevel.ERROR,
        'RELATION_STATS': LogLevel.ERROR,
        'STRIPE': LogLevel.WARN,
        'SUPABASE': LogLevel.ERROR
      }
    }
  }

  // Test/staging environment
  return {
    level: LogLevel.WARN,
    enableConsole: true,
    enableRemoteLogging: false,
    contexts: {
      'API': LogLevel.WARN,
      'AUTH': LogLevel.WARN,
      'USER': LogLevel.INFO,
      'PERF': LogLevel.NONE,
      'ADD_RELATIONSHIP': LogLevel.WARN,
      'AI_INSIGHTS': LogLevel.WARN,
      'RELATION_STATS': LogLevel.WARN,
      'STRIPE': LogLevel.WARN,
      'SUPABASE': LogLevel.WARN
    }
  }
}

// Configuration personnalisée via variables d'environnement
const getCustomConfig = (): Partial<LoggingConfig> => {
  const config: Partial<LoggingConfig> = {}

  // LOG_LEVEL=DEBUG|INFO|WARN|ERROR|NONE
  const logLevel = process.env.LOG_LEVEL
  if (logLevel && logLevel in LogLevel) {
    config.level = LogLevel[logLevel as keyof typeof LogLevel]
  }

  // LOG_CONSOLE=true|false
  const logConsole = process.env.LOG_CONSOLE
  if (logConsole !== undefined) {
    config.enableConsole = logConsole === 'true'
  }

  // LOG_REMOTE=true|false
  const logRemote = process.env.LOG_REMOTE
  if (logRemote !== undefined) {
    config.enableRemoteLogging = logRemote === 'true'
  }

  return config
}

// Configuration finale
export const loggingConfig: LoggingConfig = {
  ...getDefaultConfig(),
  ...getCustomConfig()
}

// Fonction utilitaire pour vérifier si un contexte doit logger
export const shouldLogContext = (context: string, level: LogLevel): boolean => {
  const contextLevel = loggingConfig.contexts[context] || loggingConfig.level
  return level >= contextLevel
}

// Fonction pour mettre à jour la configuration à chaud (utile pour le debug)
export const updateLoggingConfig = (updates: Partial<LoggingConfig>) => {
  Object.assign(loggingConfig, updates)
}

// Export des constantes utiles
export const LOG_CONTEXTS = {
  API: 'API',
  AUTH: 'AUTH', 
  USER: 'USER',
  PERF: 'PERF',
  ADD_RELATIONSHIP: 'ADD_RELATIONSHIP',
  AI_INSIGHTS: 'AI_INSIGHTS',
  RELATION_STATS: 'RELATION_STATS',
  STRIPE: 'STRIPE',
  SUPABASE: 'SUPABASE'
} as const 