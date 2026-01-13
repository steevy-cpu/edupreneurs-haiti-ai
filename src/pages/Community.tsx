import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Search, Smile, Check, CheckCheck, BadgeCheck, Edit2, Trash2, X, MoreVertical, ImageIcon, Download, Users, FileText, Paperclip } from "lucide-react";
import { useMessageSounds } from "@/hooks/useMessageSounds";
// Lazy load EmojiPicker (~200KB) - only loaded when user opens emoji picker
const EmojiPicker = lazy(() => import("emoji-picker-react"));
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getAvatarUrl } from "@/lib/avatarMap";
import { ThemeToggle } from "@/components/ThemeToggle";
import { optimizeMediaFile, formatFileSize } from "@/utils/mediaOptimization";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { GroupInfoDialog } from "@/components/GroupInfoDialog";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import ericAiHelper from "@/assets/eric-ai-helper.png";
import chatBackground from "@/assets/background-chat.png";
import { logger } from "@/utils/logger";
import { preloadImage } from "@/utils/performanceOptimization";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { useTimeBasedAccent } from "@/hooks/useTimeBasedAccent";
import { useVisitor } from "@/contexts/VisitorContext";
import { LockedOverlay } from "@/components/visitor";
import { visitorConversationPreview } from "@/data/visitorDemoData";
import { 
  ConversationListItem, 
  ChatHeader, 
  TypingIndicator,
  ConversationSkeleton,
  MessageBubble,
  SystemMessage,
  VisitorCommunityOverlay
} from "@/components/community";
import { EmptyState } from "@/components/shared/EmptyState";
import { 
  Profile, 
  GroupChat, 
  Conversation, 
  Message, 
  Reaction, 
  JUDE_USER_ID 
} from "@/types/community";

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isVisitor } = useVisitor();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("conversation");
  const { playSendSound, playReceiveSound } = useMessageSounds();
  
  // Network-aware animations and time-based theming
  const { 
    shouldAnimate, 
    shouldShowFloatingReactions, 
    shouldShowRipples, 
    shouldStaggerMessages,
    shouldShowGlow 
  } = useNetworkAwareAnimations();
  
  // Network-aware loading for 3G optimization
  const {
    isSlowConnection,
    shouldDeferResources,
    imageQuality
  } = useNetworkAwareLoading();
  
  const { accentColor, period } = useTimeBasedAccent();
  
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationId);
  const [selectedConversationDetails, setSelectedConversationDetails] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'document' | null>(null);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  const previousMessagesCount = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageChannelRef = useRef<any>(null);
  const reactionChannelRef = useRef<any>(null);
  const presenceChannelsRef = useRef<Record<string, any>>({});
  const profileCacheRef = useRef<Map<string, Profile>>(new Map());
  const typingTimeoutRef = useRef<any>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, Record<string, any>>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(() => new Set([JUDE_USER_ID]));
  const [lastSeenTimes, setLastSeenTimes] = useState<Record<string, string>>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem('lastSeenTimes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const globalPresenceChannelRef = useRef<any>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Cached user profile for optimistic updates - prevents redundant fetches
  const [cachedUserProfile, setCachedUserProfile] = useState<Profile | null>(null);

  // Detect if current conversation is with Jude (AI assistant) - hide media upload
  const isJudeConversation = useMemo(() => {
    if (!selectedConversation) return false;
    const conv = selectedConversationDetails ?? conversations.find(c => c.id === selectedConversation);
    return conv?.otherUser?.user_id === JUDE_USER_ID;
  }, [selectedConversation, conversations, selectedConversationDetails]);

  // Memoize chat background style with time-based mood overlay
  const chatBackgroundStyle = useMemo(() => {
    // Time-based mood gradient overlay (subtle tint)
    const moodGradient = period === 'morning' 
      ? 'hsl(35 90% 55% / 0.03)' 
      : period === 'afternoon' 
        ? 'hsl(200 90% 55% / 0.03)' 
        : period === 'evening' 
          ? 'hsl(270 70% 60% / 0.03)' 
          : 'hsl(230 60% 50% / 0.03)';
    
    return {
      backgroundImage: `linear-gradient(${moodGradient}, hsl(var(--background) / 0.55)), url(${chatBackground})`,
      backgroundSize: '300px',
      backgroundRepeat: 'repeat',
      backgroundPosition: 'center',
    };
  }, [period]);

  // Preload chat background image on mount
  useEffect(() => {
    preloadImage(chatBackground).catch(() => {
      // Silent fail - image will load normally when needed
    });
  }, []);

  // Handle virtual keyboard on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const vvHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const kbHeight = Math.max(0, windowHeight - vvHeight);
        setKeyboardHeight(kbHeight);
        document.documentElement.style.setProperty('--kb', `${kbHeight}px`);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      handleResize();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      document.documentElement.style.setProperty('--kb', '0px');
    };
  }, []);

  // Save lastSeenTimes to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('lastSeenTimes', JSON.stringify(lastSeenTimes));
    } catch (error) {
      logger.error('Failed to save lastSeenTimes:', error);
    }
  }, [lastSeenTimes]);

  useEffect(() => {
    checkUser();
  }, [isVisitor]);

  // Populate demo conversations for visitors
  useEffect(() => {
    if (isVisitor) {
      const demoConversations: Conversation[] = [
        ...visitorConversationPreview.groups.map((g, i) => ({
          id: `demo-group-${i}`,
          created_at: new Date().toISOString(),
          is_group: true,
          group: {
            id: `demo-group-${i}`,
            name: g.name,
            member_count: g.members,
            avatar_url: null,
            description: null,
            created_by: 'demo',
          },
          lastMessage: g.lastMessage,
          lastMessageTime: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
          unreadCount: i === 0 ? 3 : 0,
        })),
        ...visitorConversationPreview.directMessages.map((dm, i) => ({
          id: `demo-dm-${i}`,
          created_at: new Date().toISOString(),
          is_group: false,
          otherUser: {
            id: `demo-user-${i}`,
            user_id: `demo-user-${i}`,
            nickname: dm.name,
            full_name: dm.name,
            avatar_url: `avatar-${i + 1}`,
            verified: i === 0,
          },
          lastMessage: dm.lastMessage,
          lastMessageTime: new Date(Date.now() - (i + 4) * 3600000).toISOString(),
          unreadCount: dm.unread,
        })),
      ];
      setConversations(demoConversations);
      setIsLoadingConversations(false);
    }
  }, [isVisitor]);

  // Cache user profile on mount for optimistic updates
  useEffect(() => {
    const cacheUserProfile = async () => {
      if (user && !cachedUserProfile) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (profile) {
          setCachedUserProfile(profile as Profile);
        }
      }
    };
    cacheUserProfile();
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchFollowers();
      subscribeToMessages();
      setupGlobalPresenceListener();
    }
    
    return () => {
      // Clean up the presence listener and polling interval
      if (globalPresenceChannelRef.current) {
        const channel = globalPresenceChannelRef.current;
        if ((channel as any).pollInterval) {
          clearInterval((channel as any).pollInterval);
        }
        supabase.removeChannel(channel);
        globalPresenceChannelRef.current = null;
      }
    };
  }, [user?.id]);

  // Refresh conversations when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchConversations();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Subscribe to typing presence for all conversations - only when conversation IDs change
  useEffect(() => {
    if (user && conversations.length > 0) {
      // Only set up channels for new conversations
      conversations.forEach(conv => {
        if (!presenceChannelsRef.current[conv.id]) {
          subscribeToTypingPresence(conv.id);
        }
      });
      
      // Clean up channels for conversations that no longer exist
      const currentConvIds = new Set(conversations.map(c => c.id));
      Object.keys(presenceChannelsRef.current).forEach(convId => {
        if (!currentConvIds.has(convId)) {
          supabase.removeChannel(presenceChannelsRef.current[convId]);
          delete presenceChannelsRef.current[convId];
        }
      });
    }
    
    return () => {
      // Cleanup all presence channels on unmount
      Object.keys(presenceChannelsRef.current).forEach(convId => {
        supabase.removeChannel(presenceChannelsRef.current[convId]);
      });
      presenceChannelsRef.current = {};
    };
  }, [conversations.map(c => c.id).join(','), user?.id]);

  // Fetch single conversation data when navigating via URL (for new/empty conversations)
  const fetchSingleConversation = async (convId: string): Promise<Conversation | null> => {
    if (!user) return null;
    
    // Fetch conversation details
    const { data: convData, error: convError } = await supabase
      .from("conversations")
      .select("id, created_at, is_group, group_id")
      .eq("id", convId)
      .single();
    
    if (convError || !convData) {
      logger.error('Error fetching single conversation:', convError);
      return null;
    }
    
    // Fetch all participants
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", convId);
    
    // Find the other user
    const otherUserId = participants?.find(p => p.user_id !== user.id)?.user_id;
    
    if (!otherUserId && !convData.is_group) return null;
    
    // Fetch the other user's profile
    let otherUserProfile = null;
    if (otherUserId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", otherUserId)
        .single();
      otherUserProfile = profile as Profile | null;
    }
    
    // Fetch group details if group conversation
    let groupData = null;
    if (convData.is_group && convData.group_id) {
      const { data: group } = await supabase
        .from("group_chats")
        .select("*")
        .eq("id", convData.group_id)
        .single();
      
      if (group) {
        // Get member count
        const { data: members } = await supabase
          .from("group_members")
          .select("id")
          .eq("group_id", convData.group_id);
        
        groupData = {
          ...group,
          member_count: members?.length || 0
        };
      }
    }
    
    return {
      id: convId,
      created_at: convData.created_at,
      is_group: convData.is_group,
      otherUser: otherUserProfile || undefined,
      group: groupData || undefined,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0,
    };
  };

  useEffect(() => {
    if (selectedConversation && user) {
      const loadConversation = async () => {
        // Check if conversation exists in list
        let convDetails = conversations.find(c => c.id === selectedConversation);
        
        if (!convDetails) {
          // Fetch single conversation data (for new/empty conversations from profile "Envoyer un message")
          const newConv = await fetchSingleConversation(selectedConversation);
          if (newConv) {
            convDetails = newConv;
            // Add to conversations list
            setConversations(prev => [newConv, ...prev.filter(c => c.id !== newConv.id)]);
          }
        }
        
        // Store conversation details in persistent state to prevent header flicker
        if (convDetails) {
          setSelectedConversationDetails(convDetails);
        }
        
        await fetchMessages(selectedConversation);
        await markMessagesAsRead(selectedConversation);
        await fetchReactions(selectedConversation);
      };
      loadConversation();
      subscribeToConversationMessages(selectedConversation);
      subscribeToReactions(selectedConversation);
    } else {
      // Clear details when no conversation is selected
      setSelectedConversationDetails(null);
    }
    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
      }
      if (reactionChannelRef.current) {
        supabase.removeChannel(reactionChannelRef.current);
      }
    };
  }, [selectedConversation, user]);

  // Keep selectedConversationDetails in sync with conversations list updates
  // This ensures lastMessage, unreadCount, etc. stay current without losing otherUser data
  useEffect(() => {
    if (selectedConversation && selectedConversationDetails) {
      const updatedConv = conversations.find(c => c.id === selectedConversation);
      if (updatedConv) {
        // Merge: keep otherUser from details (in case list temporarily loses it), but update other fields
        setSelectedConversationDetails(prev => ({
          ...prev!,
          ...updatedConv,
          // Preserve otherUser if the updated conv doesn't have it (race condition protection)
          otherUser: updatedConv.otherUser || prev?.otherUser,
          group: updatedConv.group || prev?.group,
        }));
      }
    }
  }, [conversations, selectedConversation]);

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("read", false);
    
    if (!error) {
      // Update local state ONLY - no refetch needed (performance optimization)
      setMessages(prev =>
        prev.map(msg =>
          msg.sender_id !== user.id && !msg.read
            ? { ...msg, read: true }
            : msg
        )
      );
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Don't play sound here - it's already handled in subscribeToConversationMessages
    previousMessagesCount.current = messages.length;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const setupGlobalPresenceListener = () => {
    if (!user) return;

    // Check if we already have an active listener
    if (globalPresenceChannelRef.current) {
      const state = globalPresenceChannelRef.current.state;
      if (state === 'joined') {
        return;
      }
    }
    
    // Create a unique channel name for Community's listener
    const channel = supabase.channel(`community-presence-${user.id}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        // Get presence from the shared online-users channel via Layout
        const allChannels = supabase.getChannels();
        const onlineChannel = allChannels.find(ch => ch.topic === 'realtime:online-users');
        
        if (onlineChannel) {
          const state = onlineChannel.presenceState();
          const userIds = new Set<string>([JUDE_USER_ID]); // Jude is always online
          Object.values(state).forEach((presences: any) => {
            presences.forEach((p: any) => {
              if (p.user_id) userIds.add(p.user_id);
            });
          });
          setOnlineUsers(userIds);
        }
      })
      .subscribe((status) => {
        
      // Poll for presence updates every 15 seconds (optimized for 200+ users)
        if (status === 'SUBSCRIBED') {
          const pollInterval = setInterval(async () => {
            const allChannels = supabase.getChannels();
            const onlineChannel = allChannels.find(ch => ch.topic === 'realtime:online-users');
            
            if (onlineChannel) {
              const state = onlineChannel.presenceState();
              const userIds = new Set<string>([JUDE_USER_ID]); // Jude is always online
              Object.values(state).forEach((presences: any) => {
                presences.forEach((p: any) => {
                  if (p.user_id) userIds.add(p.user_id);
                });
              });
              
              setOnlineUsers(prev => {
                const prevArray = Array.from(prev).sort();
                const newArray = Array.from(userIds).sort();
                if (JSON.stringify(prevArray) !== JSON.stringify(newArray)) {
                  // Track who went offline and update their last_seen in database
                  prev.forEach(async (userId) => {
                    if (!userIds.has(userId) && userId !== JUDE_USER_ID) {
                      const now = new Date().toISOString();
                      
                      // Update last_seen in database
                      try {
                        await supabase
                          .from('profiles')
                          .update({ last_seen: now })
                          .eq('user_id', userId);
                      } catch (error) {
                        logger.error('Error updating last_seen:', error);
                      }
                      
                      // Update local state
                      setLastSeenTimes(prevTimes => ({
                        ...prevTimes,
                        [userId]: now
                      }));
                    }
                  });
                  
                  return userIds;
                }
                return prev;
              });
            }
          }, isSlowConnection ? 30000 : 15000); // 30s on slow connections, 15s otherwise
          
          // Store interval for cleanup
          (channel as any).pollInterval = pollInterval;
        }
      });

    globalPresenceChannelRef.current = channel;
  };

  const checkUser = async () => {
    // Allow visitors to stay on page and see demo content
    if (isVisitor) {
      setIsLoadingConversations(false);
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoadingConversations(false);
      return;
    }

    // Fetch all conversations with visibility info
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id, visible_from_message_id")
      .eq("user_id", user.id);

    if (!participations) {
      setIsLoadingConversations(false);
      return;
    }

    // Create map of visibility thresholds
    const visibilityMap = new Map<string, string | null>();
    participations.forEach(p => {
      visibilityMap.set(p.conversation_id, p.visible_from_message_id);
    });

    const conversationIds = participations.map(p => p.conversation_id);
    
    if (conversationIds.length === 0) {
      setConversations([]);
      setIsLoadingConversations(false);
      return;
    }

    // Fetch conversation details including group info
    const { data: conversationData } = await supabase
      .from("conversations")
      .select("id, created_at, is_group, group_id")
      .in("id", conversationIds);

    // Fetch group details for group conversations
    const groupIds = conversationData
      ?.filter(c => c.is_group && c.group_id)
      .map(c => c.group_id!) || [];

    // Fetch all participants in a single batch query (optimized - one query for all conversations)
    const { data: allParticipants } = await supabase
      .from("conversation_participants")
      .select("user_id, conversation_id")
      .in("conversation_id", conversationIds);

    // Get other user IDs (excluding current user) for profile fetching
    const otherUserIds = allParticipants
      ?.filter(p => p.user_id !== user.id)
      .map(p => p.user_id) || [];
    const uniqueOtherUserIds = [...new Set(otherUserIds)];

    // Fetch profiles for all other participants
    const { data: profiles } = uniqueOtherUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("*")
          .in("user_id", uniqueOtherUserIds)
      : { data: [] };

    // Update lastSeenTimes with actual database values
    if (profiles && profiles.length > 0) {
      const newLastSeenTimes: Record<string, string> = {};
      profiles.forEach(profile => {
        if (profile.last_seen) {
          newLastSeenTimes[profile.user_id] = profile.last_seen;
        }
      });
      setLastSeenTimes(prev => ({ ...prev, ...newLastSeenTimes }));
    }

    let groupDetails: any[] = [];
    if (groupIds.length > 0) {
      const { data: groups } = await supabase
        .from("group_chats")
        .select("*")
        .in("id", groupIds);
      
      // Fetch member counts for each group
      const { data: memberCounts } = await supabase
        .from("group_members")
        .select("group_id")
        .in("group_id", groupIds);
      
      const memberCountMap = new Map<string, number>();
      memberCounts?.forEach(m => {
        memberCountMap.set(m.group_id, (memberCountMap.get(m.group_id) || 0) + 1);
      });

      groupDetails = groups?.map(g => ({
        ...g,
        member_count: memberCountMap.get(g.id) || 0
      })) || [];
    }
    // Fetch ALL messages to check visibility
    const { data: allMessagesData } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at, sender_id, read, id")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: true });

    // Filter messages based on visibility for each conversation
    const visibleMessages = new Map<string, any[]>();
    
    conversationIds.forEach(convId => {
      const convMessages = allMessagesData?.filter(m => m.conversation_id === convId) || [];
      const visibilityThreshold = visibilityMap.get(convId);
      
      if (!visibilityThreshold || convMessages.length === 0) {
        // No threshold - all messages visible
        visibleMessages.set(convId, convMessages);
      } else {
        // Find the threshold message index
        const thresholdIndex = convMessages.findIndex(m => m.id === visibilityThreshold);
        
        if (thresholdIndex === -1) {
          // Threshold not found - show all messages
          visibleMessages.set(convId, convMessages);
        } else {
          // Include messages FROM the threshold message onwards (inclusive)
          const visibleMsgs = convMessages.slice(thresholdIndex);
          visibleMessages.set(convId, visibleMsgs);
        }
      }
    });

    // Build conversations list - deduplicate both group and 1-on-1
    const groupedByUser = new Map<string, Conversation>();
    const groupedByGroup = new Map<string, Conversation>();

    conversationIds.forEach(convId => {
      const convInfo = conversationData?.find(c => c.id === convId);
      if (!convInfo) return;

      // Get visible messages for this conversation
      const convVisibleMessages = visibleMessages.get(convId) || [];
      
      // Get total messages (before visibility filter) to distinguish "new empty" from "deleted"
      const totalMessagesInConv = allMessagesData?.filter(m => m.conversation_id === convId).length || 0;
      
      // Skip only if: there ARE messages but none are visible (user deleted/left conversation)
      // BUT keep it if: there are NO messages at all (brand new conversation)
      if (convVisibleMessages.length === 0 && totalMessagesInConv > 0) {
        return;
      }

      const lastMsg = convVisibleMessages.length > 0 ? convVisibleMessages[convVisibleMessages.length - 1] : null;
      const unreadCount = convVisibleMessages.filter(m => !m.read && m.sender_id !== user.id).length;

      if (convInfo.is_group && convInfo.group_id) {
        // Group conversation - deduplicate by group_id
        const groupData = groupDetails.find(g => g.id === convInfo.group_id);
        if (groupData) {
          const conv: Conversation = {
            id: convId,
            created_at: lastMsg?.created_at || convInfo.created_at,
            is_group: true,
            group: groupData,
            lastMessage: lastMsg?.content,
            lastMessageTime: lastMsg?.created_at,
            unreadCount,
          };
          
          // Deduplicate by group_id - keep the most recent conversation
          const existing = groupedByGroup.get(convInfo.group_id);
          if (!existing) {
            groupedByGroup.set(convInfo.group_id, conv);
          } else {
            const existingTime = new Date(existing.lastMessageTime || existing.created_at).getTime();
            const currentTime = new Date(conv.lastMessageTime || conv.created_at).getTime();
            
            if (currentTime > existingTime) {
              groupedByGroup.set(convInfo.group_id, {
                ...conv,
                unreadCount: (conv.unreadCount || 0) + (existing.unreadCount || 0)
              });
            } else {
              groupedByGroup.set(convInfo.group_id, {
                ...existing,
                unreadCount: (conv.unreadCount || 0) + (existing.unreadCount || 0)
              });
            }
          }
        }
      } else {
        // 1-on-1 conversation
        const otherUserId = allParticipants?.find(
          p => p.conversation_id === convId && p.user_id !== user.id
        )?.user_id;
        
        if (!otherUserId) return;
        
        const otherUserProfile = profiles?.find(p => p.user_id === otherUserId);
        
        const conv: Conversation = {
          id: convId,
          created_at: lastMsg?.created_at || convInfo.created_at,
          is_group: false,
          otherUser: otherUserProfile,
          lastMessage: lastMsg?.content,
          lastMessageTime: lastMsg?.created_at,
          unreadCount,
        };
        
        // Group by user to merge duplicate conversations
        const existing = groupedByUser.get(otherUserId);
        if (!existing) {
          groupedByUser.set(otherUserId, conv);
        } else {
          const existingTime = new Date(existing.lastMessageTime || existing.created_at).getTime();
          const currentTime = new Date(conv.lastMessageTime || conv.created_at).getTime();
          
          if (currentTime > existingTime) {
            groupedByUser.set(otherUserId, {
              ...conv,
              unreadCount: (conv.unreadCount || 0) + (existing.unreadCount || 0)
            });
          } else {
            groupedByUser.set(otherUserId, {
              ...existing,
              unreadCount: (conv.unreadCount || 0) + (existing.unreadCount || 0)
            });
          }
        }
        }
    });

    // Combine group and 1-on-1 conversations and sort
    const allConversations = [...Array.from(groupedByGroup.values()), ...Array.from(groupedByUser.values())];
    const sortedConversations = allConversations.sort((a, b) => 
      new Date(b.lastMessageTime || b.created_at).getTime() - 
      new Date(a.lastMessageTime || a.created_at).getTime()
    );
    
    setConversations(sortedConversations);
    setIsLoadingConversations(false);
  };

  const fetchFollowers = async () => {
    if (!user) return;

    const { data: followsData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .eq("status", "accepted");

    if (!followsData) return;

    const followingIds = followsData.map(f => f.following_id);
    
    if (followingIds.length === 0) {
      setFollowers([]);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", followingIds);

    setFollowers(profiles || []);
  };

  const fetchMessages = async (conversationId: string) => {
    // NEW APPROACH: Use message ID-based filtering instead of timestamps
    // This is more reliable and handles rejoin scenarios correctly
    
    // Get the visibility threshold for this user in this conversation
    const { data: participantData, error: participantError } = await supabase
      .from("conversation_participants")
      .select("visible_from_message_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", user?.id)
      .single();
    
    if (participantError) {
      logger.error('Error fetching participant visibility:', participantError);
    }

    const visibilityThreshold = participantData?.visible_from_message_id;

    // Fetch messages with pagination (limit 50 for better performance)
    let query = supabase
      .from("messages")
      .select("id, content, sender_id, created_at, read, shared_post_id, conversation_id, replied_to_id, image_url, video_url")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(50); // Optimized: only fetch last 50 messages initially

    const { data: allMessages, error: messagesError } = await query;
    
    // Reverse to display in chronological order (oldest first)
    const reversedMessages = allMessages ? [...allMessages].reverse() : [];
    
    if (messagesError) {
      logger.error('Messages error:', messagesError);
    }

    // Filter messages on the client side based on visibility threshold
    let messagesData = reversedMessages;
    if (visibilityThreshold && reversedMessages.length > 0) {
      // Find the index of the threshold message
      const thresholdIndex = reversedMessages.findIndex(m => m.id === visibilityThreshold);
      if (thresholdIndex !== -1) {
        // Show messages FROM the threshold message onwards (inclusive)
        messagesData = reversedMessages.slice(thresholdIndex);
      }
    }

    // Handle empty conversations (new chats with no messages yet)
    if (!messagesData || messagesData.length === 0) {
      setMessages([]);
      return;
    }

    const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", senderIds);

    // Get shared post IDs
    const sharedPostIds = messagesData
      .filter(m => m.shared_post_id)
      .map(m => m.shared_post_id);

    let sharedPosts: any[] = [];
    let sharedPostProfiles: any[] = [];

    if (sharedPostIds.length > 0) {
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .in("id", sharedPostIds);

      sharedPosts = postsData || [];

      const postUserIds = [...new Set(sharedPosts.map(p => p.user_id))];
      const { data: postProfilesData } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", postUserIds);

      sharedPostProfiles = postProfilesData || [];
    }

    const enrichedMessages = messagesData.map(msg => {
      const sharedPost = sharedPosts.find(p => p.id === msg.shared_post_id);
      const repliedTo = msg.replied_to_id 
        ? messagesData.find(m => m.id === msg.replied_to_id)
        : null;
      
      return {
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        created_at: msg.created_at,
        conversation_id: msg.conversation_id,
        shared_post_id: msg.shared_post_id,
        replied_to_id: msg.replied_to_id,
        read: msg.read ?? false,
        image_url: msg.image_url,
        video_url: msg.video_url,
        profile: profiles?.find(p => p.user_id === msg.sender_id),
        replied_to: repliedTo ? {
          id: repliedTo.id,
          content: repliedTo.content,
          sender_id: repliedTo.sender_id,
          created_at: repliedTo.created_at,
          read: repliedTo.read ?? false,
          profile: profiles?.find(p => p.user_id === repliedTo.sender_id),
          shared_post_id: repliedTo.shared_post_id,
        } : undefined,
        shared_post: sharedPost ? {
          ...sharedPost,
          profile: sharedPostProfiles.find(p => p.user_id === sharedPost.user_id)
        } : undefined
      };
    });

    setMessages(enrichedMessages);
  };

  // Helper to get cached profile or fetch if not cached
  const getCachedProfile = async (userId: string): Promise<Profile | null> => {
    if (profileCacheRef.current.has(userId)) {
      return profileCacheRef.current.get(userId)!;
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
      
    if (profile) {
      profileCacheRef.current.set(userId, profile as Profile);
    }
    return profile as Profile | null;
  };

  const subscribeToConversationMessages = (conversationId: string) => {
    // Unsubscribe from previous channel if exists
    if (messageChannelRef.current) {
      supabase.removeChannel(messageChannelRef.current);
    }

    // Subscribe to real-time updates for this specific conversation
    const channel = supabase
      .channel(`messages-${conversationId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: user?.id },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the sender profile from cache
          const profile = await getCachedProfile(payload.new.sender_id);

          // Fetch replied message if exists
          let repliedToMessage = undefined;
          if (payload.new.replied_to_id) {
            const { data: repliedData } = await supabase
              .from("messages")
              .select("id, content, sender_id, created_at, read")
              .eq("id", payload.new.replied_to_id)
              .single();

            if (repliedData) {
              const repliedProfile = await getCachedProfile(repliedData.sender_id);

              repliedToMessage = {
                ...repliedData,
                profile: repliedProfile
              };
            }
          }

          // Fetch shared post if exists
          let sharedPost = undefined;
          if (payload.new.shared_post_id) {
            const { data: postData } = await supabase
              .from("posts")
              .select("*")
              .eq("id", payload.new.shared_post_id)
              .single();

            if (postData) {
              const postProfile = await getCachedProfile(postData.user_id);

              sharedPost = {
                ...postData,
                profile: postProfile
              };
            }
          }

          // Add the new message with profile to the messages array
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            sender_id: payload.new.sender_id,
            created_at: payload.new.created_at,
            read: payload.new.read || false,
            shared_post_id: payload.new.shared_post_id,
            replied_to_id: payload.new.replied_to_id,
            image_url: payload.new.image_url,
            video_url: payload.new.video_url,
            profile,
            replied_to: repliedToMessage,
            shared_post: sharedPost,
          };

          // Only add if message doesn't already exist (avoid duplicates with optimistic updates)
          setMessages((prev) => {
            const exists = prev.some(m => m.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });

          // Check if this is a group message mentioning Eric
          const currentConversation = conversations.find(c => c.id === conversationId);
          const isGroupChat = currentConversation?.is_group;
          const mentionsJude = payload.new.content.toLowerCase().includes('hey jude');
          
          // If in group chat and mentions Jude, trigger Jude's response (including user's own messages)
          if (isGroupChat && mentionsJude && payload.new.sender_id !== JUDE_USER_ID) {
            // Get sender's profile info
            supabase.functions.invoke('eric-chat', {
              body: { 
                conversationId: conversationId,
                userMessage: payload.new.content,
                userId: payload.new.sender_id,
                userNickname: profile?.nickname || profile?.full_name
              }
            }).catch(error => {
              logger.error('Error calling Eric chat:', error);
            });
          }

          // Show notification if message is from another user AND this is the CURRENT conversation
          // (notifications for other conversations are handled in subscribeToMessages)
          if (payload.new.sender_id !== user?.id && conversationId === selectedConversation) {
            if ('Notification' in window && Notification.permission === 'granted') {
              const senderName = profile?.nickname || profile?.full_name || 'Quelqu\'un';
              const messageContent = sharedPost 
                ? 'a partagé un post' 
                : (payload.new.content || 'Nouveau message').substring(0, 100);
              
              // Use service worker for better compatibility
              if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                  registration.showNotification(senderName, {
                    body: messageContent,
                    icon: '/logo.png',
                    badge: '/logo.png',
                    tag: conversationId,
                    requireInteraction: false,
                    data: {
                      url: `/community?conversation=${conversationId}`,
                      conversationId: conversationId
                    }
                  });
                });
              }
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Update message in real-time (for read status and other updates)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id 
                ? { 
                    ...msg, 
                    read: payload.new.read,
                    content: payload.new.content,
                  }
                : msg
            )
          );
        }
      )
      .subscribe();

    messageChannelRef.current = channel;
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("messages-changes", {
        config: {
          broadcast: { self: false }, // Don't receive our own messages
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          // Only play sound once here (not in conversation-specific subscription)
          if (payload.new.sender_id !== user?.id) {
            playReceiveSound();
          }
          
          // Immediately update the conversation order in local state
          const conversationId = payload.new.conversation_id;
          const newMessageTime = payload.new.created_at;
          
          setConversations(prev => {
            // Find and update the conversation with the new message time
            const updated = prev.map(conv => 
              conv.id === conversationId 
                ? { 
                    ...conv, 
                    lastMessage: payload.new.content,
                    lastMessageTime: newMessageTime,
                  }
                : conv
            );
            
            // Re-sort immediately
            return updated.sort((a, b) => 
              new Date(b.lastMessageTime || b.created_at).getTime() - 
              new Date(a.lastMessageTime || a.created_at).getTime()
            );
          });
          
          // Show browser notification for messages in other conversations
          // (messages in the current conversation are handled by subscribeToConversationMessages)
          if (payload.new.sender_id !== user?.id && conversationId !== selectedConversation) {
          // Use cached profile for notification
          const senderProfile = await getCachedProfile(payload.new.sender_id);

          const senderName = senderProfile?.nickname || senderProfile?.full_name || 'Quelqu\'un';
            
            // Fetch conversation details for notification
            const { data: conversationData } = await supabase
              .from('conversations')
              .select('is_group, group_id')
              .eq('id', conversationId)
              .single();
            
            let conversationName = senderName;
            
            // If it's a group, get the group name
            if (conversationData?.is_group && conversationData?.group_id) {
              const { data: groupData } = await supabase
                .from('group_chats')
                .select('name')
                .eq('id', conversationData.group_id)
                .single();
              
              conversationName = groupData?.name || 'Groupe';
            }
            
            // Show browser notification using service worker
            if ('Notification' in window && Notification.permission === 'granted') {
              const messagePreview = payload.new.content.substring(0, 100) || 'Nouveau message';
              const notificationTitle = conversationData?.is_group 
                ? `${senderName} dans ${conversationName}`
                : `${senderName}`;
              
              // Use service worker for better compatibility and offline support
              if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                  registration.showNotification(notificationTitle, {
                    body: messagePreview,
                    icon: '/logo.png',
                    badge: '/logo.png',
                    tag: conversationId,
                    requireInteraction: false,
                    data: {
                      url: `/community?conversation=${conversationId}`,
                      conversationId: conversationId
                    }
                  });
                });
              }
            }
          }
          
          // Local state is already updated above - no need to refetch from database
          // This was causing performance issues by triggering heavy DB operations after every message
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          // If message was marked as read, update the conversation's unread count
          if (payload.new.read && !payload.old.read) {
            // Update conversation unread count immediately
            setConversations(prev => 
              prev.map(conv => 
                conv.id === payload.new.conversation_id 
                  ? { ...conv, unreadCount: Math.max(0, (conv.unreadCount || 0) - 1) }
                  : conv
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isDocument = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ].includes(file.type) || file.name.endsWith('.txt');

    if (!isImage && !isVideo && !isDocument) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image, vidéo ou document (PDF, Word, TXT)",
        variant: "destructive",
      });
      return;
    }

    // Check document size limit (10MB)
    if (isDocument && file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "Le document ne doit pas dépasser 10 Mo",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isDocument) {
        // For documents, no optimization needed
        setSelectedMediaFile(file);
        setMediaType('document');
        setMediaPreview(file.name); // Use filename as preview
        
        toast({
          title: "Document prêt",
          description: `${file.name} (${formatFileSize(file.size)})`,
        });
      } else {
        // Handle images and videos with optimization
        const mediaTypeValue = isImage ? 'image' : 'video';
        
        if (isImage) {
          toast({
            title: "Optimisation...",
            description: "Compression de l'image en cours...",
          });
        }

        const { file: optimizedFile, originalSize, optimizedSize, savings } = await optimizeMediaFile(file, mediaTypeValue);
        
        setSelectedMediaFile(optimizedFile);
        setMediaType(mediaTypeValue);

        // For images, use FileReader for preview
        // For videos, use createObjectURL for instant preview (much faster)
        if (isImage) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setMediaPreview(reader.result as string);
          };
          reader.readAsDataURL(optimizedFile);
        } else {
          // For videos, createObjectURL is instant (no file reading needed)
          const videoUrl = URL.createObjectURL(optimizedFile);
          setMediaPreview(videoUrl);
        }

        if (isImage && savings > 10) {
          toast({
            title: "Image optimisée!",
            description: `Taille réduite de ${savings.toFixed(0)}% (${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)})`,
          });
        } else if (isVideo) {
          const sizeInMB = optimizedSize / (1024 * 1024);
          if (sizeInMB > 10) {
            toast({
              title: "Vidéo prête",
              description: `Taille: ${formatFileSize(optimizedSize)}. Prête à être envoyée!`,
            });
          }
        }
      }
    } catch (error: any) {
      logger.error('Error processing media:', error);
      toast({
        title: "Erreur",
        description: error.message || `Impossible de traiter le fichier`,
        variant: "destructive",
      });
      e.target.value = ''; // Reset input
    }
  };

  const clearMedia = () => {
    // Revoke object URL if it was created for video preview
    if (mediaPreview && mediaType === 'video') {
      URL.revokeObjectURL(mediaPreview);
    }
    setSelectedMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedMediaFile) || !selectedConversation || !user) return;

    const messageContent = newMessage.trim();
    const currentMediaFile = selectedMediaFile;
    const currentMediaType = mediaType;
    const currentMediaPreview = mediaPreview;
    const currentReplyingTo = replyingTo;
    
    // Determine display content for optimistic update
    let displayContent = messageContent;
    if (!displayContent && currentMediaType) {
      if (currentMediaType === 'image') displayContent = '📷 Image';
      else if (currentMediaType === 'video') displayContent = '🎥 Vidéo';
      else if (currentMediaType === 'document') displayContent = `📄 ${currentMediaFile?.name || 'Document'}`;
    }

    // 1. CREATE OPTIMISTIC MESSAGE - Show instantly in UI
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      content: displayContent || '',
      sender_id: user.id,
      created_at: new Date().toISOString(),
      read: false,
      conversation_id: selectedConversation,
      profile: cachedUserProfile || undefined,
      replied_to: currentReplyingTo || undefined,
      replied_to_id: currentReplyingTo?.id || null,
      // Show local preview for images immediately
      image_url: currentMediaType === 'image' ? currentMediaPreview : null,
      video_url: currentMediaType === 'video' ? currentMediaPreview : null,
    };

    // 2. INSTANT UI UPDATE - Message appears immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
    setReplyingTo(null);
    clearMedia();
    playSendSound();
    
    // Clear typing indicator
    sendTypingStatus(false);

    // Update conversation list immediately
    setConversations(prev => {
      const updated = prev.map(conv => 
        conv.id === selectedConversation 
          ? { ...conv, lastMessage: displayContent, lastMessageTime: new Date().toISOString() }
          : conv
      );
      return updated.sort((a, b) => 
        new Date(b.lastMessageTime || b.created_at).getTime() - 
        new Date(a.lastMessageTime || a.created_at).getTime()
      );
    });

    // 3. BACKGROUND DATABASE OPERATIONS - Non-blocking
    (async () => {
      try {
        let imageUrl = null;
        let videoUrl = null;

        // Check participation (fast query)
        const { data: participation } = await supabase
          .from("conversation_participants")
          .select("id, visible_from_message_id")
          .eq("conversation_id", selectedConversation)
          .eq("user_id", user.id)
          .maybeSingle();

        // Handle participation in background
        if (!participation) {
          await supabase
            .from("conversation_participants")
            .insert({
              conversation_id: selectedConversation,
              user_id: user.id,
              visible_from_message_id: null,
            });
        } else if (participation.visible_from_message_id) {
          await supabase
            .from("conversation_participants")
            .update({ visible_from_message_id: null })
            .eq("conversation_id", selectedConversation)
            .eq("user_id", user.id);
        }

        // Upload media if present
        if (currentMediaFile) {
          const fileExt = currentMediaFile.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('message-media')
            .upload(fileName, currentMediaFile);

          if (uploadError) {
            logger.error('Media upload error:', uploadError);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticId));
            toast({
              title: "Erreur",
              description: `Impossible de télécharger le fichier`,
              variant: "destructive",
            });
            return;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('message-media')
            .getPublicUrl(fileName);
          
          if (currentMediaType === 'image') {
            imageUrl = publicUrl;
          } else if (currentMediaType === 'video') {
            videoUrl = publicUrl;
          } else if (currentMediaType === 'document') {
            imageUrl = `doc:${currentMediaFile.name}:${publicUrl}`;
          }
        }

        // Insert message to database
        const { data: insertedMessage, error } = await supabase.from("messages").insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: displayContent || '',
          image_url: imageUrl,
          video_url: videoUrl,
          read: false,
          replied_to_id: currentReplyingTo?.id || null,
        }).select('id').single();

        if (error) {
          logger.error('Message insert error:', error);
          // Remove optimistic message on error
          setMessages(prev => prev.filter(m => m.id !== optimisticId));
          toast({
            title: "Erreur",
            description: "Impossible d'envoyer le message",
            variant: "destructive",
          });
          return;
        }

        // Update optimistic message with real ID and URLs
        setMessages(prev => prev.map(m => 
          m.id === optimisticId 
            ? { ...m, id: insertedMessage.id, image_url: imageUrl, video_url: videoUrl }
            : m
        ));

        // 4. FIRE-AND-FORGET NOTIFICATIONS - Don't await
        const conversation = conversations.find(c => c.id === selectedConversation);
        const senderName = cachedUserProfile?.nickname || cachedUserProfile?.full_name || user.email || 'Someone';
        
        if (conversation?.otherUser?.user_id === JUDE_USER_ID) {
          // Call Jude in background
          supabase.functions.invoke('eric-chat', {
            body: { 
              conversationId: selectedConversation,
              userMessage: messageContent,
              userId: user.id,
              userNickname: senderName
            }
          }).catch(err => logger.error('Jude chat error:', err));
        } else if (conversation?.otherUser) {
          // Send push notification in background
          const messagePreview = messageContent 
            ? messageContent.substring(0, 80) 
            : (imageUrl ? '📷 Image' : '🎥 Vidéo');
          
          supabase.functions.invoke('send-push-notification', {
            body: {
              recipientUserId: conversation.otherUser.user_id,
              title: `💬 ${senderName}`,
              body: messagePreview,
              conversationId: selectedConversation,
              type: 'message'
            }
          }).catch(err => logger.error('Push notification error:', err));
        } else if (conversation?.is_group && conversation?.group?.id) {
          // Group notifications in background - use Promise.all for parallel sends
          (async () => {
            try {
              const { data: groupMembers } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', conversation.group!.id)
                .neq('user_id', user.id);
              
              if (groupMembers) {
                const groupName = conversation.group?.name || 'Group';
                const messagePreview = messageContent 
                  ? messageContent.substring(0, 80) 
                  : (imageUrl ? '📷 Image' : '🎥 Vidéo');
                
                // Send all notifications in parallel
                await Promise.all(
                  groupMembers.map(member => 
                    supabase.functions.invoke('send-push-notification', {
                      body: {
                        recipientUserId: member.user_id,
                        title: `👥 ${senderName} dans ${groupName}`,
                        body: messagePreview,
                        conversationId: selectedConversation,
                        type: 'message'
                      }
                    }).catch(err => logger.error(`Push to ${member.user_id} failed:`, err))
                  )
                );
              }
            } catch (err) {
              logger.error('Group members fetch error:', err);
            }
          })();
        }
      } catch (error) {
        logger.error('Background send error:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== optimisticId));
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer le message",
          variant: "destructive",
        });
      }
    })();
  };

  const fetchReactions = async (conversationId: string) => {
    const { data: messagesData } = await supabase
      .from("messages")
      .select("id")
      .eq("conversation_id", conversationId);

    if (!messagesData) return;

    const messageIds = messagesData.map(m => m.id);
    
    const { data: reactionsData } = await supabase
      .from("message_reactions")
      .select("*")
      .in("message_id", messageIds);

    if (reactionsData) {
      const reactionsByMessage = reactionsData.reduce((acc, reaction) => {
        if (!acc[reaction.message_id]) {
          acc[reaction.message_id] = [];
        }
        acc[reaction.message_id].push(reaction);
        return acc;
      }, {} as Record<string, Reaction[]>);
      
      setReactions(reactionsByMessage);
    }
  };

  const subscribeToReactions = (conversationId: string) => {
    if (reactionChannelRef.current) {
      supabase.removeChannel(reactionChannelRef.current);
    }

    const channel = supabase
      .channel(`reactions-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReaction = payload.new as Reaction;
            setReactions(prev => ({
              ...prev,
              [newReaction.message_id]: [...(prev[newReaction.message_id] || []), newReaction]
            }));
          } else if (payload.eventType === 'DELETE') {
            const deletedReaction = payload.old as Reaction;
            setReactions(prev => ({
              ...prev,
              [deletedReaction.message_id]: (prev[deletedReaction.message_id] || []).filter(
                r => r.id !== deletedReaction.id
              )
            }));
          }
        }
      )
      .subscribe();

    reactionChannelRef.current = channel;
  };

  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditedContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent("");
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editedContent.trim()) {
      toast({
        title: "Erreur",
        description: "Le message ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("messages")
        .update({ content: editedContent.trim() })
        .eq("id", messageId);

      if (error) throw error;

      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, content: editedContent.trim() } : msg
      ));

      setEditingMessageId(null);
      setEditedContent("");

      toast({
        title: "Succès",
        description: "Message modifié",
      });
    } catch (error) {
      logger.error("Error updating message:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le message",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      setMessages(messages.filter(msg => msg.id !== messageId));

      toast({
        title: "Succès",
        description: "Message supprimé",
      });
    } catch (error) {
      logger.error("Error deleting message:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive",
      });
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    // Check if user already reacted with this emoji
    const existingReaction = reactions[messageId]?.find(
      r => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (!error) {
        setShowReactionPicker(null);
      }
    } else {
      // Add reaction
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji: emoji,
        });

      if (!error) {
        setShowReactionPicker(null);
      }
    }
  };

  const subscribeToTypingPresence = (conversationId: string) => {
    if (!user) {
      return;
    }

    if (presenceChannelsRef.current[conversationId]) {
      supabase.removeChannel(presenceChannelsRef.current[conversationId]);
    }

    const channel = supabase.channel(`typing-${conversationId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setTypingUsers(prev => ({
          ...prev,
          [conversationId]: state
        }));
      })
      .on('presence', { event: 'join' }, () => {})
      .on('presence', { event: 'leave' }, () => {})
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            typing: false,
          });
        }
      });

    presenceChannelsRef.current[conversationId] = channel;
  };

  const sendTypingStatus = async (isTyping: boolean) => {
    if (!selectedConversation || !presenceChannelsRef.current[selectedConversation] || !user) {
      return;
    }

    try {
      await presenceChannelsRef.current[selectedConversation].track({
        user_id: user.id,
        typing: isTyping,
      });
    } catch (error) {
      logger.error('Error sending typing status:', error);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status
    if (value.trim()) {
      sendTypingStatus(true);

      // Auto-clear typing status after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000);
    } else {
      sendTypingStatus(false);
    }
  };

  // Periodically refresh to update "last seen" times
  useEffect(() => {
    const interval = setInterval(() => {
      // Force a re-render to update the relative time display
      setLastSeenTimes(prev => ({ ...prev }));
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      if (!user?.id) {
        toast({
          title: "Erreur",
          description: "Utilisateur non authentifié",
          variant: "destructive",
        });
        return;
      }

      // Find if this is a group or single conversation
      const conversation = conversations.find(c => c.id === conversationId);
      const isGroup = conversation?.is_group;

      if (isGroup) {
        // For group conversations: delete only user's messages
        const { error: deleteError } = await supabase
          .from("messages")
          .delete()
          .eq("conversation_id", conversationId)
          .eq("sender_id", user.id);

        if (deleteError) {
          logger.error("Error deleting messages:", deleteError);
          throw deleteError;
        }
      } else {
        // For single conversations (WhatsApp-like behavior):
        // Set visible_from_message_id to hide all current messages
        
        // Get the last message ID to set as the threshold
        const { data: lastMessage, error: fetchError } = await supabase
          .from("messages")
          .select("id")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          logger.error("Error fetching last message:", fetchError);
          throw fetchError;
        }

        // Update visible_from_message_id to exclude all current messages
        const { error: updateError } = await supabase
          .from("conversation_participants")
          .update({ 
            visible_from_message_id: lastMessage?.id || null
          })
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id);

        if (updateError) {
          logger.error("Error updating visibility:", updateError);
          throw updateError;
        }
      }

      // Clear local messages state
      setMessages([]);

      // Clear selection if this conversation was selected
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        navigate('/community');
      }
      toast({
        title: "Succès",
        description: isGroup 
          ? "Vos messages ont été supprimés" 
          : "La conversation a été supprimée de votre liste",
      });

      // Refresh conversations list
      await fetchConversations();
    } catch (error) {
      logger.error("Error deleting conversation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la conversation",
        variant: "destructive",
      });
    } finally {
      setDeleteConversationId(null);
    }
  };

  const handleDownloadMedia = async (url: string, type: 'image' | 'video') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      const timestamp = new Date().getTime();
      const extension = type === 'image' ? 'jpg' : 'mp4';
      link.download = `edupreneurs-${type}-${timestamp}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Téléchargement réussi",
        description: `${type === 'image' ? 'L\'image' : 'La vidéo'} a été enregistrée sur votre appareil`,
      });
    } catch (error) {
      logger.error('Error downloading media:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const time = date.toLocaleTimeString('fr-FR', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    });
    
    // If today, show "Dernière connexion à HH:MM"
    if (messageDate.getTime() === today.getTime()) {
      return `Dernière connexion à ${time}`;
    }
    
    // If yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.getTime() === yesterday.getTime()) {
      return `Dernière connexion hier à ${time}`;
    }
    
    // For older dates, show date and time
    const dateStr = date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
    return `Dernière connexion le ${dateStr} à ${time}`;
  };

  return (
    <div 
      className="relative h-[100dvh] bg-background flex overflow-hidden"
      style={{ '--time-accent': accentColor } as React.CSSProperties}
    >
      {/* Visitor Overlay */}
      {isVisitor && <VisitorCommunityOverlay />}
      
      {/* Notification Permission Dialog - only for logged in users */}
      {user && !isVisitor && <NotificationPermissionBanner userId={user.id} />}
      
      {/* Conversations List - Fixed sidebar on desktop/tablet */}
      <div className={`${selectedConversation ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 border-r border-border/50 md:fixed md:left-0 md:top-0 md:bottom-0 md:z-[40] bg-background pb-20 md:pb-0`}>
        <div className="shrink-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md p-3 sm:p-4 safe-area-top">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="shrink-0 h-9 w-9"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold flex-1">Messages</h1>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => !isVisitor && setShowCreateGroup(true)}
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
                onClick={() => !isVisitor && navigate("/user-search")}
                disabled={isVisitor}
                className={`shrink-0 h-9 w-9 ${isVisitor ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isVisitor ? "Créez un compte pour rechercher des utilisateurs" : undefined}
              >
                <Search size={18} className="sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {isLoadingConversations ? (
            <ConversationSkeleton />
          ) : conversations.length === 0 ? (
            <div className="py-8 px-4">
              <EmptyState
                illustration="no-messages"
                title="Aucune conversation"
                description="Commencez à discuter avec d'autres utilisateurs ou créez un groupe!"
                ctaLabel="Rechercher des utilisateurs"
                ctaAction={() => navigate("/user-search")}
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
                    onClick={() => setSelectedConversation(conv.id)}
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
                    {isOnline && (
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-sm ${shouldShowRipples ? 'presence-indicator' : ''}`} />
                    )}
                  </div>
                  <div 
                    className="flex-1 min-w-0 pr-1"
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p 
                        className={`truncate text-sm sm:text-base cursor-pointer hover:underline flex-shrink ${hasUnread ? 'font-bold' : 'font-semibold'}`}
                        onClick={(e) => {
                          if (conv.is_group && conv.group) {
                            e.stopPropagation();
                            setSelectedGroupId(conv.group.id);
                            setShowGroupInfo(true);
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
                        <span className="text-[10px] sm:text-xs text-green-500 font-medium shrink-0 whitespace-nowrap">En ligne</span>
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
                        console.log('🔴 [DROPDOWN] Delete clicked for conversation:', conv.id);
                        setDeleteConversationId(conv.id);
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
      </div>

      {/* Messages View - WhatsApp-style keyboard-adaptive layout */}
      <div
        className={`${
          selectedConversation
            ? "fixed inset-0 w-screen md:relative md:inset-auto md:w-auto"
            : "hidden md:block"
        } md:flex-1 bg-background md:ml-80 lg:ml-96 relative`}
      >
        {/* Persistent background layer - always mounted to prevent reloading */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={chatBackgroundStyle}
        />
        {selectedConversation ? (
          <div className="h-full flex flex-col relative" style={{
            height: '100dvh'
          }}>
            {/* Fixed Header - Always stays at top */}
            <div className="fixed top-0 left-0 right-0 md:left-80 lg:left-96 z-20 border-b border-border/50 bg-background/95 backdrop-blur-md p-4 flex items-center gap-3 shrink-0 h-[72px]">
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 md:hidden"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft size={20} />
              </Button>
              {(() => {
                // Use persisted details first (prevents flicker during list refresh)
                const currentConv = selectedConversationDetails ?? conversations.find(c => c.id === selectedConversation);
                const isGroup = currentConv?.is_group;
                
                return (
                  <>
                    <Avatar 
                      className={`h-10 w-10 shrink-0 cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={() => {
                        if (isGroup && currentConv?.group) {
                          setSelectedGroupId(currentConv.group.id);
                          setShowGroupInfo(true);
                        } else if (!isGroup && currentConv?.otherUser) {
                          navigate(`/profile/${currentConv.otherUser.user_id}`);
                        }
                      }}
                    >
                      {isGroup ? (
                        <>
                          <AvatarImage src={currentConv.group?.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20">
                            <Users className="h-5 w-5" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={getAvatarUrl(currentConv?.otherUser?.avatar_url)} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20">
                            {(currentConv?.otherUser?.nickname || currentConv?.otherUser?.full_name)?.[0] || "?"}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p 
                          className="font-semibold text-base truncate cursor-pointer hover:opacity-80 transition-opacity hover:underline"
                          onClick={() => {
                            if (isGroup && currentConv?.group) {
                              setSelectedGroupId(currentConv.group.id);
                              setShowGroupInfo(true);
                            } else if (!isGroup && currentConv?.otherUser) {
                              navigate(`/profile/${currentConv.otherUser.user_id}`);
                            }
                          }}
                        >
                          {isGroup 
                            ? currentConv.group?.name 
                            : (currentConv?.otherUser?.nickname || currentConv?.otherUser?.full_name || "Utilisateur")
                          }
                        </p>
                        {isGroup && (
                          <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                            ({currentConv.group?.member_count})
                          </span>
                        )}
                        {!isGroup && currentConv?.otherUser?.verified && (
                          <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 shrink-0" />
                        )}
                      </div>
                      {!isGroup && (() => {
                        const otherUserId = currentConv?.otherUser?.user_id;
                        if (!otherUserId) return null;
                        
                        if (onlineUsers.has(otherUserId)) {
                          return (
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 bg-green-500 rounded-full ${shouldShowRipples ? 'presence-indicator' : ''}`} />
                              <p className="text-xs text-green-500 font-medium">En ligne</p>
                            </div>
                          );
                        } else if (lastSeenTimes[otherUserId]) {
                          return (
                            <p className="text-xs text-muted-foreground">
                              {formatLastSeen(lastSeenTimes[otherUserId])}
                            </p>
                          );
                        }
                        return null;
                      })()}
                      {isGroup && currentConv.group?.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {currentConv.group.description}
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}
              
              {/* Three-dot menu in header */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      console.log('🔴 [HEADER] Delete clicked for conversation:', selectedConversation);
                      setDeleteConversationId(selectedConversation);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer la conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Fixed Jude Banner for Group Chats - positioned below header */}
            {(() => {
              const currentConv = selectedConversationDetails ?? conversations.find(c => c.id === selectedConversation);
              const isGroup = currentConv?.is_group;
              
              if (!isGroup) return null;
              
              return (
                <div 
                  className="fixed left-0 right-0 md:left-80 lg:left-96 z-[15] px-2 sm:px-4 pt-2"
                  style={{ top: '72px' }}
                >
                  <div className="px-3 py-2.5 bg-gradient-to-r from-primary/10 via-primary/5 to-success/10 border border-primary/20 rounded-xl backdrop-blur-md shadow-lg">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="relative">
                        <img 
                          src={ericAiHelper} 
                          alt="Jude AI Assistant" 
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0 ring-2 ring-primary/20" 
                          loading="lazy" 
                          decoding="async" 
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-foreground font-semibold">
                          Jude, votre assistant IA est dans ce groupe !
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                          Tapez <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">"Hey Jude"</span> pour lui parler
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Scrollable Messages Area - with top padding for fixed header + banner and bottom for composer + nav */}
            <div 
              className="flex-1 overflow-y-auto overflow-x-hidden md:pb-[96px]"
              style={{
                paddingTop: (() => {
                  const currentConv = selectedConversationDetails ?? conversations.find(c => c.id === selectedConversation);
                  return currentConv?.is_group ? '132px' : '72px';
                })(),
                paddingBottom: keyboardHeight > 0
                  ? `calc(8rem + ${keyboardHeight}px)`
                  : `calc(8rem + 3.5rem + env(safe-area-inset-bottom, 0px))`
              }}
            >

              {/* Messages */}
              <div className="p-4">
                <div className="space-y-4 pb-4 max-w-full">
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  const isSystemMsg = message.content.includes('a rejoint le groupe') || 
                    message.content.includes('a quitté le groupe') ||
                    message.content.includes('Bienvenue dans');
                  
                  // System message rendering (centered)
                  if (isSystemMsg) {
                    return <SystemMessage key={message.id} content={message.content} />;
                  }
                  
                  // Regular message rendering with staggered animation
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      userId={user?.id}
                      reactions={reactions[message.id] || []}
                      editingMessageId={editingMessageId}
                      editedContent={editedContent}
                      showReactionPicker={showReactionPicker}
                      onSetReplyingTo={setReplyingTo}
                      onEditMessage={handleEditMessage}
                      onCancelEdit={handleCancelEdit}
                      onSaveEdit={handleSaveEdit}
                      onSetEditedContent={setEditedContent}
                      onDeleteMessage={handleDeleteMessage}
                      onToggleReaction={toggleReaction}
                      onSetShowReactionPicker={setShowReactionPicker}
                      onDownloadMedia={handleDownloadMedia}
                      onSetFullSizeImage={setFullSizeImage}
                      formatTime={formatTime}
                      messageIndex={index}
                      shouldAnimate={shouldStaggerMessages}
                      shouldShowFloatingReactions={shouldShowFloatingReactions}
                    />
                  );
                })}
                
                {/* Typing Indicator */}
                {(() => {
                  if (!selectedConversation) return null;
                  
                  const conversationTypingUsers = typingUsers[selectedConversation] || {};
                  
                  return Object.entries(conversationTypingUsers).map(([key, value]) => {
                    const presence = Array.isArray(value) ? value[0] : value;
                    if (presence?.typing && presence?.user_id !== user?.id) {
                      const conversation = selectedConversationDetails ?? conversations.find(c => c.id === selectedConversation);
                      
                      // Find the actual user profile for group chats
                      let typingUserProfile = conversation?.otherUser;
                      if (conversation?.is_group) {
                        // For group chats, find the user from messages or participants
                        const userMessage = messages.find(m => m.profile?.user_id === presence?.user_id);
                        typingUserProfile = userMessage?.profile;
                      }
                      
                      return (
                        <TypingIndicator key={key} profile={typingUserProfile} />
                      );
                    }
                    return null;
                  });
                })()}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
            </div>

            {/* Composer - Fixed at bottom, above bottom nav on mobile */}
            <div 
              className="fixed left-0 right-0 md:left-80 lg:left-96 border-t border-border/50 bg-background/95 backdrop-blur-md shrink-0 z-[9999] md:bottom-0"
              style={{
                bottom: keyboardHeight > 0 
                  ? `${keyboardHeight}px` 
                  : `calc(3.5rem + env(safe-area-inset-bottom, 0px))`
              }}
            >
              <div className="p-3 pt-2 md:p-4 md:pt-2">
              {replyingTo && (
                <div className="mb-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/30 flex items-start justify-between max-w-full overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-primary mb-0.5">
                      Répondre à {replyingTo.profile?.nickname || replyingTo.profile?.full_name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {replyingTo.content}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={() => setReplyingTo(null)}
                  >
                    ✕
                  </Button>
                </div>
              )}
              
              {/* Media Preview */}
              {mediaPreview && (
                <div className="mb-2 relative">
                  {mediaType === 'image' ? (
                    <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg object-contain bg-muted/20" loading="lazy" decoding="async" />
                  ) : mediaType === 'video' ? (
                    <video src={mediaPreview} controls className="max-h-48 rounded-lg bg-muted/20" />
                  ) : mediaType === 'document' ? (
                    <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-lg border border-border/50">
                      <FileText size={24} className="text-primary shrink-0" />
                      <span className="text-sm font-medium truncate">{mediaPreview}</span>
                    </div>
                  ) : null}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={clearMedia}
                  >
                    ×
                  </Button>
                </div>
              )}

              <div className="flex gap-2 items-end">
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-10 w-10"
                    >
                      <Smile size={20} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 border-0" align="start">
                    <Suspense fallback={
                      <div className="w-full h-[400px] flex items-center justify-center bg-background">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }>
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setNewMessage((prev) => prev + emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                        width="100%"
                        height="400px"
                      />
                    </Suspense>
                  </PopoverContent>
                </Popover>

                {/* Media Upload Button - Hidden for Jude conversations */}
                {!isJudeConversation && (
                  <>
                    <input
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={handleMediaSelect}
                      className="hidden"
                      id="media-upload"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-10 w-10"
                      onClick={() => document.getElementById('media-upload')?.click()}
                      title="Joindre une image, vidéo ou document"
                    >
                      <Paperclip size={20} />
                    </Button>
                  </>
                )}

                <Textarea
                  placeholder="Écrivez un message..."
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                  className="text-base resize-none min-h-[40px] max-h-[120px] overflow-y-auto mobile-input tap-highlight-none"
                  autoCapitalize="sentences"
                  autoCorrect="on"
                  spellCheck={false}
                  enterKeyHint="send"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '40px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={(!newMessage.trim() && !selectedMediaFile) || isSending}
                  className={`shrink-0 h-10 w-10 ${isSending ? 'animate-send-bounce' : ''}`}
                >
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center justify-center h-full">
            <p className="text-foreground/70 font-medium bg-background/80 px-4 py-2 rounded-lg backdrop-blur-sm">
              Sélectionnez une conversation
            </p>
          </div>
        )}
      </div>
      
      {/* Create Group Dialog - only for non-visitors */}
      {!isVisitor && (
        <CreateGroupDialog
          open={showCreateGroup}
          onOpenChange={setShowCreateGroup}
          followers={followers}
          onGroupCreated={async (conversationId) => {
            await fetchConversations();
            setShowCreateGroup(false);
            // Navigate to the new conversation
            setSelectedConversation(conversationId);
            navigate(`/community?conversation=${conversationId}`);
            // Fetch messages for the new conversation
            await fetchMessages(conversationId);
          }}
        />
      )}
      
      {/* Delete Conversation Confirmation Dialog */}
      <AlertDialog open={!!deleteConversationId} onOpenChange={(open) => {
        console.log('🔵 [DIALOG] Dialog state changed:', open, 'conversationId:', deleteConversationId);
        if (!open) setDeleteConversationId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
          <AlertDialogTitle>
            {conversations.find(c => c.id === deleteConversationId)?.is_group 
              ? "Supprimer vos messages?" 
              : "Supprimer la conversation?"}
          </AlertDialogTitle>
            <AlertDialogDescription>
              {conversations.find(c => c.id === deleteConversationId)?.is_group 
                ? "Cette action est irréversible. Tous vos messages dans ce groupe seront définitivement supprimés. Vous resterez membre du groupe."
                : "La conversation disparaîtra de votre liste, mais vous pourrez toujours envoyer des messages à cette personne."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                console.log('🟢 [CONFIRM] Confirm button clicked for:', deleteConversationId);
                if (deleteConversationId) handleDeleteConversation(deleteConversationId);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Group Info Dialog */}
      {selectedGroupId && selectedConversation && (
        <GroupInfoDialog
          open={showGroupInfo}
          onOpenChange={setShowGroupInfo}
          groupId={selectedGroupId}
          conversationId={selectedConversation}
          currentUserId={user?.id}
          onLeaveGroup={() => {
            setSelectedConversation(null);
            setShowGroupInfo(false);
            fetchConversations();
          }}
          onDeleteGroup={() => {
            setSelectedConversation(null);
            setShowGroupInfo(false);
            fetchConversations();
          }}
        />
      )}

      {/* Full-size Image Viewer Dialog */}
      <Dialog open={!!fullSizeImage} onOpenChange={() => setFullSizeImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
          <DialogHeader>
            <DialogTitle className="sr-only">Image en taille réelle</DialogTitle>
          </DialogHeader>
          {fullSizeImage && (
            <img
              src={fullSizeImage}
              alt="Image en taille réelle"
              className="w-full h-full object-contain rounded-lg"
              loading="lazy"
              decoding="async"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
