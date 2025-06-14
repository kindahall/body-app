import { createClientComponentClient } from '@/lib/supabase'

export interface ReflectionItem {
  id: string
  user_id: string
  type: 'self' | 'others' | 'growth'
  title: string
  items: string[]
  created_at: string
  updated_at: string
}

export interface MirrorData {
  self: ReflectionItem[]
  others: ReflectionItem[]
  growth: ReflectionItem[]
  confidenceLevel: number
  lastUpdated: string
}

export interface HistoryEntry {
  id: string
  type: 'self' | 'others' | 'growth'
  title: string
  items: string[]
  created_at: string
}

export const templates = {
  self: [
    { title: 'Mes qualités principales', placeholder: 'Ajouter une qualité...' },
    { title: 'Mes défauts que j\'accepte', placeholder: 'Ajouter un défaut...' },
    { title: 'Mes objectifs personnels', placeholder: 'Ajouter un objectif...' },
    { title: 'Ce qui me rend unique', placeholder: 'Ajouter une spécificité...' }
  ],
  others: [
    { title: 'Retours de mes proches', placeholder: 'Ajouter un retour...' },
    { title: 'Mes forces selon les autres', placeholder: 'Ajouter une force...' },
    { title: 'Première impression que je donne', placeholder: 'Ajouter une impression...' },
    { title: 'Points d\'amélioration suggérés', placeholder: 'Ajouter un point...' }
  ],
  growth: [
    { title: 'Ce sur quoi je travaille', placeholder: 'Ajouter un point de travail...' },
    { title: 'Mes réussites récentes', placeholder: 'Ajouter une réussite...' },
    { title: 'Mes prochaines étapes', placeholder: 'Ajouter une étape...' },
    { title: 'Mes apprentissages', placeholder: 'Ajouter un apprentissage...' }
  ]
}

export class MirrorService {
  private static supabase = createClientComponentClient()

  static async getMirrorData(): Promise<MirrorData> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error("Utilisateur non authentifié")

    const { data, error } = await this.supabase
      .from('self_reflection')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error loading mirror data:', error.message || error)
      throw error
    }

    if (data && data.length > 0) {
      return this.organizeReflectionData(data)
    } else {
      return this.initializeDefaultData(user.id)
    }
  }
  
  static async saveMirrorData(editData: MirrorData): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error("Utilisateur non authentifié")
    
    const allItems = [
      ...editData.self.map(item => ({ ...item, user_id: user.id })),
      ...editData.others.map(item => ({ ...item, user_id: user.id })),
      ...editData.growth.map(item => ({ ...item, user_id: user.id })),
      {
        id: 'confidence_level',
        user_id: user.id,
        type: 'growth' as const,
        title: 'confidence_level',
        items: [editData.confidenceLevel.toString()],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    for (const item of allItems) {
      const { error } = await this.supabase
        .from('self_reflection')
        .upsert(item, {
          onConflict: 'id, user_id',
        })

      if (error) {
        console.error('Error saving item:', error.message || error)
        throw new Error(`Failed to save item: ${item.title}`)
      }
    }
  }

  private static organizeReflectionData(data: any[]): MirrorData {
    const organized: MirrorData = {
      self: [],
      others: [],
      growth: [],
      confidenceLevel: 5,
      lastUpdated: new Date().toISOString()
    }

    data.forEach(item => {
      if (item.type in organized && Array.isArray(organized[item.type as keyof MirrorData])) {
        (organized[item.type as keyof MirrorData] as ReflectionItem[]).push(item)
      }
    })

    const confidenceItem = data.find(item => item.title === 'confidence_level')
    if (confidenceItem && confidenceItem.items[0]) {
      organized.confidenceLevel = parseInt(confidenceItem.items[0]) || 5
    }

    if (data.length > 0) {
      organized.lastUpdated = data[0].updated_at
    }

    return organized
  }

  public static initializeDefaultData(userId: string): MirrorData {
    return {
      self: templates.self.map((template, index) => ({
        id: `self_${index}`,
        user_id: userId,
        type: 'self' as const,
        title: template.title,
        items: index === 0 ? ['Empathique', 'Créatif'] : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })),
      others: templates.others.map((template, index) => ({
        id: `others_${index}`,
        user_id: userId,
        type: 'others' as const,
        title: template.title,
        items: index === 0 ? ['Tu es très à l\'écoute'] : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })),
      growth: templates.growth.map((template, index) => ({
        id: `growth_${index}`,
        user_id: userId,
        type: 'growth' as const,
        title: template.title,
        items: index === 0 ? ['Communication assertive'] : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })),
      confidenceLevel: 6,
      lastUpdated: new Date().toISOString()
    }
  }
} 