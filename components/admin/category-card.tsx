'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteCategory, deleteEmotion } from '@/lib/actions/emotions';
import { toast } from 'sonner';
import { EmotionCategory, Emotion } from '@/lib/db/schema';

interface CategoryCardProps {
  category: EmotionCategory & { emotions: Emotion[] };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const handleDeleteCategory = async () => {
    if (!confirm(`Supprimer la catégorie "${category.label}" et toutes ses émotions ?`)) return;
    
    const result = await deleteCategory(category.id);
    if (result.success) {
      toast.success('Catégorie supprimée');
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  const handleDeleteEmotion = async (emotion: Emotion) => {
    if (!confirm(`Supprimer l'émotion "${emotion.label}" ?`)) return;
    
    const result = await deleteEmotion(emotion.id);
    if (result.success) {
      toast.success('Émotion supprimée');
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: category.colorHex + '30' }}
            >
              <span style={{ color: category.colorHex }}>●</span>
            </div>
            <div>
              <CardTitle className="text-lg">{category.label}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {category.emotions?.length || 0} émotion(s)
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/emotions/categories/${category.id}`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleDeleteCategory}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {category.emotions?.map((emotion) => (
            <Badge
              key={emotion.id}
              variant="secondary"
              className="flex items-center gap-2 py-1.5 px-3"
              style={{ 
                backgroundColor: (emotion.colorHex || category.colorHex) + '20',
                borderColor: emotion.colorHex || category.colorHex,
              }}
            >
              <span>{emotion.label}</span>
              <div className="flex items-center gap-1 ml-1">
                <Link href={`/admin/emotions/${emotion.id}`}>
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0"
                  onClick={() => handleDeleteEmotion(emotion)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </Badge>
          ))}
          {(!category.emotions || category.emotions.length === 0) && (
            <p className="text-sm text-muted-foreground italic">
              Aucune émotion dans cette catégorie
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
