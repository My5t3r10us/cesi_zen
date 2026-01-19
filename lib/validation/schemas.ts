import { z } from 'zod';

// Schéma de validation pour l'inscription
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
  nom: z.string().optional(),
  prenom: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
});

// Schéma de validation pour une entrée du journal émotionnel
export const entrySchema = z.object({
  emotionId: z.number().int().positive('Sélectionnez une émotion'),
  intensity: z
    .number()
    .int()
    .min(1, 'L\'intensité doit être entre 1 et 10')
    .max(10, 'L\'intensité doit être entre 1 et 10'),
  note: z.string().max(2000, 'La note ne peut pas dépasser 2000 caractères').optional(),
  contextTags: z.array(z.string()).optional(),
});

// Schéma de validation pour un article
export const articleSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères'),
  slug: z
    .string()
    .min(1, 'Le slug est requis')
    .max(255, 'Le slug ne peut pas dépasser 255 caractères')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  content: z
    .string()
    .min(1, 'Le contenu est requis'),
  isPublished: z.boolean().default(false),
});

// Types dérivés des schémas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EntryInput = z.infer<typeof entrySchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
