import Link from 'next/link';
import { getSession } from '@/lib/auth/session';

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">MyApp</span>
          <div className="flex gap-4">
            {session ? (
              <>
                <Link
                  href="/app"
                  className="px-4 py-2 text-white hover:text-blue-400 transition"
                >
                  Dashboard
                </Link>
                {session.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-white hover:text-blue-400 transition"
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-white hover:text-blue-400 transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Bienvenue sur{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-br from-blue-400 to-purple-500">
              MyApp
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Une application moderne construite avec Next.js, Drizzle ORM et PostgreSQL.
            Système d&apos;authentification complet avec gestion des rôles.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {session ? (
              <Link
                href="/app"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-lg"
              >
                Accéder au Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-lg"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 border border-slate-600 hover:border-slate-500 text-white font-semibold rounded-xl transition text-lg"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Authentification sécurisée</h3>
            <p className="text-slate-400">
              Système de connexion avec hash de mot de passe et sessions JWT sécurisées.
            </p>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Gestion des rôles</h3>
            <p className="text-slate-400">
              Système de rôles avec accès différenciés pour utilisateurs et administrateurs.
            </p>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">PostgreSQL & Drizzle</h3>
            <p className="text-slate-400">
              Base de données robuste avec Drizzle ORM pour des requêtes type-safe.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-slate-800">
        <p className="text-center text-slate-500">
          2024 MyApp. Construit avec Next.js, Drizzle & PostgreSQL.
        </p>
      </footer>
    </div>
  );
}
