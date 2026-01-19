'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Smile, Frown, Meh, Heart, Zap, Cloud, Sun, Moon } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  smile: Smile,
  frown: Frown,
  meh: Meh,
  heart: Heart,
  zap: Zap,
  cloud: Cloud,
  sun: Sun,
  moon: Moon,
};

interface JournalEntry {
  id: string;
  emotionId: number;
  intensity: number;
  note: string | null;
  contextTags: string[] | null;
  createdAt: Date;
  emotion: {
    id: number;
    label: string;
    colorHex: string;
    iconName: string;
  } | null;
}

interface JournalCalendarProps {
  entries: JournalEntry[];
}

export function JournalCalendar({ entries }: JournalCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Trouver les dates avec des entrées
  const datesWithEntries = entries.map(entry => new Date(entry.createdAt));
  
  // Entrées pour la date sélectionnée
  const selectedEntries = selectedDate 
    ? entries.filter(entry => isSameDay(new Date(entry.createdAt), selectedDate))
    : [];

  // Modifier le style des jours avec des entrées
  const modifiers = {
    hasEntry: datesWithEntries,
  };

  const modifiersStyles = {
    hasEntry: {
      backgroundColor: 'rgba(138, 154, 91, 0.2)',
      borderRadius: '50%',
    },
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={fr}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-md border"
        />
      </div>

      <div>
        <h3 className="font-semibold mb-4">
          {selectedDate 
            ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })
            : 'Sélectionnez une date'}
        </h3>

        {selectedEntries.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune entrée pour cette date.
          </p>
        ) : (
          <div className="space-y-4">
            {selectedEntries.map((entry) => {
              const Icon = iconMap[entry.emotion?.iconName || 'meh'] || Meh;
              
              return (
                <Card key={entry.id} className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-2 rounded-full shrink-0"
                        style={{ backgroundColor: `${entry.emotion?.colorHex || '#8A9A5B'}20` }}
                      >
                        <Icon 
                          className="h-5 w-5" 
                          style={{ color: entry.emotion?.colorHex || '#8A9A5B' }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{entry.emotion?.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.createdAt), 'HH:mm')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {entry.intensity}/10
                          </Badge>
                          {entry.contextTags?.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {entry.note && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
