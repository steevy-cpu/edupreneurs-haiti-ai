import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, LogOut, BadgeCheck, UserPlus, X, Upload, Trash2 } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  verified: boolean;
}

interface GroupChat {
  id: string;
  name: string;
  avatar_url: string | null;
  description: string | null;
  created_by: string;
}

interface GroupInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  conversationId: string;
  currentUserId: string;
  onLeaveGroup: () => void;
}

export const GroupInfoDialog = ({
  open,
  onOpenChange,
  groupId,
  conversationId,
  currentUserId,
  onLeaveGroup,
}: GroupInfoDialogProps) => {
  const { toast } = useToast();
  const [group, setGroup] = useState<GroupChat | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [availableFollowers, setAvailableFollowers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [showDeleteAvatarConfirm, setShowDeleteAvatarConfirm] = useState(false);

  useEffect(() => {
    if (open && groupId) {
      fetchGroupInfo();
      fetchAvailableFollowers();
    }
  }, [open, groupId]);

  const fetchGroupInfo = async () => {
    try {
      setLoading(true);

      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from('group_chats')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Fetch group members with their user IDs
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('user_id, role')
        .eq('group_id', groupId);

      if (memberError) throw memberError;

      // Fetch profiles for all members
      const userIds = memberData.map((m: any) => m.user_id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, nickname, avatar_url, verified')
        .in('user_id', userIds);

      if (profileError) throw profileError;
      
      setMembers(profileData || []);
    } catch (error) {
      console.error('Error fetching group info:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations du groupe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableFollowers = async () => {
    try {
      // Get current user's accepted followers
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .eq('status', 'accepted');

      if (followsError) throw followsError;

      const followerIds = followsData.map((f) => f.following_id);

      // Get current group members
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (memberError) throw memberError;

      const memberIds = memberData.map((m: any) => m.user_id);

      // Filter out users already in the group
      const availableIds = followerIds.filter((id) => !memberIds.includes(id));

      if (availableIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, nickname, avatar_url, verified')
          .in('user_id', availableIds);

        if (profilesError) throw profilesError;
        setAvailableFollowers(profilesData || []);
      } else {
        setAvailableFollowers([]);
      }
    } catch (error) {
      console.error('Error fetching available followers:', error);
    }
  };

  const handleAddMember = async (userId: string, userName: string) => {
    try {
      setAddingMember(true);

      // Add to group_members
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (memberError) throw memberError;

      // Add to conversation_participants
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversationId,
          user_id: userId
        });

      if (participantError) throw participantError;

      // Create system message announcing the new member
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: `${userName} a rejoint le groupe`,
          read: false
        });

      if (messageError) throw messageError;

      // Create notification for the added user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          actor_id: currentUserId,
          type: 'group_invitation',
          content: `Vous avez été ajouté au groupe "${group?.name}"`,
          read: false
        });

      if (notificationError) throw notificationError;

      toast({
        title: "Succès",
        description: `${userName} a été ajouté au groupe`,
      });

      // Refresh data
      await fetchGroupInfo();
      await fetchAvailableFollowers();
      setShowAddMembers(false);
      setSearchQuery("");
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter ce membre au groupe",
        variant: "destructive",
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !group) return;

    try {
      setUpdatingAvatar(true);

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${groupId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('group-avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('group-avatars')
        .getPublicUrl(fileName);

      // Update group avatar URL
      const { error: updateError } = await supabase
        .from('group_chats')
        .update({ avatar_url: publicUrl })
        .eq('id', groupId);

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: "Photo de groupe mise à jour",
      });

      await fetchGroupInfo();
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la photo",
        variant: "destructive",
      });
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setUpdatingAvatar(true);

      // Update group to remove avatar URL
      const { error: updateError } = await supabase
        .from('group_chats')
        .update({ avatar_url: null })
        .eq('id', groupId);

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: "Photo de groupe supprimée",
      });

      await fetchGroupInfo();
      setShowDeleteAvatarConfirm(false);
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo",
        variant: "destructive",
      });
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      // Get current user's profile for the system message
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('nickname, full_name')
        .eq('user_id', currentUserId)
        .single();

      if (profileError) throw profileError;

      const userName = userProfile.nickname || userProfile.full_name;

      // IMPORTANT: Insert the system message BEFORE removing user from participants
      // Otherwise RLS policy will block the insert
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: `${userName} a quitté le groupe`,
          read: false
        });

      if (messageError) throw messageError;

      // Now remove from group_members
      const { error: memberError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUserId);

      if (memberError) throw memberError;

      // Remove from conversation_participants
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', currentUserId);

      if (participantError) throw participantError;

      toast({
        title: "Succès",
        description: "Vous avez quitté le groupe",
      });

      onLeaveGroup();
      onOpenChange(false);
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "Erreur",
        description: "Impossible de quitter le groupe",
        variant: "destructive",
      });
    }
  };

  if (!group) return null;

  const filteredFollowers = availableFollowers.filter((follower) =>
    follower.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    follower.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative group/avatar">
                <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                  <AvatarImage 
                    src={group.avatar_url || undefined} 
                    alt={group.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10">
                    <Users className="h-10 w-10 text-primary" />
                  </AvatarFallback>
                </Avatar>
                {(group.created_by === currentUserId || members.some(m => m.user_id === currentUserId)) && (
                  <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <label htmlFor="group-avatar" className="cursor-pointer">
                      <Upload className="h-5 w-5 text-white hover:text-primary transition-colors" />
                    </label>
                    {group.avatar_url && (
                      <button onClick={() => setShowDeleteAvatarConfirm(true)}>
                        <Trash2 className="h-5 w-5 text-white hover:text-destructive transition-colors" />
                      </button>
                    )}
                  </div>
                )}
                <input
                  id="group-avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={updatingAvatar}
                />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {group.name}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {members.length} {members.length === 1 ? 'membre' : 'membres'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {group.description && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full"></span>
                  Description
                </h4>
                <p className="text-sm text-muted-foreground pl-3">{group.description}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full"></span>
                  Membres ({members.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5"
                  onClick={() => setShowAddMembers(!showAddMembers)}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Ajouter
                </Button>
              </div>

              {showAddMembers && (
                <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Ajouter des membres</h5>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => {
                        setShowAddMembers(false);
                        setSearchQuery("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Input
                    placeholder="Rechercher dans vos abonnements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                  />

                  <ScrollArea className="h-[200px] pr-2">
                    <div className="space-y-1.5">
                      {filteredFollowers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {searchQuery ? "Aucun résultat trouvé" : "Tous vos abonnements sont déjà dans ce groupe"}
                        </p>
                      ) : (
                        filteredFollowers.map((follower) => (
                          <div
                            key={follower.id}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-background transition-colors"
                          >
                            <Avatar className="h-9 w-9">
                              <AvatarImage 
                                src={getAvatarUrl(follower.avatar_url)} 
                                alt={follower.full_name}
                              />
                              <AvatarFallback className="text-xs">
                                {follower.full_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="text-sm font-medium truncate">
                                  {follower.full_name}
                                </p>
                                {follower.verified && (
                                  <BadgeCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                @{follower.nickname}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs"
                              onClick={() => handleAddMember(follower.user_id, follower.full_name)}
                              disabled={addingMember}
                            >
                              Ajouter
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <ScrollArea className="h-[250px] pr-2">
                <div className="space-y-1.5">
                  {loading ? (
                    <div className="space-y-2 py-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-all hover:scale-[1.01]"
                      >
                        <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                          <AvatarImage 
                            src={getAvatarUrl(member.avatar_url)} 
                            alt={member.full_name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                            {member.full_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">
                              {member.full_name}
                            </p>
                            {member.verified && (
                              <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            @{member.nickname}
                          </p>
                        </div>
                        {member.user_id === group.created_by && (
                          <span className="text-xs bg-gradient-to-r from-primary to-primary/70 text-primary-foreground px-2.5 py-1 rounded-full font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="pt-2">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowLeaveConfirm(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Quitter le groupe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter le groupe?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir quitter "{group.name}"? Vous ne recevrez plus de messages de ce groupe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveGroup}>
              Quitter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAvatarConfirm} onOpenChange={setShowDeleteAvatarConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la photo de groupe?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAvatar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
