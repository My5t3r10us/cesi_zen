import { getSession } from '@/lib/auth/session';
import { getEmotions, getUserEntries, getEntriesStats } from '@/lib/actions/entries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmotionForm } from '@/components/dashboard/emotion-form';
import { RecentEntries } from '@/components/dashboard/recent-entries';
import { MoodChart } from '@/components/dashboard/mood-chart';
import { Sun, TrendingUp, Calendar } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getSession();
  const emotions = await getEmotions();
  const stats = await getEntriesStats();
  
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  const todayEntries = await getUserEntries(startOfDay, endOfDay);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="space-y-6">
      {/* Header de bienvenue */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {greeting()}, {session?.prenom || 'cher utilisateur'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Comment vous sentez-vous aujourd&apos;hui ?
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </div>
      </div>

      {/* Météo du jour - Bouton d'ajout d'émotion */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Sun className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Météo du jour</h3>
                <p className="text-sm text-muted-foreground">
                  {todayEntries.length > 0 
                    ? `${todayEntries.length} entrée${todayEntries.length > 1 ? 's' : ''} aujourd'hui`
                    : 'Aucune entrée aujourd\'hui'}
                </p>
              </div>
            </div>
            <EmotionForm emotions={emotions} hasTodayEntry={todayEntries.length > 0} />
          </div>
        </CardContent>
      </Card>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{stats?.totalEntries || 0}</div>
            <p className="text-sm text-muted-foreground">Entrées ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{todayEntries.length}</div>
            <p className="text-sm text-muted-foreground">Entrées aujourd&apos;hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {stats?.dailyAverages?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Jours actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-primary">
                {stats?.dailyAverages?.length 
                  ? Math.round(stats.dailyAverages.reduce((a, b) => a + b.averageIntensity, 0) / stats.dailyAverages.length * 10) / 10
                  : '-'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Intensité moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique d'évolution */}
      {stats?.dailyAverages && stats.dailyAverages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Évolution de votre humeur</CardTitle>
            <CardDescription>
              Tendances des 30 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MoodChart data={stats.dailyAverages} />
          </CardContent>
        </Card>
      )}

      {/* Entrées récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Entrées récentes</CardTitle>
          <CardDescription>
            Vos dernières humeurs enregistrées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentEntries />
        </CardContent>
      </Card>
    </div>
  );
}
