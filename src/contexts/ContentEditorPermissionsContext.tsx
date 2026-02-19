import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// Mirrors the type in useContentEditorPermissions for backward compat
export type ContentEditorRole = 'admin' | 'editor' | 'viewer' | null;

interface ContentEditorPermissionsState {
  role: ContentEditorRole;
  isLoading: boolean;
  hasAccess: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageRoles: boolean;
  canPublish: boolean;
  canView: boolean;
  refetch: () => void;
}

const ContentEditorPermissionsContext = createContext<
  ContentEditorPermissionsState | undefined
>(undefined);

/**
 * Runs a single permission check for the entire ContentEditor page tree.
 * All child components read from this context instead of making independent
 * auth.getUser() + content_editor_roles queries on every render.
 */
export const ContentEditorPermissionsProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<ContentEditorRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        return;
      }

      const { data: editorRole } = await supabase
        .from('content_editor_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (editorRole && ['admin', 'editor', 'viewer'].includes(editorRole.role)) {
        setRole(editorRole.role as ContentEditorRole);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error('ContentEditorPermissionsProvider: error checking permissions:', error);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const value: ContentEditorPermissionsState = {
    role,
    isLoading,
    hasAccess: role !== null,
    canEdit: role === 'admin' || role === 'editor',
    canDelete: role === 'admin',
    canManageRoles: role === 'admin',
    canPublish: role === 'admin' || role === 'editor',
    canView: role !== null,
    refetch: checkPermissions,
  };

  return (
    <ContentEditorPermissionsContext.Provider value={value}>
      {children}
    </ContentEditorPermissionsContext.Provider>
  );
};

/**
 * Read shared ContentEditor permissions from the nearest provider.
 * Must be used inside a ContentEditorPermissionsProvider.
 */
export const useContentEditorPermissionsContext = (): ContentEditorPermissionsState => {
  const ctx = useContext(ContentEditorPermissionsContext);
  if (!ctx) {
    throw new Error(
      'useContentEditorPermissionsContext must be used inside ContentEditorPermissionsProvider'
    );
  }
  return ctx;
};
