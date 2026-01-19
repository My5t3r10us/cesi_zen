import { getEmotionById, getEmotionCategories } from '@/lib/actions/emotions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmotionForm } from '@/components/admin/emotion-form';
import { Heart } from 'lucide-react';
import { notFound } from 'next/navigation';

interface EditEmotionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmotionPage({ params }: EditEmotionPageProps) {
  const { id } = await params;
  const [emotion, categories] = await Promise.all([
    getEmotionById(parseInt(id, 10)),
    getEmotionCategories(),
  ]);

  if (!emotion) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary" />
          Modifier l&apos;émotion
        </h1>
        <p className="text-muted-foreground mt-1">
          Éditez les informations de l&apos;émotion
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;émotion</CardTitle>
          <CardDescription>
            Modifiez les champs pour mettre à jour l&apos;émotion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmotionForm emotion={emotion} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
