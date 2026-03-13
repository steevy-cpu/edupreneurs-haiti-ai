/**
 * @file NotificationsTab.tsx
 * @description Notifications tab content for the Settings page — push notification
 *   toggle and per-group notification preference switches.
 * @module components/settings
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Loader2, Smartphone } from "lucide-react";
import { initializePushNotifications } from "@/utils/pushNotifications";
import { NOTIFICATION_GROUPS } from "@/hooks/useSettingsData";

export interface NotificationsTabProps {
  userId: string | null;
  groupToggles: Record<string, boolean>;
  setGroupToggles: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function NotificationsTab({
  userId,
  groupToggles,
  setGroupToggles,
}: NotificationsTabProps) {
  const [savingNotification, setSavingNotification] = useState<string | null>(null);

  // Push notification toggle state
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  // Track if browser has denied push permission (requires manual browser settings change)
  const [pushPermissionDenied, setPushPermissionDenied] = useState(false);

  // Check push subscription status on mount
  useEffect(() => {
    if (!userId) return;

    // Check browser permission state
    if ('Notification' in window) {
      setPushPermissionDenied(Notification.permission === 'denied');
    }

    // Check if a push subscription exists for this device
    const deviceId = localStorage.getItem('edupreneurs_device_id');
    if (!deviceId) {
      setPushEnabled(false);
      return;
    }

    supabase
      .from('push_subscriptions' as any)
      .select('id')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .maybeSingle()
      .then(({ data }) => {
        setPushEnabled(!!data);
      });
  }, [userId]);

  /** Toggle an entire notification group ON or OFF.
   *  OFF → upsert all category rows with enabled=false.
   *  ON  → delete all category rows (revert to implicit default = enabled). */
  const handleGroupToggle = useCallback(async (groupKey: string, enabled: boolean) => {
    if (!userId) return;

    const group = NOTIFICATION_GROUPS.find(g => g.key === groupKey);
    if (!group) return;

    setSavingNotification(groupKey);
    // Optimistic update
    setGroupToggles(prev => ({ ...prev, [groupKey]: enabled }));

    try {
      if (enabled) {
        // Delete rows → reverts to implicit default (enabled)
        const { error } = await supabase
          .from('notification_preferences')
          .delete()
          .eq('user_id', userId)
          .in('category', group.categories);
        if (error) throw error;
      } else {
        // Upsert rows with enabled=false for every category in the group
        const rows = group.categories.map(cat => ({
          user_id: userId,
          category: cat,
          enabled: false,
          updated_at: new Date().toISOString(),
        }));
        const { error } = await supabase
          .from('notification_preferences')
          .upsert(rows, { onConflict: 'user_id,category' });
        if (error) throw error;
      }
      toast.success('Préférence mise à jour');
    } catch {
      // Revert on failure
      setGroupToggles(prev => ({ ...prev, [groupKey]: !enabled }));
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSavingNotification(null);
    }
  }, [userId, setGroupToggles]);

  // Push notification toggle handler — uses existing initializePushNotifications
  const handlePushToggle = useCallback(async (enabled: boolean) => {
    if (!userId) return;
    setPushLoading(true);

    try {
      if (enabled) {
        // Subscribe: delegates to existing push infra (permission + SW + DB upsert)
        await initializePushNotifications(userId);
        // Verify it worked by checking if permission was granted
        if ('Notification' in window && Notification.permission === 'granted') {
          setPushEnabled(true);
          toast.success("Notifications push activées");
        } else if ('Notification' in window && Notification.permission === 'denied') {
          setPushPermissionDenied(true);
          toast.error("Permission refusée — changez dans les paramètres du navigateur");
        }
      } else {
        // Unsubscribe: remove SW subscription + delete DB row for this device
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const pm = (registration as any).pushManager;
          if (pm) {
            const subscription = await pm.getSubscription();
            if (subscription) {
              await subscription.unsubscribe();
            }
          }
        }
        // Delete push_subscriptions row for this device
        const deviceId = localStorage.getItem('edupreneurs_device_id');
        if (deviceId) {
          await supabase
            .from('push_subscriptions' as any)
            .delete()
            .eq('user_id', userId)
            .eq('device_id', deviceId);
        }
        setPushEnabled(false);
        toast.success("Notifications push désactivées");
      }
    } catch (error: any) {
      console.error("Push toggle error:", error);
      toast.error("Erreur lors de la modification");
    } finally {
      setPushLoading(false);
    }
  }, [userId]);

  return (
    <div className="space-y-6">
      {/* Push notification master toggle */}
      <Card className="border-none rounded-[20px] shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <Label htmlFor="push-toggle" className="text-base font-medium">Notifications push</Label>
                <p className="text-sm text-muted-foreground">
                  {pushPermissionDenied
                    ? "Bloqué — changez dans les paramètres du navigateur"
                    : "Recevoir des notifications sur cet appareil"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pushLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                id="push-toggle"
                checked={pushEnabled}
                onCheckedChange={handlePushToggle}
                disabled={pushLoading || pushPermissionDenied}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification category preferences */}
      <Card className="border-none rounded-[20px] shadow-md">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Bell className="text-primary shrink-0" size={20} />
            Préférences de notification
          </CardTitle>
          <CardDescription className="text-sm">
            Choisissez comment vous souhaitez être informé. Les modifications sont enregistrées automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
          {NOTIFICATION_GROUPS.map((group, index) => (
            <div key={group.key}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={group.key}>{group.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {savingNotification === group.key && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    id={group.key}
                    checked={groupToggles[group.key] ?? true}
                    onCheckedChange={(checked) => handleGroupToggle(group.key, checked)}
                    disabled={savingNotification === group.key}
                  />
                </div>
              </div>
              {index < NOTIFICATION_GROUPS.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
