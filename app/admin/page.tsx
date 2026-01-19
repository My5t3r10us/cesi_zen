import { getSession } from '@/lib/auth/session';
import { logout } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getSession();
  const allUsers = await db.select({
    id: users.id,
    nom: users.nom,
    prenom: users.prenom,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
  }).from(users);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-2xl font-bold text-white">
                MyApp
              </Link>
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                ADMIN
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/app" className="text-slate-300 hover:text-white font-medium">
                Dashboard
              </Link>
              <Link href="/admin" className="text-white font-medium">
                Admin
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">
                  {session?.email}
                </span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
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
        <div className="max-w-6xl">
          <h1 className="text-3xl font-bold text-white mb-2">
            Panel Administrateur
          </h1>
          <p className="text-slate-400 mb-8">
            Gérez les utilisateurs et les paramètres de l&apos;application.
          </p>

          {/* Warning Box */}
          <div className="p-4 bg-red-900/30 border border-red-700 rounded-xl mb-8">
            <p className="text-red-300 text-sm">
              ⚠️ Cette zone est réservée aux administrateurs. Toutes les actions sont enregistrées.
            </p>
          </div>

          {/* Users Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">
                Utilisateurs ({allUsers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Créé le
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {user.prenom} {user.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            user.role === 'admin'
                              ? 'bg-red-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {user.createdAt.toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
