import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMessageSounds } from "@/hooks/useMessageSounds";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { optimizeMediaFile, formatFileSize, generateImageThumbnail } from "@/utils/mediaOptimization";
import { uploadWithProgress } from "@/utils/uploadWithProgress";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { GroupInfoDialog } from "@/components/GroupInfoDialog";

import chatBackground from "@/assets/edupreneur-watermark-patterns.png";

// Use public paths for WebP optimization
const ericAiHelper = "/images/eric-ai-helper.png";
const ericAiHelperWebP = "/images/eric-ai-helper.webp";
import { logger } from "@/utils/logger";
import { preloadImage } from "@/utils/performanceOptimization";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { useTimeBasedAccent } from "@/hooks/useTimeBasedAccent";
import { useVisitor } from "@/contexts/VisitorContext";
import { visitorConversationPreview } from "@/data/visitorDemoData";
import { 
  ConversationListItem, 
  ChatViewHeader,
  TypingIndicator,
  ConversationSkeleton,
  MessageBubble,
  SystemMessage,
  VisitorCommunityOverlay,
  ChatComposer,
  ChatLayout,
  JudeBanner,
  ConversationSidebar,
  JudeTypingIndicator
} from "@/components/community";
import { ErrorState } from "@/components/shared/ErrorState";
import { 
  Profile, 
  Conversation, 
  Message, 
  Reaction, 
  JUDE_USER_ID 
} from "@/types/community";
import { useOnlineUserIds } from "@/contexts/PresenceContext";

// Hook imports — no hook imports another hook; all deps via params
import { useCommunityMedia } from "@/features/community/hooks/useCommunityMedia";
import { useTypingIndicators } from "@/features/community/hooks/useTypingIndicators";
import { useCommunityConversations } from "@/features/community/hooks/useCommunityConversations";
import { useCommunityMessages } from "@/features/community/hooks/useCommunityMessages";
import { useCommunityRealtime } from "@/features/community/hooks/useCommunityRealtime";

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
  
  const {
    isSlowConnection,
    shouldDeferResources,
    imageQuality
  } = useNetworkAwareLoading();
  
  const { accentColor, period } = useTimeBasedAccent();
  
  // === Core shared state — owned by parent ===
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  const [isAwaitingJudeResponse, setIsAwaitingJudeResponse] = useState(false);
  const [typewriterMessageId, setTypewriterMessageId] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Fallback timestamps for OFFLINE users only
  const [offlineLastSeenTimes, setOfflineLastSeenTimes] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('lastSeenTimes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Use centralized presence from PresenceContext (event-driven, not polling)
  const onlineUsers = useOnlineUserIds();

  // === Refs — owned by parent, passed to hooks ===
  const previousMessagesCount = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentConversationRef = useRef<string | null>(null);
  const selectedConversationRef = useRef<string | null>(null);
  const prevConversationIdsRef = useRef<string>('');
  /** Ref-synced conversations list — avoids stale closures in realtime callbacks */
  const conversationsRef = useRef<Conversation[]>([]);

  // === Hook 1: Media (self-contained) ===
  const mediaHook = useCommunityMedia();

  // === Hook 2: Typing indicators ===
  const typingHook = useTypingIndicators({
    user,
    selectedConversationRef,
  });

  // === Hook 3: Conversations ===
  const convHook = useCommunityConversations({
    user,
    selectedConversation,
    setSelectedConversation,
    conversations,
    setConversations,
    setMessages,
    setOfflineLastSeenTimes,
  });

  // === Hook 4: Messages ===
  const msgHook = useCommunityMessages({
    user,
    messages,
    setMessages,
    reactions,
    setReactions,
    conversations,
    setConversations,
    currentConversationRef,
  });

  // Sync conversationsRef on every conversations update — keeps realtime callbacks fresh
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // === Hook 5: Realtime subscriptions ===
  const realtimeHook = useCommunityRealtime({
    user,
    selectedConversation,
    conversations,
    setConversations,
    setMessages,
    setReactions,
    markMessagesAsRead: msgHook.markMessagesAsRead,
    getCachedProfile: msgHook.getCachedProfile,
    setIsAwaitingJudeResponse,
    setTypewriterMessageId,
    selectedConversationRef,
    conversationsRef,
    playReceiveSound,
  });

  // Detect if current conversation is with Jude (AI assistant)
  const isJudeConversation = useMemo(() => {
    if (!selectedConversation) return false;
    const conv = convHook.selectedConversationDetails ?? conversations.find(c => c.id === selectedConversation);
    return conv?.otherUser?.user_id === JUDE_USER_ID;
  }, [selectedConversation, conversations, convHook.selectedConversationDetails]);

  // Memoize chat background style with time-based mood overlay
  const chatBackgroundStyle = useMemo(() => {
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

  // === All useEffects stay in parent to maintain lifecycle order ===

  // Preload chat background image on mount
  useEffect(() => {
    preloadImage(chatBackground).catch(() => {});
  }, []);

  // Save offlineLastSeenTimes to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('lastSeenTimes', JSON.stringify(offlineLastSeenTimes));
    } catch (error) {
      logger.error('Failed to save lastSeenTimes:', error);
    }
  }, [offlineLastSeenTimes]);

  useEffect(() => {
    checkUser();
  }, [isVisitor]);

  // Fix 6: 10s loading timeout — show retry instead of infinite skeleton
  useEffect(() => {
    if (!convHook.isLoadingConversations || isVisitor) {
      convHook.setLoadingTimedOut(false);
      return;
    }
    const timer = setTimeout(() => convHook.setLoadingTimedOut(true), 10_000);
    return () => clearTimeout(timer);
  }, [convHook.isLoadingConversations, isVisitor]);

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
      convHook.setIsLoadingConversations(false);
    }
  }, [isVisitor]);

  // Main subscription setup on user login
  useEffect(() => {
    if (user) {
      convHook.fetchConversations();
      convHook.fetchFollowers();
      const unsubscribeMessages = realtimeHook.subscribeToMessages();
      
      return () => {
        if (unsubscribeMessages) unsubscribeMessages();
      };
    }
  }, [user?.id]);

  // Refresh conversations when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        convHook.fetchConversations();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Fix 6: Subscribe to typing presence — optimized dependency comparison
  useEffect(() => {
    if (!user || conversations.length === 0) return;
    
    const currentIds = conversations.map(c => c.id).sort().join(',');
    if (currentIds === prevConversationIdsRef.current) return;
    prevConversationIdsRef.current = currentIds;
    
    // Only set up channels for new conversations
    conversations.forEach(conv => {
      if (!typingHook.presenceChannelsRef.current[conv.id]) {
        typingHook.subscribeToTypingPresence(conv.id);
      }
    });
    
    // Clean up channels for conversations that no longer exist
    const currentConvIds = new Set(conversations.map(c => c.id));
    Object.keys(typingHook.presenceChannelsRef.current).forEach(convId => {
      if (!currentConvIds.has(convId)) {
        supabase.removeChannel(typingHook.presenceChannelsRef.current[convId]);
        delete typingHook.presenceChannelsRef.current[convId];
      }
    });
    
    return () => {
      Object.keys(typingHook.presenceChannelsRef.current).forEach(convId => {
        supabase.removeChannel(typingHook.presenceChannelsRef.current[convId]);
      });
      typingHook.presenceChannelsRef.current = {};
    };
  }, [conversations, user?.id]);

  // Selected conversation load effect
  useEffect(() => {
    if (selectedConversation && user) {
      currentConversationRef.current = selectedConversation;
      
      const loadConversation = async () => {
        let convDetails = conversations.find(c => c.id === selectedConversation);
        
        if (!convDetails) {
          const newConv = await convHook.fetchSingleConversation(selectedConversation);
          if (newConv) {
            convDetails = newConv;
            setConversations(prev => [newConv, ...prev.filter(c => c.id !== newConv.id)]);
          }
        }
        
        if (convDetails) {
          convHook.setSelectedConversationDetails(convDetails);
        }
        
        await msgHook.fetchMessages(selectedConversation);
        await msgHook.markMessagesAsRead(selectedConversation);
        await msgHook.fetchReactions(selectedConversation);
        
        requestAnimationFrame(() => {
          scrollToBottom(true);
        });
      };
      loadConversation();
      realtimeHook.subscribeToConversationMessages(selectedConversation);
      realtimeHook.subscribeToReactions(selectedConversation);
    } else {
      convHook.setSelectedConversationDetails(null);
      currentConversationRef.current = null;
    }
    return () => {
      if (realtimeHook.messageChannelRef.current) {
        supabase.removeChannel(realtimeHook.messageChannelRef.current);
      }
      if (realtimeHook.reactionChannelRef.current) {
        supabase.removeChannel(realtimeHook.reactionChannelRef.current);
      }
    };
  }, [selectedConversation, user?.id]);
  
  // Fix 3: Keep selectedConversationRef in sync and clear typing on switch
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
    setIsAwaitingJudeResponse(false);
    setTypewriterMessageId(null);
  }, [selectedConversation]);

  // Keep selectedConversationDetails in sync with conversations list updates
  useEffect(() => {
    if (selectedConversation && convHook.selectedConversationDetails) {
      const updatedConv = conversations.find(c => c.id === selectedConversation);
      if (updatedConv) {
        convHook.setSelectedConversationDetails(prev => ({
          ...prev!,
          ...updatedConv,
          otherUser: updatedConv.otherUser || prev?.otherUser,
          group: updatedConv.group || prev?.group,
        }));
      }
    }
  }, [conversations, selectedConversation]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
    previousMessagesCount.current = messages.length;
  }, [messages]);

  // Periodically refresh to update "last seen" times (30s interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setOfflineLastSeenTimes(prev => ({ ...prev }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // === Functions that stay in parent ===

  const scrollToBottom = useCallback((force = false) => {
    const container = messagesContainerRef.current;
    if (!container) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (force || isNearBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  const checkUser = async () => {
    if (isVisitor) {
      convHook.setIsLoadingConversations(false);
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth/login");
        return;
      }
      setUser(user);
    } catch (error) {
      logger.error('checkUser failed:', error);
      convHook.setIsLoadingConversations(false);
    }
  };

  // sendMessage stays in parent — heavy cross-cutting deps (media, typing, sounds, optimistic updates, Jude)
  const sendMessage = async () => {
    if ((!newMessage.trim() && !mediaHook.selectedMediaFile) || !selectedConversation || !user) return;

    const messageContent = newMessage.trim();
    const currentMediaFile = mediaHook.selectedMediaFile;
    const currentMediaType = mediaHook.mediaType;
    const currentMediaPreview = mediaHook.mediaPreview;
    const currentReplyingTo = replyingTo;
    
    let displayContent = messageContent;
    if (!displayContent && currentMediaType) {
      if (currentMediaType === 'image') displayContent = '📷 Image';
      else if (currentMediaType === 'video') displayContent = '🎥 Vidéo';
      else if (currentMediaType === 'document') displayContent = `📄 ${currentMediaFile?.name || 'Document'}`;
    }

    // 1. CREATE OPTIMISTIC MESSAGE
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      content: displayContent || '',
      sender_id: user.id,
      created_at: new Date().toISOString(),
      read: false,
      conversation_id: selectedConversation,
      profile: msgHook.cachedUserProfile || undefined,
      replied_to: currentReplyingTo || undefined,
      replied_to_id: currentReplyingTo?.id || null,
      image_url: currentMediaType === 'image' ? currentMediaPreview : null,
      video_url: currentMediaType === 'video' ? currentMediaPreview : null,
    };

    // 2. INSTANT UI UPDATE
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
    setReplyingTo(null);
    mediaHook.clearMedia();
    playSendSound();
    
    requestAnimationFrame(() => {
      setTimeout(() => scrollToBottom(true), 50);
    });
    
    typingHook.sendTypingStatus(false);

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

    // 3. BACKGROUND DATABASE OPERATIONS
    (async () => {
      try {
        let imageUrl = null;
        let videoUrl = null;
        let documentUrl: string | null = null;
        let documentName: string | null = null;
        let thumbnailUrl: string | null = null;

        const { data: participation } = await supabase
          .from("conversation_participants")
          .select("id, visible_from_message_id")
          .eq("conversation_id", selectedConversation)
          .eq("user_id", user.id)
          .maybeSingle();

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
          const timestamp = Date.now();
          
          if (currentMediaType === 'image') {
            const [thumbBlob] = await Promise.all([
              generateImageThumbnail(currentMediaFile).catch(() => null),
            ]);
            
            const fullFileName = `${user.id}/${timestamp}-full.jpg`;
            const { error: uploadError } = await supabase.storage
              .from('message-media')
              .upload(fullFileName, currentMediaFile);

            if (uploadError) {
              logger.error('Image upload error:', uploadError);
              setMessages(prev => prev.filter(m => m.id !== optimisticId));
              toast({ title: "Erreur", description: "Impossible de télécharger l'image", variant: "destructive" });
              return;
            }

            const { data: { publicUrl: fullUrl } } = supabase.storage.from('message-media').getPublicUrl(fullFileName);
            imageUrl = fullUrl;
            
            if (thumbBlob) {
              const thumbFileName = `${user.id}/${timestamp}-thumb.jpg`;
              const thumbFile = new File([thumbBlob], 'thumb.jpg', { type: 'image/jpeg' });
              const { error: thumbErr } = await supabase.storage
                .from('message-media')
                .upload(thumbFileName, thumbFile);
              
              if (!thumbErr) {
                const { data: { publicUrl: thumbUrl } } = supabase.storage.from('message-media').getPublicUrl(thumbFileName);
                thumbnailUrl = thumbUrl;
              }
            }
          } else if (currentMediaType === 'video') {
            const videoFileName = `${user.id}/${timestamp}.${currentMediaFile.name.split('.').pop()}`;
            mediaHook.setUploadProgress(0);
            
            const { error: uploadError } = await uploadWithProgress(
              'message-media',
              videoFileName,
              currentMediaFile,
              (progress) => mediaHook.setUploadProgress(progress.progress)
            );
            
            mediaHook.setUploadProgress(null);

            if (uploadError) {
              logger.error('Video upload error:', uploadError);
              setMessages(prev => prev.filter(m => m.id !== optimisticId));
              toast({ title: "Erreur", description: "Impossible de télécharger la vidéo", variant: "destructive" });
              return;
            }

            const { data: { publicUrl } } = supabase.storage.from('message-media').getPublicUrl(videoFileName);
            videoUrl = publicUrl;
          } else if (currentMediaType === 'document') {
            const docFileName = `${user.id}/${timestamp}.${currentMediaFile.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage
              .from('message-media')
              .upload(docFileName, currentMediaFile);

            if (uploadError) {
              logger.error('Document upload error:', uploadError);
              setMessages(prev => prev.filter(m => m.id !== optimisticId));
              toast({ title: "Erreur", description: "Impossible de télécharger le document", variant: "destructive" });
              return;
            }

            const { data: { publicUrl } } = supabase.storage.from('message-media').getPublicUrl(docFileName);
            documentUrl = publicUrl;
            documentName = currentMediaFile.name;
          }
        }

        // Insert message to database
        const { data: insertedMessage, error } = await supabase.from("messages").insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: displayContent || '',
          image_url: imageUrl,
          video_url: videoUrl,
          document_url: documentUrl,
          document_name: documentName,
          thumbnail_url: thumbnailUrl,
          read: false,
          replied_to_id: currentReplyingTo?.id || null,
        }).select('id').single();

        if (error) {
          logger.error('Message insert error:', error);
          setMessages(prev => prev.filter(m => m.id !== optimisticId));
          toast({ title: "Erreur", description: "Impossible d'envoyer le message", variant: "destructive" });
          return;
        }

        // Update optimistic message with real ID and URLs
        setMessages(prev => prev.map(m => 
          m.id === optimisticId 
            ? { ...m, id: insertedMessage.id, image_url: imageUrl, video_url: videoUrl, document_url: documentUrl, document_name: documentName, thumbnail_url: thumbnailUrl }
            : m
        ));

        // 4. FIRE-AND-FORGET NOTIFICATIONS
        const conversation = conversations.find(c => c.id === selectedConversation);
        const senderName = msgHook.cachedUserProfile?.nickname || msgHook.cachedUserProfile?.full_name || 'Élève';
        
        if (conversation?.otherUser?.user_id === JUDE_USER_ID) {
          setIsAwaitingJudeResponse(true);
          
          supabase.functions.invoke('eric-chat', {
            body: { 
              conversationId: selectedConversation,
              userMessage: messageContent,
              // userNickname intentionally omitted — eric-chat reads from DB
              // to prevent stale-cache name divergence (Jude "two people" bug)
            }
          }).catch(err => {
            logger.error('Jude chat error:', err);
            setIsAwaitingJudeResponse(false);
          });
        } else if (conversation?.otherUser) {
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
        setMessages(prev => prev.filter(m => m.id !== optimisticId));
        toast({ title: "Erreur", description: "Impossible d'envoyer le message", variant: "destructive" });
      }
    })();
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
    
    if (messageDate.getTime() === today.getTime()) {
      return `Dernière connexion à ${time}`;
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.getTime() === yesterday.getTime()) {
      return `Dernière connexion hier à ${time}`;
    }
    
    const dateStr = date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
    return `Dernière connexion le ${dateStr} à ${time}`;
  };

  // === JSX ===
  return (
    <div 
      className="relative h-dvh bg-background overflow-hidden grid grid-cols-1 md:grid-cols-[380px_1fr] lg:grid-cols-[420px_1fr]"
      style={{ '--time-accent': accentColor } as React.CSSProperties}
    >
      {/* Visitor Overlay */}
      {isVisitor && <VisitorCommunityOverlay />}
      
      {/* Conversations List */}
      <div data-tour="community-list" className="h-full overflow-hidden">
      {convHook.loadingTimedOut && convHook.isLoadingConversations ? (
        <div className="flex items-center justify-center h-full p-4">
          <ErrorState
            message="Impossible de charger les conversations"
            onRetry={() => {
              convHook.setLoadingTimedOut(false);
              convHook.setIsLoadingConversations(true);
              checkUser();
            }}
          />
        </div>
      ) : (
      <ConversationSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        isLoading={convHook.isLoadingConversations}
        isVisitor={isVisitor}
        typingUsers={typingHook.typingUsers}
        onlineUsers={onlineUsers}
        shouldShowGlow={shouldShowGlow}
        shouldShowRipples={shouldShowRipples}
        onSelectConversation={setSelectedConversation}
        onDeleteConversation={(id) => setDeleteConversationId(id)}
        onGroupInfoClick={(groupId) => {
          setSelectedGroupId(groupId);
          setShowGroupInfo(true);
        }}
        onCreateGroup={() => setShowCreateGroup(true)}
        onSearch={() => navigate("/user-search")}
        onBack={() => navigate("/dashboard")}
        formatTime={formatTime}
      />
      )}
      </div>

      {/* Messages View */}
      <section
        className={`${
          selectedConversation
            ? "absolute inset-x-0 top-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] flex md:relative md:inset-auto md:bottom-auto md:pb-16 lg:pb-0 md:flex md:h-full"
            : "hidden md:flex h-full"
        } flex-col bg-background overflow-hidden`}
      >
        {selectedConversation ? (
          (() => {
            const currentConv = convHook.selectedConversationDetails ?? conversations.find(c => c.id === selectedConversation);
            const isGroup = currentConv?.is_group;
            const otherUserId = currentConv?.otherUser?.user_id;
            
            return (
              <ChatLayout
                ref={messagesContainerRef}
                backgroundStyle={chatBackgroundStyle}
                header={
                  <ChatViewHeader
                    conversation={currentConv}
                    isOnline={otherUserId ? onlineUsers.has(otherUserId) : false}
                    lastSeen={otherUserId ? offlineLastSeenTimes[otherUserId] : undefined}
                    onBack={() => setSelectedConversation(null)}
                    onDelete={() => setDeleteConversationId(selectedConversation)}
                    onGroupInfoClick={(groupId) => {
                      setSelectedGroupId(groupId);
                      setShowGroupInfo(true);
                    }}
                    formatLastSeen={formatLastSeen}
                    showRipple={shouldShowRipples}
                  />
                }
                banner={isGroup ? <JudeBanner isVisible={true} /> : undefined}
                footer={
                  <div className="relative">
                    {/* Video upload progress indicator for 3G users */}
                    {mediaHook.uploadProgress !== null && (
                      <div className="px-4 py-2 bg-muted/50 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Envoi vidéo: {mediaHook.uploadProgress}%</span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${mediaHook.uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <ChatComposer
                      newMessage={newMessage}
                      isSending={isSending}
                      showEmojiPicker={showEmojiPicker}
                      mediaPreview={mediaHook.mediaPreview}
                      mediaType={mediaHook.mediaType}
                      replyingTo={replyingTo}
                      isJudeConversation={isJudeConversation}
                      hasMediaFile={!!mediaHook.selectedMediaFile}
                      onSend={sendMessage}
                      onEmojiPickerChange={setShowEmojiPicker}
                      onEmojiSelect={(emoji) => setNewMessage((prev) => prev + emoji)}
                      onMediaSelect={mediaHook.handleMediaSelect}
                      onClearMedia={mediaHook.clearMedia}
                      onCancelReply={() => setReplyingTo(null)}
                      onTyping={(value) => typingHook.handleTyping(value, setNewMessage)}
                    />
                  </div>
                }
              >
                <div className="p-4">
                  <div className="space-y-4 pb-4 max-w-full">
                    {messages.map((message, index) => {
                      const isOwn = message.sender_id === user?.id;
                      const isSystemMsg = message.content.includes('a rejoint le groupe') || 
                        message.content.includes('a quitté le groupe') ||
                        message.content.includes('Bienvenue dans');
                      
                      if (isSystemMsg) {
                        return <SystemMessage key={message.id} content={message.content} />;
                      }
                      
                      return (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isOwn={isOwn}
                          userId={user?.id}
                          reactions={reactions[message.id] || []}
                          editingMessageId={msgHook.editingMessageId}
                          editedContent={msgHook.editedContent}
                          showReactionPicker={msgHook.showReactionPicker}
                          onSetReplyingTo={setReplyingTo}
                          onEditMessage={msgHook.handleEditMessage}
                          onCancelEdit={msgHook.handleCancelEdit}
                          onSaveEdit={msgHook.handleSaveEdit}
                          onSetEditedContent={msgHook.setEditedContent}
                          onDeleteMessage={msgHook.handleDeleteMessage}
                          onToggleReaction={msgHook.toggleReaction}
                          onSetShowReactionPicker={msgHook.setShowReactionPicker}
                          onDownloadMedia={mediaHook.handleDownloadMedia}
                          onSetFullSizeImage={setFullSizeImage}
                          formatTime={formatTime}
                          messageIndex={index}
                          shouldAnimate={shouldStaggerMessages}
                          shouldShowFloatingReactions={shouldShowFloatingReactions}
                          isTypewriting={message.id === typewriterMessageId}
                          onTypewriterComplete={() => setTypewriterMessageId(null)}
                        />
                      );
                    })}
                    
                    {/* Jude AI Thinking Indicator */}
                    {isJudeConversation && isAwaitingJudeResponse && (
                      <JudeTypingIndicator isThinking={true} />
                    )}
                    
                    {/* Regular User Typing Indicators */}
                    {(() => {
                      if (!selectedConversation) return null;
                      
                      const conversationTypingUsers = typingHook.typingUsers[selectedConversation] || {};
                      
                      return Object.entries(conversationTypingUsers).map(([key, value]) => {
                        const presence = Array.isArray(value) ? value[0] : value;
                        if (presence?.typing && presence?.user_id !== user?.id) {
                          const conversation = convHook.selectedConversationDetails ?? conversations.find(c => c.id === selectedConversation);
                          
                          let typingUserProfile = conversation?.otherUser;
                          if (conversation?.is_group) {
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
              </ChatLayout>
            );
          })()
        ) : (
          <div className="hidden md:flex items-center justify-center h-full">
            <p className="text-foreground/70 font-medium bg-background/80 px-4 py-2 rounded-lg backdrop-blur-sm">
              Sélectionnez une conversation
            </p>
          </div>
        )}
      </section>
      
      {/* Create Group Dialog */}
      {!isVisitor && (
        <CreateGroupDialog
          open={showCreateGroup}
          onOpenChange={setShowCreateGroup}
          followers={convHook.followers}
          onGroupCreated={async (createdConversationId) => {
            await convHook.fetchConversations();
            setShowCreateGroup(false);
            setSelectedConversation(createdConversationId);
            navigate(`/community?conversation=${createdConversationId}`);
            await msgHook.fetchMessages(createdConversationId);
          }}
        />
      )}
      
      {/* Delete Conversation Confirmation Dialog */}
      <AlertDialog open={!!deleteConversationId} onOpenChange={(open) => {
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
                if (deleteConversationId) convHook.handleDeleteConversation(deleteConversationId);
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
            convHook.fetchConversations();
          }}
          onDeleteGroup={() => {
            setSelectedConversation(null);
            setShowGroupInfo(false);
            convHook.fetchConversations();
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
