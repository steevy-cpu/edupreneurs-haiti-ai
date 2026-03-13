/**
 * @file useTypingIndicators — Manages typing presence channels and status broadcasting.
 * Owns presenceChannelsRef and typingTimeoutRef internally.
 * selectedConversationRef is passed from parent to avoid stale closures.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

interface UseTypingIndicatorsParams {
  /** Current authenticated user */
  user: any;
  /** Ref to currently selected conversation — owned by parent, passed here to avoid stale closures */
  selectedConversationRef: React.MutableRefObject<string | null>;
}

export interface UseTypingIndicatorsReturn {
  typingUsers: Record<string, Record<string, any>>;
  presenceChannelsRef: React.MutableRefObject<Record<string, any>>;
  subscribeToTypingPresence: (conversationId: string) => void;
  sendTypingStatus: (isTyping: boolean) => Promise<void>;
  /** Typing handler that also updates message text via onMessageChange callback */
  handleTyping: (value: string, onMessageChange: (value: string) => void) => void;
}

export function useTypingIndicators({
  user,
  selectedConversationRef,
}: UseTypingIndicatorsParams): UseTypingIndicatorsReturn {
  const [typingUsers, setTypingUsers] = useState<Record<string, Record<string, any>>>({});
  const presenceChannelsRef = useRef<Record<string, any>>({});
  const typingTimeoutRef = useRef<any>(null);

  // Subscribe to typing presence for a specific conversation
  const subscribeToTypingPresence = useCallback((conversationId: string) => {
    if (!user) return;

    // Remove existing channel for this conversation before re-subscribing
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
  }, [user]);

  // Send typing status to the currently selected conversation's presence channel
  const sendTypingStatus = useCallback(async (isTyping: boolean) => {
    const selectedConv = selectedConversationRef.current;
    if (!selectedConv || !presenceChannelsRef.current[selectedConv] || !user) {
      return;
    }

    try {
      await presenceChannelsRef.current[selectedConv].track({
        user_id: user.id,
        typing: isTyping,
      });
    } catch (error) {
      logger.error('Error sending typing status:', error);
    }
  }, [user, selectedConversationRef]);

  // Fix 3: handleTyping with stale closure prevention — receives onMessageChange callback
  const handleTyping = useCallback((value: string, onMessageChange: (value: string) => void) => {
    onMessageChange(value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status
    if (value.trim()) {
      sendTypingStatus(true);

      // Capture current conversation for timeout callback
      const conversationAtCall = selectedConversationRef.current;

      // Auto-clear typing status after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        // Only send if still in the same conversation
        if (selectedConversationRef.current === conversationAtCall) {
          sendTypingStatus(false);
        }
      }, 3000);
    } else {
      sendTypingStatus(false);
    }
  }, [sendTypingStatus, selectedConversationRef]);

  // Fix 5: Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers,
    presenceChannelsRef,
    subscribeToTypingPresence,
    sendTypingStatus,
    handleTyping,
  };
}
