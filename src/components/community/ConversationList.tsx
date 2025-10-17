import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, CheckCheck, Check } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { Input } from "@/components/ui/input";

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
  member_count?: number;
}

interface Conversation {
  id: string;
  created_at: string;
  is_group: boolean;
  group?: GroupChat;
  otherUser?: Profile;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  searchQuery: string;
  onlineUsers: Set<string>;
  lastSeenTimes: Record<string, string>;
  onSelectConversation: (id: string) => void;
  onSearchChange: (query: string) => void;
  onCreateGroup: () => void;
}

export function ConversationList({
  conversations,
  selectedConversation,
  searchQuery,
  onlineUsers,
  lastSeenTimes,
  onSelectConversation,
  onSearchChange,
  onCreateGroup,
}: ConversationListProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins}min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays === 1) return "hier";
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const getLastSeenText = (userId: string) => {
    const lastSeen = lastSeenTimes[userId];
    if (!lastSeen) return 'Hors ligne';
    return `Vu ${formatTimeAgo(lastSeen)}`;
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    
    if (conv.is_group && conv.group) {
      return conv.group.name.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (conv.otherUser) {
      return conv.otherUser.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
             conv.otherUser.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return false;
  });

  return (
    <div className="w-full lg:w-80 xl:w-96 border-r border-border flex flex-col h-full bg-card/50">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-bold">Messages</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onCreateGroup}
            className="hover:bg-primary/10"
            title="Créer un groupe"
          >
            <Plus size={20} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-muted-foreground text-sm">
              {searchQuery ? "Aucune conversation trouvée" : "Aucune conversation"}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isGroup = conv.is_group;
              const displayName = isGroup && conv.group ? conv.group.name : conv.otherUser?.nickname;
              const displayAvatar = isGroup && conv.group 
                ? conv.group.avatar_url 
                : conv.otherUser?.avatar_url;
              const isOnline = !isGroup && conv.otherUser && onlineUsers.has(conv.otherUser.user_id);
              const lastSeenText = !isGroup && conv.otherUser && !isOnline 
                ? getLastSeenText(conv.otherUser.user_id)
                : null;

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1 ${
                    selectedConversation === conv.id
                      ? "bg-gradient-to-br from-primary/20 to-success/20 shadow-sm"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={getAvatarUrl(displayAvatar)} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20">
                          {displayName?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {!isGroup && isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">{displayName}</p>
                        {conv.unreadCount && conv.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs shrink-0">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage || "Aucun message"}
                      </p>
                      {!isGroup && (
                        <div className="flex items-center gap-1 mt-1">
                          {isOnline ? (
                            <span className="text-[10px] text-green-500 font-medium">En ligne</span>
                          ) : lastSeenText ? (
                            <span className="text-[10px] text-muted-foreground">{lastSeenText}</span>
                          ) : null}
                        </div>
                      )}
                      {isGroup && conv.group && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {conv.group.member_count} membres
                        </div>
                      )}
                    </div>
                    {conv.lastMessageTime && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatTimeAgo(conv.lastMessageTime)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
