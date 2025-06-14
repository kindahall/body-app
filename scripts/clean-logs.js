#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const SRC_DIR = path.join(__dirname, '../src')
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']
const CONSOLE_PATTERNS = [
  /console\.log\s*\(/g,
  /console\.debug\s*\(/g,
  /console\.info\s*\(/g,
  /console\.warn\s*\(/g,
  /console\.error\s*\(/g
]

// Fichiers à exclure du nettoyage
const EXCLUDE_FILES = [
  'src/lib/logger.ts',
  'src/lib/config/logging.ts'
]

// Fonction pour scanner récursivement les fichiers
function scanDirectory(dir, files = []) {
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      // Ignorer node_modules et .next
      if (!['node_modules', '.next', '.git'].includes(item)) {
        scanDirectory(fullPath, files)
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item)
      if (EXTENSIONS.includes(ext)) {
        files.push(fullPath)
      }
    }
  }
  
  return files
}

// Fonction pour analyser un fichier
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const issues = []
  
  lines.forEach((line, index) => {
    CONSOLE_PATTERNS.forEach(pattern => {
      const matches = line.match(pattern)
      if (matches) {
        issues.push({
          line: index + 1,
          content: line.trim(),
          pattern: pattern.source
        })
      }
    })
  })
  
  return issues
}

// Fonction pour générer un rapport
function generateReport(results) {
  console.log('\n🔍 RAPPORT DE NETTOYAGE DES LOGS\n')
  console.log('=' .repeat(50))
  
  let totalIssues = 0
  let filesWithIssues = 0
  
  for (const [filePath, issues] of Object.entries(results)) {
    if (issues.length > 0) {
      filesWithIssues++
      totalIssues += issues.length
      
      const relativePath = path.relative(process.cwd(), filePath)
      console.log(`\n📄 ${relativePath}`)
      console.log('-'.repeat(relativePath.length + 4))
      
      issues.forEach(issue => {
        console.log(`  Ligne ${issue.line}: ${issue.content}`)
      })
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log(`📊 RÉSUMÉ:`)
  console.log(`   • Fichiers analysés: ${Object.keys(results).length}`)
  console.log(`   • Fichiers avec problèmes: ${filesWithIssues}`)
  console.log(`   • Total console.log trouvés: ${totalIssues}`)
  
  if (totalIssues > 0) {
    console.log('\n⚠️  RECOMMANDATIONS:')
    console.log('   1. Remplacez console.log par log.debug()')
    console.log('   2. Remplacez console.error par log.error()')
    console.log('   3. Remplacez console.warn par log.warn()')
    console.log('   4. Ajoutez un contexte approprié')
    console.log('\n💡 Exemple:')
    console.log('   ❌ console.log("User data:", userData)')
    console.log('   ✅ log.debug("Données utilisateur", userData, "AUTH")')
  } else {
    console.log('\n✅ Aucun console.log trouvé ! Code propre.')
  }
}

// Fonction pour proposer des corrections automatiques
function suggestFixes(results) {
  console.log('\n🔧 SUGGESTIONS DE CORRECTIONS AUTOMATIQUES\n')
  
  const fixes = []
  
  for (const [filePath, issues] of Object.entries(results)) {
    if (issues.length > 0) {
      const relativePath = path.relative(process.cwd(), filePath)
      
      issues.forEach(issue => {
        let suggestion = ''
        
        if (issue.content.includes('console.log')) {
          suggestion = issue.content.replace(/console\.log/, 'log.debug')
        } else if (issue.content.includes('console.error')) {
          suggestion = issue.content.replace(/console\.error/, 'log.error')
        } else if (issue.content.includes('console.warn')) {
          suggestion = issue.content.replace(/console\.warn/, 'log.warn')
        } else if (issue.content.includes('console.info')) {
          suggestion = issue.content.replace(/console\.info/, 'log.info')
        }
        
        if (suggestion) {
          fixes.push({
            file: relativePath,
            line: issue.line,
            original: issue.content,
            suggested: suggestion
          })
        }
      })
    }
  }
  
  if (fixes.length > 0) {
    console.log('Corrections suggérées:')
    fixes.slice(0, 10).forEach((fix, index) => {
      console.log(`\n${index + 1}. ${fix.file}:${fix.line}`)
      console.log(`   ❌ ${fix.original}`)
      console.log(`   ✅ ${fix.suggested}`)
    })
    
    if (fixes.length > 10) {
      console.log(`\n... et ${fixes.length - 10} autres corrections`)
    }
  }
}

// Fonction principale
function main() {
  console.log('🧹 Démarrage du nettoyage des logs...')
  
  // Scanner tous les fichiers
  const files = scanDirectory(SRC_DIR)
  
  // Filtrer les fichiers exclus
  const filteredFiles = files.filter(file => {
    const relativePath = path.relative(process.cwd(), file)
    return !EXCLUDE_FILES.includes(relativePath)
  })
  
  console.log(`📁 Analyse de ${filteredFiles.length} fichiers...`)
  
  // Analyser chaque fichier
  const results = {}
  filteredFiles.forEach(file => {
    results[file] = analyzeFile(file)
  })
  
  // Générer le rapport
  generateReport(results)
  
  // Suggérer des corrections
  suggestFixes(results)
  
  console.log('\n🎯 Pour appliquer le logger:')
  console.log('   1. Ajoutez: import { log } from "@/lib/logger"')
  console.log('   2. Utilisez les contextes appropriés (AUTH, API, USER, etc.)')
  console.log('   3. En production, seuls ERROR et WARN seront affichés')
}

// Exécuter le script
if (require.main === module) {
  main()
}

module.exports = { scanDirectory, analyzeFile, generateReport } 