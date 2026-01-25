/**
 * AuthLayout - Zero-logic wrapper for auth routes
 * 
 * This component handles:
 * - Consistent visual structure
 * - AuthRouteGuard for flow protection
 * - No business logic
 */

import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet";
import { lazy, Suspense } from "react";
import { AuthRouteGuard } from "../guards/AuthRouteGuard";
import AuthHeader from "./AuthHeader";
import AuthSidebar from "./AuthSidebar";
import { VisitorBanner, VisitorTypeSelector } from "@/components/visitor";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the visitor selector (portal)
const VisitorSelectorPortal = lazy(() => 
  import("@/components/visitor").then(m => ({ default: m.VisitorTypeSelector }))
);

// Auth form skeleton for loading state
function AuthFormSkeleton() {
  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full mt-6" />
    </div>
  );
}

interface AuthLayoutProps {
  showVisitorSelector?: boolean;
  onVisitorSelectorChange?: (open: boolean) => void;
}

export function AuthLayout({ showVisitorSelector = false, onVisitorSelectorChange }: AuthLayoutProps) {
  return (
    <>
      <Helmet>
        <title>Connexion & Inscription - EDUPRENEURS | Plateforme éducative haïtienne</title>
        <meta name="description" content="Connectez-vous ou créez un compte sur EDUPRENEURS. Plateforme d'apprentissage personnalisé alignée au programme MENFP avec assistance IA." />
        <meta name="keywords" content="connexion, inscription, EDUPRENEURS, éducation Haïti, MENFP, apprentissage en ligne" />
        <meta property="og:title" content="Connexion & Inscription - EDUPRENEURS" />
        <meta property="og:description" content="Rejoignez la plateforme éducative haïtienne avec assistance IA personnalisée." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>
      
      <AuthRouteGuard>
        <VisitorBanner />
        <div className="auth-page min-h-screen bg-background">
          <AuthHeader />

          {/* Main Content */}
          <div className="auth-wrap min-h-[calc(100vh-65px)] grid place-items-center p-4 md:p-8">
            <div className="auth-container flex flex-col items-center gap-8 w-full max-w-[1000px]">
              <div className="auth-grid grid md:grid-cols-[1fr_1.2fr] gap-6 md:gap-8 w-full">
                <AuthSidebar />

                {/* Auth Card with Outlet */}
                <section className="auth-panel auth-card bg-card border border-border rounded-2xl shadow-lg overflow-hidden order-1 md:order-2">
                  <Suspense fallback={<AuthFormSkeleton />}>
                    <Outlet />
                  </Suspense>
                </section>
              </div>
            </div>
          </div>

          {/* Visitor Type Selector Modal */}
          <Suspense fallback={null}>
            <VisitorTypeSelector 
              open={showVisitorSelector} 
              onOpenChange={onVisitorSelectorChange || (() => {})} 
            />
          </Suspense>
        </div>
      </AuthRouteGuard>
    </>
  );
}

export default AuthLayout;
export { AuthFormSkeleton };
