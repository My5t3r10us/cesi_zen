'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JournalCalendar } from '@/components/dashboard/journal-calendar';
import { Calendar } from 'lucide-react';

export default function JournalPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [entries, setEntries] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [emotions, setEmotions] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    const [entriesData, emotionsData] = await Promise.all([
      fetch('/api/entries').then((r) => r.json()),
      fetch('/api/emotions').then((r) => r.json()),
    ]);
    setEntries(Array.isArray(entriesData) ? entriesData : []);
    setEmotions(Array.isArray(emotionsData) ? emotionsData : []);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-6 w-6 md:h-7 md:w-7 text-primary" />
          Mon Journal
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Consultez l&apos;historique de vos émotions
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2 md:pb-6">
          <CardTitle className="text-base md:text-lg">Calendrier émotionnel</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Cliquez sur une date pour voir le détail de vos entrées
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 md:px-6">
          <JournalCalendar entries={entries} emotions={emotions} onSuccess={fetchData} />
        </CardContent>
      </Card>
    </div>
  );
}
