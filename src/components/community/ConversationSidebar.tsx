import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, BadgeCheck, Trash2, MoreVertical, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getAvatarUrl } from "@/lib/avatarMap";
import { ConversationSkeleton } from "./ConversationSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Conversation } from "@/types/community";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  isLoading: boolean;
  isVisitor: boolean;
  typingUsers: Record<string, any>;
  onlineUsers: Set<string>;
  shouldShowGlow: boolean;
  shouldShowRipples: boolean;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onGroupInfoClick: (groupId: string) => void;
  onCreateGroup: () => void;
  onSearch: () => void;
  onBack: () => void;
  formatTime: (time: string) => string;
}

export const ConversationSidebar = ({
  conversations,
  selectedConversation,
  isLoading,
  isVisitor,
  typingUsers,
  onlineUsers,
  shouldShowGlow,
  shouldShowRipples,
  onSelectConversation,
  onDeleteConversation,
  onGroupInfoClick,
  onCreateGroup,
  onSearch,
  onBack,
  formatTime,
}: ConversationSidebarProps) => {
  return (
    <aside className={`${selectedConversation ? "hidden md:flex" : "flex"} flex-col w-full border-r border-border/50 bg-background pb-20 md:pb-0 h-full overflow-hidden`}>
      {/* Header */}
      <div className="shrink-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md p-3 sm:p-4 safe-area-top">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="shrink-0 h-9 w-9"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Button>
          <h1 className="text-lg sm:text-xl font-bold flex-1">Messages</h1>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => !isVisitor && onCreateGroup()}
              disabled={isVisitor}
              className={`gap-1.5 bg-gradient-to-r from-primary/10 to-success/10 border-primary/30 hover:border-primary/50 hover:scale-105 transition-all duration-200 h-9 px-2.5 sm:px-3 ${isVisitor ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isVisitor ? "Créez un compte pour créer des groupes" : "Créer un groupe"}
            >
              <Users size={16} className="shrink-0" />
              <span className="hidden sm:inline text-xs font-medium">Nouveau</span>
            </Button>
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => !isVisitor && onSearch()}
              disabled={isVisitor}
              className={`shrink-0 h-9 w-9 ${isVisitor ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isVisitor ? "Créez un compte pour rechercher des utilisateurs" : undefined}
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <ConversationSkeleton />
        ) : conversations.length === 0 ? (
          <div className="py-8 px-4">
            <EmptyState
              illustration="no-messages"
              title="Aucune conversation"
              description="Commencez à discuter avec d'autres utilisateurs ou créez un groupe!"
              ctaLabel="Rechercher des utilisateurs"
              ctaAction={onSearch}
            />
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {conversations.map((conv) => {
              const hasUnread = conv.unreadCount !== undefined && conv.unreadCount > 0;
              const isOnline = !conv.is_group && conv.otherUser?.user_id && onlineUsers.has(conv.otherUser.user_id);
              
              return (
                <div
                  key={conv.id}
                  className={`flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 cursor-pointer transition-all duration-200 ${
                    selectedConversation === conv.id 
                      ? "bg-primary/10 border-l-4 border-l-primary" 
                      : hasUnread 
                        ? `bg-accent/40 hover:bg-accent/60 ${shouldShowGlow ? 'unread-glow' : ''}` 
                        : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <div 
                      className="relative"
                      onClick={() => onSelectConversation(conv.id)}
                    >
                      <Avatar className={`h-11 w-11 sm:h-12 sm:w-12 shrink-0 ring-2 ring-background shadow-sm avatar-interactive ${hasUnread ? 'ring-primary/30' : ''}`}>
                        {conv.is_group ? (
                          <>
                            <AvatarImage src={conv.group?.avatar_url || undefined} loading="lazy" decoding="async" />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-sm sm:text-base font-medium">
                              <Users className="h-5 w-5" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src={getAvatarUrl(conv.otherUser?.avatar_url)} loading="lazy" decoding="async" />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-sm sm:text-base font-medium">
                              {(conv.otherUser?.nickname || conv.otherUser?.full_name)?.[0] || "?"}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      {isOnline && (
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-background shadow-sm ${shouldShowRipples ? 'presence-indicator' : ''}`} />
                      )}
                    </div>
                    <div 
                      className="flex-1 min-w-0 pr-1"
                      onClick={() => onSelectConversation(conv.id)}
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
                        {isOnline && (
                          <span className="text-[10px] sm:text-xs text-success font-medium shrink-0 whitespace-nowrap">En ligne</span>
                        )}
                        {(() => {
                          if (!conv.is_group) {
                            // Check if the other user is typing in this conversation
                            const conversationTypingUsers = typingUsers[conv.id] || {};
                            const otherUserTyping = Object.entries(conversationTypingUsers).some(([key, value]) => {
                              const presence = Array.isArray(value) ? value[0] : value;
                              return presence?.typing && presence?.user_id === conv.otherUser?.user_id;
                            });
                            
                            if (otherUserTyping) {
                              return (
                                <div className="flex items-center gap-1 text-primary text-xs italic font-medium">
                                  <span>en train d'écrire</span>
                                  <span className="flex gap-0.5">
                                    <span className="animate-typing-wave" style={{ animationDelay: '0ms' }}>•</span>
                                    <span className="animate-typing-wave" style={{ animationDelay: '100ms' }}>•</span>
                                    <span className="animate-typing-wave" style={{ animationDelay: '200ms' }}>•</span>
                                  </span>
                                </div>
                              );
                            }
                          }
                          
                          return (
                            <p className={`text-xs sm:text-sm line-clamp-1 break-words overflow-hidden ${hasUnread ? 'text-foreground/80 font-medium' : 'text-muted-foreground'}`}>
                              {conv.lastMessage || "Aucun message"}
                            </p>
                          );
                        })()}
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer la conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
};

export default ConversationSidebar;
