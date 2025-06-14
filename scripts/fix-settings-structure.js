#!/usr/bin/env node

/**
 * Script pour corriger la structure du fichier settings/page.tsx
 */

const fs = require('fs')

console.log('🔧 Correction de la structure du fichier settings/page.tsx...')

const settingsPath = 'src/app/settings/page.tsx'

if (!fs.existsSync(settingsPath)) {
  console.error('❌ Fichier settings page non trouvé')
  process.exit(1)
}

let content = fs.readFileSync(settingsPath, 'utf8')

// Corriger le problème de la fonction updateUserAge orpheline
const orphanCodeStart = content.indexOf('    try {\n      setIsLoading(true)\n      \n      const { error } = await supabase')
if (orphanCodeStart !== -1) {
  const orphanCodeEnd = content.indexOf('  }\n\n  const saveAppSettings', orphanCodeStart) + 3
  
  if (orphanCodeEnd > orphanCodeStart) {
    // Supprimer le code orphelin
    const orphanCode = content.substring(orphanCodeStart, orphanCodeEnd)
    content = content.replace(orphanCode, '')
    
    // Reconstituer la fonction updateUserAge complète
    const updateUserAgeFunction = `
  const updateUserAge = async (age: number) => {
    if (!user || isTestUser) return

    // Validation côté client
    if (age < 18 || age > 99) {
      setError('L\\'âge doit être compris entre 18 et 99 ans.')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          age: age,
          updated_at: new Date().toISOString()
        })

      if (error) {
        setError('Erreur lors de la mise à jour de l\\'âge.')
        return
      }

      setFormData(prev => ({ ...prev, age }))
      setMessage('Âge mis à jour avec succès!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setError('Erreur lors de la mise à jour de l\\'âge.')
    } finally {
      setIsLoading(false)
    }
  }
`
    
    // Insérer la fonction après fetchCredits
    const insertPoint = content.indexOf('  }\n\n  const saveAppSettings')
    content = content.substring(0, insertPoint + 3) + updateUserAgeFunction + content.substring(insertPoint + 3)
    
    console.log('✅ Fonction updateUserAge reconstruite')
  }
}

// Corriger les problèmes d'erreur dans le composant AgeInput 
if (content.includes('                         <p className="text-sm text-yellow-600 mt-3 flex items-center space-x-2">')) {
  // Supprimer ce bout de code orphelin qui vient du patch précédent
  const orphanStart = content.indexOf('                         <p className="text-sm text-yellow-600 mt-3 flex items-center space-x-2">')
  const orphanEnd = content.indexOf('                         </p>', orphanStart) + 28
  
  if (orphanEnd > orphanStart) {
    const orphanCode = content.substring(orphanStart, orphanEnd)
    content = content.replace(orphanCode, '')
    console.log('✅ Code orphelin AgeInput supprimé')
  }
}

// Sauvegarder le fichier corrigé
fs.writeFileSync(settingsPath, content)

console.log('🎉 Structure du fichier settings/page.tsx corrigée !')
console.log('🔨 Testez la compilation avec : npm run build') 