import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isFounder } from "@/lib/founderConstants";

/**
 * Checks if the current user is a founder OR a content_editor_roles admin.
 * Either grants access to the Control Center without conflating admin with founder
 * (founders have separate side-effects like leaderboard exclusion).
 */
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

          // Founders always have access
          if (isFounder(user.id)) {
            setIsUserFounder(true);
          } else {
            // Check if user holds an admin role in content_editor_roles
            const { data: editorRole } = await supabase
              .from('content_editor_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .maybeSingle();

            setIsUserFounder(!!editorRole);
          }
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
