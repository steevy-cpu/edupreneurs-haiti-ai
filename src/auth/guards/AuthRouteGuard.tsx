/**
 * AuthRouteGuard - Thin routing layer using the auth state machine
 * 
 * Derives the current auth state and redirects if necessary.
 * All decision logic lives in authStateMachine.ts.
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { getAuthFlow, saveAuthFlow } from "../store/authFlow.store";
import { deriveAuthState, getRedirectIfNeeded } from "../store/authStateMachine";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthRouteGuardProps {
  children: React.ReactNode;
}

export function AuthRouteGuard({ children }: AuthRouteGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useSessionAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      if (isLoading) return;

      try {
        const authFlow = getAuthFlow();
        const currentPath = location.pathname;

        // Handle legacy URL params (backward compatibility)
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get('tab');
        const refCode = searchParams.get('ref');

        if (currentPath === '/auth') {
          if (tabParam === 'signup' || refCode) {
            if (refCode) {
              saveAuthFlow({ flow: 'signup', referralCode: refCode });
            }
            navigate('/auth/signup/step-1', { replace: true });
            return;
          }
          navigate('/auth/login', { replace: true });
          return;
        }

        // Fetch email_confirmed for authenticated users
        let emailConfirmed: boolean | null = null;
        if (isAuthenticated && user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email_confirmed')
            .eq('user_id', user.id)
            .maybeSingle();
          emailConfirmed = profile?.email_confirmed ?? null;

          // If authenticated but unverified, ensure authFlow is set for verify page
          if (emailConfirmed === false && authFlow?.flow !== 'verify') {
            saveAuthFlow({
              flow: 'verify',
              pendingUserId: user.id,
              email: user.email,
            });
          }
        }

        // Derive state and check if redirect is needed
        const state = deriveAuthState({
          session: isAuthenticated ? ({ user } as any) : null,
          emailConfirmed,
          authFlow,
        });

        // Handle authenticated state with quiz battle return URL
        if (state === 'authenticated') {
          const returnTo = sessionStorage.getItem('quiz_battle_return_url');
          if (returnTo) {
            sessionStorage.removeItem('quiz_battle_return_url');
            navigate(returnTo, { replace: true });
            return;
          }
        }

        const redirect = getRedirectIfNeeded(state, currentPath);
        if (redirect) {
          navigate(redirect, { replace: true });
        }
      } catch (error) {
        console.error('AuthRouteGuard: Error checking auth state:', error);
        // On error, allow rendering children rather than blocking
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthState();
  }, [isAuthenticated, isLoading, user, location.pathname, location.search, navigate]);

  // I3: Show a generic skeleton instead of null during auth check to prevent blank white screen on 3G.
  // The skeleton is replaced immediately when checkAuthState() completes (redirect or children render).
  if (isChecking || isLoading) {
    return (
      <div className="flex-1 p-4 lg:p-6 space-y-4" aria-hidden="true">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-28 w-3/4 rounded-xl" />
      </div>
    );
  }

  return <>{children}</>;
}
