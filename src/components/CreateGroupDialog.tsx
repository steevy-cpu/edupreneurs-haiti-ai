import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
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
  const [progress, setProgress] = useState(0);

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
    setProgress(0);

    try {
      // Step 1: Get user (10%)
      setProgress(10);
      const { data: { user } } = await supabase.auth.getUser();
      console.log("User authenticated:", user?.id);
      if (!user) throw new Error("Non authentifié");

      let avatarUrl = null;

      // Step 2: Upload avatar if provided (30%)
      if (avatarFile) {
        setProgress(20);
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('group-avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('group-avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
        setProgress(30);
      } else {
        setProgress(30);
      }

      // Step 3: Create group using secure function (50%)
      setProgress(40);
      console.log("Creating group with secure function for user:", user.id);
      
      const { data: groupId, error: groupError } = await supabase
        .rpc('create_group_chat', {
          p_name: groupName,
          p_description: description || null,
          p_avatar_url: avatarUrl
        });

      if (groupError) {
        console.error("Group creation error:", groupError);
        throw groupError;
      }
      
      console.log("Group created successfully:", groupId);
      setProgress(50);

      // Step 4: Add other members (70%)
      if (selectedMembers.size > 0) {
        const members = Array.from(selectedMembers).map(userId => ({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        }));

        const { error: membersError } = await supabase
          .from('group_members')
          .insert(members);

        if (membersError) throw membersError;
      }
      setProgress(70);

      // Step 5: Create conversation (90%)
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: true,
          group_id: groupId
        })
        .select()
        .single();

      if (convError) throw convError;
      setProgress(90);

      // Step 6: Complete (100%)
      setProgress(100);
      toast.success("Groupe créé avec succès!");
      onGroupCreated();
      onOpenChange(false);
      
      // Reset form
      setGroupName("");
      setDescription("");
      setSelectedMembers(new Set());
      setAvatarFile(null);
      setAvatarPreview(null);
      setProgress(0);
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(`Erreur: ${error.message || "Impossible de créer le groupe"}`);
      setProgress(0);
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

          {/* Progress Bar */}
          {isCreating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Création du groupe... {progress}%
              </p>
            </div>
          )}

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