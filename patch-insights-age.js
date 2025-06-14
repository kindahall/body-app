#!/usr/bin/env node

/**
 * Script pour ajouter le support de l'âge dans la page insights
 */

const fs = require('fs')

console.log('🔧 Ajout du support de l\'âge dans la page insights...')

const insightsPath = 'src/app/insights/page.tsx'

if (!fs.existsSync(insightsPath)) {
  console.error('❌ Fichier insights page non trouvé')
  process.exit(1)
}

let content = fs.readFileSync(insightsPath, 'utf8')

// 1. Ajouter l'état userAge
if (!content.includes('const [userAge, setUserAge]')) {
  content = content.replace(
    'const [showCreditModal, setShowCreditModal] = useState(false)',
    'const [showCreditModal, setShowCreditModal] = useState(false)\n  const [userAge, setUserAge] = useState<number | null>(null)'
  )
  console.log('✅ État userAge ajouté')
}

// 2. Ajouter la fonction fetchUserAge
if (!content.includes('const fetchUserAge = async')) {
  const fetchUserAgeFunction = `
  const fetchUserAge = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('age')
        .eq('id', user.id)
        .single()

      if (error) {
        console.warn('Could not fetch user age:', error.message)
        return
      }

      setUserAge(data?.age || null)
    } catch (error: any) {
      console.warn('Error fetching user age:', error?.message || 'Unknown error')
    }
  }`

  content = content.replace(
    '  }',
    '  }' + fetchUserAgeFunction
  )
  console.log('✅ Fonction fetchUserAge ajoutée')
}

// 3. Ajouter l'appel à fetchUserAge dans useEffect
if (!content.includes('fetchUserAge()')) {
  content = content.replace(
    'if (user && !isTestUser) {\n      fetchCredits()\n    }',
    'if (user && !isTestUser) {\n      fetchCredits()\n      fetchUserAge()\n    }'
  )
  console.log('✅ Appel fetchUserAge ajouté dans useEffect')
}

// 4. Ajouter userAge dans analysisData
if (!content.includes('userAge,')) {
  content = content.replace(
    'const analysisData = {\n      relationships,\n      wishlistItems: wishlistItems || [],\n      mirrorData,\n      previousAnalyses: getContextForAI(5)',
    'const analysisData = {\n      relationships,\n      wishlistItems: wishlistItems || [],\n      mirrorData,\n      userAge,\n      previousAnalyses: getContextForAI(5)'
  )
  console.log('✅ userAge ajouté dans analysisData')
}

// Sauvegarder le fichier modifié
fs.writeFileSync(insightsPath, content)

console.log('🎉 Page insights mise à jour avec succès !')
console.log('📋 L\'âge sera maintenant inclus dans les analyses IA') 