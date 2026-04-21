import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Shield, UserPlus, Trash2, Search } from "lucide-react";

export const RoleManagement = () => {
  const [editors, setEditors] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editorToDelete, setEditorToDelete] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    fetchCurrentUser();
    fetchEditors();
    fetchProfiles();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchEditors = async () => {
    try {
      const { data, error } = await supabase
        .from('content_editor_roles')
        .select(`
          *,
          profiles!content_editor_roles_user_id_fkey(full_name, nickname, avatar_url),
          granted_by_profile:profiles!content_editor_roles_granted_by_fkey(full_name, nickname)
        `)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      setEditors(data || []);
    } catch (error) {
      console.error('Error fetching editors:', error);
      toast.error("Erreur lors du chargement des éditeurs");
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, nickname, avatar_url')
        .order('full_name');

      if (error) throw error;
      
      // Filter out users who already have editor roles
      const editorUserIds = editors.map(e => e.user_id);
      const availableProfiles = (data || []).filter(
        p => !editorUserIds.includes(p.user_id)
      );
      
      setAllProfiles(availableProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error("Erreur lors du chargement des profils");
    }
  };

  const grantRole = async () => {
    if (!selectedProfile) {
      toast.error("Veuillez sélectionner un utilisateur");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from('content_editor_roles')
        .insert({
          user_id: selectedProfile,
          role: selectedRole,
          granted_by: user.id,
        });

      if (error) throw error;

      toast.success(`Rôle ${selectedRole} accordé avec succès`);
      setSelectedProfile("");
      setSelectedRole("editor");
      fetchEditors();
      fetchProfiles();
    } catch (error) {
      console.error('Error granting role:', error);
      toast.error("Erreur lors de l'attribution du rôle");
    } finally {
      setIsLoading(false);
    }
  };

  const revokeRole = async (editorId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('content_editor_roles')
        .delete()
        .eq('id', editorId);

      if (error) throw error;

      toast.success("Rôle révoqué avec succès");
      fetchEditors();
      fetchProfiles();
    } catch (error) {
      console.error('Error revoking role:', error);
      toast.error("Erreur lors de la révocation du rôle");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setEditorToDelete(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredEditors = editors.filter(editor =>
    editor.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    editor.profiles?.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Grant Role Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Accorder un rôle d'éditeur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {allProfiles.map((profile) => (
                    <SelectItem key={profile.user_id} value={profile.user_id}>
                      {profile.full_name || profile.nickname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Éditeur</SelectItem>
                <SelectItem value="viewer">Lecteur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={grantRole}
            disabled={isLoading || !selectedProfile}
            className="w-full"
          >
            <Shield className="mr-2 h-4 w-4" />
            Accorder le rôle
          </Button>
        </CardContent>
      </Card>

      {/* Current Editors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Éditeurs actuels ({editors.length})
            </span>
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un éditeur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {filteredEditors.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                Aucun éditeur trouvé
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEditors.map((editor) => (
                  <Card
                    key={editor.id}
                    className="border-l-4 border-l-primary/50"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {editor.profiles?.avatar_url ? (
                              <img
          loading="lazy"
          decoding="async"
                                src={editor.profiles.avatar_url}
                                alt=""
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <span className="text-lg">
                                {editor.profiles?.full_name?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {editor.profiles?.full_name ?? editor.profiles?.nickname ?? 'Étudiant'}
                              </h4>
                              <Badge variant={getRoleBadgeVariant(editor.role)}>
                                {editor.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Accordé par {editor.granted_by_profile?.full_name || 'Système'} •{' '}
                              {new Date(editor.granted_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditorToDelete(editor);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={editor.user_id === currentUserId}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer le rôle d'éditeur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir révoquer le rôle d'éditeur de{' '}
              <strong>
                {editorToDelete?.profiles?.full_name || editorToDelete?.profiles?.nickname}
              </strong>
              ? Cette action est irréversible et l'utilisateur perdra immédiatement
              l'accès à l'éditeur de contenu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => editorToDelete && revokeRole(editorToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Révoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
