'use client';

import { useState } from 'react';
import { toggleAdminRole } from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldMinus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PromoteUserButtonProps {
  userId: string;
  isAdmin: boolean;
}

export function PromoteUserButton({ userId, isAdmin }: PromoteUserButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    const result = await toggleAdminRole(userId);
    setIsLoading(false);

    if (result.success) {
      toast.success(isAdmin ? 'Droits admin retirés' : 'Utilisateur promu administrateur');
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={isAdmin ? 'border-orange-300 text-orange-600 hover:bg-orange-50' : 'border-primary/40 text-primary hover:bg-primary/5'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isAdmin ? (
        <>
          <ShieldMinus className="h-4 w-4 mr-1" />
          Rétrograder
        </>
      ) : (
        <>
          <ShieldCheck className="h-4 w-4 mr-1" />
          Promouvoir admin
        </>
      )}
    </Button>
  );
}
