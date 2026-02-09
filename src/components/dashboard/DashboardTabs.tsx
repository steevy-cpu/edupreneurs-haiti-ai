import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutDashboard, TrendingUp, Users } from "lucide-react";
import { OverviewTab, OverviewTabProps } from "./tabs/OverviewTab";
import { ProgressTab, ProgressTabProps } from "./tabs/ProgressTab";
import { CommunityTab, CommunityTabProps } from "./tabs/CommunityTab";

const TAB_STORAGE_KEY = "dashboard-active-tab";

function getInitialTab(): string {
  try {
    return localStorage.getItem(TAB_STORAGE_KEY) || "overview";
  } catch {
    return "overview";
  }
}

export interface DashboardTabsProps {
  overview: OverviewTabProps;
  progress: ProgressTabProps;
  community: CommunityTabProps;
}

export const DashboardTabs = ({ overview, progress, community }: DashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState(getInitialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    try {
      localStorage.setItem(TAB_STORAGE_KEY, value);
    } catch {}
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full grid grid-cols-3 h-12 rounded-xl bg-muted/70 p-1">
        <TabsTrigger value="overview" className="rounded-lg data-[state=active]:shadow-md text-xs sm:text-sm gap-1">
          <LayoutDashboard className="w-4 h-4" />
          <span className="sm:hidden">Vue</span>
          <span className="hidden sm:inline">Aperçu</span>
        </TabsTrigger>
        <TabsTrigger value="progress" className="rounded-lg data-[state=active]:shadow-md text-xs sm:text-sm gap-1">
          <TrendingUp className="w-4 h-4" />
          <span className="sm:hidden">Stats</span>
          <span className="hidden sm:inline">Progression</span>
        </TabsTrigger>
        <TabsTrigger value="community" className="rounded-lg data-[state=active]:shadow-md text-xs sm:text-sm gap-1">
          <Users className="w-4 h-4" />
          <span className="sm:hidden">Club</span>
          <span className="hidden sm:inline">Communauté</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4 space-y-4">
        <OverviewTab {...overview} />
      </TabsContent>

      <TabsContent value="progress" className="mt-4 space-y-4">
        <ProgressTab {...progress} />
      </TabsContent>

      <TabsContent value="community" className="mt-4 space-y-4">
        <CommunityTab {...community} />
      </TabsContent>
    </Tabs>
  );
};
