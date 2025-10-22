import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LessonVersion {
  id: string;
  lesson_id: string;
  version_number: number;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  grade_level: string;
  created_by: string;
  created_at: string;
  is_current: boolean;
  profiles?: {
    full_name?: string;
    nickname?: string;
  } | null;
}

export const useVersionControl = (lessonId?: string) => {
  const [versions, setVersions] = useState<LessonVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchVersions();
    }
  }, [lessonId]);

  const fetchVersions = async () => {
    if (!lessonId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lesson_versions')
        .select(`
          *,
          profiles!created_by(full_name, nickname)
        `)
        .eq('lesson_id', lessonId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions((data || []) as LessonVersion[]);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Erreur lors du chargement des versions');
    } finally {
      setIsLoading(false);
    }
  };

  const restoreVersion = async (versionId: string) => {
    try {
      // Get the version to restore
      const version = versions.find(v => v.id === versionId);
      if (!version) throw new Error('Version not found');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update the lesson with the version's content
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          title: version.title,
          slug: version.slug,
          objectif: version.objectif,
          introduction: version.introduction,
          contenu: version.contenu,
          exemples_exercices: version.exemples_exercices,
          updated_at: new Date().toISOString(),
          created_by: user.id,
        })
        .eq('id', lessonId);

      if (updateError) throw updateError;

      toast.success(`Version ${version.version_number} restaurée avec succès`);
      return true;
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Erreur lors de la restauration');
      return false;
    }
  };

  const compareVersions = (version1: LessonVersion, version2: LessonVersion) => {
    const changes: string[] = [];

    if (version1.title !== version2.title) changes.push('Titre');
    if (version1.objectif !== version2.objectif) changes.push('Objectif');
    if (version1.introduction !== version2.introduction) changes.push('Introduction');
    if (version1.contenu !== version2.contenu) changes.push('Contenu');
    if (version1.exemples_exercices !== version2.exemples_exercices) changes.push('Exercices');

    return changes;
  };

  return {
    versions,
    isLoading,
    fetchVersions,
    restoreVersion,
    compareVersions,
  };
};
