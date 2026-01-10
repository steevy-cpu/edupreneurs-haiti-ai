import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isFounder } from "@/lib/founderConstants";

export function useFounderCheck() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserFounder, setIsUserFounder] = useState(false);

  useEffect(() => {
    const checkFounderStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          setIsUserFounder(isFounder(user.id));
        }
      } catch (error) {
        console.error("Error checking founder status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFounderStatus();
  }, []);

  return { userId, isFounder: isUserFounder, isLoading };
}
