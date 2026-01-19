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
      <main className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 text-primary mb-4 md:mb-6">
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm font-medium">Votre bien-être, notre priorité</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Bienvenue sur{' '}
            <span className="text-primary">CESIZen</span>
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-10 max-w-2xl mx-auto px-2">
            Prenez soin de votre santé mentale au quotidien. Suivez vos émotions, 
            accédez à des conseils personnalisés et cultivez votre bien-être intérieur.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 sm:px-0">
            {session ? (
              <Button size="lg" asChild className="text-base md:text-lg px-6 md:px-8 w-full sm:w-auto">
                <Link href="/dashboard">
                  <Leaf className="mr-2 h-5 w-5" />
                  Accéder à mon espace
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="text-base md:text-lg px-6 md:px-8 w-full sm:w-auto">
                  <Link href="/register">
                    Commencer gratuitement
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base md:text-lg px-6 md:px-8 w-full sm:w-auto">
                  <Link href="/login">
                    Se connecter
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-20">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="pt-5 md:pt-6 px-4 md:px-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                <Heart className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Journal émotionnel</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Enregistrez vos émotions quotidiennes et suivez leur évolution grâce à un journal intime et sécurisé.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="pt-5 md:pt-6 px-4 md:px-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/30 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                <Brain className="h-5 w-5 md:h-6 md:w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Analyses et insights</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Visualisez vos tendances émotionnelles avec des graphiques clairs et comprenez vos patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-5 md:pt-6 px-4 md:px-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-xl flex items-center justify-center mb-3 md:mb-4">
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Conseils d&apos;experts</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Accédez à une bibliothèque d&apos;articles et de conseils validés pour améliorer votre bien-être.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trust Section */}
        <div className="mt-12 md:mt-20 text-center px-4">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-sm md:text-base">
            <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
            <span>Vos données sont chiffrées et protégées - Conforme RGPD</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 md:py-8 border-t border-border mt-8 md:mt-12">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">CESIZen</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            © 2025 CESIZen - Ministère de la Santé. Tous droits réservés.
          </p>
          <div className="flex gap-4 justify-center md:justify-end">
            <Link href="/conseils" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition">
              Conseils
            </Link>
            <Link href="/mentions-legales" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition">
              Mentions légales
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
