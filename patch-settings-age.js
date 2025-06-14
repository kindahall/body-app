#!/usr/bin/env node

/**
 * Script pour ajouter le composant AgeInput dans la page settings
 */

const fs = require('fs')

console.log('🔧 Ajout du composant AgeInput dans la page settings...')

const settingsPath = 'src/app/settings/page.tsx'

if (!fs.existsSync(settingsPath)) {
  console.error('❌ Fichier settings page non trouvé')
  process.exit(1)
}

let content = fs.readFileSync(settingsPath, 'utf8')

// 1. Ajouter l'import du composant AgeInput
if (!content.includes('import AgeInput from')) {
  content = content.replace(
    'import { createClientComponentClient } from \'@/lib/supabase\'',
    'import { createClientComponentClient } from \'@/lib/supabase\'\nimport AgeInput from \'@/components/AgeInput\''
  )
  console.log('✅ Import AgeInput ajouté')
}

// 2. Supprimer les fonctions dupliquées
const duplicateStart = content.indexOf('  const fetchUserProfile = async () => {', content.indexOf('  const fetchCredits = async () => {') + 100)
if (duplicateStart !== -1) {
  const duplicateEnd = content.indexOf('  }', content.indexOf('  const updateUserAge = async (age: number) => {', duplicateStart) + 100) + 3
  if (duplicateEnd > duplicateStart) {
    content = content.substring(0, duplicateStart) + content.substring(duplicateEnd)
    console.log('✅ Fonctions dupliquées supprimées')
  }
}

// 3. Rechercher la section du champ âge dans l'onglet profile et la remplacer par le composant AgeInput
const ageFieldStart = content.indexOf('                  {/* Champ âge */}')
if (ageFieldStart === -1) {
  // Si le commentaire n'existe pas, chercher une autre signature
  const profileTabStart = content.indexOf('{activeTab === \'profile\' && (')
  if (profileTabStart !== -1) {
    const emailFieldEnd = content.indexOf('</div>', content.indexOf('L\'email ne peut pas être modifié', profileTabStart)) + 6
    
    const ageInputComponent = `

                  {/* Champ âge */}
                  <AgeInput
                    currentAge={formData.age}
                    onAgeUpdate={updateUserAge}
                    isLoading={isLoading}
                    isTestUser={isTestUser}
                  />`

    content = content.substring(0, emailFieldEnd) + ageInputComponent + content.substring(emailFieldEnd)
    console.log('✅ Composant AgeInput ajouté dans l\'onglet profile')
  }
} else {
  // Remplacer la section existante
  const ageFieldEnd = content.indexOf('                  </div>', ageFieldStart + 500) + 24
  
  const ageInputComponent = `                  {/* Champ âge */}
                  <AgeInput
                    currentAge={formData.age}
                    onAgeUpdate={updateUserAge}
                    isLoading={isLoading}
                    isTestUser={isTestUser}
                  />`

  content = content.substring(0, ageFieldStart) + ageInputComponent + content.substring(ageFieldEnd)
  console.log('✅ Section âge remplacée par le composant AgeInput')
}

// Sauvegarder le fichier modifié
fs.writeFileSync(settingsPath, content)

console.log('🎉 Page settings mise à jour avec succès !')
console.log('📋 Le composant AgeInput est maintenant intégré dans les paramètres') 