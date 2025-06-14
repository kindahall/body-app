import { z } from 'zod'

// Schema pour les relations
export const RelationshipSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(['romantic', 'sexual', 'friend', 'friendzone', 'other']),
  name: z.string().min(1, 'Le nom est requis').max(100),
  start_date: z.string().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  duration: z.string().max(100).optional().nullable(),
  feelings: z.string().max(1000).optional().nullable(),
  rating: z.number().int().min(1).max(10).optional().nullable(),
  private_note: z.string().max(2000).optional().nullable(),
  user_id: z.string().uuid().optional()
})

// Schema pour les insights IA
export const InsightSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
  relationships: z.array(RelationshipSchema).min(1, 'Au moins une relation est requise pour générer des insights'),
  prompt: z.string().optional()
})

// Schema pour les mémoires/souvenirs
export const MemorySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Le titre est requis').max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').optional().nullable(),
  kind: z.enum(['photo', 'video', 'note']),
  file_url: z.string().url('URL de fichier invalide').optional().nullable(),
  relation_id: z.string().uuid('ID de relation invalide').optional(),
  user_id: z.string().uuid('ID utilisateur invalide').optional(),
  is_private: z.boolean().default(true),
  created_at: z.string().optional()
})

// Schema pour les éléments de wishlist
export const WishlistItemSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Le titre est requis').max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').optional().nullable(),
  price: z.number().positive('Le prix doit être positif').optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.string().max(100, 'La catégorie ne peut pas dépasser 100 caractères').optional().nullable(),
  image_url: z.string().url('URL d\'image invalide').optional().nullable(),
  link: z.string().url('Lien invalide').optional().nullable(),
  is_purchased: z.boolean().default(false),
  user_id: z.string().uuid('ID utilisateur invalide').optional()
})

// Schema pour les données du miroir
export const MirrorDataSchema = z.object({
  id: z.string().uuid().optional(),
  confidence_level: z.number().int().min(1).max(10),
  mood: z.string().min(1, 'L\'humeur est requise').max(100),
  notes: z.string().max(2000, 'Les notes ne peuvent pas dépasser 2000 caractères').optional().nullable(),
  user_id: z.string().uuid('ID utilisateur invalide').optional(),
  created_at: z.string().optional()
})

// Schema pour l'âge utilisateur (validation spécifique)
export const userAgeSchema = z.number()
  .int('L\'âge doit être un nombre entier')
  .min(18, 'L\'âge minimum est 18 ans')
  .max(99, 'L\'âge maximum est 99 ans')

// Schema pour les profils utilisateur
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Email invalide'),
  name: z.string().min(1).max(100).optional().nullable(),
  age: userAgeSchema,
  credits: z.number().int().min(0).default(30),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

// Schema pour les achats de crédits
export const CreditPurchaseSchema = z.object({
  pack: z.enum(['pack_50', 'pack_150', 'pack_500'], {
    errorMap: () => ({ message: 'Pack de crédits invalide' })
  }),
  user_id: z.string().uuid('ID utilisateur invalide')
})

// Schema pour les uploads de fichiers
export const FileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Un fichier valide est requis' }),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB par défaut
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
}).refine(
  (data) => data.file.size <= data.maxSize,
  { message: 'Le fichier est trop volumineux' }
).refine(
  (data) => data.allowedTypes.includes(data.file.type),
  { message: 'Type de fichier non autorisé' }
)

// Schema pour les insights archivés
export const ArchivedInsightSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Le titre est requis').max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  content: z.string().min(10, 'Le contenu doit faire au moins 10 caractères'),
  folder: z.string().max(100, 'Le nom du dossier ne peut pas dépasser 100 caractères').default('General'),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags autorisés').default([]),
  snapshot_data: z.record(z.any()).optional(),
  user_id: z.string().uuid('ID utilisateur invalide').optional(),
  created_at: z.string().optional()
})

// Types TypeScript générés automatiquement
export type Relationship = z.infer<typeof RelationshipSchema>
export type Insight = z.infer<typeof InsightSchema>
export type Memory = z.infer<typeof MemorySchema>
export type WishlistItem = z.infer<typeof WishlistItemSchema>
export type MirrorData = z.infer<typeof MirrorDataSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type CreditPurchase = z.infer<typeof CreditPurchaseSchema>
export type FileUpload = z.infer<typeof FileUploadSchema>
export type ArchivedInsight = z.infer<typeof ArchivedInsightSchema>

// Utilitaires de validation
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Données invalides', error)
    }
    throw error
  }
}

export function validateDataSafe<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true
  data: T
} | {
  success: false
  errors: z.ZodError
} {
  const result = schema.safeParse(data)
  if (result.success) {
    return {
      success: true,
      data: result.data
    }
  } else {
    return {
      success: false,
      errors: result.error
    }
  }
}

// Middleware de validation pour les API routes
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    const result = schema.safeParse(data)
    if (!result.success) {
      throw new Response(
        JSON.stringify({
          error: 'Données invalides',
          details: result.error.errors
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    return result.data
  }
}

// Validation pour les formulaires côté client
export function getFieldErrors(errors: z.ZodError, field: string): string[] {
  return errors.errors
    .filter(error => error.path.includes(field))
    .map(error => error.message)
}

// Sanitization basique
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
} 