import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, LogOut, BadgeCheck } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

  useEffect(() => {
    if (open && groupId) {
      fetchGroupInfo();
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

  const handleLeaveGroup = async () => {
    try {
      // Remove from group_members
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={group.avatar_url || undefined} 
                  alt={group.name}
                />
                <AvatarFallback>
                  <Users className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <DialogTitle className="text-xl">{group.name}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {members.length} {members.length === 1 ? 'membre' : 'membres'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {group.description && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-3">Membres ({members.length})</h4>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Chargement...</p>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={getAvatarUrl(member.avatar_url)} 
                            alt={member.full_name}
                          />
                          <AvatarFallback>
                            {member.full_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
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
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

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
    </>
  );
};
