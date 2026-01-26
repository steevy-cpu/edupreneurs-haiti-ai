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
  showGlow?: boolean;
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
  showGlow = true,
}: ConversationListItemProps) => {
  const conv = conversation;

  const hasUnread = conv.unreadCount !== undefined && conv.unreadCount > 0;

  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? "bg-primary/10 border-l-4 border-l-primary" 
          : hasUnread 
            ? `bg-accent/40 hover:bg-accent/60 ${showGlow ? 'unread-glow' : ''}` 
            : "hover:bg-muted/40"
      }`}
      style={hasUnread && showGlow ? { 
        '--time-accent': 'var(--time-accent, hsl(var(--primary) / 0.5))'
      } as React.CSSProperties : undefined}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
        <div 
          className="relative"
          onClick={() => onSelect(conv.id)}
        >
          <Avatar className={`h-11 w-11 sm:h-12 sm:w-12 shrink-0 ring-2 ring-background shadow-sm avatar-interactive ${hasUnread ? 'ring-primary/30' : ''}`}>
            {conv.is_group ? (
              <>
                <AvatarImage src={conv.group?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-sm sm:text-base font-medium">
                  <Users className="h-5 w-5" />
                </AvatarFallback>
              </>
            ) : (
              <>
                <AvatarImage src={getAvatarUrl(conv.otherUser?.avatar_url)} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-sm sm:text-base font-medium">
                  {(conv.otherUser?.nickname || conv.otherUser?.full_name)?.[0] || "?"}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          {!conv.is_group && conv.otherUser?.user_id && isOnline && (
            <div 
              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-background shadow-sm"
              aria-label="En ligne"
              role="status"
            />
          )}
        </div>
        <div 
          className="flex-1 min-w-0 pr-1"
          onClick={() => onSelect(conv.id)}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <p 
              className={`truncate text-sm sm:text-base cursor-pointer hover:underline flex-shrink ${hasUnread ? 'font-bold' : 'font-semibold'}`}
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
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {!conv.is_group && conv.otherUser?.user_id && isOnline && (
              <span className="text-[10px] sm:text-xs text-success font-medium shrink-0 whitespace-nowrap">En ligne</span>
            )}
            {!conv.is_group && isTyping ? (
              <div className="flex items-center gap-1 text-primary text-xs italic font-medium">
                <span>en train d'écrire</span>
                <span className="flex gap-0.5">
                  <span className="animate-typing-wave" style={{ animationDelay: '0ms' }}>•</span>
                  <span className="animate-typing-wave" style={{ animationDelay: '100ms' }}>•</span>
                  <span className="animate-typing-wave" style={{ animationDelay: '200ms' }}>•</span>
                </span>
              </div>
            ) : (
              <p className={`text-xs sm:text-sm line-clamp-1 break-words overflow-hidden ${hasUnread ? 'text-foreground/80 font-medium' : 'text-muted-foreground'}`}>
                {conv.lastMessage || "Aucun message"}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-1">
          {conv.lastMessageTime && (
            <span className={`text-[10px] sm:text-xs ${hasUnread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {formatTime(conv.lastMessageTime)}
            </span>
          )}
          {hasUnread && (
            <span className="flex items-center justify-center min-w-[20px] h-5 sm:min-w-[24px] sm:h-6 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold shadow-md">
              {conv.unreadCount! > 99 ? '99+' : conv.unreadCount}
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
        <DropdownMenuContent align="end" className="min-w-[180px]">
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
