import { getArticleById } from '@/lib/actions/articles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/admin/article-form';
import { FileText } from 'lucide-react';
import { notFound } from 'next/navigation';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          Modifier l&apos;article
        </h1>
        <p className="text-muted-foreground mt-1">
          Éditez les informations de l&apos;article
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;article</CardTitle>
          <CardDescription>
            Modifiez les champs pour mettre à jour l&apos;article
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArticleForm article={article} />
        </CardContent>
      </Card>
    </div>
  );
}
