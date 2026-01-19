import { getUserEntries, getEmotions } from '@/lib/actions/entries';
import { EntryCard } from './entry-card';

export async function RecentEntries() {
  const entries = await getUserEntries();
  const emotions = await getEmotions();
  const recentEntries = entries.slice(0, 10);

  if (recentEntries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucune entrée pour le moment.</p>
        <p className="text-sm mt-1">Commencez par enregistrer votre première humeur !</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentEntries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} emotions={emotions} />
      ))}
    </div>
  );
}
