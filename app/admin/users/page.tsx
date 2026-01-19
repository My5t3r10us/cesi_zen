import { getUsers } from '@/lib/actions/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BanUserButton } from '@/components/admin/ban-user-button';

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          Utilisateurs
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez les comptes utilisateurs
        </p>
      </div>

      {/* Warning about privacy */}
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
        <p className="text-primary text-sm flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Les notes des utilisateurs sont chiffrées et techniquement inaccessibles aux administrateurs.
        </p>
      </div>

      {/* Users list */}
      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className={user.isBanned ? 'border-destructive/50 bg-destructive/5' : ''}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {user.prenom} {user.nom || user.email}
                    </span>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    {user.isBanned && (
                      <Badge variant="destructive">Banni</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inscrit le {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                
                {user.role !== 'admin' && (
                  <BanUserButton userId={user.id} isBanned={user.isBanned} />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
