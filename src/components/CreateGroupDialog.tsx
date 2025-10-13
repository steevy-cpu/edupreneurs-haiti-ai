import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Users, X } from "lucide-react";

interface Follower {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  nickname: string;
}

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followers: Follower[];
  onGroupCreated: () => void;
}

export function CreateGroupDialog({ open, onOpenChange, followers, onGroupCreated }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Veuillez entrer un nom de groupe");
      return;
    }

    if (selectedMembers.size === 0) {
      toast.error("Veuillez sélectionner au moins un membre");
      return;
    }

    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      let avatarUrl = null;

      // Upload avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('group-avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('group-avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      // Create group
      const { data: group, error: groupError } = await supabase
        .from('group_chats')
        .insert({
          name: groupName,
          description: description || null,
          avatar_url: avatarUrl,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      const members = [
        { group_id: group.id, user_id: user.id, role: 'admin' },
        ...Array.from(selectedMembers).map(userId => ({
          group_id: group.id,
          user_id: userId,
          role: 'member'
        }))
      ];

      const { error: membersError } = await supabase
        .from('group_members')
        .insert(members);

      if (membersError) throw membersError;

      // Create conversation for the group
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: true,
          group_id: group.id
        })
        .select()
        .single();

      if (convError) throw convError;

      toast.success("Groupe créé avec succès!");
      onGroupCreated();
      onOpenChange(false);
      
      // Reset form
      setGroupName("");
      setDescription("");
      setSelectedMembers(new Set());
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error("Erreur lors de la création du groupe");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Créer un groupe
          </DialogTitle>
          <DialogDescription>
            Créez un groupe pour discuter avec plusieurs personnes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} />
                  ) : (
                    <AvatarFallback className="bg-primary/10">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
                {avatarPreview && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">Ajouter une photo de groupe</p>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du groupe *</Label>
            <Input
              id="name"
              placeholder="Ex: Classe de Maths"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le groupe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Member Selection */}
          <div className="space-y-2">
            <Label>Ajouter des membres ({selectedMembers.size} sélectionné{selectedMembers.size !== 1 ? 's' : ''})</Label>
            <ScrollArea className="h-48 border rounded-md">
              <div className="p-2 space-y-2">
                {followers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun abonné disponible
                  </p>
                ) : (
                  followers.map((follower) => (
                    <div
                      key={follower.user_id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => toggleMember(follower.user_id)}
                    >
                      <Checkbox
                        checked={selectedMembers.has(follower.user_id)}
                        onCheckedChange={() => toggleMember(follower.user_id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={follower.avatar_url} />
                        <AvatarFallback>
                          {follower.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {follower.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{follower.nickname}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isCreating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateGroup}
              className="flex-1"
              disabled={isCreating || !groupName.trim() || selectedMembers.size === 0}
            >
              {isCreating ? "Création..." : "Créer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
