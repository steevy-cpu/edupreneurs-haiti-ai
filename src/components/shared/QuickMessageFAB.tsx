import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, Plus, UserPlus } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";

interface RecentConversation {
  id: string;
  participantName: string;
  participantAvatar: string | null;
  participantId: string;
  lastMessage: string;
  unreadCount: number;
}

interface QuickMessageFABProps {
  isVisitor?: boolean;
}

export const QuickMessageFAB = ({ isVisitor = false }: QuickMessageFABProps) => {
  // I12: Use in-memory session auth instead of supabase.auth.getUser() network call.
  // SessionAuthContext already has the user cached — zero extra round-trip to auth server.
  const { user } = useSessionAuth();
  const [isStable, setIsStable] = useState(false);
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Function MUST be defined before useEffect to avoid ReferenceError
  const fetchRecentConversations = useCallback(async () => {
    // user comes from useSessionAuth() hook above — no network call needed
    if (!user) return;

    // Get recent conversations the user is part of
    const { data: participantData, error } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversations!inner(
          id,
          updated_at,
          is_group
        )
      `)
      .eq("user_id", user.id)
      .order("conversations(updated_at)", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error fetching recent conversations:", error);
      return;
    }

    if (!participantData) return;

    // Fetch participant details and last message for each conversation
    const conversationsWithDetails = await Promise.all(
      participantData.map(async (p) => {
        // Get other participant
        const { data: otherParticipant } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", p.conversation_id)
          .neq("user_id", user.id)
          .single();

        if (!otherParticipant) return null;

        // Get profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("nickname, avatar_url")
          .eq("user_id", otherParticipant.user_id)
          .single();

        // Get last message
        const { data: lastMessage } = await supabase
          .from("messages")
          .select("content, sender_id")
          .eq("conversation_id", p.conversation_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", p.conversation_id)
          .eq("read", false)
          .neq("sender_id", user.id);

        return {
          id: p.conversation_id,
          participantName: profile?.nickname ?? 'toi',
          participantAvatar: profile?.avatar_url,
          participantId: otherParticipant.user_id,
          lastMessage: lastMessage?.content || "",
          unreadCount: unreadCount || 0,
        };
      })
    );

    const validConversations = conversationsWithDetails.filter(Boolean) as RecentConversation[];
    setRecentConversations(validConversations);
    setUnreadTotal(validConversations.reduce((acc, c) => acc + c.unreadCount, 0));
  }, [user]); // user is a closure dep — recreate callback if user identity changes (e.g. re-login)

  // useEffect MUST be called before any conditional returns to comply with Rules of Hooks
  // This prevents React error #310 when navigating between pages
  useEffect(() => {
    if (!isVisitor) {
      fetchRecentConversations();
    }
  }, [isVisitor, fetchRecentConversations]);

  // isStable guard: prevents null dispatcher crash on lazy-load mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsStable(true));
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!isStable) return null;

  // Hide on community page, passion-discovery page, and all quiz battle pages
  if (
    location.pathname === "/community" || 
    location.pathname === "/passion-discovery" ||
    location.pathname.startsWith("/quiz-battle")
  ) return null;

  const handleConversationClick = (conversationId: string) => {
    navigate(`/community?conversation=${conversationId}`);
  };

  const handleNewMessage = () => {
    navigate("/user-search");
  };

  if (isVisitor) {
    return (
      <Button
        onClick={() => navigate("/auth/login")}
        className="fixed bottom-[84px] right-4 lg:bottom-6 z-40 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-success hover:opacity-90 transition-all"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="fixed bottom-[84px] right-4 lg:bottom-6 z-40 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-success hover:opacity-90 transition-all"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
          {unreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadTotal > 9 ? "9+" : unreadTotal}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-3 py-2 font-semibold text-sm">Messages récents</div>
        <DropdownMenuSeparator />
        
        {recentConversations.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            Aucune conversation récente
          </div>
        ) : (
          recentConversations.map((conversation) => (
            <DropdownMenuItem
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              className="flex items-center gap-3 py-3 cursor-pointer"
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={getAvatarUrl(conversation.participantAvatar)} />
                <AvatarFallback className="text-xs">
                  {conversation.participantName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">
                    {conversation.participantName}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {conversation.lastMessage}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleNewMessage}
          className="flex items-center gap-2 py-3 cursor-pointer"
        >
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium text-sm">Nouveau message</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickMessageFAB;
