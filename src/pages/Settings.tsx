/**
 * @file Settings.tsx
 * @description Settings page — slim orchestrator that delegates to tab sub-components.
 *   Handles auth redirect, tab navigation, and data fetching via useSettingsData.
 * @module pages
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Bell, Globe } from "lucide-react";
import ericArmsCrossed from "@/assets/eric-main01.png";
import { PageHeader, SettingsPageSkeleton } from "@/components/shared";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { isFounder } from "@/lib/founderConstants";
import { useSettingsData } from "@/hooks/useSettingsData";

// Tab sub-components — each owns its own state and logic
import { ProfileTab } from "@/components/settings/ProfileTab";
import { AccountTab } from "@/components/settings/AccountTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { PreferencesTab } from "@/components/settings/PreferencesTab";

const Settings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, user, isAuthenticated, isLoading: authLoading } = useSessionAuth();
  const { isSlowConnection } = useNetworkAwareLoading();

  const userId = user?.id ?? null;
  const userEmail = user?.email ?? "";
  // Founders bypass the 3-day avatar regeneration cooldown
  const isFounderUser = isFounder(userId);

  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || "profile";
  });

  // Centralised data fetching for profile, followers, notification prefs
  const {
    profile,
    followerCount,
    followingCount,
    pageLoading,
    groupToggles,
    setGroupToggles,
    fetchUserData,
  } = useSettingsData(userId, authLoading);

  // Redirect if not authenticated (handled after all hooks)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Scroll to subscription card if hash is present — now in account tab
  useEffect(() => {
    if (activeTab === 'account' && window.location.hash === '#subscription') {
      setTimeout(() => {
        document.getElementById('subscription')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/auth/login");
  };

  // Show skeleton while auth is loading OR page data is loading
  if (authLoading || pageLoading) {
    return <SettingsPageSkeleton simplified={isSlowConnection} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-8" data-tour="settings-content">
      {/* Header — skip image on slow connections to save data */}
      {isSlowConnection ? (
        <PageHeader
          title="Paramètres"
          subtitle="Gérez votre profil, votre compte et vos préférences"
          backPath="/dashboard"
          backLabel="Dashboard"
          variant="simple"
        />
      ) : (
        <PageHeader
          title="Paramètres"
          subtitle="Gérez votre profil, votre compte et vos préférences"
          image={ericArmsCrossed}
          backPath="/dashboard"
          backLabel="Dashboard"
        />
      )}

      {/* Settings Tabs — 4 tabs delegating to sub-components */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-1 sm:gap-2 h-auto p-1">
          <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3">
            <User size={16} className="shrink-0" />
            <span className="text-xs sm:text-sm">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3">
            <Lock size={16} className="shrink-0" />
            <span className="text-xs sm:text-sm">Compte</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3">
            <Bell size={16} className="shrink-0" />
            <span className="text-xs sm:text-sm hidden sm:inline">Notifications</span>
            <span className="text-xs sm:hidden">Notifs</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3">
            <Globe size={16} className="shrink-0" />
            <span className="text-xs sm:text-sm hidden sm:inline">Préférences</span>
            <span className="text-xs sm:hidden">Prefs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 sm:mt-6">
          <ProfileTab
            profile={profile}
            followerCount={followerCount}
            followingCount={followingCount}
            userId={userId}
            isFounderUser={isFounderUser}
            onProfileUpdated={fetchUserData}
          />
        </TabsContent>

        <TabsContent value="account" className="mt-4 sm:mt-6">
          <AccountTab
            profile={profile}
            userId={userId}
            userEmail={userEmail}
            session={session}
            isFounderUser={isFounderUser}
            onLogout={handleLogout}
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 sm:mt-6">
          <NotificationsTab
            userId={userId}
            groupToggles={groupToggles}
            setGroupToggles={setGroupToggles}
          />
        </TabsContent>

        <TabsContent value="preferences" className="mt-4 sm:mt-6">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
