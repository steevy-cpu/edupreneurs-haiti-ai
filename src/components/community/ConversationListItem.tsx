import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BadgeCheck, MoreVertical, Trash2, Users } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { Conversation } from "@/types/community";

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isOnline: boolean;
  isTyping: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onGroupInfoClick: (groupId: string) => void;
  formatTime: (timestamp: string) => string;
}

export const ConversationListItem = ({
  conversation,
  isSelected,
  isOnline,
  isTyping,
  onSelect,
  onDelete,
  onGroupInfoClick,
  formatTime,
}: ConversationListItemProps) => {
  const conv = conversation;

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/50 ${
        isSelected ? "bg-muted/50" : ""
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <div 
          className="relative"
          onClick={() => onSelect(conv.id)}
        >
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
            {conv.is_group ? (
              <>
                <AvatarImage src={conv.group?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-sm sm:text-base">
                  <Users className="h-5 w-5" />
                </AvatarFallback>
              </>
            ) : (
              <>
                <AvatarImage src={getAvatarUrl(conv.otherUser?.avatar_url)} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-sm sm:text-base">
                  {(conv.otherUser?.nickname || conv.otherUser?.full_name)?.[0] || "?"}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          {!conv.is_group && conv.otherUser?.user_id && isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        <div 
          className="flex-1 min-w-0"
          onClick={() => onSelect(conv.id)}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <p 
              className="font-semibold truncate text-sm sm:text-base cursor-pointer hover:underline flex-shrink"
              onClick={(e) => {
                if (conv.is_group && conv.group) {
                  e.stopPropagation();
                  onGroupInfoClick(conv.group.id);
                }
              }}
            >
              {conv.is_group 
                ? conv.group?.name 
                : (conv.otherUser?.nickname || conv.otherUser?.full_name || "Utilisateur")
              }
            </p>
            {conv.is_group && (
              <span className="text-xs text-muted-foreground shrink-0">
                ({conv.group?.member_count})
              </span>
            )}
            {!conv.is_group && conv.otherUser?.verified && (
              <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 shrink-0" />
            )}
            {!conv.is_group && conv.otherUser?.user_id && isOnline && (
              <span className="text-xs text-green-500 font-medium shrink-0 whitespace-nowrap">En ligne</span>
            )}
          </div>
          {!conv.is_group && isTyping ? (
            <div className="flex items-center gap-1 text-muted-foreground text-xs italic">
              <span>en train d'écrire</span>
              <span className="flex gap-0.5">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words overflow-hidden">
              {conv.lastMessage || "Aucun message"}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {conv.lastMessageTime && (
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {formatTime(conv.lastMessageTime)}
            </span>
          )}
          {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
            <span className="flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold shadow-lg">
              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conv.id);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer la conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
