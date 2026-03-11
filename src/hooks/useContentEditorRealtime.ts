import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription, usePresenceSubscription } from './useRealtimeSubscription';
import { toast } from 'sonner';

interface EditorPresence {
  user_id: string;
  nickname: string;
  avatar_url?: string;
  editing_lesson_id?: string;
  online_at: string;
}

export const useContentEditorRealtime = (userId: string | undefined, lessonId?: string) => {
  const [activeEditors, setActiveEditors] = useState<EditorPresence[]>([]);
  const [hasConflict, setHasConflict] = useState(false);

  // Subscribe to lesson updates
  useRealtimeSubscription({
    table: 'lessons',
    event: 'UPDATE',
    filter: lessonId ? `id=eq.${lessonId}` : undefined,
    enabled: !!lessonId,
    callback: (payload) => {
      // Check if the update was made by someone else
      const updatedBy = payload.new?.created_by;
      if (updatedBy && updatedBy !== userId) {
        toast.info('Le contenu a été modifié par un autre éditeur', {
          description: 'Rechargez pour voir les dernières modifications',
          action: {
            label: 'Recharger',
            onClick: () => window.location.reload(),
          },
        });
        setHasConflict(true);
      }
    },
  });

  // Subscribe to change log updates
  useRealtimeSubscription({
    table: 'content_change_log',
    event: 'INSERT',
    enabled: true,
    callback: () => {},
  });

  // Track editor presence with reactive state updates (no polling!)
  const { updatePresence, presenceState, isReady } = usePresenceSubscription(
    'content-editor',
    userId || '',
    !!userId
  );

  // Update presence with current lesson being edited
  useEffect(() => {
    if (userId && lessonId) {
      updatePresence({
        editing_lesson_id: lessonId,
        online_at: new Date().toISOString(),
      });
    }
  }, [userId, lessonId, updatePresence]);

  // Update active editors reactively from presence state (event-driven, not polling)
  useEffect(() => {
    if (!isReady) return;
    
    const editors: EditorPresence[] = [];

    Object.values(presenceState).forEach((presences: any) => {
      if (Array.isArray(presences)) {
        presences.forEach((presence: any) => {
          if (presence.user_id !== userId) {
            editors.push(presence);
          }
        });
      }
    });

    setActiveEditors(editors);

    // Check if anyone else is editing the same lesson
    const editingConflict = editors.some(
      (editor) => editor.editing_lesson_id === lessonId
    );
    setHasConflict(editingConflict);
  }, [presenceState, userId, lessonId, isReady]);

  const getEditorsForLesson = useCallback(
    (targetLessonId: string) => {
      return activeEditors.filter(
        (editor) => editor.editing_lesson_id === targetLessonId
      );
    },
    [activeEditors]
  );

  return {
    activeEditors,
    hasConflict,
    getEditorsForLesson,
  };
};
