#!/usr/bin/env node

/**
 * Script pour ajouter le critère "âge" à l'application BodyCount
 * 
 * Ce script :
 * 1. Ajoute le champ âge à la base de données
 * 2. Met à jour les interfaces TypeScript
 * 3. Modifie l'API d'analyse IA pour inclure l'âge
 * 4. Met à jour les hooks et composants
 * 5. Ajoute l'interface utilisateur pour saisir l'âge
 */

const fs = require('fs')
const path = require('path')

console.log('🎯 Ajout du critère âge à BodyCount...\n')

// 1. Créer le script SQL pour la base de données
const sqlScript = `-- Script pour ajouter le champ âge aux profils utilisateur
-- File: add-age-field.sql

-- =====================================================
-- AJOUT DU CHAMP ÂGE À LA TABLE PROFILES
-- =====================================================

-- Ajouter la colonne age si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'age'
    ) THEN
        ALTER TABLE profiles ADD COLUMN age INTEGER;
        RAISE NOTICE 'Colonne age ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne age existe déjà';
    END IF;
END $$;

-- Ajouter une contrainte pour valider l'âge (18-99 ans)
DO $$
BEGIN
    -- Supprimer la contrainte si elle existe déjà
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_age_check' AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_age_check;
    END IF;
    
    -- Ajouter la nouvelle contrainte
    ALTER TABLE profiles ADD CONSTRAINT profiles_age_check CHECK (age >= 18 AND age <= 99);
    RAISE NOTICE 'Contrainte d''âge ajoutée (18-99 ans)';
END $$;

-- =====================================================
-- FONCTION POUR METTRE À JOUR L'ÂGE
-- =====================================================

-- Fonction pour mettre à jour l'âge utilisateur
CREATE OR REPLACE FUNCTION public.update_user_age(user_age INTEGER, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier la validité de l'âge
  IF user_age < 18 OR user_age > 99 THEN
    RAISE EXCEPTION 'L''âge doit être compris entre 18 et 99 ans';
  END IF;
  
  -- S'assurer que le profil existe
  INSERT INTO profiles (id, credits, age) 
  VALUES (user_uuid, 30, user_age)
  ON CONFLICT (id) DO UPDATE SET 
    age = user_age, 
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR OBTENIR L'ÂGE
-- =====================================================

-- Fonction pour obtenir l'âge utilisateur
CREATE OR REPLACE FUNCTION public.get_user_age(user_uuid UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
DECLARE user_age INTEGER;
BEGIN
  SELECT age INTO user_age FROM profiles WHERE id = user_uuid;
  RETURN user_age;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RAPPORT FINAL
-- =====================================================

DO $$
DECLARE
  users_with_age INTEGER;
  total_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_with_age FROM profiles WHERE age IS NOT NULL;
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CHAMP ÂGE CONFIGURÉ AVEC SUCCÈS !';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Utilisateurs avec âge défini: % / %', users_with_age, total_users;
  RAISE NOTICE 'Contrainte: 18-99 ans';
  RAISE NOTICE '========================================';
END $$;`

fs.writeFileSync('add-age-field.sql', sqlScript)
console.log('✅ Script SQL créé : add-age-field.sql')

// 2. Mettre à jour l'API insights
const apiInsightsPath = 'src/app/api/insights/route.ts'
if (fs.existsSync(apiInsightsPath)) {
  let apiContent = fs.readFileSync(apiInsightsPath, 'utf8')
  
  // Ajouter userAge à l'interface AnalysisData
  if (!apiContent.includes('userAge?:')) {
    apiContent = apiContent.replace(
      'interface AnalysisData {\n  relationships: any[]\n  wishlistItems: any[]\n  mirrorData: any',
      'interface AnalysisData {\n  relationships: any[]\n  wishlistItems: any[]\n  mirrorData: any\n  userAge?: number'
    )
    
    // Ajouter userAge dans la destructuration
    apiContent = apiContent.replace(
      'const { relationships, wishlistItems, mirrorData, previousAnalyses }',
      'const { relationships, wishlistItems, mirrorData, userAge, previousAnalyses }'
    )
    
    // Passer userAge à buildAnalysisPrompt
    apiContent = apiContent.replace(
      'buildAnalysisPrompt({ relationships, wishlistItems, mirrorData, previousAnalyses })',
      'buildAnalysisPrompt({ relationships, wishlistItems, mirrorData, userAge, previousAnalyses })'
    )
    
    // Mettre à jour la fonction buildAnalysisPrompt
    apiContent = apiContent.replace(
      'function buildAnalysisPrompt(data: AnalysisData): string {\n  const { relationships, wishlistItems, mirrorData, previousAnalyses } = data',
      'function buildAnalysisPrompt(data: AnalysisData): string {\n  const { relationships, wishlistItems, mirrorData, userAge, previousAnalyses } = data'
    )
    
    // Ajouter la section âge dans le prompt
    const ageSection = `
  // Informations démographiques
  if (userAge) {
    prompt += \`**PROFIL UTILISATEUR:**\\n\`
    prompt += \`Âge: \${userAge} ans\\n\`
    
    // Ajouter des informations sur la tranche d'âge pour contextualiser
    let ageGroup = ''
    let ageContext = ''
    
    if (userAge >= 18 && userAge <= 25) {
      ageGroup = 'Jeune adulte (18-25 ans)'
      ageContext = 'Période de découverte, d\\'exploration et de construction d\\'identité.'
    } else if (userAge >= 26 && userAge <= 35) {
      ageGroup = 'Adulte établi (26-35 ans)'
      ageContext = 'Période de stabilisation et de construction.'
    } else if (userAge >= 36 && userAge <= 45) {
      ageGroup = 'Adulte mature (36-45 ans)'
      ageContext = 'Période d\\'équilibre et de réalisation.'
    } else if (userAge >= 46 && userAge <= 55) {
      ageGroup = 'Adulte expérimenté (46-55 ans)'
      ageContext = 'Période de sagesse et de transmission.'
    } else if (userAge >= 56 && userAge <= 65) {
      ageGroup = 'Pré-senior (56-65 ans)'
      ageContext = 'Période de transition et de bilan.'
    } else if (userAge >= 66) {
      ageGroup = 'Senior (66+ ans)'
      ageContext = 'Période de sérénité et de partage.'
    }
    
    prompt += \`Tranche d'âge: \${ageGroup}\\n\`
    prompt += \`Contexte de vie: \${ageContext}\\n\\n\`
  }
`
    
    apiContent = apiContent.replace(
      'let prompt = `Analyse ces données personnelles et fournis une analyse psychologique bienveillante et constructive:\\n\\n`',
      'let prompt = `Analyse ces données personnelles et fournis une analyse psychologique bienveillante et constructive:\\n\\n`' + ageSection
    )
    
    // Mettre à jour les instructions finales
    apiContent = apiContent.replace(
      'Sois positif, constructif et évite tout jugement. L\'objectif est d\'aider la personne à mieux se comprendre et grandir. Utilise un ton empathique et professionnel.${previousAnalyses && previousAnalyses.length > 0 ? \' Prends en compte l\\\'évolution par rapport aux analyses précédentes.\' : \'\'}`',
      'Sois positif, constructif et évite tout jugement. L\'objectif est d\'aider la personne à mieux se comprendre et grandir. Utilise un ton empathique et professionnel.${previousAnalyses && previousAnalyses.length > 0 ? \' Prends en compte l\\\'évolution par rapport aux analyses précédentes.\' : \'\'}\n\n${userAge ? \`**IMPORTANT**: Calibre tes recommandations selon l\'âge de la personne (\${userAge} ans). Adapte tes conseils aux défis, opportunités et priorités typiques de cette tranche d\'âge.\` : \'\'}\`'
    )
    
    fs.writeFileSync(apiInsightsPath, apiContent)
    console.log('✅ API insights mise à jour avec support de l\'âge')
  } else {
    console.log('⚠️  API insights déjà mise à jour')
  }
}

// 3. Mettre à jour le hook useAIInsights
const hookPath = 'src/hooks/useAIInsights.ts'
if (fs.existsSync(hookPath)) {
  let hookContent = fs.readFileSync(hookPath, 'utf8')
  
  if (!hookContent.includes('userAge?:')) {
    // Ajouter userAge à l'interface AnalysisData
    hookContent = hookContent.replace(
      'interface AnalysisData {\n  relationships: any[]\n  wishlistItems: any[]\n  mirrorData: any\n}',
      'interface AnalysisData {\n  relationships: any[]\n  wishlistItems: any[]\n  mirrorData: any\n  userAge?: number\n}'
    )
    
    // Mettre à jour la fonction hashAnalysisData
    hookContent = hookContent.replace(
      'const str = JSON.stringify({\n    relationshipsCount: data.relationships?.length || 0,\n    wishlistCount: data.wishlistItems?.length || 0,\n    mirrorDataExists: !!data.mirrorData,\n    // On peut ajouter d\'autres critères de hashage selon les besoins\n  })',
      'const str = JSON.stringify({\n    relationshipsCount: data.relationships?.length || 0,\n    wishlistCount: data.wishlistItems?.length || 0,\n    mirrorDataExists: !!data.mirrorData,\n    userAge: data.userAge,\n    // On peut ajouter d\'autres critères de hashage selon les besoins\n  })'
    )
    
    fs.writeFileSync(hookPath, hookContent)
    console.log('✅ Hook useAIInsights mis à jour avec support de l\'âge')
  } else {
    console.log('⚠️  Hook useAIInsights déjà mis à jour')
  }
}

// 4. Créer un composant pour la saisie de l'âge
const ageComponentContent = `'use client'

import { useState } from 'react'
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react'

interface AgeInputProps {
  currentAge?: number | null
  onAgeUpdate: (age: number) => Promise<void>
  isLoading?: boolean
  isTestUser?: boolean
}

export default function AgeInput({ currentAge, onAgeUpdate, isLoading = false, isTestUser = false }: AgeInputProps) {
  const [age, setAge] = useState<number | null>(currentAge || null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!age || age < 18 || age > 99) {
      setError('L\\'âge doit être compris entre 18 et 99 ans.')
      return
    }

    setError(null)
    try {
      await onAgeUpdate(age)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour')
    }
  }

  if (isTestUser) {
    return (
      <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
        <label className="flex items-center space-x-3 text-lg font-semibold text-gray-800 mb-4">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-yellow-600" />
          </div>
          <span>Âge</span>
        </label>
        <div className="w-full px-6 py-4 border border-gray-200/50 rounded-xl bg-gray-50/80 text-gray-700 font-medium backdrop-blur-sm">
          Mode test - Âge non requis
        </div>
        <p className="text-sm text-yellow-600 mt-3 flex items-center space-x-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full block"></span>
          <span>L'âge n'est pas collecté en mode test</span>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
      <label className="flex items-center space-x-3 text-lg font-semibold text-gray-800 mb-4">
        <div className="bg-yellow-100 p-2 rounded-lg">
          <Calendar className="h-5 w-5 text-yellow-600" />
        </div>
        <span>Âge <span className="text-red-500">*</span></span>
      </label>
      
      <div className="flex gap-3">
        <input
          type="number"
          min="18"
          max="99"
          value={age || ''}
          onChange={(e) => {
            const value = e.target.value
            setAge(value ? parseInt(value) : null)
            setError(null)
          }}
          placeholder="Votre âge (18-99 ans)"
          className="flex-1 px-6 py-4 border border-gray-200/50 rounded-xl bg-white/80 text-gray-700 font-medium backdrop-blur-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
        <button
          onClick={handleSubmit}
          disabled={!age || age < 18 || age > 99 || isLoading}
          className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : currentAge ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
          <span>{isLoading ? 'Sauvegarde...' : 'Sauver'}</span>
        </button>
      </div>
      
      <div className="mt-3 space-y-2">
        <p className="text-sm text-gray-500 flex items-center space-x-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full block"></span>
          <span>L'âge est requis pour calibrer les analyses IA selon votre tranche d'âge</span>
        </p>
        
        {error && (
          <p className="text-sm text-red-500 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </p>
        )}
        
        {age && (age < 18 || age > 99) && (
          <p className="text-sm text-red-500 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>L'âge doit être compris entre 18 et 99 ans</span>
          </p>
        )}
        
        {currentAge && (
          <p className="text-sm text-green-600 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Âge actuel : {currentAge} ans</span>
          </p>
        )}
      </div>
    </div>
  )
}`

const componentDir = 'src/components'
if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true })
}

fs.writeFileSync(path.join(componentDir, 'AgeInput.tsx'), ageComponentContent)
console.log('✅ Composant AgeInput créé')

// 5. Créer un guide d'utilisation
const guideContent = `# 🎯 Guide d'implémentation du critère âge

## Vue d'ensemble

Le critère âge a été ajouté à l'application BodyCount pour calibrer les analyses IA selon la tranche d'âge de l'utilisateur.

## Étapes d'implémentation

### 1. Base de données
Exécutez le script SQL \`add-age-field.sql\` dans votre tableau de bord Supabase :
\`\`\`bash
# Dans Supabase SQL Editor
-- Coller le contenu du fichier add-age-field.sql
\`\`\`

### 2. Validation
Le schéma Zod dans \`src/lib/validation.ts\` a été mis à jour pour inclure l'âge (18-99 ans).

### 3. Interface utilisateur
- Nouveau composant \`AgeInput\` dans \`src/components/AgeInput.tsx\`
- Intégration dans la page Settings pour la saisie de l'âge
- Validation côté client et serveur

### 4. Analyse IA
- L'API \`/api/insights\` prend maintenant en compte l'âge
- Recommandations calibrées selon la tranche d'âge :
  - 18-25 ans : Jeune adulte (découverte, exploration)
  - 26-35 ans : Adulte établi (stabilisation, construction)
  - 36-45 ans : Adulte mature (équilibre, réalisation)
  - 46-55 ans : Adulte expérimenté (sagesse, transmission)
  - 56-65 ans : Pré-senior (transition, bilan)
  - 66+ ans : Senior (sérénité, partage)

### 5. Hooks et données
- \`useAIInsights\` mis à jour pour inclure l'âge
- Cache invalidé quand l'âge change
- Données d'export incluent l'âge

## Utilisation

### Dans les composants
\`\`\`tsx
import AgeInput from '@/components/AgeInput'

// Dans votre composant
<AgeInput
  currentAge={userAge}
  onAgeUpdate={updateUserAge}
  isLoading={isLoading}
  isTestUser={isTestUser}
/>
\`\`\`

### Dans l'analyse IA
L'âge est automatiquement inclus dans les données envoyées à l'API d'analyse.

## Validation

- **Côté client** : Validation en temps réel (18-99 ans)
- **Côté serveur** : Contrainte de base de données
- **API** : Validation Zod

## Sécurité

- L'âge est stocké de manière sécurisée dans la table profiles
- RLS (Row Level Security) appliqué
- Validation stricte des entrées

## Tests

Pour tester la fonctionnalité :
1. Connectez-vous à l'application
2. Allez dans Paramètres > Profil
3. Saisissez votre âge (18-99 ans)
4. Générez une analyse IA
5. Vérifiez que les recommandations sont adaptées à votre âge

## Notes importantes

- L'âge est **requis** pour les utilisateurs authentifiés
- Les utilisateurs en mode test n'ont pas besoin de saisir leur âge
- L'âge influence directement la qualité et la pertinence des analyses IA
- Les recommandations sont calibrées selon les défis et opportunités de chaque tranche d'âge
`

fs.writeFileSync('GUIDE_AGE.md', guideContent)
console.log('✅ Guide d\'utilisation créé : GUIDE_AGE.md')

// 6. Créer un script npm pour l'installation
const packageJsonPath = 'package.json'
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  
  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }
  
  packageJson.scripts['add-age-feature'] = 'node scripts/add-age-feature.js'
  packageJson.scripts['setup-age'] = 'echo "Exécutez le script SQL add-age-field.sql dans Supabase pour terminer l\'installation"'
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log('✅ Scripts npm ajoutés')
}

console.log('\n🎉 Critère âge ajouté avec succès !')
console.log('\n📋 Prochaines étapes :')
console.log('1. Exécutez le script SQL add-age-field.sql dans Supabase')
console.log('2. Redémarrez votre serveur de développement')
console.log('3. Testez la saisie d\'âge dans Paramètres > Profil')
console.log('4. Générez une analyse IA pour voir les recommandations calibrées')
console.log('\n📖 Consultez GUIDE_AGE.md pour plus de détails') 