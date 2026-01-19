import { getEntriesStats, getUserEntries } from '@/lib/actions/entries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoodChart } from '@/components/dashboard/mood-chart';
import { EmotionDistribution } from '@/components/dashboard/emotion-distribution';
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react';

export default async function StatsPage() {
  const stats = await getEntriesStats();
  const entries = await getUserEntries();

  // Calculer la distribution des émotions
  const emotionCounts = entries.reduce((acc, entry) => {
    const label = entry.emotion?.label || 'Autre';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const emotionData = Object.entries(emotionCounts).map(([name, value]) => ({
    name,
    value,
    color: entries.find(e => e.emotion?.label === name)?.emotion?.colorHex || '#8A9A5B',
  }));

  // Calcul des statistiques
  const averageIntensity = entries.length > 0
    ? Math.round(entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length * 10) / 10
    : 0;

  const currentStreak = calculateStreak(entries);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" />
          Mes Statistiques
        </h1>
        <p className="text-muted-foreground mt-1">
          Analysez vos tendances émotionnelles
        </p>
      </div>

      {/* Cartes de stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{entries.length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total entrées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{averageIntensity}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Intensité moyenne</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold">{currentStreak}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Jours consécutifs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{Object.keys(emotionCounts).length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Émotions différentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique d'évolution */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution de l&apos;humeur</CardTitle>
          <CardDescription>
            Intensité moyenne par jour sur les 30 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.dailyAverages && stats.dailyAverages.length > 0 ? (
            <MoodChart data={stats.dailyAverages} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Pas assez de données pour afficher le graphique
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution des émotions */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution des émotions</CardTitle>
          <CardDescription>
            Répartition de vos émotions enregistrées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emotionData.length > 0 ? (
            <EmotionDistribution data={emotionData} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Pas assez de données pour afficher le graphique
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function calculateStreak(entries: { createdAt: Date }[]): number {
  if (entries.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sortedDates = [...new Set(
    entries.map(e => {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  )].sort((a, b) => b - a);

  let streak = 0;
  let currentDate = today.getTime();

  for (const date of sortedDates) {
    if (date === currentDate) {
      streak++;
      currentDate -= 24 * 60 * 60 * 1000;
    } else if (date === currentDate - 24 * 60 * 60 * 1000) {
      currentDate = date;
      streak++;
      currentDate -= 24 * 60 * 60 * 1000;
    } else {
      break;
    }
  }

  return streak;
}
