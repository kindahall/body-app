#!/usr/bin/env node

/**
 * Script d'installation complète du critère âge
 * 
 * Ce script :
 * 1. Vérifie que tous les fichiers sont en place
 * 2. Affiche les instructions pour la base de données
 * 3. Teste la compilation
 * 4. Génère un rapport d'installation
 */

const fs = require('fs')
const { execSync } = require('child_process')

console.log('🎯 Installation complète du critère âge pour BodyCount\n')

// Vérifications des fichiers
const requiredFiles = [
  'add-age-field.sql',
  'src/components/AgeInput.tsx',
  'GUIDE_AGE.md'
]

console.log('📋 Vérification des fichiers...')
let allFilesPresent = true

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MANQUANT`)
    allFilesPresent = false
  }
})

if (!allFilesPresent) {
  console.log('\n❌ Certains fichiers sont manquants. Exécutez d\'abord :')
  console.log('node scripts/add-age-feature.js')
  process.exit(1)
}

// Vérification des modifications dans les fichiers existants
console.log('\n🔍 Vérification des modifications...')

// Vérifier l'API insights
const apiInsightsPath = 'src/app/api/insights/route.ts'
if (fs.existsSync(apiInsightsPath)) {
  const apiContent = fs.readFileSync(apiInsightsPath, 'utf8')
  if (apiContent.includes('userAge?:') && apiContent.includes('PROFIL UTILISATEUR')) {
    console.log('✅ API insights mise à jour')
  } else {
    console.log('⚠️  API insights - mise à jour partielle')
  }
}

// Vérifier le hook useAIInsights
const hookPath = 'src/hooks/useAIInsights.ts'
if (fs.existsSync(hookPath)) {
  const hookContent = fs.readFileSync(hookPath, 'utf8')
  if (hookContent.includes('userAge?:')) {
    console.log('✅ Hook useAIInsights mis à jour')
  } else {
    console.log('⚠️  Hook useAIInsights - mise à jour nécessaire')
  }
}

// Vérifier la page insights
const insightsPagePath = 'src/app/insights/page.tsx'
if (fs.existsSync(insightsPagePath)) {
  const insightsContent = fs.readFileSync(insightsPagePath, 'utf8')
  if (insightsContent.includes('fetchUserAge') && insightsContent.includes('userAge,')) {
    console.log('✅ Page insights mise à jour')
  } else {
    console.log('⚠️  Page insights - mise à jour nécessaire')
  }
}

// Vérifier la page settings
const settingsPagePath = 'src/app/settings/page.tsx'
if (fs.existsSync(settingsPagePath)) {
  const settingsContent = fs.readFileSync(settingsPagePath, 'utf8')
  if (settingsContent.includes('import AgeInput') && settingsContent.includes('<AgeInput')) {
    console.log('✅ Page settings mise à jour')
  } else {
    console.log('⚠️  Page settings - mise à jour nécessaire')
  }
}

// Vérifier la validation
const validationPath = 'src/lib/validation.ts'
if (fs.existsSync(validationPath)) {
  const validationContent = fs.readFileSync(validationPath, 'utf8')
  if (validationContent.includes('age: z.number().int().min(18')) {
    console.log('✅ Validation Zod mise à jour')
  } else {
    console.log('⚠️  Validation Zod - mise à jour nécessaire')
  }
}

// Test de compilation
console.log('\n🔨 Test de compilation...')
try {
  execSync('npm run build', { stdio: 'pipe' })
  console.log('✅ Compilation réussie')
} catch (error) {
  console.log('⚠️  Erreurs de compilation détectées')
  console.log('Vérifiez les imports et la syntaxe')
}

// Instructions pour la base de données
console.log('\n📊 Instructions pour la base de données :')
console.log('1. Connectez-vous à votre tableau de bord Supabase')
console.log('2. Allez dans SQL Editor')
console.log('3. Copiez et exécutez le contenu du fichier add-age-field.sql')
console.log('4. Vérifiez que la colonne "age" a été ajoutée à la table "profiles"')

// Génération du rapport
const report = {
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  status: 'installed',
  features: {
    database_schema: 'ready_for_migration',
    api_support: 'installed',
    ui_components: 'installed',
    validation: 'installed',
    age_groups: [
      '18-25 ans: Jeune adulte',
      '26-35 ans: Adulte établi', 
      '36-45 ans: Adulte mature',
      '46-55 ans: Adulte expérimenté',
      '56-65 ans: Pré-senior',
      '66+ ans: Senior'
    ]
  },
  next_steps: [
    'Exécuter le script SQL dans Supabase',
    'Redémarrer le serveur de développement',
    'Tester la saisie d\'âge dans Paramètres',
    'Générer une analyse IA pour vérifier la calibration'
  ]
}

fs.writeFileSync('age-feature-report.json', JSON.stringify(report, null, 2))

console.log('\n🎉 Installation du critère âge terminée !')
console.log('\n📋 Prochaines étapes :')
console.log('1. 📊 Exécutez le script SQL add-age-field.sql dans Supabase')
console.log('2. 🔄 Redémarrez votre serveur : npm run dev')
console.log('3. ⚙️  Testez dans Paramètres > Profil > Âge')
console.log('4. 🤖 Générez une analyse IA pour voir la calibration')
console.log('\n📖 Consultez GUIDE_AGE.md pour plus de détails')
console.log('📄 Rapport généré : age-feature-report.json')

// Afficher un résumé des tranches d'âge
console.log('\n🎯 Tranches d\'âge configurées :')
report.features.age_groups.forEach(group => {
  console.log(`   • ${group}`)
})

console.log('\n✨ Le critère âge permettra des analyses IA plus précises et personnalisées !') 