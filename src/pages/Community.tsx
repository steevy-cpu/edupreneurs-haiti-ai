import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Search, Smile, Check, CheckCheck, BadgeCheck, Edit2, Trash2, X, MoreVertical, ImageIcon, Download, Users } from "lucide-react";
import { useMessageSounds } from "@/hooks/useMessageSounds";
import EmojiPicker from "emoji-picker-react";
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
import { Bug } from "lucide-react";

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

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
  profile?: Profile;
  shared_post_id?: string | null;
  replied_to_id?: string | null;
  replied_to?: Message;
  image_url?: string | null;
  video_url?: string | null;
  shared_post?: {
    id: string;
    content: string;
    image_url: string | null;
    user_id: string;
    profile?: Profile;
  };
}

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("conversation");
  const { playSendSound, playReceiveSound } = useMessageSounds();
  
  // Eric's user ID - he's always shown as online
  const ERIC_USER_ID = '68f2f959-e14a-47f9-8277-07df3a6fcd79';
  
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
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
  const typingTimeoutRef = useRef<any>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, Record<string, any>>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(() => new Set([ERIC_USER_ID]));
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

  // Save lastSeenTimes to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('lastSeenTimes', JSON.stringify(lastSeenTimes));
    } catch (error) {
      console.error('Failed to save lastSeenTimes:', error);
    }
  }, [lastSeenTimes]);

  useEffect(() => {
    checkUser();
  }, []);

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
        console.log('📱 Page visible, refreshing conversations');
        fetchConversations();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Subscribe to typing presence for all conversations - only when conversation IDs change
  useEffect(() => {
    if (user && conversations.length > 0) {
      console.log('🔔 Setting up typing presence for all conversations');
      
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
          console.log('🧹 Cleaning up removed conversation presence channel:', convId);
          supabase.removeChannel(presenceChannelsRef.current[convId]);
          delete presenceChannelsRef.current[convId];
        }
      });
    }
    
    return () => {
      // Cleanup all presence channels on unmount
      Object.keys(presenceChannelsRef.current).forEach(convId => {
        console.log('🧹 Cleaning up typing presence channel for conversation:', convId);
        supabase.removeChannel(presenceChannelsRef.current[convId]);
      });
      presenceChannelsRef.current = {};
    };
  }, [conversations.map(c => c.id).join(','), user?.id]);

  useEffect(() => {
    console.log('🔍 useEffect triggered - selectedConversation:', selectedConversation, 'user:', user?.id);
    if (selectedConversation && user) {
      console.log('✅ Conditions met, loading conversation and subscribing');
      const loadConversation = async () => {
        await fetchMessages(selectedConversation);
        await markMessagesAsRead(selectedConversation);
        await fetchReactions(selectedConversation);
      };
      loadConversation();
      subscribeToConversationMessages(selectedConversation);
      subscribeToReactions(selectedConversation);
    } else {
      console.log('❌ Conditions not met - selectedConversation:', !!selectedConversation, 'user:', !!user);
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

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("read", false);
    
    if (!error) {
      // Refresh conversations to update unread counts
      await fetchConversations();
    }

    if (!error) {
      // Immediately update local state for messages
      setMessages(prev =>
        prev.map(msg =>
          msg.sender_id !== user.id && !msg.read
            ? { ...msg, read: true }
            : msg
        )
      );
      
      // Update conversations state to remove badge
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
        console.log('✅ [Community] Global presence listener already active');
        return;
      }
    }

    console.log('🌐 [Community] Setting up presence listener for user:', user.id);
    
    // Create a unique channel name for Community's listener
    const channel = supabase.channel(`community-presence-${user.id}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        // Get presence from the shared online-users channel via Layout
        const allChannels = supabase.getChannels();
        const onlineChannel = allChannels.find(ch => ch.topic === 'realtime:online-users');
        
        if (onlineChannel) {
          const state = onlineChannel.presenceState();
          console.log('🔄 [Community] Presence sync from Layout channel:', state);
          const userIds = new Set<string>([ERIC_USER_ID]); // Eric is always online
          Object.values(state).forEach((presences: any) => {
            presences.forEach((p: any) => {
              if (p.user_id) userIds.add(p.user_id);
            });
          });
          console.log('👥 [Community] Online users:', Array.from(userIds));
          setOnlineUsers(userIds);
          
          // Initialize last seen times for offline users
          setLastSeenTimes(prevTimes => {
            console.log('🔍 [Community] Current lastSeenTimes:', prevTimes);
            const newTimes = { ...prevTimes };
            conversations.forEach(conv => {
              const otherUserId = conv.otherUser?.user_id;
              if (otherUserId && !userIds.has(otherUserId)) {
                if (!newTimes[otherUserId]) {
                  // User is offline and we don't have a last seen time, set a default
                  newTimes[otherUserId] = new Date(Date.now() - 300000).toISOString();
                  console.log('⏰ [Community] Set default last seen for:', otherUserId);
                } else {
                  console.log('✅ [Community] Already have last seen for:', otherUserId, newTimes[otherUserId]);
                }
              }
            });
            console.log('📦 [Community] Final lastSeenTimes:', newTimes);
            return newTimes;
          });
        }
      })
      .subscribe((status) => {
        console.log('📡 [Community] Presence listener status:', status);
        
        // Poll for presence updates every 5 seconds
        if (status === 'SUBSCRIBED') {
          const pollInterval = setInterval(() => {
            const allChannels = supabase.getChannels();
            const onlineChannel = allChannels.find(ch => ch.topic === 'realtime:online-users');
            
            if (onlineChannel) {
              const state = onlineChannel.presenceState();
              const userIds = new Set<string>([ERIC_USER_ID]); // Eric is always online
              Object.values(state).forEach((presences: any) => {
                presences.forEach((p: any) => {
                  if (p.user_id) userIds.add(p.user_id);
                });
              });
              
              setOnlineUsers(prev => {
                const prevArray = Array.from(prev).sort();
                const newArray = Array.from(userIds).sort();
                if (JSON.stringify(prevArray) !== JSON.stringify(newArray)) {
                  console.log('👥 [Community] Online users updated:', Array.from(userIds));
                  
                  // Track who went offline
                  prev.forEach(userId => {
                    if (!userIds.has(userId)) {
                      console.log('📴 [Community] User went offline:', userId);
                      setLastSeenTimes(prevTimes => {
                        const newTimes = {
                          ...prevTimes,
                          [userId]: new Date().toISOString()
                        };
                        console.log('⏰ [Community] Updated lastSeenTimes:', newTimes);
                        return newTimes;
                      });
                    }
                  });
                  
                  return userIds;
                }
                return prev;
              });
            }
          }, 5000);
          
          // Store interval for cleanup
          (channel as any).pollInterval = pollInterval;
        }
      });

    globalPresenceChannelRef.current = channel;
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch all conversations with visibility info
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id, visible_from_message_id")
      .eq("user_id", user.id);

    if (!participations) return;

    // Create map of visibility thresholds
    const visibilityMap = new Map<string, string | null>();
    participations.forEach(p => {
      visibilityMap.set(p.conversation_id, p.visible_from_message_id);
    });

    const conversationIds = participations.map(p => p.conversation_id);
    
    if (conversationIds.length === 0) {
      setConversations([]);
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

    // Fetch 1-on-1 conversation participants
    const { data: allParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", conversationIds);

    const otherUserIds = allParticipants
      ?.filter(p => p.user_id !== user.id)
      .map(p => p.user_id) || [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", otherUserIds);

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
          // Only include messages after the threshold
          const visibleMsgs = convMessages.slice(thresholdIndex + 1);
          visibleMessages.set(convId, visibleMsgs);
        }
      }
    });

    console.log('📊 Visible messages per conversation:', Object.fromEntries(
      Array.from(visibleMessages.entries()).map(([id, msgs]) => [id, msgs.length])
    ));
    
    console.log('🔍 [FETCH] Starting to build conversation list...');

    // Build conversations list - deduplicate both group and 1-on-1
    const groupedByUser = new Map<string, Conversation>();
    const groupedByGroup = new Map<string, Conversation>();

    conversationIds.forEach(convId => {
      const convInfo = conversationData?.find(c => c.id === convId);
      if (!convInfo) return;

      // Get visible messages for this conversation
      const convVisibleMessages = visibleMessages.get(convId) || [];
      
      // Skip this conversation if no visible messages (deleted conversation with no new messages)
      if (convVisibleMessages.length === 0) {
        console.log(`🚫 [FETCH] Skipping conversation ${convId} - no visible messages (user deleted it)`);
        return;
      }

      console.log(`✅ [FETCH] Including conversation ${convId} - ${convVisibleMessages.length} visible messages`);

      const lastMsg = convVisibleMessages[convVisibleMessages.length - 1];
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
        
        console.log(`💬 Conversation ${convId} with ${otherUserProfile?.full_name}: ${unreadCount} unread`);
      }
    });

    // Combine group and 1-on-1 conversations and sort
    const allConversations = [...Array.from(groupedByGroup.values()), ...Array.from(groupedByUser.values())];
    const sortedConversations = allConversations.sort((a, b) => 
      new Date(b.lastMessageTime || b.created_at).getTime() - 
      new Date(a.lastMessageTime || a.created_at).getTime()
    );
    
    setConversations(sortedConversations);
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
      console.error('❌ Error fetching participant visibility:', participantError);
    }

    const visibilityThreshold = participantData?.visible_from_message_id;
    console.log('🔍 Message visibility threshold:', visibilityThreshold || 'ALL MESSAGES');

    // Fetch all messages for this conversation first
    let query = supabase
      .from("messages")
      .select("id, content, sender_id, created_at, read, shared_post_id, conversation_id, replied_to_id, image_url, video_url")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    const { data: allMessages, error: messagesError } = await query;
    
    if (messagesError) {
      console.error('❌ Messages error:', messagesError);
    }

    // Filter messages on the client side based on visibility threshold
    let messagesData = allMessages || [];
    if (visibilityThreshold && allMessages) {
      // Find the index of the threshold message
      const thresholdIndex = allMessages.findIndex(m => m.id === visibilityThreshold);
      if (thresholdIndex !== -1) {
        // Show messages FROM the threshold message onwards (inclusive)
        messagesData = allMessages.slice(thresholdIndex);
        console.log(`📊 Filtered from ${allMessages.length} to ${messagesData.length} messages (starting from threshold)`);
      }
    }
    
    console.log('💬 Final visible messages count:', messagesData.length);

    if (!messagesData) return;

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

  const subscribeToConversationMessages = (conversationId: string) => {
    // Unsubscribe from previous channel if exists
    if (messageChannelRef.current) {
      supabase.removeChannel(messageChannelRef.current);
    }

    console.log('🔔 Setting up realtime subscription for conversation:', conversationId);

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
          // Fetch the sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", payload.new.sender_id)
            .single();

          // Fetch replied message if exists
          let repliedToMessage = undefined;
          if (payload.new.replied_to_id) {
            const { data: repliedData } = await supabase
              .from("messages")
              .select("id, content, sender_id, created_at, read")
              .eq("id", payload.new.replied_to_id)
              .single();

            if (repliedData) {
              const { data: repliedProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", repliedData.sender_id)
                .single();

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
              const { data: postProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", postData.user_id)
                .single();

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

          setMessages((prev) => [...prev, newMessage]);

          // Check if this is a group message mentioning Eric
          const currentConversation = conversations.find(c => c.id === conversationId);
          const isGroupChat = currentConversation?.is_group;
          const mentionsEric = payload.new.content.toLowerCase().includes('hey eric');
          
          // If in group chat and mentions Eric, trigger Eric's response (including user's own messages)
          if (isGroupChat && mentionsEric && payload.new.sender_id !== ERIC_USER_ID) {
            console.log('🤖 Eric mentioned in group chat, triggering response...');
            
            // Get sender's profile info
            supabase.functions.invoke('eric-chat', {
              body: { 
                conversationId: conversationId,
                userMessage: payload.new.content,
                userId: payload.new.sender_id,
                userNickname: profile?.nickname || profile?.full_name
              }
            }).catch(error => {
              console.error('Error calling Eric chat:', error);
            });
          }

          // Show notification if message is from another user AND this is the CURRENT conversation
          // (notifications for other conversations are handled in subscribeToMessages)
          if (payload.new.sender_id !== user?.id && conversationId === selectedConversation) {
            console.log('🔔 Message in current conversation, showing notification');
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
          console.log('📨 New message received:', payload);
          
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
            console.log('🔔 Showing browser notification for new message');
            
            // Fetch sender profile for notification
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name, nickname')
              .eq('user_id', payload.new.sender_id)
              .single();
            
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
          
          // Also refresh from database after a small delay to ensure consistency
          setTimeout(() => fetchConversations(), 100);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          console.log('✅ Message updated:', payload);
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
      .subscribe((status) => {
        console.log('📡 Messages subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image ou une vidéo",
        variant: "destructive",
      });
      return;
    }

    try {
      const mediaType = isImage ? 'image' : 'video';
      
      if (isImage) {
        toast({
          title: "Optimisation...",
          description: "Compression de l'image en cours...",
        });
      }

      const { file: optimizedFile, originalSize, optimizedSize, savings } = await optimizeMediaFile(file, mediaType);
      
      setSelectedMediaFile(optimizedFile);
      setMediaType(mediaType);

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
    } catch (error: any) {
      console.error('Error optimizing media:', error);
      toast({
        title: "Erreur",
        description: error.message || `Impossible d'optimiser ${isImage ? "l'image" : "la vidéo"}`,
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

    setIsSending(true);
    const messageContent = newMessage.trim();
    let imageUrl = null;
    let videoUrl = null;
    
    // Clear typing indicator when sending
    sendTypingStatus(false);

    // Check if user is a participant and their visibility settings
    const { data: participation } = await supabase
      .from("conversation_participants")
      .select("id, visible_from_message_id")
      .eq("conversation_id", selectedConversation)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!participation) {
      // User is not a participant - re-add them (WhatsApp-like behavior)
      const { error: addError } = await supabase
        .from("conversation_participants")
        .insert({
          conversation_id: selectedConversation,
          user_id: user.id,
          visible_from_message_id: null,
        });

      if (addError) {
        console.error("Error re-adding user to conversation:", addError);
        toast({
          title: "Erreur",
          description: "Impossible de rejoindre la conversation",
          variant: "destructive",
        });
        setIsSending(false);
        return;
      }
    } else if (participation.visible_from_message_id) {
      // User deleted the conversation before - reset visibility to see all new messages
      const { error: resetError } = await supabase
        .from("conversation_participants")
        .update({ visible_from_message_id: null })
        .eq("conversation_id", selectedConversation)
        .eq("user_id", user.id);

      if (resetError) {
        console.error("Error resetting visibility:", resetError);
      }
    }

    // Upload media if present
    if (selectedMediaFile) {
      const fileExt = selectedMediaFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('message-media')
        .upload(fileName, selectedMediaFile);

      if (uploadError) {
        toast({
          title: "Erreur",
          description: `Impossible de télécharger le ${mediaType === 'image' ? 'image' : 'vidéo'}`,
          variant: "destructive",
        });
        setIsSending(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('message-media')
        .getPublicUrl(fileName);
      
      if (mediaType === 'image') {
        imageUrl = publicUrl;
      } else {
        videoUrl = publicUrl;
      }
    }
    
    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: messageContent || (mediaType === 'image' ? '📷 Image' : '🎥 Vidéo'),
      image_url: imageUrl,
      video_url: videoUrl,
      read: false,
      replied_to_id: replyingTo?.id || null,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
      setIsSending(false);
      return;
    }

    playSendSound();
    setNewMessage("");
    setReplyingTo(null);
    clearMedia();
    
    // Send notification to recipient
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (conversation?.otherUser) {
      // Get sender's profile for better notification
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name, nickname')
        .eq('user_id', user.id)
        .single();
      
      const senderName = senderProfile?.full_name || user.email || 'Someone';
      
      // Check if messaging Eric (AI assistant)
      if (conversation.otherUser.user_id === ERIC_USER_ID) {
        try {
          // Call Eric's chat function (handles AI and message insertion)
          const { error: ericError } = await supabase.functions.invoke('eric-chat', {
            body: { 
              conversationId: selectedConversation,
              userMessage: messageContent,
              userId: user.id,
              userNickname: senderProfile?.nickname || senderProfile?.full_name
            }
          });

          if (ericError) {
            console.error('Error calling Eric chat:', ericError);
            toast({
              title: "Erreur",
              description: "Impossible d'obtenir une réponse d'Eric",
              variant: "destructive",
            });
          }
        } catch (aiError) {
          console.error('Error getting AI response:', aiError);
          toast({
            title: "Erreur",
            description: "Impossible d'obtenir une réponse d'Eric",
            variant: "destructive",
          });
        }
      } else {
        // Regular user - send push notification
        try {
          const messagePreview = messageContent 
            ? messageContent.substring(0, 80) 
            : (imageUrl ? '📷 Vous a envoyé une image' : '🎥 Vous a envoyé une vidéo');
            
          await supabase.functions.invoke('send-push-notification', {
            body: {
              recipientUserId: conversation.otherUser.user_id,
              title: `💬 ${senderName}`,
              body: messagePreview,
              conversationId: selectedConversation
            }
          });
        } catch (pushError) {
          console.error('Error sending push notification:', pushError);
        }
      }
    } else if (conversation?.is_group && conversation?.group?.id) {
      // Group message - send push notifications to all members except sender
      try {
        const { data: groupMembers } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', conversation.group.id)
          .neq('user_id', user.id);

        if (groupMembers) {
          // Get sender profile
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, nickname')
            .eq('user_id', user.id)
            .single();

          const senderName = senderProfile?.nickname || senderProfile?.full_name || 'Someone';
          const groupName = conversation.group?.name || 'Group';

          // Send push notification to each group member
          for (const member of groupMembers) {
            try {
              const messagePreview = messageContent 
                ? messageContent.substring(0, 80) 
                : (imageUrl ? '📷 Image' : '🎥 Vidéo');
                
              await supabase.functions.invoke('send-push-notification', {
                body: {
                  recipientUserId: member.user_id,
                  title: `👥 ${senderName} dans ${groupName}`,
                  body: messagePreview,
                  conversationId: selectedConversation
                }
              });
            } catch (error) {
              console.error(`Error sending push to ${member.user_id}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error sending group push notifications:', error);
      }
    }
    setIsSending(false);
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
      console.error("Error updating message:", error);
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
      console.error("Error deleting message:", error);
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
      console.log('❌ Cannot setup typing presence - no user');
      return;
    }

    if (presenceChannelsRef.current[conversationId]) {
      supabase.removeChannel(presenceChannelsRef.current[conversationId]);
    }

    console.log('🔄 Setting up typing presence for conversation:', conversationId, 'User:', user.id);

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
        console.log('👥 Presence state synced for conversation:', conversationId, state);
        setTypingUsers(prev => ({
          ...prev,
          [conversationId]: state
        }));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log('📡 Typing presence subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Tracking initial typing state for user:', user.id);
          const trackResult = await channel.track({
            user_id: user.id,
            typing: false,
          });
          console.log('Track result:', trackResult);
        }
      });

    presenceChannelsRef.current[conversationId] = channel;
  };

  const sendTypingStatus = async (isTyping: boolean) => {
    if (!selectedConversation || !presenceChannelsRef.current[selectedConversation] || !user) {
      console.log('❌ Cannot send typing status - no channel or user');
      return;
    }

    try {
      console.log('📤 Sending typing status:', isTyping, 'for user:', user.id);
      const result = await presenceChannelsRef.current[selectedConversation].track({
        user_id: user.id,
        typing: isTyping,
      });
      console.log('✅ Typing status sent:', result);
    } catch (error) {
      console.error('❌ Error sending typing status:', error);
    }
  };

  const handleTyping = (value: string) => {
    console.log('⌨️ handleTyping called with value length:', value.length);
    setNewMessage(value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status
    if (value.trim()) {
      console.log('⌨️ User is typing, sending status true');
      sendTypingStatus(true);

      // Auto-clear typing status after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        console.log('⌨️ Typing timeout reached, sending status false');
        sendTypingStatus(false);
      }, 3000);
    } else {
      console.log('⌨️ Input empty, sending status false');
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
    console.log('🚀 [DELETE] Function called with conversationId:', conversationId);
    
    try {
      if (!user?.id) {
        console.error('❌ [DELETE] No user ID found');
        toast({
          title: "Erreur",
          description: "Utilisateur non authentifié",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ [DELETE] User ID:', user.id);
      console.log('📋 [DELETE] Current conversations:', conversations.length);

      // Find if this is a group or single conversation
      const conversation = conversations.find(c => c.id === conversationId);
      const isGroup = conversation?.is_group;

      console.log('🔍 [DELETE] Found conversation:', { 
        found: !!conversation, 
        isGroup, 
        conversationName: isGroup ? conversation?.group?.name : conversation?.otherUser?.nickname 
      });

      if (isGroup) {
        console.log('🗂️ [DELETE] Deleting messages from group conversation');
        // For group conversations: delete only user's messages
        const { error: deleteError } = await supabase
          .from("messages")
          .delete()
          .eq("conversation_id", conversationId)
          .eq("sender_id", user.id);

        if (deleteError) {
          console.error("❌ [DELETE] Error deleting messages:", deleteError);
          throw deleteError;
        }
        console.log('✅ [DELETE] Deleted user messages from group');
      } else {
        console.log('💬 [DELETE] Hiding messages in single conversation');
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
          console.error("❌ [DELETE] Error fetching last message:", fetchError);
          throw fetchError;
        }

        console.log('📨 [DELETE] Last message ID:', lastMessage?.id);

        // Update visible_from_message_id to exclude all current messages
        const { error: updateError } = await supabase
          .from("conversation_participants")
          .update({ 
            visible_from_message_id: lastMessage?.id || null
          })
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id);

        if (updateError) {
          console.error("❌ [DELETE] Error updating visibility:", updateError);
          throw updateError;
        }
        console.log('✅ [DELETE] Updated visibility threshold to:', lastMessage?.id);
      }

      // Clear local messages state
      setMessages([]);
      console.log('🧹 [DELETE] Cleared local messages');

      // Clear selection if this conversation was selected
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        // Update URL to reflect no conversation selected
        navigate('/community');
        console.log('🔄 [DELETE] Cleared selection and navigated to /community');
      }

      toast({
        title: "Succès",
        description: isGroup 
          ? "Vos messages ont été supprimés" 
          : "La conversation a été supprimée de votre liste",
      });

      // Refresh conversations list to hide the deleted conversation
      console.log('🔄 [DELETE] Refreshing conversations list...');
      await fetchConversations();
      console.log('✅ [DELETE] Conversations refreshed');
    } catch (error) {
      console.error("❌ [DELETE] Critical error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la conversation",
        variant: "destructive",
      });
    } finally {
      setDeleteConversationId(null);
      console.log('🏁 [DELETE] Cleanup complete');
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
      console.error('Error downloading media:', error);
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
    <div className="h-[100dvh] bg-background flex overflow-hidden pb-16 md:pb-0">
      {/* Notification Permission Dialog */}
      {user && <NotificationPermissionBanner userId={user.id} />}
      
      {/* Conversations List */}
      <div className={`${selectedConversation ? "hidden md:block" : "block"} w-full md:w-80 lg:w-96 border-r border-border/50 overflow-hidden`}>
        <div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="shrink-0"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold flex-1">Messages</h1>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowCreateGroup(true)}
              className="shrink-0"
              title="Créer un groupe"
            >
              <Users size={18} className="sm:w-5 sm:h-5" />
            </Button>
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/user-search")}
              className="shrink-0"
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100dvh-80px)]">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <p className="text-muted-foreground">Aucune conversation</p>
              <Button
                className="mt-4"
                onClick={() => navigate("/user-search")}
              >
                Rechercher des utilisateurs
              </Button>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/50 ${
                  selectedConversation === conv.id ? "bg-muted/50" : ""
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div 
                    className="relative"
                    onClick={() => setSelectedConversation(conv.id)}
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
                    {!conv.is_group && conv.otherUser?.user_id && onlineUsers.has(conv.otherUser.user_id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p 
                        className="font-semibold truncate text-sm sm:text-base cursor-pointer hover:underline flex-shrink"
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
                      {!conv.is_group && conv.otherUser?.user_id && onlineUsers.has(conv.otherUser.user_id) && (
                        <span className="text-xs text-green-500 font-medium shrink-0 whitespace-nowrap">En ligne</span>
                      )}
                    </div>
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
                            <div className="flex items-center gap-1 text-muted-foreground text-xs italic">
                              <span>en train d'écrire</span>
                              <span className="flex gap-0.5">
                                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                              </span>
                            </div>
                          );
                        }
                      }
                      
                      return (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words overflow-hidden">
                          {conv.lastMessage || "Aucun message"}
                        </p>
                      );
                    })()}
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
            ))
          )}
        </ScrollArea>
      </div>

      {/* Messages View */}
      <div className={`${selectedConversation ? "fixed inset-0 md:relative md:flex-1" : "hidden md:block md:flex-1"} flex flex-col bg-background z-40 md:z-auto`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="fixed md:relative top-0 left-0 right-0 border-b border-border/50 bg-background/95 backdrop-blur-sm p-4 flex items-center gap-3 shrink-0 z-50 h-[60px]">
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 md:hidden"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft size={20} />
              </Button>
              {(() => {
                const currentConv = conversations.find(c => c.id === selectedConversation);
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
                            <p className="text-xs text-green-500 font-medium">
                              En ligne
                            </p>
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

            {/* Eric Help Banner for Group Chats */}
            {(() => {
              const currentConv = conversations.find(c => c.id === selectedConversation);
              const isGroup = currentConv?.is_group;
              
              if (!isGroup) return null;
              
              return (
                <div className="sticky top-[60px] md:top-0 z-[60] mx-2 sm:mx-4 mt-2 mb-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-lg backdrop-blur-sm shadow-sm">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <img src={ericAiHelper} alt="Eric AI Assistant" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-foreground font-semibold">
                        Eric, votre assistant IA est dans ce groupe !
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        Pour lui parler, commencez votre message par <span className="font-bold text-primary">"Hey eric"</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 min-h-0 pt-[60px] md:pt-2 pb-[80px] md:pb-2">
              <div className="space-y-4 pb-4 max-w-full">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  const isSystemMessage = message.content.includes('a rejoint le groupe') || message.content.includes('a quitté le groupe');
                  
                  // System message rendering (centered)
                  if (isSystemMessage) {
                    return (
                      <div key={message.id} className="flex justify-center px-2">
                        <div className="bg-muted/50 text-muted-foreground text-xs sm:text-sm px-4 py-2 rounded-full border border-border/50 max-w-[90%] text-center">
                          {message.content}
                        </div>
                      </div>
                    );
                  }
                  
                  // Regular message rendering
                  return (
                    <>
                      {/* System messages like "X a rejoint le groupe" */}
                      {(message.content.includes('a rejoint le groupe') || 
                        message.content.includes('a quitté le groupe') ||
                        message.content.includes('Bienvenue dans')) && (
                        <div key={message.id} className="flex justify-center my-2 px-2">
                          <div className="bg-muted/50 rounded-full px-4 py-1.5">
                            <p className="text-xs text-muted-foreground text-center">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Regular messages */}
                      {!message.content.includes('a rejoint le groupe') && 
                       !message.content.includes('a quitté le groupe') &&
                       !message.content.includes('Bienvenue dans') && (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} px-2`}
                    >
                      <div 
                        className={`flex gap-1.5 sm:gap-2 max-w-[85%] sm:max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"} cursor-pointer group`}
                        onClick={(e) => {
                          // Don't trigger reply if clicking on avatar or post
                          if (!(e.target as HTMLElement).closest('.no-reply-trigger')) {
                            setReplyingTo(message);
                          }
                        }}
                      >
                        <Avatar 
                          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 cursor-pointer hover:opacity-80 transition-opacity no-reply-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (message.profile?.user_id) {
                              navigate(`/profile/${message.profile.user_id}`);
                            }
                          }}
                        >
                          <AvatarImage src={getAvatarUrl(message.profile?.avatar_url)} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-[10px] sm:text-xs">
                            {(message.profile?.nickname || message.profile?.full_name)?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1 min-w-0 max-w-full">
                          {message.replied_to && (
                            <div className={`text-xs px-2 py-1 rounded-lg border break-words ${
                              isOwn ? "bg-primary/20 border-primary/30" : "bg-muted/60 border-border/30"
                            }`}>
                              <div className="font-semibold opacity-70">
                                {message.replied_to.profile?.nickname || message.replied_to.profile?.full_name}
                              </div>
                              <div className="opacity-60 truncate">
                                {message.replied_to.content.substring(0, 50)}
                                {message.replied_to.content.length > 50 && "..."}
                              </div>
                            </div>
                          )}
                          {message.shared_post ? (
                            // Shared Post Display
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/feed");
                              }}
                              className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 cursor-pointer hover:opacity-90 transition-opacity no-reply-trigger break-words ${
                                isOwn
                                  ? "bg-primary/90 text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/20">
                                <span className="text-xs font-semibold opacity-80">
                                  📝 Post partagé de {message.shared_post.profile?.nickname || message.shared_post.profile?.full_name}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm whitespace-pre-wrap break-words mb-2">
                                {message.shared_post.content}
                              </p>
                              {message.shared_post.image_url && (
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium flex items-center gap-1">
                                      📷 Image
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 hover:bg-background/50 no-reply-trigger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadMedia(message.shared_post.image_url, 'image');
                                      }}
                                    >
                                      <Download size={14} />
                                    </Button>
                                  </div>
                                  <img
                                    src={message.shared_post.image_url}
                                    alt="Post"
                                    className="rounded-lg w-full max-h-48 object-contain bg-muted/20 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFullSizeImage(message.shared_post.image_url);
                                    }}
                                  />
                                </div>
                              )}
                              <p className="text-xs opacity-70 mt-2">Cliquez pour voir le post</p>
                            </div>
                          ) : editingMessageId === message.id ? (
                            // Editing Mode
                            <div className="flex flex-col gap-2 w-full">
                              <Textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="min-h-[60px] resize-none"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                  }}
                                  className="no-reply-trigger"
                                >
                                  <X size={14} className="mr-1" />
                                  Annuler
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveEdit(message.id);
                                  }}
                                  className="no-reply-trigger"
                                >
                                  <Check size={14} className="mr-1" />
                                  Enregistrer
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Regular Message Display
                            <div className="relative group/message">
                              <div
                                className={`rounded-2xl px-3 py-2 sm:px-4 break-words overflow-wrap-anywhere ${
                                  isOwn
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <div className={`flex items-start ${message.image_url ? 'justify-between' : 'justify-start'} gap-2`}>
                                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere flex-1">
                                    {message.content}
                                  </p>
                                  {message.image_url && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 hover:bg-background/50 no-reply-trigger shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadMedia(message.image_url, 'image');
                                      }}
                                    >
                                      <Download size={14} />
                                    </Button>
                                  )}
                                </div>
                                {message.image_url && (
                                  <img
                                    src={message.image_url}
                                    alt="Image"
                                    className="mt-2 rounded-lg w-full max-h-64 object-contain bg-muted/20 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFullSizeImage(message.image_url);
                                    }}
                                  />
                                )}
                                {message.video_url && (
                                  <div className="relative group/video mt-2">
                                    <video
                                      src={message.video_url}
                                      controls
                                      className="rounded-lg w-full max-h-64 bg-muted/20"
                                      preload="metadata"
                                    />
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="absolute bottom-2 right-2 h-8 w-8 p-0 opacity-0 group-hover/video:opacity-100 transition-opacity bg-background/90 hover:bg-background no-reply-trigger shadow-lg"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadMedia(message.video_url, 'video');
                                      }}
                                    >
                                      <Download size={16} />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              {isOwn && (
                                <div className="absolute -right-2 top-0 opacity-0 group-hover/message:opacity-100 transition-opacity flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 bg-background/90 hover:bg-background no-reply-trigger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditMessage(message.id, message.content);
                                    }}
                                  >
                                    <Edit2 size={12} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 bg-background/90 hover:bg-destructive hover:text-destructive-foreground no-reply-trigger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMessage(message.id);
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.created_at)}
                            </span>
                            {isOwn && (
                              <span className="inline-flex">
                                {message.read ? (
                                  <CheckCheck size={14} className="text-primary" />
                                ) : (
                                  <Check size={14} className="text-muted-foreground" />
                                )}
                              </span>
                            )}
                          </div>
                          
                          {/* Reactions Display */}
                          {reactions[message.id] && reactions[message.id].length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(
                                reactions[message.id].reduce((acc, reaction) => {
                                  if (!acc[reaction.emoji]) {
                                    acc[reaction.emoji] = [];
                                  }
                                  acc[reaction.emoji].push(reaction.user_id);
                                  return acc;
                                }, {} as Record<string, string[]>)
                              ).map(([emoji, userIds]) => {
                                const hasUserReacted = userIds.includes(user?.id);
                                return (
                                  <button
                                    key={emoji}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleReaction(message.id, emoji);
                                    }}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors no-reply-trigger ${
                                      hasUserReacted 
                                        ? "bg-primary/20 border border-primary/50" 
                                        : "bg-muted border border-border hover:bg-muted/80"
                                    }`}
                                  >
                                    <span>{emoji}</span>
                                    <span className="text-[10px] font-medium">{userIds.length}</span>
                                  </button>
                                );
                              })}
                              
                              {/* Add Reaction Button */}
                              <Popover 
                                open={showReactionPicker === message.id} 
                                onOpenChange={(open) => setShowReactionPicker(open ? message.id : null)}
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-2 py-0.5 rounded-full text-xs bg-muted border border-border hover:bg-muted/80 transition-colors no-reply-trigger"
                                  >
                                    ➕
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-auto p-2" 
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex gap-2">
                                    {['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '🎉'].map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleReaction(message.id, emoji);
                                        }}
                                        className="text-xl hover:scale-125 transition-transform"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                          
                          {/* Add Reaction Button (when no reactions exist) */}
                          {(!reactions[message.id] || reactions[message.id].length === 0) && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                              <Popover 
                                open={showReactionPicker === message.id} 
                                onOpenChange={(open) => setShowReactionPicker(open ? message.id : null)}
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-2 py-0.5 rounded-full text-xs bg-muted border border-border hover:bg-muted/80 transition-colors no-reply-trigger flex items-center gap-1"
                                  >
                                    <Smile size={12} />
                                    <span className="text-[10px]">Réagir</span>
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-auto p-2" 
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex gap-2">
                                    {['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '🎉'].map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleReaction(message.id, emoji);
                                        }}
                                        className="text-xl hover:scale-125 transition-transform"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                      )}
                    </>
                  );
                })}
                
                {/* Typing Indicator */}
                {(() => {
                  if (!selectedConversation) return null;
                  
                  const conversationTypingUsers = typingUsers[selectedConversation] || {};
                  console.log('🎨 Rendering typing indicator for conversation:', selectedConversation, conversationTypingUsers);
                  
                  return Object.entries(conversationTypingUsers).map(([key, value]) => {
                    const presence = Array.isArray(value) ? value[0] : value;
                    console.log('🔍 Presence:', presence, 'typing:', presence?.typing, 'user_id:', presence?.user_id, 'current user:', user?.id);
                    if (presence?.typing && presence?.user_id !== user?.id) {
                      console.log('✅ Showing typing indicator for user:', presence?.user_id);
                      const conversation = conversations.find(c => c.id === selectedConversation);
                      
                      // Find the actual user profile for group chats
                      let typingUserProfile = conversation?.otherUser;
                      if (conversation?.is_group) {
                        // For group chats, find the user from messages or participants
                        const userMessage = messages.find(m => m.profile?.user_id === presence?.user_id);
                        typingUserProfile = userMessage?.profile;
                      }
                      
                      return (
                        <div key={key} className="flex items-center gap-2 px-2 py-1">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={getAvatarUrl(typingUserProfile?.avatar_url)} />
                            <AvatarFallback className="text-xs">
                              {typingUserProfile?.nickname?.[0] || typingUserProfile?.full_name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <span className="italic">en train d'écrire</span>
                            <span className="flex gap-1">
                              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                            </span>
                          </div>
                        </div>
                      );
                    }
                    console.log('❌ Not showing typing indicator for this presence');
                    return null;
                  });
                })()}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="fixed md:relative bottom-0 left-0 right-0 border-t border-border/50 p-2 sm:p-4 bg-background/95 backdrop-blur-sm shrink-0 z-50 safe-bottom">
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
                    <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg object-contain bg-muted/20" />
                  ) : (
                    <video src={mediaPreview} controls className="max-h-48 rounded-lg bg-muted/20" />
                  )}
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

              <div className="flex gap-1.5 sm:gap-2 items-end">
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Smile size={18} className="sm:w-5 sm:h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 border-0" align="start">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setNewMessage((prev) => prev + emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                      width="100%"
                      height="400px"
                    />
                  </PopoverContent>
                </Popover>

                {/* Media Upload Button */}
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                  id="media-upload"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                  onClick={() => document.getElementById('media-upload')?.click()}
                  title="Joindre une image ou vidéo"
                >
                  <ImageIcon size={18} className="sm:w-5 sm:h-5" />
                </Button>

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
                  className="text-sm sm:text-base resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
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
                  className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Send size={18} className="sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex items-center justify-center h-full">
            <p className="text-muted-foreground">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
      
      {/* Create Group Dialog */}
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
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
