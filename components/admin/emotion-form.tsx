'use client';

import { useActionState, useState, useEffect } from 'react';
import { createEmotion, updateEmotion, EmotionState } from '@/lib/actions/emotions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Emotion, EmotionCategory } from '@/lib/db/schema';
import { generateColorVariations } from '@/lib/colors';

interface EmotionFormProps {
  emotion?: Emotion & { category?: EmotionCategory };
  categories: EmotionCategory[];
}

export function EmotionForm({ emotion, categories }: EmotionFormProps) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(emotion?.categoryId?.toString() || '');
  const [colorHex, setColorHex] = useState(emotion?.colorHex || '');
  const [colorVariations, setColorVariations] = useState<string[]>([]);

  const selectedCategory = categories.find(c => c.id.toString() === categoryId);

  useEffect(() => {
    if (selectedCategory?.colorHex) {
      const variations = generateColorVariations(selectedCategory.colorHex);
      setColorVariations(variations);
    } else {
      setColorVariations([]);
    }
  }, [selectedCategory]);

  const action = emotion
    ? updateEmotion.bind(null, emotion.id)
    : createEmotion;

  const [state, formAction, pending] = useActionState<EmotionState, FormData>(
    async (prevState, formData) => {
      const result = await action(prevState, formData);
      if (result.success) {
        toast.success(emotion ? 'Émotion mise à jour !' : 'Émotion créée !');
        router.push('/admin/emotions');
      }
      return result;
    },
    {}
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="label">Nom de l&apos;émotion *</Label>
        <Input
          type="text"
          id="label"
          name="label"
          required
          defaultValue={emotion?.label || ''}
          placeholder="Ex: Fierté, Frustration, Anxiété..."
          className="h-11"
        />
        {state.fieldErrors?.label && (
          <p className="text-sm text-destructive">{state.fieldErrors.label[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Catégorie (émotion de base) *</Label>
        <input type="hidden" name="categoryId" value={categoryId} />
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.colorHex }}
                  />
                  {category.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.categoryId && (
          <p className="text-sm text-destructive">{state.fieldErrors.categoryId[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="colorHex">Couleur personnalisée (optionnel)</Label>
        
        {colorVariations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Suggestions de nuances basées sur la catégorie :
            </p>
            <div className="flex gap-2 flex-wrap">
              {colorVariations.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setColorHex(color)}
                  className="relative w-12 h-12 rounded-lg border-2 transition-all hover:scale-110"
                  style={{ 
                    backgroundColor: color,
                    borderColor: colorHex === color ? '#000' : 'transparent'
                  }}
                  title={color}
                >
                  {colorHex === color && (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-lg" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Input
            type="color"
            id="colorHex"
            name="colorHex"
            value={colorHex || selectedCategory?.colorHex || '#888888'}
            onChange={(e) => setColorHex(e.target.value)}
            className="w-16 h-11 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            placeholder="Hérite de la catégorie"
            className="h-11 flex-1"
          />
          {colorHex && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setColorHex('')}
            >
              Réinitialiser
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Si non définie, la couleur de la catégorie sera utilisée
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="iconName">Icône personnalisée (optionnel)</Label>
        <Input
          type="text"
          id="iconName"
          name="iconName"
          defaultValue={emotion?.iconName || ''}
          placeholder="Hérite de la catégorie"
          className="h-11"
        />
        <p className="text-sm text-muted-foreground">
          Si non définie, l&apos;icône de la catégorie sera utilisée
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {emotion ? 'Mise à jour...' : 'Création...'}
            </>
          ) : (
            emotion ? 'Mettre à jour' : 'Créer l\'émotion'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
