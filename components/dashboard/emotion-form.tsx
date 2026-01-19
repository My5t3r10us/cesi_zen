'use client';

import { useActionState, useState } from 'react';
import { createEntry, EntryState } from '@/lib/actions/entries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Check, Smile, Frown, Meh, Heart, Zap, Cloud, Sun, Moon, Flame, AlertTriangle, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Emotion, EmotionCategory } from '@/lib/db/schema';

const iconMap: Record<string, React.ElementType> = {
  smile: Smile,
  frown: Frown,
  meh: Meh,
  heart: Heart,
  zap: Zap,
  cloud: Cloud,
  sun: Sun,
  moon: Moon,
  flame: Flame,
  'alert-triangle': AlertTriangle,
  'thumbs-down': ThumbsDown,
};

type EmotionWithCategory = Emotion & { category?: EmotionCategory };

interface EmotionFormProps {
  emotions: EmotionWithCategory[];
  categories?: EmotionCategory[];
  hasTodayEntry?: boolean;
}

const contextTags = [
  'Travail', 'Famille', 'Santé', 'Sport', 'Sommeil', 
  'Relations', 'Finances', 'Loisirs', 'Météo', 'Actualités'
];

export function EmotionForm({ emotions, categories, hasTodayEntry }: EmotionFormProps) {
  // Grouper les émotions par catégorie
  const groupedEmotions = emotions.reduce((acc, emotion) => {
    const categoryId = emotion.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: emotion.category,
        emotions: [],
      };
    }
    acc[categoryId].emotions.push(emotion);
    return acc;
  }, {} as Record<number, { category?: EmotionCategory; emotions: EmotionWithCategory[] }>);
  
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
  const [intensity, setIntensity] = useState([5]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [state, formAction, pending] = useActionState<EntryState, FormData>(
    async (prevState, formData) => {
      const result = await createEntry(prevState, formData);
      if (result.success) {
        toast.success('Votre humeur a été enregistrée !');
        setSelectedEmotion(null);
        setIntensity([5]);
        setSelectedTags([]);
      }
      return result;
    },
    {}
  );

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {state.error}
        </div>
      )}

      {/* Sélection de l'émotion par catégorie */}
      <div className="space-y-4">
        <Label>Comment vous sentez-vous ?</Label>
        {Object.entries(groupedEmotions).map(([categoryId, group]) => {
          const categoryColor = group.category?.colorHex || '#888888';
          const CategoryIcon = iconMap[group.category?.iconName || 'meh'] || Meh;
          
          return (
            <div key={categoryId} className="space-y-2">
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-4 w-4" style={{ color: categoryColor }} />
                <span className="text-sm font-medium" style={{ color: categoryColor }}>
                  {group.category?.label || 'Autres'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.emotions.map((emotion: EmotionWithCategory) => {
                  const emotionColor = emotion.colorHex || categoryColor;
                  const isSelected = selectedEmotion === emotion.id;
                  
                  return (
                    <button
                      key={emotion.id}
                      type="button"
                      onClick={() => setSelectedEmotion(emotion.id)}
                      className={cn(
                        'px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium',
                        isSelected 
                          ? 'border-primary bg-primary/10 shadow-md' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      )}
                      style={{
                        borderColor: isSelected ? undefined : emotionColor + '50',
                        backgroundColor: isSelected ? undefined : emotionColor + '10',
                      }}
                    >
                      {emotion.label}
                      {isSelected && <Check className="inline-block ml-1 h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <input type="hidden" name="emotionId" value={selectedEmotion || ''} />
      </div>

      {/* Intensité */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Intensité</Label>
          <span className="text-sm font-medium text-primary">{intensity[0]}/10</span>
        </div>
        <Slider
          value={intensity}
          onValueChange={setIntensity}
          max={10}
          min={1}
          step={1}
          className="py-4"
        />
        <input type="hidden" name="intensity" value={intensity[0]} />
      </div>

      {/* Tags de contexte */}
      <div className="space-y-3">
        <Label>Contexte (optionnel)</Label>
        <div className="flex flex-wrap gap-2">
          {contextTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer transition-all"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        {selectedTags.map(tag => (
          <input key={tag} type="hidden" name="contextTags" value={tag} />
        ))}
      </div>

      {/* Note privée */}
      <div className="space-y-3">
        <Label htmlFor="note">Note privée (optionnelle, chiffrée)</Label>
        <Textarea
          id="note"
          name="note"
          placeholder="Décrivez votre journée, vos pensées..."
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          🔒 Votre note est chiffrée et uniquement accessible par vous
        </p>
      </div>

      {/* Bouton submit */}
      <Button 
        type="submit" 
        disabled={pending || !selectedEmotion}
        className="w-full"
        size="lg"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          'Enregistrer mon humeur'
        )}
      </Button>
    </form>
  );
}
