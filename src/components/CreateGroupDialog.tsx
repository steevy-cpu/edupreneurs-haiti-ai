import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Users, X, Search, Check, Sparkles } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { JUDE_USER_ID } from "@/types/community";

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
  onGroupCreated: (conversationId: string) => void;
}

export function CreateGroupDialog({ open, onOpenChange, followers, onGroupCreated }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter followers based on search query, excluding Jude (auto-added to all groups)
  const filteredFollowers = useMemo(() => {
    const availableFollowers = followers.filter(f => f.user_id !== JUDE_USER_ID);
    if (!searchQuery.trim()) return availableFollowers;
    const query = searchQuery.toLowerCase();
    return availableFollowers.filter(
      f => f.full_name.toLowerCase().includes(query) || 
           f.nickname.toLowerCase().includes(query)
    );
  }, [followers, searchQuery]);

  // Get selected member profiles
  const selectedMemberProfiles = useMemo(() => {
    return followers.filter(f => selectedMembers.has(f.user_id));
  }, [followers, selectedMembers]);

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

  const removeMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    newSelected.delete(userId);
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

      // Step 4: Add other selected members (70%)
      // Filter out creator (already admin) and Jude (already member) — both added by create_group_chat RPC
      const filteredMembers = Array.from(selectedMembers).filter(
        memberId => memberId !== user.id && memberId !== JUDE_USER_ID
      );

      if (filteredMembers.length > 0) {
        const members = filteredMembers.map(userId => ({
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

      // Step 5: Create conversation (80%)
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: true,
          group_id: groupId
        })
        .select()
        .single();

      if (convError) throw convError;
      setProgress(80);

      // Step 6: Add all participants to conversation FIRST (85%)
      setProgress(85);
      // Add all participants via SECURITY DEFINER RPC to bypass circular RLS policy
      const allParticipantIds = [user.id, JUDE_USER_ID, ...filteredMembers];
      const { error: participantsError } = await supabase
        .rpc('add_group_conversation_participants', {
          p_conversation_id: conversation.id,
          p_participant_ids: allParticipantIds
        });

      if (participantsError) throw participantsError;

      // Step 7: Send welcome message AFTER participants are added (90%)
      setProgress(90);
      const { data: groupData } = await supabase
        .from('group_chats')
        .select('name')
        .eq('id', groupId)
        .single();

      let welcomeMessageId = null;
      if (groupData) {
        const { data: welcomeMsg, error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            content: `🎉 Bienvenue dans ${groupData.name} ! 👋✨`,
            read: false
          })
          .select()
          .single();
        
        if (msgError) {
          console.error('Error creating welcome message:', msgError);
        } else if (welcomeMsg) {
          welcomeMessageId = welcomeMsg.id;
          console.log('✅ Welcome message created:', welcomeMessageId);
        }
      }

      // Step 8: Update participants with visibility from welcome message (95%)
      if (welcomeMessageId) {
        setProgress(95);
        const { error: updateError } = await supabase
          .from('conversation_participants')
          .update({ visible_from_message_id: welcomeMessageId })
          .eq('conversation_id', conversation.id);
        
        if (updateError) {
          console.error('Error updating participant visibility:', updateError);
        }
      }

      // Step 9: Complete (100%)
      setProgress(100);
      toast.success("Groupe créé avec succès!");
      onGroupCreated(conversation.id);
      onOpenChange(false);
      
      // Reset form
      setGroupName("");
      setDescription("");
      setSelectedMembers(new Set());
      setAvatarFile(null);
      setAvatarPreview(null);
      setProgress(0);
      setSearchQuery("");
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(`Erreur: ${error.message || "Impossible de créer le groupe"}`);
      setProgress(0);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setGroupName("");
    setDescription("");
    setSelectedMembers(new Set());
    setAvatarFile(null);
    setAvatarPreview(null);
    setProgress(0);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Enhanced Gradient Header */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-success/20 p-4 sm:p-6 shrink-0 overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-2 right-8 w-16 h-16 bg-primary/30 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-2 left-8 w-12 h-12 bg-success/30 rounded-full blur-lg animate-pulse" style={{ animationDelay: '150ms' }} />
          </div>
          
          <DialogHeader className="relative z-10 space-y-2">
            <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="p-2.5 bg-primary/20 rounded-full shadow-lg shadow-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span>Créer un groupe</span>
              <Sparkles className="h-4 w-4 text-primary/60 ml-auto animate-pulse" />
            </DialogTitle>
            <DialogDescription className="text-sm">
              Rassemblez vos amis et commencez à discuter ensemble
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-5">
            {/* Avatar Upload - Enhanced */}
            <div className="flex flex-col items-center gap-3">
              <Label htmlFor="avatar" className="cursor-pointer group">
                <div className="relative">
                  <div className={`h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300 ${
                    avatarPreview 
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20' 
                      : 'border-muted-foreground/30 bg-gradient-to-br from-muted/30 to-muted/50 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 group-hover:scale-105'
                  }`}>
                    {avatarPreview ? (
                      <Avatar className="h-full w-full ring-2 ring-primary/20">
                        <AvatarImage src={avatarPreview} className="object-cover" />
                      </Avatar>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
                        <Upload className="h-6 w-6 sm:h-7 sm:w-7" />
                        <span className="text-[10px] sm:text-xs font-medium">Photo</span>
                      </div>
                    )}
                  </div>
                  {avatarPreview && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-3 w-3" />
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
            </div>

            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Nom du groupe *</Label>
              <Input
                id="name"
                placeholder="Ex: Classe de Maths"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-11 sm:h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Décrivez le groupe..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Selected Members Chips */}
            {selectedMemberProfiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Membres sélectionnés</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedMemberProfiles.map((member) => (
                    <Badge
                      key={member.user_id}
                      variant="secondary"
                      className="pl-1 pr-1.5 py-1 gap-1.5 bg-primary/10 hover:bg-destructive/20 hover:text-destructive transition-all duration-200 cursor-pointer group hover:scale-105 animate-scale-in"
                      onClick={() => removeMember(member.user_id)}
                    >
                      <Avatar className="h-5 w-5 ring-1 ring-primary/20">
                        <AvatarImage src={getAvatarUrl(member.avatar_url)} />
                        <AvatarFallback className="text-[10px]">
                          {member.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs max-w-[80px] truncate font-medium">{member.nickname || member.full_name}</span>
                      <X className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Member Selection with Search */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Ajouter des membres
                </Label>
                <span className="text-xs text-muted-foreground">
                  {selectedMembers.size} sélectionné{selectedMembers.size !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Search Input */}
              {followers.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10"
                  />
                </div>
              )}

              {/* Members List */}
              <div className="border rounded-lg overflow-hidden">
                <ScrollArea className="h-44 sm:h-48">
                  <div className="p-1.5 space-y-1">
                    {filteredFollowers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        {followers.length === 0 
                          ? "Aucun abonné disponible" 
                          : "Aucun résultat trouvé"
                        }
                      </p>
                    ) : (
                      filteredFollowers.map((follower) => {
                        const isSelected = selectedMembers.has(follower.user_id);
                        return (
                          <div
                            key={follower.user_id}
                            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                              isSelected 
                                ? 'bg-primary/10 ring-1 ring-primary/30 shadow-sm' 
                                : 'hover:bg-accent hover:shadow-sm'
                            }`}
                            onClick={() => toggleMember(follower.user_id)}
                          >
                            <div className={`flex items-center justify-center h-5 w-5 rounded-md border-2 transition-all duration-200 ${
                              isSelected 
                                ? 'bg-primary border-primary scale-110' 
                                : 'border-muted-foreground/30 hover:border-primary/50'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-primary-foreground animate-scale-in" />}
                            </div>
                            <Avatar className={`h-9 w-9 sm:h-10 sm:w-10 transition-all duration-200 ${isSelected ? 'ring-2 ring-primary/30' : ''}`}>
                              <AvatarImage src={getAvatarUrl(follower.avatar_url)} />
                              <AvatarFallback className="text-sm">
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
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Footer with Progress and Actions */}
        <div className="border-t p-4 sm:p-6 bg-background/95 backdrop-blur-sm shrink-0 space-y-4">
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
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 sm:h-10"
              disabled={isCreating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateGroup}
              className="flex-1 h-11 sm:h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
              disabled={isCreating || !groupName.trim() || selectedMembers.size === 0}
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Création...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Créer le groupe
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
