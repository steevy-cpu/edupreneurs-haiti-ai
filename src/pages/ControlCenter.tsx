import { useState, Suspense } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFounderCheck } from "./control-center/hooks/useFounderCheck";
import { useModuleBadges } from "./control-center/hooks/useModuleBadges";
import { CONTROL_CENTER_MODULES } from "./control-center/modules";

const ModuleLoader = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);

export default function ControlCenter() {
  const navigate = useNavigate();
  const { isFounder, isLoading: isCheckingFounder } = useFounderCheck();
  const { badges } = useModuleBadges();
  const [activeTab, setActiveTab] = useState(CONTROL_CENTER_MODULES[0]?.id || "users");

  // Track which tabs have been visited — once mounted they stay mounted
  // to preserve component state when switching between tabs
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(
    () => new Set([CONTROL_CENTER_MODULES[0]?.id || "users"])
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Add to mounted set — never remove, preserves state on tab switch-back
    setMountedTabs(prev => new Set([...prev, value]));
  };

  // Show loading while checking founder status
  if (isCheckingFounder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect non-founders
  if (!isFounder) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-3"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-amber-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              Centre de Contrôle
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-screen-2xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          {/* Tabs Navigation */}
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-muted/50">
            {CONTROL_CENTER_MODULES.map((module) => (
              <TabsTrigger
                key={module.id}
                value={module.id}
                className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <module.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{module.label}</span>
                <span className="sm:hidden">{module.shortLabel || module.label}</span>
                {badges[module.id] !== undefined && badges[module.id] > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="h-5 min-w-[20px] px-1.5 text-xs font-semibold"
                  >
                    {badges[module.id]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Contents — only mount a module when first visited to prevent
              all modules from firing their queries simultaneously on load */}
          {CONTROL_CENTER_MODULES.map((module) => (
            <TabsContent key={module.id} value={module.id} className="mt-6">
              {mountedTabs.has(module.id) && (
                <Suspense fallback={<ModuleLoader />}>
                  <module.component />
                </Suspense>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
