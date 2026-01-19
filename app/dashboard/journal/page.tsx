import { getUserEntries } from '@/lib/actions/entries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JournalCalendar } from '@/components/dashboard/journal-calendar';
import { Calendar } from 'lucide-react';

export default async function JournalPage() {
  const entries = await getUserEntries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-7 w-7 text-primary" />
          Mon Journal
        </h1>
        <p className="text-muted-foreground mt-1">
          Consultez l&apos;historique de vos émotions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendrier émotionnel</CardTitle>
          <CardDescription>
            Cliquez sur une date pour voir le détail de vos entrées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JournalCalendar entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
