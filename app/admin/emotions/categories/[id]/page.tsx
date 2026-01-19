import { getCategoryById } from '@/lib/actions/emotions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryForm } from '@/components/admin/category-form';
import { FolderEdit } from 'lucide-react';
import { notFound } from 'next/navigation';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getCategoryById(parseInt(id, 10));

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <FolderEdit className="h-7 w-7 text-primary" />
          Modifier la catégorie
        </h1>
        <p className="text-muted-foreground mt-1">
          Éditez les informations de la catégorie
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la catégorie</CardTitle>
          <CardDescription>
            Modifiez les champs pour mettre à jour la catégorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm category={category} />
        </CardContent>
      </Card>
    </div>
  );
}
