'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, desc, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type AdminState = {
  error?: string;
  success?: boolean;
};

export async function getUsers() {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    return [];
  }

  try {
    // Récupérer tous les utilisateurs SANS les notes (les admins n'ont pas accès aux notes)
    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
      orderBy: [desc(users.createdAt)],
    });

    return allUsers;
  } catch (error) {
    console.error('Get users error:', error);
    return [];
  }
}

export async function toggleBanUser(userId: string): Promise<AdminState> {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    return { error: 'Non autorisé' };
  }

  // Empêcher l'admin de se bannir lui-même
  if (userId === session.userId) {
    return { error: 'Vous ne pouvez pas vous bannir vous-même' };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { error: 'Utilisateur non trouvé' };
    }

    // Empêcher de bannir un autre admin
    if (user.role === 'admin') {
      return { error: 'Vous ne pouvez pas bannir un administrateur' };
    }

    await db.update(users)
      .set({ isBanned: !user.isBanned })
      .where(eq(users.id, userId));

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Toggle ban user error:', error);
    return { error: 'Une erreur est survenue' };
  }
}

export async function getAdminStats() {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    return null;
  }

  try {
    const allUsers = await db.query.users.findMany({
      columns: { id: true, role: true, isBanned: true, createdAt: true },
    });

    const totalUsers = allUsers.length;
    const bannedUsers = allUsers.filter(u => u.isBanned).length;
    const admins = allUsers.filter(u => u.role === 'admin').length;

    // Utilisateurs créés cette semaine
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = allUsers.filter(u => u.createdAt >= oneWeekAgo).length;

    const allArticles = await db.query.articles.findMany({
      columns: { id: true, isPublished: true },
    });

    const totalArticles = allArticles.length;
    const publishedArticles = allArticles.filter(a => a.isPublished).length;

    return {
      totalUsers,
      bannedUsers,
      admins,
      newUsersThisWeek,
      totalArticles,
      publishedArticles,
    };
  } catch (error) {
    console.error('Get admin stats error:', error);
    return null;
  }
}
