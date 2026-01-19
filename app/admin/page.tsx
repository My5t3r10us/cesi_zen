import { getAdminStats } from '@/lib/actions/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, ShieldAlert, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Tableau de bord Admin
        </h1>
        <p className="text-muted-foreground mt-1">
          Vue d&apos;ensemble de l&apos;application CESIZen
        </p>
      </div>

      {/* Warning Box */}
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
        <p className="text-destructive text-sm flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Cette zone est réservée aux administrateurs. Les notes des utilisateurs sont chiffrées et inaccessibles.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats?.totalUsers || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Utilisateurs totaux</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats?.newUsersThisWeek || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Nouveaux cette semaine</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold">{stats?.publishedArticles || 0}/{stats?.totalArticles || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Articles publiés</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold">{stats?.bannedUsers || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Utilisateurs bannis</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des articles</CardTitle>
            <CardDescription>
              Créez et gérez les articles de conseils
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link 
              href="/admin/articles" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <FileText className="h-4 w-4" />
              Accéder aux articles →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <CardDescription>
              Gérez les comptes et les bannissements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link 
              href="/admin/users" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Users className="h-4 w-4" />
              Accéder aux utilisateurs →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
