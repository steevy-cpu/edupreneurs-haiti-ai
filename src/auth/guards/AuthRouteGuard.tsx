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
          setIsChecking(false);
          return;
        }
        navigate('/auth/login', { replace: true });
        setIsChecking(false);
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
          setIsChecking(false);
          return;
        }
      }

      const redirect = getRedirectIfNeeded(state, currentPath);
      if (redirect) {
        navigate(redirect, { replace: true });
      }

      setIsChecking(false);
    };

    checkAuthState();
  }, [isAuthenticated, isLoading, user, location.pathname, location.search, navigate]);

  if (isChecking || isLoading) {
    return null;
  }

  return <>{children}</>;
}
