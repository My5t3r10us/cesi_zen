'use server';

import { db } from '@/lib/db';
import { emotionCategories, emotions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schémas de validation
const categorySchema = z.object({
  label: z.string().min(1, 'Le label est requis').max(100),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hex invalide'),
  iconName: z.string().min(1, 'L\'icône est requise').max(50),
});

const emotionSchema = z.object({
  label: z.string().min(1, 'Le label est requis').max(100),
  categoryId: z.number().int().positive('Catégorie requise'),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hex invalide').optional().nullable(),
  iconName: z.string().max(50).optional().nullable(),
});

export type EmotionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

// ===== CATEGORIES =====

export async function getEmotionCategories() {
  try {
    return await db.query.emotionCategories.findMany({
      with: {
        emotions: true,
      },
      orderBy: [asc(emotionCategories.label)],
    });
  } catch (error) {
    console.error('Get emotion categories error:', error);
    return [];
  }
}

export async function getCategoryById(id: number) {
  try {
    return await db.query.emotionCategories.findFirst({
      where: eq(emotionCategories.id, id),
      with: {
        emotions: true,
      },
    });
  } catch (error) {
    console.error('Get category by id error:', error);
    return null;
  }
}

export async function createCategory(
  prevState: EmotionState,
  formData: FormData
): Promise<EmotionState> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Non autorisé' };
  }

  const rawData = {
    label: formData.get('label') as string,
    colorHex: formData.get('colorHex') as string,
    iconName: formData.get('iconName') as string,
  };

  const validation = categorySchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: 'Validation échouée',
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await db.insert(emotionCategories).values(validation.data);
    revalidatePath('/admin/emotions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create category error:', error);
    return { error: 'Une erreur est survenue' };
  }
}

export async function updateCategory(
  categoryId: number,
  prevState: EmotionState,
  formData: FormData
): Promise<EmotionState> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Non autorisé' };
  }

  const rawData = {
    label: formData.get('label') as string,
    colorHex: formData.get('colorHex') as string,
    iconName: formData.get('iconName') as string,
  };

  const validation = categorySchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: 'Validation échouée',
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await db.update(emotionCategories)
      .set(validation.data)
      .where(eq(emotionCategories.id, categoryId));
    revalidatePath('/admin/emotions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update category error:', error);
    return { error: 'Une erreur est survenue' };
  }
}

export async function deleteCategory(categoryId: number): Promise<EmotionState> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Non autorisé' };
  }

  try {
    await db.delete(emotionCategories).where(eq(emotionCategories.id, categoryId));
    revalidatePath('/admin/emotions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete category error:', error);
    return { error: 'Une erreur est survenue' };
  }
}

// ===== EMOTIONS =====

export async function getEmotions() {
  try {
    return await db.query.emotions.findMany({
      with: {
        category: true,
      },
      orderBy: [asc(emotions.label)],
    });
  } catch (error) {
    console.error('Get emotions error:', error);
    return [];
  }
}

export async function getEmotionById(id: number) {
  try {
    return await db.query.emotions.findFirst({
      where: eq(emotions.id, id),
      with: {
        category: true,
      },
    });
  } catch (error) {
    console.error('Get emotion by id error:', error);
    return null;
  }
}

export async function createEmotion(
  prevState: EmotionState,
  formData: FormData
): Promise<EmotionState> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Non autorisé' };
  }

  const rawData = {
    label: formData.get('label') as string,
    categoryId: parseInt(formData.get('categoryId') as string, 10),
    colorHex: (formData.get('colorHex') as string) || null,
    iconName: (formData.get('iconName') as string) || null,
  };

  const validation = emotionSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: 'Validation échouée',
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await db.insert(emotions).values(validation.data);
    revalidatePath('/admin/emotions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create emotion error:', error);
    return { error: 'Une erreur est survenue' };
  }
}

export async function updateEmotion(
  emotionId: number,
  prevState: EmotionState,
  formData: FormData
): Promise<EmotionState> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Non autorisé' };
  }

  const rawData = {
    label: formData.get('label') as string,
    categoryId: parseInt(formData.get('categoryId') as string, 10),
    colorHex: (formData.get('colorHex') as string) || null,
    iconName: (formData.get('iconName') as string) || null,
  };

  const validation = emotionSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: 'Validation échouée',
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await db.update(emotions)
      .set(validation.data)
      .where(eq(emotions.id, emotionId));
    revalidatePath('/admin/emotions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update emotion error:', error);
    return { error: 'Une erreur est survenue' };
  }
}

export async function deleteEmotion(emotionId: number): Promise<EmotionState> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Non autorisé' };
  }

  try {
    await db.delete(emotions).where(eq(emotions.id, emotionId));
    revalidatePath('/admin/emotions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete emotion error:', error);
    return { error: 'Une erreur est survenue' };
  }
}
