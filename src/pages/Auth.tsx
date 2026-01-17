import { Suspense, lazy } from "react";
import { Helmet } from "react-helmet";
import { AuthProvider, useAuth } from "@/components/auth";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthSidebar from "@/components/auth/AuthSidebar";
import { Button } from "@/components/ui/button";
import { Telescope } from "lucide-react";
import { VisitorTypeSelector } from "@/components/visitor/VisitorTypeSelector";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load auth forms
const LoginForm = lazy(() => import("@/components/auth/LoginForm"));
const SignupForm = lazy(() => import("@/components/auth/SignupForm"));
const VerifyForm = lazy(() => import("@/components/auth/VerifyForm"));
const ForgotPasswordForm = lazy(() => import("@/components/auth/ForgotPasswordForm"));

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

function AuthContent() {
  const { activeTab, setActiveTab, showVisitorSelector, setShowVisitorSelector } = useAuth();

  return (
    <div className="auth-page min-h-screen bg-background pt-0 mt-0">
      <AuthHeader />

      {/* Main Content */}
      <div className="auth-wrap min-h-[calc(100vh-65px)] grid place-items-center p-4 md:p-8">
        <div className="auth-container flex flex-col items-center gap-8 w-full max-w-[1000px]">
          <div className="auth-grid grid md:grid-cols-[1fr_1.2fr] gap-6 md:gap-8 w-full">
            <AuthSidebar />

            {/* Auth Card */}
            <section className="auth-panel auth-card bg-card border border-border rounded-2xl shadow-lg overflow-hidden order-1 md:order-2">
              {/* Visitor Mode Button */}
              {(activeTab === "login" || activeTab === "signup") && (
                <div className="px-5 pt-5 pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 py-5 border-2 border-dashed border-primary/40 text-primary font-medium
                               hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg
                               transition-all duration-300 group"
                    onClick={() => setShowVisitorSelector(true)}
                  >
                    <Telescope className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Découvrir la plateforme sans inscription</span>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    Explorez en mode visiteur, inscrivez-vous plus tard
                  </p>
                </div>
              )}
              
              {/* Tabs */}
              <div className="auth-tabs p-3 flex justify-center">
                {activeTab !== "verify" && activeTab !== "forgot-password" && (
                  <div className="relative flex bg-muted/50 rounded-xl p-1 w-fit">
                    {/* Sliding Background Indicator */}
                    <div 
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-sm transition-all duration-300 ease-out ${
                        activeTab === "login" ? "left-1" : "left-[calc(50%+2px)]"
                      }`}
                    />
                    
                    {/* Tab Buttons */}
                    <button
                      className={`relative z-10 flex-1 text-center py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                        activeTab === "login" 
                          ? "text-foreground" 
                          : "text-muted-foreground hover:text-foreground/80"
                      }`}
                      onClick={() => setActiveTab("login")}
                    >
                      Se connecter
                    </button>
                    <button
                      className={`relative z-10 flex-1 text-center py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                        activeTab === "signup" 
                          ? "text-foreground" 
                          : "text-muted-foreground hover:text-foreground/80"
                      }`}
                      onClick={() => setActiveTab("signup")}
                    >
                      Créer un compte
                    </button>
                  </div>
                )}
                {activeTab === "forgot-password" && (
                  <div className="text-center py-3 font-bold text-primary">
                    Réinitialiser le mot de passe
                  </div>
                )}
                {activeTab === "verify" && (
                  <div className="text-center py-3 font-bold text-primary">
                    Vérification de l'email
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="auth-content p-5">
                <Suspense fallback={<AuthFormSkeleton />}>
                  {activeTab === "login" && <LoginForm />}
                  {activeTab === "signup" && <SignupForm />}
                  {activeTab === "verify" && <VerifyForm />}
                  {activeTab === "forgot-password" && <ForgotPasswordForm />}
                </Suspense>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Visitor Type Selector Modal */}
      <VisitorTypeSelector 
        open={showVisitorSelector} 
        onOpenChange={setShowVisitorSelector} 
      />
    </div>
  );
}

export default function Auth() {
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
      <AuthProvider>
        <AuthContent />
      </AuthProvider>
    </>
  );
}
