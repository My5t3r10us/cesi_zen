import { getSession } from '@/lib/auth/session';
import { logout } from '@/lib/actions/auth';
import Link from 'next/link';

export default async function AppDashboard() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-slate-800">
              MyApp
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/app" className="text-slate-600 hover:text-slate-800 font-medium">
                Dashboard
              </Link>
              {session?.role === 'admin' && (
                <Link href="/admin" className="text-slate-600 hover:text-slate-800 font-medium">
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  {session?.email}
                </span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  >
                    Déconnexion
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Bienvenue sur votre Dashboard
          </h1>
          <p className="text-slate-600 mb-8">
            Vous êtes connecté en tant que <span className="font-medium">{session?.role}</span>.
          </p>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-1">12</div>
              <div className="text-slate-600">Projets actifs</div>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-1">48</div>
              <div className="text-slate-600">Tâches complétées</div>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-1">5</div>
              <div className="text-slate-600">En attente</div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Zone protégée
            </h2>
            <p className="text-blue-700">
              Cette page est accessible uniquement aux utilisateurs connectés.
              Le middleware vérifie votre session JWT avant de vous autoriser l&apos;accès.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
