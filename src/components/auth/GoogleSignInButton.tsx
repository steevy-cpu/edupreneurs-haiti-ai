/**
 * @file GoogleSignInButton — Branded Google sign-in button.
 *
 * Uses Lovable Cloud managed OAuth for Google sign-in.
 * Handles redirect URIs automatically — no manual Cloud Console config needed.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { useToast } from '@/hooks/use-toast';

interface GoogleSignInButtonProps {
  /** Button label — defaults to "Continuer avec Google" */
  label?: string;
}

/** Official Google "G" logo SVG with brand colors */
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function GoogleSignInButton({ label = 'Continuer avec Google' }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Uses Lovable Cloud managed OAuth — redirect URIs handled automatically
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      // Browser will redirect to Google — just return
      if (result.redirected) return;

      if (result.error) {
        throw result.error;
      }

      // Session set by lovable SDK — navigate based on setup state
      const needsSetup = sessionStorage.getItem('google_needs_setup') === 'true';
      navigate(needsSetup ? '/auth/google-setup' : '/dashboard');
    } catch (err: any) {
      console.error('[GoogleSignIn] Error:', err);
      toast({
        title: 'Erreur de connexion Google',
        description: err?.message || 'Une erreur est survenue. Réessayez.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full gap-3 py-5 border-border bg-background hover:bg-muted/50 
                 text-foreground font-medium transition-all duration-200"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <GoogleLogo />
      )}
      <span>{label}</span>
    </Button>
  );
}