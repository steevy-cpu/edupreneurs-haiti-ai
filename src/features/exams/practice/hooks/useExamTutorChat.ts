/**
 * useExamTutorChat - Persist and manage Jude chat messages
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { toast } from 'sonner';
import type { ContentBlock } from '../../types/exam.types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  blocks?: ContentBlock[];
  timestamp: Date;
}

// Type for parsing JSON blocks safely
function parseBlocks(blocks: unknown): ContentBlock[] | undefined {
  if (!blocks || !Array.isArray(blocks)) return undefined;
  return blocks as ContentBlock[];
}

interface UseExamTutorChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  saveUserMessage: (content: string) => Promise<ChatMessage | null>;
  saveAssistantMessage: (content: string, blocks?: ContentBlock[]) => Promise<ChatMessage | null>;
  deleteAllMessages: () => Promise<boolean>;
  addOptimisticMessage: (message: ChatMessage) => void;
  replaceOptimisticMessage: (tempId: string, realMessage: ChatMessage) => void;
}

export function useExamTutorChat(
  sessionId: string,
  exerciseId: string
): UseExamTutorChatReturn {
  const { user } = useSessionAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing messages when session/exercise changes
  useEffect(() => {
    if (!sessionId || !exerciseId || !user?.id) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadMessages() {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('exam_tutor_chats')
          .select('*')
          .eq('session_id', sessionId)
          .eq('exercise_id', exerciseId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (isMounted && data) {
          const loaded: ChatMessage[] = data.map((msg) => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            blocks: parseBlocks(msg.blocks),
            timestamp: new Date(msg.created_at),
          }));
          setMessages(loaded);
        }
      } catch (error) {
        console.error('[useExamTutorChat] Load error:', error);
        if (isMounted) {
          setMessages([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [sessionId, exerciseId, user?.id]);

  // Add optimistic message (for immediate UI update)
  const addOptimisticMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Replace optimistic message with real one from DB
  const replaceOptimisticMessage = useCallback((tempId: string, realMessage: ChatMessage) => {
    setMessages(prev => prev.map(msg => 
      msg.id === tempId ? realMessage : msg
    ));
  }, []);

  // Save user message to database
  const saveUserMessage = useCallback(async (content: string): Promise<ChatMessage | null> => {
    if (!user?.id || !sessionId || !exerciseId) return null;

    try {
      const { data, error } = await supabase
        .from('exam_tutor_chats')
        .insert({
          session_id: sessionId,
          exercise_id: exerciseId,
          user_id: user.id,
          role: 'user',
          content,
        })
        .select()
        .single();

      if (error) throw error;

      const message: ChatMessage = {
        id: data.id,
        role: 'user',
        content: data.content,
        timestamp: new Date(data.created_at),
      };

      return message;
    } catch (error) {
      console.error('[useExamTutorChat] Save user message error:', error);
      toast.error('Erreur lors de la sauvegarde du message');
      return null;
    }
  }, [sessionId, exerciseId, user?.id]);

  // Save assistant message to database
  const saveAssistantMessage = useCallback(async (
    content: string,
    blocks?: ContentBlock[]
  ): Promise<ChatMessage | null> => {
    if (!user?.id || !sessionId || !exerciseId) return null;

    try {
      const { data, error } = await supabase
        .from('exam_tutor_chats')
        .insert({
          session_id: sessionId,
          exercise_id: exerciseId,
          user_id: user.id,
          role: 'assistant',
          content,
          blocks: blocks as unknown as null,
        })
        .select()
        .single();

      if (error) throw error;

      const message: ChatMessage = {
        id: data.id,
        role: 'assistant',
        content: data.content,
        blocks: parseBlocks(data.blocks),
        timestamp: new Date(data.created_at),
      };

      return message;
    } catch (error) {
      console.error('[useExamTutorChat] Save assistant message error:', error);
      toast.error('Erreur lors de la sauvegarde de la réponse');
      return null;
    }
  }, [sessionId, exerciseId, user?.id]);

  // Delete all messages for this exercise
  const deleteAllMessages = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !sessionId || !exerciseId) return false;

    try {
      const { error } = await supabase
        .from('exam_tutor_chats')
        .delete()
        .eq('session_id', sessionId)
        .eq('exercise_id', exerciseId)
        .eq('user_id', user.id);

      if (error) throw error;

      setMessages([]);
      toast.success('Conversation supprimée');
      return true;
    } catch (error) {
      console.error('[useExamTutorChat] Delete error:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, [sessionId, exerciseId, user?.id]);

  return {
    messages,
    isLoading,
    saveUserMessage,
    saveAssistantMessage,
    deleteAllMessages,
    addOptimisticMessage,
    replaceOptimisticMessage,
  };
}
