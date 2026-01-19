import { getSession } from '@/lib/auth/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { logout } from '@/lib/actions/auth';

export default async function ProfilPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const getInitials = () => {
    if (session.prenom && session.nom) {
      return `${session.prenom[0]}${session.nom[0]}`.toUpperCase();
    }
    return session.email[0].toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <User className="h-7 w-7 text-primary" />
          Mon Profil
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos informations personnelles
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>
                {session.prenom} {session.nom || ''}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant={session.role === 'admin' ? 'default' : 'secondary'}>
                  {session.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{session.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Sécurité</p>
              <p className="font-medium">Vos notes sont chiffrées de bout en bout</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions du compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={logout}>
            <Button variant="outline" type="submit" className="w-full justify-start">
              Se déconnecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
