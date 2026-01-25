import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, BadgeCheck, MoreVertical, Trash2, Users } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { Conversation } from "@/types/community";

interface ChatViewHeaderProps {
  conversation: Conversation | undefined;
  isOnline: boolean;
  lastSeen: string | undefined;
  onBack: () => void;
  onDelete: () => void;
  onGroupInfoClick: (groupId: string) => void;
  formatLastSeen: (timestamp: string) => string;
  showRipple?: boolean;
}

/**
 * ChatViewHeader - Chat header without fixed positioning
 * Designed to sit in a flex container as a shrink-0 element
 */
export const ChatViewHeader = ({
  conversation,
  isOnline,
  lastSeen,
  onBack,
  onDelete,
  onGroupInfoClick,
  formatLastSeen,
  showRipple = true,
}: ChatViewHeaderProps) => {
  const navigate = useNavigate();
  const isGroup = conversation?.is_group;

  if (!conversation) return null;

  return (
    <div className="h-[56px] border-b border-border/50 bg-background/95 backdrop-blur-md px-4 flex items-center gap-3">
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 md:hidden"
        onClick={onBack}
      >
        <ArrowLeft size={20} />
      </Button>
      
      <Avatar 
        className="h-10 w-10 shrink-0 cursor-pointer avatar-interactive"
        onClick={() => {
          if (isGroup && conversation?.group) {
            onGroupInfoClick(conversation.group.id);
          } else if (!isGroup && conversation?.otherUser) {
            navigate(`/profile/${conversation.otherUser.user_id}`);
          }
        }}
      >
        {isGroup ? (
          <>
            <AvatarImage src={conversation.group?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20">
              <Users className="h-5 w-5" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src={getAvatarUrl(conversation?.otherUser?.avatar_url)} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20">
              {(conversation?.otherUser?.nickname || conversation?.otherUser?.full_name)?.[0] || "?"}
            </AvatarFallback>
          </>
        )}
      </Avatar>
      
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <p 
            className="font-semibold text-base truncate cursor-pointer hover:opacity-80 transition-opacity hover:underline"
            onClick={() => {
              if (isGroup && conversation?.group) {
                onGroupInfoClick(conversation.group.id);
              } else if (!isGroup && conversation?.otherUser) {
                navigate(`/profile/${conversation.otherUser.user_id}`);
              }
            }}
          >
            {isGroup 
              ? conversation.group?.name 
              : (conversation?.otherUser?.nickname || conversation?.otherUser?.full_name || "Utilisateur")
            }
          </p>
          {isGroup && (
            <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
              ({conversation.group?.member_count})
            </span>
          )}
          {!isGroup && conversation?.otherUser?.verified && (
            <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 shrink-0" />
          )}
        </div>
        {!isGroup && (() => {
          const otherUserId = conversation?.otherUser?.user_id;
          if (!otherUserId) return null;
          
          if (isOnline) {
            return (
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <div 
                    className="w-2 h-2 bg-green-500 rounded-full"
                    aria-label="En ligne"
                    role="status"
                  />
                  {showRipple && (
                    <div 
                      className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-presence-ripple"
                      style={{ contain: 'layout style paint' }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="text-xs text-green-500 font-medium">
                  En ligne
                </p>
              </div>
            );
          } else if (lastSeen) {
            return (
              <p className="text-xs text-muted-foreground">
                {formatLastSeen(lastSeen)}
              </p>
            );
          }
          return null;
        })()}
        {isGroup && conversation.group?.description && (
          <p className="text-xs text-muted-foreground truncate">
            {conversation.group.description}
          </p>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer la conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
