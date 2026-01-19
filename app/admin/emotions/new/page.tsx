import { getEmotionCategories } from '@/lib/actions/emotions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmotionForm } from '@/components/admin/emotion-form';
import { Heart } from 'lucide-react';

export default async function NewEmotionPage() {
  const categories = await getEmotionCategories();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary" />
          Nouvelle émotion
        </h1>
        <p className="text-muted-foreground mt-1">
          Ajoutez une émotion au référentiel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;émotion</CardTitle>
          <CardDescription>
            Les émotions sont rattachées à une catégorie (émotion de base)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmotionForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
