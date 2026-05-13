import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PRESENCE_CHANNEL = "platform:online-users";

/**
 * Tracks the authenticated user in the global presence channel.
 * Call from AppShell only — once per authenticated session.
 * Uses userId as the presence key so multi-tab opens count as one user.
 */
export function useOnlinePresence(userId: string | null | undefined) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: userId } },
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      channel.untrack().then(() => supabase.removeChannel(channel));
    };
  }, [userId]);
}
