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

export async function updateEntry(
  entryId: string,
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
    // Vérifier que l'entrée appartient à l'utilisateur
    const existingEntry = await db.query.entries.findFirst({
      where: and(
        eq(entries.id, entryId),
        eq(entries.userId, session.userId)
      ),
    });

    if (!existingEntry) {
      return { error: 'Entrée non trouvée' };
    }

    const noteEncrypted = note ? await encryptNote(note) : null;

    await db.update(entries)
      .set({
        emotionId,
        intensity,
        noteEncrypted,
        contextTags: contextTags || [],
      })
      .where(eq(entries.id, entryId));

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update entry error:', error);
    return { error: 'Une erreur est survenue lors de la modification' };
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

export async function getDetailedStats(startDate: Date, endDate: Date) {
  const session = await getSession();
  
  if (!session) {
    return null;
  }

  try {
    const userEntries = await db.query.entries.findMany({
      where: and(
        eq(entries.userId, session.userId),
        gte(entries.createdAt, startDate),
        lte(entries.createdAt, endDate)
      ),
      with: {
        emotion: {
          with: {
            category: true,
          },
        },
      },
      orderBy: [entries.createdAt],
    });

    if (userEntries.length === 0) {
      return {
        totalEntries: 0,
        averageIntensity: 0,
        mostFrequentEmotion: null,
        mostFrequentCategory: null,
        emotionDistribution: [],
        categoryDistribution: [],
        dailyAverages: [],
        weekdayDistribution: [],
        hourDistribution: [],
        streakDays: 0,
        contextTagsDistribution: [],
      };
    }

    // Stats de base
    const totalEntries = userEntries.length;
    const averageIntensity = userEntries.reduce((sum, e) => sum + e.intensity, 0) / totalEntries;

    // Distribution par émotion
    const emotionCounts: Record<string, { count: number; label: string; colorHex: string }> = {};
    userEntries.forEach((entry) => {
      const emotionId = entry.emotionId.toString();
      if (!emotionCounts[emotionId]) {
        emotionCounts[emotionId] = {
          count: 0,
          label: entry.emotion?.label || 'Inconnu',
          colorHex: entry.emotion?.colorHex || entry.emotion?.category?.colorHex || '#888888',
        };
      }
      emotionCounts[emotionId].count++;
    });
    const emotionDistribution = Object.entries(emotionCounts)
      .map(([id, data]) => ({ id, ...data, percentage: (data.count / totalEntries) * 100 }))
      .sort((a, b) => b.count - a.count);

    // Distribution par catégorie
    const categoryCounts: Record<string, { count: number; label: string; colorHex: string }> = {};
    userEntries.forEach((entry) => {
      const categoryId = entry.emotion?.categoryId?.toString() || 'unknown';
      if (!categoryCounts[categoryId]) {
        categoryCounts[categoryId] = {
          count: 0,
          label: entry.emotion?.category?.label || 'Inconnu',
          colorHex: entry.emotion?.category?.colorHex || '#888888',
        };
      }
      categoryCounts[categoryId].count++;
    });
    const categoryDistribution = Object.entries(categoryCounts)
      .map(([id, data]) => ({ id, ...data, percentage: (data.count / totalEntries) * 100 }))
      .sort((a, b) => b.count - a.count);

    // Moyennes par jour
    const entriesByDay: Record<string, typeof userEntries> = {};
    userEntries.forEach((entry) => {
      const date = entry.createdAt.toISOString().split('T')[0];
      if (!entriesByDay[date]) {
        entriesByDay[date] = [];
      }
      entriesByDay[date].push(entry);
    });
    const dailyAverages = Object.entries(entriesByDay).map(([date, dayEntries]) => ({
      date,
      averageIntensity: dayEntries.reduce((sum, e) => sum + e.intensity, 0) / dayEntries.length,
      count: dayEntries.length,
    }));

    // Distribution par jour de la semaine
    const weekdays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
    userEntries.forEach((entry) => {
      const day = new Date(entry.createdAt).getDay();
      weekdayCounts[day]++;
    });
    const weekdayDistribution = weekdays.map((label, index) => ({
      label,
      count: weekdayCounts[index],
      percentage: (weekdayCounts[index] / totalEntries) * 100,
    }));

    // Distribution par heure
    const hourCounts = Array(24).fill(0);
    userEntries.forEach((entry) => {
      const hour = new Date(entry.createdAt).getHours();
      hourCounts[hour]++;
    });
    const hourDistribution = hourCounts.map((count, hour) => ({
      hour,
      label: `${hour}h`,
      count,
      percentage: (count / totalEntries) * 100,
    }));

    // Calcul du streak (jours consécutifs)
    const sortedDates = Object.keys(entriesByDay).sort();
    let streakDays = 0;
    let currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        streakDays = Math.max(streakDays, currentStreak);
        currentStreak = 1;
      }
    }
    streakDays = Math.max(streakDays, currentStreak);

    // Distribution des tags de contexte
    const tagCounts: Record<string, number> = {};
    userEntries.forEach((entry) => {
      entry.contextTags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const contextTagsDistribution = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count, percentage: (count / totalEntries) * 100 }))
      .sort((a, b) => b.count - a.count);

    return {
      totalEntries,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      mostFrequentEmotion: emotionDistribution[0] || null,
      mostFrequentCategory: categoryDistribution[0] || null,
      emotionDistribution,
      categoryDistribution,
      dailyAverages,
      weekdayDistribution,
      hourDistribution,
      streakDays,
      contextTagsDistribution,
    };
  } catch (error) {
    console.error('Get detailed stats error:', error);
    return null;
  }
}
