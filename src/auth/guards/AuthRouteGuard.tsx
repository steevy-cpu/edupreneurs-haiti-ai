/**
 * AuthRouteGuard - Route-level protection for auth flows
 * 
 * CRITICAL: This guard ensures:
 * 1. Pending verifications redirect to verify page
 * 2. Authenticated users redirect to dashboard
 * 3. Unverified users are forced to verify
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { getAuthFlow, hasPendingVerification, hasPendingDeviceVerification, saveAuthFlow } from "../store/authFlow.store";
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
      // Wait for session to load
      if (isLoading) return;

      const authFlow = getAuthFlow();
      const currentPath = location.pathname;

      // Rule 1: If there's a pending email verification, always redirect to verify page
      if (hasPendingVerification() && currentPath !== '/auth/verify-email') {
        navigate('/auth/verify-email', { replace: true });
        setIsChecking(false);
        return;
      }

      // Rule 1b: If there's a pending device verification, redirect to device verify page
      if (hasPendingDeviceVerification() && currentPath !== '/auth/verify-device') {
        navigate('/auth/verify-device', { replace: true });
        setIsChecking(false);
        return;
      }

      // Rule 2: If authenticated, check email_confirmed
      if (isAuthenticated && user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email_confirmed')
          .eq('user_id', user.id)
          .maybeSingle();

        // If not verified, redirect to verify WITHOUT signing out
        if (profile && !profile.email_confirmed) {
          // Save flow for verification (keep session alive)
          saveAuthFlow({
            flow: 'verify',
            pendingUserId: user.id,
            email: user.email,
          });

          navigate('/auth/verify-email', { replace: true });
          setIsChecking(false);
          return;
        }

        // Fully authenticated - redirect to dashboard
        const returnTo = sessionStorage.getItem('quiz_battle_return_url');
        if (returnTo) {
          sessionStorage.removeItem('quiz_battle_return_url');
          navigate(returnTo, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
        setIsChecking(false);
        return;
      }

      // Rule 3: Handle URL params for backward compatibility
      const searchParams = new URLSearchParams(location.search);
      const tabParam = searchParams.get('tab');
      const refCode = searchParams.get('ref');

      if (currentPath === '/auth') {
        if (tabParam === 'signup' || refCode) {
          // Save referral code if present
          if (refCode) {
            saveAuthFlow({ flow: 'signup', referralCode: refCode });
          }
          navigate('/auth/signup/step-1', { replace: true });
          setIsChecking(false);
          return;
        }
        // Default /auth redirects to login
        navigate('/auth/login', { replace: true });
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    checkAuthState();
  }, [isAuthenticated, isLoading, user, location.pathname, location.search, navigate]);

  // Show nothing while checking (prevents flash)
  if (isChecking || isLoading) {
    return null;
  }

  return <>{children}</>;
}
