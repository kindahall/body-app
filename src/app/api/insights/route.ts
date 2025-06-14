import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { validateData, RelationshipSchema, sanitizeString } from '@/lib/validation'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface AnalysisData {
  relationships: any[]
  wishlistItems: any[]
  mirrorData: any
  userAge?: number
  previousAnalyses?: Array<{
    title: string
    date: string
    analysis: string
    tags: string[]
  }>
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier si la clé API est chargée
    if (!process.env.OPENAI_API_KEY) {
      logger.error('La variable d\'environnement OPENAI_API_KEY n\'est pas définie.');
      throw new Error('La clé API OpenAI n\'est pas configurée sur le serveur.');
    }

    // Récupérer les données depuis le body
    const body = await request.json()
    const { relationships, wishlistItems, mirrorData, userAge, previousAnalyses } = body as AnalysisData

    // Construire le prompt pour OpenAI
    const prompt = buildAnalysisPrompt({ relationships, wishlistItems, mirrorData, userAge, previousAnalyses })

    // Appeler OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Tu es un coach de vie et psychologue expert qui analyse les données personnelles pour fournir des insights constructifs et bienveillants. Réponds toujours en français et sois empathique. Utilise un format markdown avec des sections claires."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const analysis = completion.choices[0]?.message?.content

    if (!analysis) {
      throw new Error('Aucune analyse générée')
    }

    return NextResponse.json({ 
      analysis,
      success: true 
    })

  } catch (error: any) {
    logger.error('--- ERREUR DÉTAILLÉE DE L\'API INSIGHTS ---');
    
    // Spécifiquement pour les erreurs de l'API OpenAI
    if (error.constructor.name === 'APIError' || error instanceof OpenAI.APIError) {
      logger.error('Status:', error.status);
      logger.error('Type:', error.type);
      logger.error('Code:', error.code);
      logger.error('Message:', error.message);
      return NextResponse.json(
        { error: 'Erreur de l\'API OpenAI', details: `[${error.code}] ${error.message}` },
        { status: error.status || 500 }
      );
    }
    
    // Pour toutes les autres erreurs
    logger.error('Message d\'erreur:', error.message);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error.message },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(data: AnalysisData): string {
  const { relationships, wishlistItems, mirrorData, userAge, previousAnalyses } = data

  let prompt = `Analyse ces données personnelles et fournis une analyse psychologique bienveillante et constructive:\n\n`

  // Informations démographiques
  if (userAge) {
    prompt += `**PROFIL UTILISATEUR:**\n`
    prompt += `Âge: ${userAge} ans\n`
    
    // Ajouter des informations sur la tranche d'âge pour contextualiser
    let ageGroup = ''
    if (userAge >= 18 && userAge <= 25) {
      ageGroup = 'Jeune adulte (18-25 ans) - Période de découverte et d\'exploration'
    } else if (userAge >= 26 && userAge <= 35) {
      ageGroup = 'Adulte établi (26-35 ans) - Période de stabilisation et de construction'
    } else if (userAge >= 36 && userAge <= 45) {
      ageGroup = 'Adulte mature (36-45 ans) - Période d\'équilibre et de réalisation'
    } else if (userAge >= 46 && userAge <= 55) {
      ageGroup = 'Adulte expérimenté (46-55 ans) - Période de sagesse et de transmission'
    } else if (userAge >= 56 && userAge <= 65) {
      ageGroup = 'Pré-senior (56-65 ans) - Période de transition et de bilan'
    } else if (userAge >= 66) {
      ageGroup = 'Senior (66+ ans) - Période de sérénité et de partage'
    }
    
    prompt += `Tranche d'âge: ${ageGroup}\n\n`
  }

  // Relations
  if (relationships && relationships.length > 0) {
    prompt += `**RELATIONS (${relationships.length} relations):**\n`
    relationships.forEach((rel, index) => {
      prompt += `- Relation ${index + 1}: Type: ${rel.type}, Note: ${rel.rating || 'N/A'}/10, Durée: ${rel.duration || 'N/A'}, Lieu: ${rel.location || 'N/A'}, Sentiments: ${rel.feelings || 'N/A'}\n`
    })
    prompt += `\n`
  }

  // Wishlist
  if (wishlistItems && wishlistItems.length > 0) {
    prompt += `**SOUHAITS ET OBJECTIFS (${wishlistItems.length} items):**\n`
    wishlistItems.forEach((item, index) => {
      prompt += `- ${item.title} (Catégorie: ${item.category}, Priorité: ${item.priority}, Complété: ${item.is_completed ? 'Oui' : 'Non'})\n`
    })
    prompt += `\n`
  }

  // Données du miroir (auto-réflexion)
  if (mirrorData) {
    prompt += `**AUTO-RÉFLEXION:**\n`
    if (mirrorData.self && mirrorData.self.length > 0) {
      prompt += `Défauts acceptés: ${mirrorData.self.join(', ')}\n`
    }
    if (mirrorData.others && mirrorData.others.length > 0) {
      prompt += `Ce que les autres pensent: ${mirrorData.others.join(', ')}\n`
    }
    if (mirrorData.growth && mirrorData.growth.length > 0) {
      prompt += `Axes de développement: ${mirrorData.growth.join(', ')}\n`
    }
    if (mirrorData.confidenceLevel) {
      prompt += `Niveau de confiance: ${mirrorData.confidenceLevel}/10\n`
    }
    prompt += `\n`
  }

  // Analyses précédentes pour le contexte
  if (previousAnalyses && previousAnalyses.length > 0) {
    prompt += `**ANALYSES PRÉCÉDENTES (pour contexte et évolution):**\n`
    previousAnalyses.forEach((analysis, index) => {
      prompt += `- ${analysis.title} (${new Date(analysis.date).toLocaleDateString('fr-FR')}): ${analysis.analysis.substring(0, 200)}...\n`
      if (analysis.tags.length > 0) {
        prompt += `  Tags: ${analysis.tags.join(', ')}\n`
      }
    })
    prompt += `\n`
  }

  prompt += `**ANALYSE DEMANDÉE:**

Fournis une analyse structurée avec ces sections en markdown :

## 🔍 Patterns et Tendances
Identifie les patterns principaux dans les relations et comportements

## 💪 Forces et Qualités  
Souligne les points positifs et forces de caractère

## 🎯 Axes d'Amélioration
Suggestions constructives pour le développement personnel

## 📋 Recommandations Pratiques
3-4 actions concrètes à mettre en place

## 🌟 Vision d'Ensemble
Une synthèse bienveillante du profil psychologique

${previousAnalyses && previousAnalyses.length > 0 ? 
'## 📈 Évolution et Progrès\nCompare avec les analyses précédentes et note les évolutions positives\n\n' : ''}

Sois positif, constructif et évite tout jugement. L'objectif est d'aider la personne à mieux se comprendre et grandir. Utilise un ton empathique et professionnel.${previousAnalyses && previousAnalyses.length > 0 ? ' Prends en compte l\'évolution par rapport aux analyses précédentes.' : ''}

${userAge ? `**IMPORTANT**: Calibre tes recommandations selon l'âge de la personne (${userAge} ans). Adapte tes conseils aux défis, opportunités et priorités typiques de cette tranche d'âge. Les attentes et contextes de vie varient significativement selon l'âge.` : ''}`

  return prompt
} 