import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AssetKind, AssetStatus, LessonAsset, ValidationReport } from '../validation/validation-report.types';
import type { QuizPayload } from '../validation/quiz.schema';
import type { ActivitiesPayload } from '../validation/activities.schema';
import type { Json } from '@/integrations/supabase/types';

// Helper to convert database row to typed LessonAsset
function toTypedLessonAsset(row: {
  id: string;
  lesson_id: string;
  kind: string;
  schema_version: number;
  payload_json: Json;
  status: string;
  validation_report_json: Json | null;
  generated_by: string | null;
  created_at: string;
  updated_at: string;
}): LessonAsset {
  return {
    id: row.id,
    lesson_id: row.lesson_id,
    kind: row.kind as AssetKind,
    schema_version: row.schema_version,
    payload_json: row.payload_json,
    status: row.status as AssetStatus,
    validation_report_json: row.validation_report_json as unknown as ValidationReport | null,
    generated_by: row.generated_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetch a specific lesson asset by lesson ID and kind
 */
async function fetchLessonAsset(
  lessonId: string, 
  kind: AssetKind
): Promise<LessonAsset | null> {
  const { data, error } = await supabase
    .from('lesson_assets')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('kind', kind)
    .order('schema_version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching lesson asset:', error);
    return null;
  }

  return data ? toTypedLessonAsset(data) : null;
}

/**
 * Fetch all assets for a lesson
 */
async function fetchLessonAssets(lessonId: string): Promise<LessonAsset[]> {
  const { data, error } = await supabase
    .from('lesson_assets')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lesson assets:', error);
    return [];
  }

  return (data || []).map(toTypedLessonAsset);
}

/**
 * Hook to fetch a lesson's quiz asset
 */
export function useLessonQuizAsset(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson-asset', lessonId, 'quiz_final'],
    queryFn: () => fetchLessonAsset(lessonId!, 'quiz_final'),
    enabled: !!lessonId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a lesson's activities asset
 */
export function useLessonActivitiesAsset(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson-asset', lessonId, 'activities'],
    queryFn: () => fetchLessonAsset(lessonId!, 'activities'),
    enabled: !!lessonId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch all assets for a lesson
 */
export function useLessonAssets(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson-assets', lessonId],
    queryFn: () => fetchLessonAssets(lessonId!),
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create or update a lesson asset
 */
interface SaveAssetParams {
  lessonId: string;
  kind: AssetKind;
  payload: QuizPayload | ActivitiesPayload;
  status?: AssetStatus;
  validationReport?: ValidationReport;
}

async function saveLesonAsset(params: SaveAssetParams): Promise<LessonAsset | null> {
  const { lessonId, kind, payload, status = 'draft', validationReport } = params;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check for existing asset
  const { data: existing } = await supabase
    .from('lesson_assets')
    .select('id, schema_version')
    .eq('lesson_id', lessonId)
    .eq('kind', kind)
    .order('schema_version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const schemaVersion = existing ? existing.schema_version + 1 : 1;

  // Insert new version - use type assertion to handle Supabase strict typing
  const insertData = {
    lesson_id: lessonId,
    kind: kind,
    schema_version: schemaVersion,
    payload_json: payload as unknown as Json,
    status: status,
    validation_report_json: validationReport ? (validationReport as unknown as Json) : null,
    generated_by: user?.id || null,
  };

  const { data, error } = await supabase
    .from('lesson_assets')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error saving lesson asset:', error);
    throw error;
  }

  return toTypedLessonAsset(data);
}

/**
 * Hook to save a lesson asset
 */
export function useSaveLessonAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveLesonAsset,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['lesson-asset', variables.lessonId, variables.kind] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['lesson-assets', variables.lessonId] 
      });
    },
  });
}

/**
 * Update asset status
 */
interface UpdateStatusParams {
  assetId: string;
  status: AssetStatus;
  validationReport?: ValidationReport;
}

async function updateAssetStatus(params: UpdateStatusParams): Promise<void> {
  const { assetId, status, validationReport } = params;

  const updateData: Record<string, unknown> = { status };
  if (validationReport) {
    updateData.validation_report_json = validationReport;
  }

  const { error } = await supabase
    .from('lesson_assets')
    .update(updateData)
    .eq('id', assetId);

  if (error) {
    console.error('Error updating asset status:', error);
    throw error;
  }
}

/**
 * Hook to update asset status
 */
export function useUpdateAssetStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAssetStatus,
    onSuccess: () => {
      // Invalidate all lesson-asset queries
      queryClient.invalidateQueries({ queryKey: ['lesson-asset'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-assets'] });
    },
  });
}
