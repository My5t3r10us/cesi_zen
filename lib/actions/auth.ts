'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, deleteSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { registerSchema, loginSchema } from '@/lib/validation/schemas';

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function register(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    nom: formData.get('nom') as string || undefined,
    prenom: formData.get('prenom') as string || undefined,
  };

  // Validation Zod
  const validationResult = registerSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    return { 
      error: 'Validation échouée',
      fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const { email, password, nom, prenom } = validationResult.data;

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: 'Un compte avec cet email existe déjà' };
    }

    const passwordHash = hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        nom,
        prenom,
        role: 'user',
      })
      .returning();

    await createSession(newUser);
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Une erreur est survenue lors de l\'inscription' };
  }

  redirect('/dashboard');
}

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  // Validation Zod
  const validationResult = loginSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    return { 
      error: 'Validation échouée',
      fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const { email, password } = validationResult.data;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return { error: 'Email ou mot de passe incorrect' };
    }

    // Vérifier si l'utilisateur est banni
    if (user.isBanned) {
      return { error: 'Votre compte a été suspendu. Contactez l\'administrateur.' };
    }

    const isValidPassword = verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return { error: 'Email ou mot de passe incorrect' };
    }

    await createSession(user);
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Une erreur est survenue lors de la connexion' };
  }

  redirect('/dashboard');
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/');
}
