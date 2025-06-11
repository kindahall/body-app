type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerInterface {
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  log: (...args: any[]) => void
}

class AppLogger implements LoggerInterface {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isTest = process.env.NODE_ENV === 'test'

  debug(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('🐛', ...args)
    }
  }

  info(...args: any[]): void {
    if (this.isDevelopment || this.isTest) {
      console.info('ℹ️', ...args)
    }
  }

  warn(...args: any[]): void {
    console.warn('⚠️', ...args)
  }

  error(...args: any[]): void {
    console.error('❌', ...args)
    // En production, on pourrait envoyer à un service de monitoring
    if (!this.isDevelopment && !this.isTest) {
      // TODO: Implémenter Sentry ou autre service de monitoring
      // sentry.captureException(new Error(args.join(' ')))
    }
  }

  log(...args: any[]): void {
    this.debug(...args)
  }

  // Méthodes spécialisées pour les contextes
  auth(...args: any[]): void {
    this.debug('🔐 [AUTH]', ...args)
  }

  api(...args: any[]): void {
    this.debug('🌐 [API]', ...args)
  }

  db(...args: any[]): void {
    this.debug('🗄️ [DB]', ...args)
  }
}

// Export singleton
export const logger = new AppLogger()

// Export type pour utilisation
export type { LoggerInterface as Logger, LogLevel }

// Export fonction utilitaire pour capturer les erreurs
export function captureError(error: Error, context?: string): void {
  logger.error(context ? `[${context}]` : '', error.message, error.stack)
} 