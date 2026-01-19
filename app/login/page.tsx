'use client';

import { useActionState } from 'react';
import { login, AuthState } from '@/lib/actions/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, {});

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-8">Connexion</h1>
        
        <form action={formAction} className="space-y-6">
          {state.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            S&apos;inscrire
          </Link>
        </p>

        <p className="mt-4 text-center">
          <Link href="/" className="text-slate-500 hover:text-slate-700 text-sm">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
