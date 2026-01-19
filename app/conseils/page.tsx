import { getArticles, getArticleCategories } from '@/lib/actions/articles';
import { getSession } from '@/lib/auth/session';
import { Header } from '@/components/layout/header';
import { ArticlesList } from '@/components/conseils/articles-list';
import { BookOpen } from 'lucide-react';

export default async function ConseilsPage() {
  const session = await getSession();
  const articles = await getArticles(true);
  const categories = await getArticleCategories();

  return (
    <div className="min-h-screen bg-background">
      <Header user={session ? { email: session.email, nom: session.nom, prenom: session.prenom, role: session.role } : undefined} />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 text-primary mb-3 md:mb-4">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs md:text-sm font-medium">Blog bien-être</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Conseils & Articles
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Découvrez nos articles rédigés par des experts pour vous accompagner 
              dans votre parcours de bien-être mental.
            </p>
          </div>

          <ArticlesList articles={articles} categories={categories} />
        </div>
      </main>
    </div>
  );
}
