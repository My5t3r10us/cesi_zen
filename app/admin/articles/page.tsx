import { getArticles } from '@/lib/actions/articles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DeleteArticleButton } from '@/components/admin/delete-article-button';

export default async function AdminArticlesPage() {
  const articles = await getArticles(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Articles
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les articles de conseils
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
          </Link>
        </Button>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun article pour le moment.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/articles/new">Créer le premier article</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{article.title}</h3>
                      <Badge variant={article.isPublished ? 'default' : 'secondary'}>
                        {article.isPublished ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      /{article.slug} • Créé le {format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Par {article.author?.prenom} {article.author?.nom || article.author?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/articles/${article.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteArticleButton articleId={article.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
