/**
 * Exam Save Utilities
 * Shared logic for saving and updating exams
 */
import { supabase } from "@/integrations/supabase/client";

export interface ParsedExercise {
  exerciseNumber: number;
  exerciseType: string;
  questionText: string;
  options: any;
  correctAnswer: string | null;
  explanation: string | null;
  points: number;
  concept: string;
  promptBlocks?: any;
  optionsJson?: any;
  answerJson?: any;
  explanationBlocks?: any;
}

export interface ReferenceText {
  section?: string;
  title?: string;
  text: string;
}

export interface ParsedPreview {
  title: string;
  totalExercises: number;
  totalPoints: number;
  exercises: ParsedExercise[];
  referenceTexts?: ReferenceText[];
}

export interface ExamFormData {
  track: '9AF' | 'NS4';
  subject: string;
  year: number;
  pdfUrl: string;
  series?: string;
  session?: string;
  isModelExam?: boolean;
}

/**
 * Save a new exam with its exercises
 */
export async function saveExamWithExercises(
  formData: ExamFormData,
  preview: ParsedPreview
): Promise<{ examId: string; exerciseCount: number; isUpdate: boolean }> {
  const { track, subject, year, pdfUrl, series, session, isModelExam } = formData;
  
  // Check if exam already exists
  let query = supabase
    .from("official_exams")
    .select("id, version_number")
    .eq("subject", subject)
    .eq("year", year)
    .eq("grade_level", track);
  
  if (track === 'NS4') {
    query = query
      .eq("series", series || null)
      .eq("session", session || 'principale')
      .eq("is_model_exam", isModelExam || false);
  }
  
  const { data: existingExam } = await query
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  let examId: string;
  const isUpdate = !!existingExam;
  const nextVersion = existingExam ? ((existingExam.version_number as number) || 1) + 1 : 1;

  // Build title
  let examTitle = preview.title;
  if (!examTitle) {
    if (track === '9AF') {
      examTitle = `Examen officiel de ${subject} ${year} - 9AF`;
    } else {
      examTitle = isModelExam 
        ? `Modèle - ${subject} ${series}` 
        : `${subject} ${series} ${year} ${session === "rattrapage" ? "(Rattrapage)" : ""}`;
    }
  }

  // Build exam data
  const examData: any = {
    title: examTitle,
    subject,
    year,
    grade_level: track,
    track,
    subject_slug: subject.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    total_exercises: preview.totalExercises || preview.exercises.length,
    total_points: preview.totalPoints || 100,
    pdf_url: pdfUrl,
    reference_texts: preview.referenceTexts || [],
    version: nextVersion,
  };

  // Add NS4-specific fields
  if (track === 'NS4') {
    examData.series = series;
    examData.session = session || 'principale';
    examData.is_model_exam = isModelExam || false;
    examData.exam_type = isModelExam ? 'model' : (session === 'rattrapage' ? 'rattrapage' : 'official');
  } else {
    examData.exam_type = 'official';
  }

  if (existingExam && track === '9AF') {
    // Update existing 9AF exam
    const { error: updateError } = await supabase
      .from("official_exams")
      .update(examData)
      .eq("id", existingExam.id);

    if (updateError) throw updateError;

    // Delete old exercises
    await supabase
      .from("exam_exercises")
      .delete()
      .eq("exam_id", existingExam.id);

    examId = existingExam.id;
  } else {
    // Create new exam (NS4 always creates new version, 9AF creates if not exists)
    const { data: newExam, error: examError } = await supabase
      .from("official_exams")
      .insert(examData)
      .select()
      .single();

    if (examError) throw examError;
    examId = newExam.id;
  }

  // Insert exercises (deduplicate by exerciseNumber)
  const uniqueExercises = preview.exercises.reduce((acc: ParsedExercise[], ex) => {
    if (!acc.some((e) => e.exerciseNumber === ex.exerciseNumber)) {
      acc.push(ex);
    }
    return acc;
  }, []);

  const exercisesToInsert = uniqueExercises.map((ex) => ({
    exam_id: examId,
    exercise_number: ex.exerciseNumber,
    exercise_type: ex.exerciseType || 'multiple_choice',
    question_text: ex.questionText,
    options: ex.options || null,
    correct_answer: ex.correctAnswer || null,
    explanation: ex.explanation || null,
    points: typeof ex.points === "number" && Number.isFinite(ex.points) 
      ? ex.points 
      : (ex.exerciseType === "multiple_choice" ? 5 : 15),
    concept: ex.concept || "Général",
    // New structured fields
    prompt_blocks: ex.promptBlocks || null,
    options_json: ex.optionsJson || null,
    answer_json: ex.answerJson || null,
    explanation_blocks: ex.explanationBlocks || null,
  }));

  const { error: exercisesError } = await supabase
    .from("exam_exercises")
    .upsert(exercisesToInsert, { onConflict: "exam_id,exercise_number" });

  if (exercisesError) throw exercisesError;

  // Get actual count
  const { count: actualCount } = await supabase
    .from("exam_exercises")
    .select("*", { count: "exact", head: true })
    .eq("exam_id", examId);

  // Update total_exercises with actual count
  await supabase
    .from("official_exams")
    .update({ total_exercises: actualCount || 0 })
    .eq("id", examId);

  return {
    examId,
    exerciseCount: actualCount || uniqueExercises.length,
    isUpdate,
  };
}

/**
 * Re-analyze an existing exam (update with new parsing)
 */
export async function updateExamFromReanalysis(
  examId: string,
  preview: ParsedPreview
): Promise<{ exerciseCount: number }> {
  // Update exam metadata
  const { error: updateError } = await supabase
    .from("official_exams")
    .update({
      title: preview.title,
      total_exercises: preview.totalExercises || preview.exercises.length,
      total_points: preview.totalPoints || 100,
      reference_texts: (preview.referenceTexts || []) as any,
    })
    .eq("id", examId);

  if (updateError) throw updateError;

  // Delete old exercises
  await supabase
    .from("exam_exercises")
    .delete()
    .eq("exam_id", examId);

  // Insert new exercises
  const uniqueExercises = preview.exercises.reduce((acc: ParsedExercise[], ex) => {
    if (!acc.some((e) => e.exerciseNumber === ex.exerciseNumber)) {
      acc.push(ex);
    }
    return acc;
  }, []);

  const exercisesToInsert = uniqueExercises.map((ex) => ({
    exam_id: examId,
    exercise_number: ex.exerciseNumber,
    exercise_type: ex.exerciseType || 'multiple_choice',
    question_text: ex.questionText,
    options: ex.options || null,
    correct_answer: ex.correctAnswer || null,
    explanation: ex.explanation || null,
    points: typeof ex.points === "number" && Number.isFinite(ex.points) 
      ? ex.points 
      : (ex.exerciseType === "multiple_choice" ? 5 : 15),
    concept: ex.concept || "Général",
    prompt_blocks: ex.promptBlocks || null,
    options_json: ex.optionsJson || null,
    answer_json: ex.answerJson || null,
    explanation_blocks: ex.explanationBlocks || null,
  }));

  const { error: exercisesError } = await supabase
    .from("exam_exercises")
    .upsert(exercisesToInsert, { onConflict: "exam_id,exercise_number" });

  if (exercisesError) throw exercisesError;

  // Get actual count
  const { count: actualCount } = await supabase
    .from("exam_exercises")
    .select("*", { count: "exact", head: true })
    .eq("exam_id", examId);

  await supabase
    .from("official_exams")
    .update({ total_exercises: actualCount || 0 })
    .eq("id", examId);

  return { exerciseCount: actualCount || uniqueExercises.length };
}

/**
 * Delete an exam and its exercises
 */
export async function deleteExam(examId: string): Promise<void> {
  // Delete exercises first (due to foreign key)
  await supabase
    .from("exam_exercises")
    .delete()
    .eq("exam_id", examId);

  // Delete exam
  const { error } = await supabase
    .from("official_exams")
    .delete()
    .eq("id", examId);

  if (error) throw error;
}
