import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ContentEditorRole = 'admin' | 'editor' | 'viewer' | null;

export const useContentEditorPermissions = () => {
  const [role, setRole] = useState<ContentEditorRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRole(null);
        setHasAccess(false);
        return;
      }

      const { data: editorRole } = await supabase
        .from('content_editor_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (editorRole && ['admin', 'editor', 'viewer'].includes(editorRole.role)) {
        setRole(editorRole.role as ContentEditorRole);
        setHasAccess(['admin', 'editor'].includes(editorRole.role));
      } else {
        setRole(null);
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setRole(null);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const canEdit = () => role === 'admin' || role === 'editor';
  const canDelete = () => role === 'admin';
  const canManageRoles = () => role === 'admin';
  const canPublish = () => role === 'admin' || role === 'editor';
  const canView = () => role !== null;

  return {
    role,
    isLoading,
    hasAccess,
    canEdit: canEdit(),
    canDelete: canDelete(),
    canManageRoles: canManageRoles(),
    canPublish: canPublish(),
    canView: canView(),
    refetch: checkPermissions,
  };
};
