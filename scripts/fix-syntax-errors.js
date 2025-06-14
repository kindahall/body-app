#!/usr/bin/env node

/**
 * Script pour corriger les erreurs de syntaxe dans les fichiers
 */

const fs = require('fs')

console.log('🔧 Correction des erreurs de syntaxe...')

const filesToFix = [
  'src/app/relations/[relationId]/ShareMemoryDrawer.tsx',
  'src/app/wishlist/AddEditModal.tsx', 
  'src/app/wishlist/ItemCard.tsx',
  'src/app/confessions/page.tsx',
  'src/app/settings/page.tsx'
]

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé : ${filePath}`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let hasChanges = false

  // Corriger les erreurs de type "() = width={400} height={300} quality={80}> void"
  const badPattern = /\(\)\s*=\s*width=\{400\}\s*height=\{300\}\s*quality=\{80\}>\s*void/g
  if (content.match(badPattern)) {
    content = content.replace(badPattern, '() => void')
    hasChanges = true
    console.log(`✅ Corrigé les types de fonction dans ${filePath}`)
  }

  // Corriger les erreurs de type "useState<Type[] width={400} height={300} quality={80}>"
  const badStatePattern = /useState<([^>]+)\[\]\s*width=\{400\}\s*height=\{300\}\s*quality=\{80\}>/g
  if (content.match(badStatePattern)) {
    content = content.replace(badStatePattern, 'useState<$1[]>')
    hasChanges = true
    console.log(`✅ Corrigé les types useState dans ${filePath}`)
  }

  // Corriger les problèmes spécifiques au fichier settings
  if (filePath.includes('settings/page.tsx')) {
    // Corriger la fonction updateUserAge qui n'est pas async
    if (content.includes('const { error } = await supabase') && !content.includes('const updateUserAge = async')) {
      content = content.replace(
        'const updateUserAge = (age: number) => {',
        'const updateUserAge = async (age: number) => {'
      )
      hasChanges = true
      console.log(`✅ Corrigé la fonction updateUserAge dans ${filePath}`)
    }

    // Corriger les problèmes de structure
    if (content.includes('return (') && content.includes('const tabs = [')) {
      // S'assurer que la structure est correcte
      const tabsIndex = content.indexOf('const tabs = [')
      const returnIndex = content.indexOf('return (')
      
      if (returnIndex < tabsIndex) {
        // Déplacer la déclaration tabs avant le return
        const tabsDeclaration = content.substring(tabsIndex, content.indexOf(']', tabsIndex) + 1)
        content = content.replace(tabsDeclaration, '')
        content = content.replace('return (', tabsDeclaration + '\n\n  return (')
        hasChanges = true
        console.log(`✅ Corrigé la structure dans ${filePath}`)
      }
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content)
    console.log(`💾 Fichier sauvegardé : ${filePath}`)
  } else {
    console.log(`✓ Aucune correction nécessaire : ${filePath}`)
  }
})

console.log('\n🎉 Correction des erreurs de syntaxe terminée !')
console.log('🔨 Testez la compilation avec : npm run build') 