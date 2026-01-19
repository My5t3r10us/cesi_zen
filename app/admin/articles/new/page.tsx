import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/admin/article-form';
import { getArticleCategories } from '@/lib/actions/articles';
import { FileText } from 'lucide-react';

export default async function NewArticlePage() {
  const categories = await getArticleCategories();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          Nouvel article
        </h1>
        <p className="text-muted-foreground mt-1">
          Créez un nouvel article de conseils
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;article</CardTitle>
          <CardDescription>
            Remplissez les champs pour créer votre article
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArticleForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
