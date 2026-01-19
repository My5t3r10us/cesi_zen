'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, deleteSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function register(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nom = formData.get('nom') as string;
  const prenom = formData.get('prenom') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!nom || !prenom || !email || !password) {
    return { error: 'Tous les champs sont requis' };
  }

  if (password !== confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas' };
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères' };
  }

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: 'Un compte avec cet email existe déjà' };
    }

    const hashedPassword = hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        nom,
        prenom,
        email,
        password: hashedPassword,
        role: 'user',
      })
      .returning();

    await createSession(newUser);
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Une erreur est survenue lors de l\'inscription' };
  }

  redirect('/app');
}

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email et mot de passe requis' };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return { error: 'Email ou mot de passe incorrect' };
    }

    const isValidPassword = verifyPassword(password, user.password);

    if (!isValidPassword) {
      return { error: 'Email ou mot de passe incorrect' };
    }

    await createSession(user);
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Une erreur est survenue lors de la connexion' };
  }

  redirect('/app');
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/');
}
