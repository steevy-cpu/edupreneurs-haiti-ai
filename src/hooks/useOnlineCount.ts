import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PRESENCE_CHANNEL = "platform:online-users";

/**
 * Returns the live count of authenticated users currently online.
 * Subscribes to the presence channel without tracking (read-only).
 * Returns null until the first sync event arrives.
 */
export function useOnlineCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const channel = supabase.channel(PRESENCE_CHANNEL);

    const updateCount = () => {
      setCount(Object.keys(channel.presenceState()).length);
    };

    channel
      .on("presence", { event: "sync" }, updateCount)
      .on("presence", { event: "join" }, updateCount)
      .on("presence", { event: "leave" }, updateCount)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
