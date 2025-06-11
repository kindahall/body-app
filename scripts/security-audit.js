#!/usr/bin/env node

/**
 * Script d'audit de sécurité pour BodyCount App
 * Analyse les variables d'environnement, logs sensibles, et problèmes de sécurité
 */

const fs = require('fs')
const path = require('path')

console.log('🔒 AUDIT DE SÉCURITÉ - BodyCount App')
console.log('=====================================')

// Couleurs pour les logs
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(level, message) {
  const prefix = {
    error: `${colors.red}❌`,
    warning: `${colors.yellow}⚠️`,
    success: `${colors.green}✅`,
    info: `${colors.blue}ℹ️`
  }[level] || colors.blue + 'ℹ️'
  
  console.log(`${prefix} ${message}${colors.reset}`)
}

// 1. Vérifier les fichiers d'environnement
function checkEnvironmentFiles() {
  console.log('\n1. 📄 Vérification des fichiers d\'environnement')
  
  const envFiles = ['.env', '.env.local', '.env.production', '.env.development']
  let foundEnvFiles = []

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      foundEnvFiles.push(file)
      log('info', `Fichier trouvé: ${file}`)
      
      // Vérifier si le fichier est dans .gitignore
      const gitignore = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : ''
      if (!gitignore.includes('.env') && !gitignore.includes(file)) {
        log('error', `DANGER: ${file} n'est PAS dans .gitignore !`)
      } else {
        log('success', `${file} est protégé par .gitignore`)
      }
    }
  })

  if (foundEnvFiles.length === 0) {
    log('warning', 'Aucun fichier d\'environnement trouvé')
  }
}

// 2. Analyser les variables NEXT_PUBLIC
function checkPublicEnvVars() {
  console.log('\n2. 🌐 Variables NEXT_PUBLIC (exposées côté client)')
  
  const sourceDir = './src'
  const publicVars = new Set()
  
  function scanDirectory(dir) {
    try {
      const files = fs.readdirSync(dir)
      
      files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        
        if (stat.isDirectory() && !file.startsWith('.')) {
          scanDirectory(filePath)
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8')
          
          // Chercher les variables NEXT_PUBLIC
          const matches = content.match(/process\.env\.NEXT_PUBLIC_\w+/g)
          if (matches) {
            matches.forEach(match => {
              const varName = match.replace('process.env.', '')
              publicVars.add(varName)
            })
          }
        }
      })
    } catch (error) {
      log('error', `Erreur lors de l'analyse: ${error.message}`)
    }
  }
  
  scanDirectory(sourceDir)
  
  const allowedPublicVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_APP_URL'
  ]
  
  publicVars.forEach(varName => {
    if (allowedPublicVars.includes(varName)) {
      log('success', `${varName} - Autorisée`)
    } else {
      log('warning', `${varName} - Non répertoriée (vérifiez)`)
    }
  })
  
  console.log(`\nTotal variables NEXT_PUBLIC: ${publicVars.size}`)
}

// 3. Détecter les logs dangereux
function checkDangerousLogs() {
  console.log('\n3. 🚨 Détection des logs dangereux')
  
  const dangerousPatterns = [
    /console\.log.*process\.env/gi,
    /console\.log.*password/gi,
    /console\.log.*secret/gi,
    /console\.log.*token/gi,
    /console\.log.*api[_-]?key/gi
  ]

  let dangerousLogsFound = 0

  function scanForDangerousLogs(dir) {
    try {
      const files = fs.readdirSync(dir)
      
      files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanForDangerousLogs(filePath)
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8')
          const lines = content.split('\n')
          
          lines.forEach((line, index) => {
            dangerousPatterns.forEach(pattern => {
              if (pattern.test(line)) {
                dangerousLogsFound++
                log('error', `${filePath}:${index + 1} - ${line.trim()}`)
              }
            })
          })
        }
      })
    } catch (error) {
      log('error', `Erreur: ${error.message}`)
    }
  }

  scanForDangerousLogs('./src')

  if (dangerousLogsFound === 0) {
    log('success', 'Aucun log dangereux détecté')
  } else {
    log('error', `${dangerousLogsFound} log(s) dangereux !`)
  }
}

// 4. Générer le rapport final
function generateReport() {
  console.log('\n📊 RECOMMANDATIONS DE SÉCURITÉ')
  console.log('==============================')
  
  console.log('\n🔒 Variables d\'environnement:')
  console.log('   • Vérifiez que .env.local est dans .gitignore')
  console.log('   • Ne commitez JAMAIS de vraies clés API')
  console.log('   • Utilisez NEXT_PUBLIC_ seulement si nécessaire')
  
  console.log('\n🚨 Nettoyage des logs:')
  console.log('   • Supprimez les console.log avec données sensibles')
  console.log('   • Désactivez les logs debug en production')
  
  console.log('\n⚙️ Configuration:')
  console.log('   • Configurez les en-têtes de sécurité')
  console.log('   • Activez le CSP (Content Security Policy)')
  
  log('success', 'Audit terminé !')
}

// Exécution
try {
  checkEnvironmentFiles()
  checkPublicEnvVars()
  checkDangerousLogs()
  generateReport()
} catch (error) {
  log('error', `Erreur: ${error.message}`)
  process.exit(1)
} 