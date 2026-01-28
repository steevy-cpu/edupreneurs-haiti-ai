import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LessonNotesTabProps {
  lessonSlug: string;
  onNotesChange?: (hasNotes: boolean) => void;
}

/**
 * Lazy-loading Notes Tab
 * Fetches user notes only when tab is active
 */
export function LessonNotesTab({ lessonSlug, onNotesChange }: LessonNotesTabProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [lessonSlug]);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('lesson_notes')
        .select('notes')
        .eq('lesson_id', lessonSlug)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.notes) {
        setNotes(data.notes);
        onNotesChange?.(true);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [lessonSlug, onNotesChange]);

  const saveNotes = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour sauvegarder des notes",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          lesson_id: lessonSlug,
          user_id: user.id,
          notes: notes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'lesson_id,user_id'
        });

      if (error) throw error;

      onNotesChange?.(notes.length > 0);
      toast({
        title: "Succès",
        description: "Notes sauvegardées avec succès",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            Mes Notes Personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          Mes Notes Personnelles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-6">
        <Textarea
          placeholder="Écris tes notes ici..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[200px] sm:min-h-[300px] resize-none text-sm sm:text-base"
        />
        <Button 
          onClick={saveNotes} 
          className="w-full"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          )}
          Sauvegarder mes notes
        </Button>
      </CardContent>
    </Card>
  );
}
