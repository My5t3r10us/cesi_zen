import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Heart, Brain, Shield, Sparkles, BookOpen } from 'lucide-react';

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
      <Header user={session ? { email: session.email, nom: session.nom, prenom: session.prenom, role: session.role } : undefined} />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Votre bien-être, notre priorité</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenue sur{' '}
            <span className="text-primary">CESIZen</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Prenez soin de votre santé mentale au quotidien. Suivez vos émotions, 
            accédez à des conseils personnalisés et cultivez votre bien-être intérieur.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {session ? (
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/dashboard">
                  <Leaf className="mr-2 h-5 w-5" />
                  Accéder à mon espace
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="text-lg px-8">
                  <Link href="/register">
                    Commencer gratuitement
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <Link href="/login">
                    Se connecter
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Journal émotionnel</h3>
              <p className="text-muted-foreground">
                Enregistrez vos émotions quotidiennes et suivez leur évolution grâce à un journal intime et sécurisé.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-accent/30 rounded-xl flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyses et insights</h3>
              <p className="text-muted-foreground">
                Visualisez vos tendances émotionnelles avec des graphiques clairs et comprenez vos patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Conseils d&apos;experts</h3>
              <p className="text-muted-foreground">
                Accédez à une bibliothèque d&apos;articles et de conseils validés pour améliorer votre bien-être.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trust Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            <span>Vos données sont chiffrées et protégées - Conforme RGPD</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">CESIZen</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 CESIZen - Ministère de la Santé. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <Link href="/conseils" className="text-sm text-muted-foreground hover:text-primary transition">
              Conseils
            </Link>
            <Link href="/mentions-legales" className="text-sm text-muted-foreground hover:text-primary transition">
              Mentions légales
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
