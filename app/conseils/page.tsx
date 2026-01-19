import { getArticles } from '@/lib/actions/articles';
import { getSession } from '@/lib/auth/session';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default async function ConseilsPage() {
  const session = await getSession();
  const articles = await getArticles(true); // Published only

  return (
    <div className="min-h-screen bg-background">
      <Header user={session ? { email: session.email, nom: session.nom, prenom: session.prenom, role: session.role } : undefined} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Ressources bien-être</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Conseils & Articles
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos articles rédigés par des experts pour vous accompagner 
              dans votre parcours de bien-être mental.
            </p>
          </div>

          {articles.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun article disponible pour le moment.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Revenez bientôt pour découvrir nos conseils !
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {articles.map((article) => (
                <Link key={article.id} href={`/conseils/${article.slug}`}>
                  <Card className="hover:shadow-lg transition-all hover:border-primary/30 group">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {article.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Par {article.author?.prenom} {article.author?.nom || ''} • {' '}
                            {format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: fr })}
                          </CardDescription>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">
                        {article.content.replace(/[#*`]/g, '').substring(0, 200)}...
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
