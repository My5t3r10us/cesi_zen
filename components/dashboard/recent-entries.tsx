import { getUserEntries } from '@/lib/actions/entries';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
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

export async function RecentEntries() {
  const entries = await getUserEntries();
  const recentEntries = entries.slice(0, 5);

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
      {recentEntries.map((entry) => {
        const Icon = iconMap[entry.emotion?.iconName || 'meh'] || Meh;
        
        return (
          <div 
            key={entry.id} 
            className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition"
          >
            <div 
              className="p-2 rounded-full shrink-0"
              style={{ backgroundColor: `${entry.emotion?.colorHex || '#8A9A5B'}20` }}
            >
              <Icon 
                className="h-5 w-5" 
                style={{ color: entry.emotion?.colorHex || '#8A9A5B' }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{entry.emotion?.label || 'Émotion'}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.createdAt), { 
                    addSuffix: true, 
                    locale: fr 
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Intensité: {entry.intensity}/10
                </Badge>
                {entry.contextTags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {entry.note && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {entry.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
