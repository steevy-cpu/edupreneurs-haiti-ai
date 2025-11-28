import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Search, MessageCircle, ArrowLeft, Eye, BadgeCheck } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Profile {
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  verified: boolean;
}

const UserSearch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUser(user);
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setProfiles([]);
      return;
    }

    setIsLoading(true);
    // Use public_profiles view to only access non-sensitive user data
    const { data, error } = await supabase
      .from("public_profiles")
      .select("user_id, full_name, nickname, avatar_url, verified")
      .or(`full_name.ilike.%${query}%,nickname.ilike.%${query}%`)
      .neq("user_id", currentUser?.id)
      .limit(20)
      .returns<Profile[]>();

    if (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rechercher des utilisateurs",
        variant: "destructive",
      });
    } else {
      setProfiles(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, currentUser]);

  const startConversation = async (otherUserId: string) => {
    if (!currentUser) {
      console.log("No current user found");
      return;
    }

    console.log("Starting conversation with user:", otherUserId);

    // Check if conversation already exists
    const { data: existingConversations, error: existingError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUser.id);

    if (existingError) {
      console.error("Error checking existing conversations:", existingError);
    }

    if (existingConversations) {
      for (const conv of existingConversations) {
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conv.conversation_id);

        if (participants?.length === 2 && participants.some(p => p.user_id === otherUserId)) {
          console.log("Found existing conversation:", conv.conversation_id);
          navigate(`/community?conversation=${conv.conversation_id}`);
          return;
        }
      }
    }

    console.log("Creating new conversation...");

    // Create new conversation using the database function
    const { data: conversationId, error: convError } = await supabase
      .rpc("create_conversation");

    console.log("Conversation creation result:", { conversationId, convError });

    if (convError) {
      console.error("Conversation creation error:", convError);
      toast({
        title: "Erreur",
        description: `Impossible de créer la conversation: ${convError.message}`,
        variant: "destructive",
      });
      return;
    }

    if (!conversationId) {
      console.error("No conversation ID returned");
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation: aucune donnée retournée",
        variant: "destructive",
      });
      return;
    }

    console.log("Adding participants to conversation:", conversationId);

    // Add participants
    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: conversationId, user_id: currentUser.id },
        { conversation_id: conversationId, user_id: otherUserId },
      ]);

    console.log("Participants insertion result:", { participantsError });

    if (participantsError) {
      console.error("Participants error:", participantsError);
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter les participants: ${participantsError.message}`,
        variant: "destructive",
      });
      return;
    }

    console.log("Successfully created conversation, navigating...");
    navigate(`/community?conversation=${conversationId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <h1 className="text-base sm:text-xl font-semibold flex-1 truncate">Rechercher des utilisateurs</h1>
          <ThemeToggle />
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Rechercher par nom ou pseudo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]">
        <div className="max-w-2xl mx-auto pb-20 sm:pb-24">
          {isLoading ? (
            <div className="flex justify-center py-8 sm:py-10">
              <p className="text-sm sm:text-base text-muted-foreground">Recherche...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted/30 flex items-center justify-center mb-3 sm:mb-4">
                <Search size={28} className="text-muted-foreground sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-medium mb-1.5 sm:mb-2">
                {searchQuery ? "Aucun résultat" : "Commencez votre recherche"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs px-2">
                {searchQuery
                  ? "Essayez un autre nom ou pseudo"
                  : "Tapez un nom ou pseudo pour trouver des utilisateurs"}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2 px-3 sm:px-4">
              {profiles.map((profile) => (
                <div
                  key={profile.user_id}
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <Avatar 
                    className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 cursor-pointer" 
                    onClick={() => navigate(`/profile/${profile.user_id}`)}
                  >
                    <AvatarImage src={getAvatarUrl(profile.avatar_url)} alt={profile.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-foreground text-sm sm:text-base">
                      {profile.full_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${profile.user_id}`)}>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <p className="font-semibold text-sm sm:text-base truncate">{profile.full_name}</p>
                      {profile.verified && (
                        <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-primary/20 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">@{profile.nickname}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/profile/${profile.user_id}`)}
                      className="hover:bg-primary/10 h-9 w-9 sm:h-10 sm:w-10"
                      title="Voir le profil"
                    >
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startConversation(profile.user_id)}
                      className="hover:bg-primary/10 h-9 w-9 sm:h-10 sm:w-10"
                      title="Envoyer un message"
                    >
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserSearch;
