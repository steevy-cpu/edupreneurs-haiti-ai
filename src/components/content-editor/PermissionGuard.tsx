import { ReactNode } from "react";
import { useContentEditorPermissions, ContentEditorRole } from "@/hooks/useContentEditorPermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole?: ContentEditorRole;
  requireEdit?: boolean;
  requireDelete?: boolean;
  requireManageRoles?: boolean;
  requirePublish?: boolean;
  fallback?: ReactNode;
}

export const PermissionGuard = ({
  children,
  requiredRole,
  requireEdit,
  requireDelete,
  requireManageRoles,
  requirePublish,
  fallback,
}: PermissionGuardProps) => {
  const {
    role,
    isLoading,
    canEdit,
    canDelete,
    canManageRoles,
    canPublish,
  } = useContentEditorPermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check specific role requirement
  if (requiredRole && role !== requiredRole) {
    return fallback || (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          Rôle requis: {requiredRole}. Votre rôle actuel: {role || 'aucun'}
        </AlertDescription>
      </Alert>
    );
  }

  // Check specific permission requirements
  if (requireEdit && !canEdit) {
    return fallback || (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          Vous n'avez pas la permission de modifier le contenu
        </AlertDescription>
      </Alert>
    );
  }

  if (requireDelete && !canDelete) {
    return fallback || (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          Vous n'avez pas la permission de supprimer le contenu
        </AlertDescription>
      </Alert>
    );
  }

  if (requireManageRoles && !canManageRoles) {
    return fallback || (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          Vous n'avez pas la permission de gérer les rôles
        </AlertDescription>
      </Alert>
    );
  }

  if (requirePublish && !canPublish) {
    return fallback || (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          Vous n'avez pas la permission de publier le contenu
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
