'use client';

import { useState } from 'react';
import { toggleBanUser } from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';
import { Ban, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BanUserButtonProps {
  userId: string;
  isBanned: boolean;
}

export function BanUserButton({ userId, isBanned }: BanUserButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleBan = async () => {
    setIsLoading(true);
    const result = await toggleBanUser(userId);
    setIsLoading(false);
    
    if (result.success) {
      toast.success(isBanned ? 'Utilisateur débanni' : 'Utilisateur banni');
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  return (
    <Button 
      variant={isBanned ? 'outline' : 'destructive'} 
      size="sm"
      onClick={handleToggleBan}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isBanned ? (
        <>
          <CheckCircle className="h-4 w-4 mr-1" />
          Débannir
        </>
      ) : (
        <>
          <Ban className="h-4 w-4 mr-1" />
          Bannir
        </>
      )}
    </Button>
  );
}
