'use server';

import { db } from '@/lib/db';
import { entries, emotions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { encryptNote, decryptNote } from '@/lib/security/encryption';
import { entrySchema } from '@/lib/validation/schemas';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type EntryState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function createEntry(
  prevState: EntryState,
  formData: FormData
): Promise<EntryState> {
  const session = await getSession();
  
  if (!session) {
    return { error: 'Non authentifié' };
  }

  const rawData = {
    emotionId: parseInt(formData.get('emotionId') as string),
    intensity: parseInt(formData.get('intensity') as string),
    note: formData.get('note') as string || undefined,
    contextTags: formData.getAll('contextTags') as string[],
  };

  const validationResult = entrySchema.safeParse(rawData);
  
  if (!validationResult.success) {
    return { 
      error: 'Validation échouée',
      fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const { emotionId, intensity, note, contextTags } = validationResult.data;

  try {
    // Chiffrement de la note côté serveur
    const noteEncrypted = note ? await encryptNote(note) : null;

    await db.insert(entries).values({
      userId: session.userId,
      emotionId,
      intensity,
      noteEncrypted,
      contextTags: contextTags || [],
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create entry error:', error);
    return { error: 'Une erreur est survenue lors de l\'enregistrement' };
  }
}

export async function getEmotions() {
  try {
    const allEmotions = await db.query.emotions.findMany({
      with: {
        category: true,
      },
    });
    return allEmotions;
  } catch (error) {
    console.error('Get emotions error:', error);
    return [];
  }
}

export async function getUserEntries(startDate?: Date, endDate?: Date) {
  const session = await getSession();
  
  if (!session) {
    return [];
  }

  try {
    let whereClause = eq(entries.userId, session.userId);
    
    if (startDate && endDate) {
      whereClause = and(
        eq(entries.userId, session.userId),
        gte(entries.createdAt, startDate),
        lte(entries.createdAt, endDate)
      )!;
    }

    const userEntries = await db.query.entries.findMany({
      where: whereClause,
      with: {
        emotion: true,
      },
      orderBy: [desc(entries.createdAt)],
    });

    // Déchiffrer les notes pour l'utilisateur
    const decryptedEntries = await Promise.all(
      userEntries.map(async (entry) => ({
        ...entry,
        note: entry.noteEncrypted ? await decryptNote(entry.noteEncrypted) : null,
        noteEncrypted: undefined, // Ne pas exposer la note chiffrée
      }))
    );

    return decryptedEntries;
  } catch (error) {
    console.error('Get user entries error:', error);
    return [];
  }
}

export async function getEntryById(entryId: string) {
  const session = await getSession();
  
  if (!session) {
    return null;
  }

  try {
    const entry = await db.query.entries.findFirst({
      where: and(
        eq(entries.id, entryId),
        eq(entries.userId, session.userId)
      ),
      with: {
        emotion: true,
      },
    });

    if (!entry) return null;

    return {
      ...entry,
      note: entry.noteEncrypted ? await decryptNote(entry.noteEncrypted) : null,
      noteEncrypted: undefined,
    };
  } catch (error) {
    console.error('Get entry by id error:', error);
    return null;
  }
}

export async function deleteEntry(entryId: string): Promise<EntryState> {
  const session = await getSession();
  
  if (!session) {
    return { error: 'Non authentifié' };
  }

  try {
    await db.delete(entries).where(
      and(
        eq(entries.id, entryId),
        eq(entries.userId, session.userId)
      )
    );

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete entry error:', error);
    return { error: 'Une erreur est survenue lors de la suppression' };
  }
}

export async function getEntriesStats() {
  const session = await getSession();
  
  if (!session) {
    return null;
  }

  try {
    // Récupérer les entrées des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userEntries = await db.query.entries.findMany({
      where: and(
        eq(entries.userId, session.userId),
        gte(entries.createdAt, thirtyDaysAgo)
      ),
      with: {
        emotion: true,
      },
      orderBy: [entries.createdAt],
    });

    // Grouper par jour pour les graphiques
    const entriesByDay = userEntries.reduce((acc, entry) => {
      const date = entry.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, typeof userEntries>);

    // Calculer la moyenne d'intensité par jour
    const dailyAverages = Object.entries(entriesByDay).map(([date, dayEntries]) => ({
      date,
      averageIntensity: dayEntries.reduce((sum, e) => sum + e.intensity, 0) / dayEntries.length,
      count: dayEntries.length,
    }));

    return {
      totalEntries: userEntries.length,
      dailyAverages,
      recentEntries: userEntries.slice(-7),
    };
  } catch (error) {
    console.error('Get entries stats error:', error);
    return null;
  }
}
