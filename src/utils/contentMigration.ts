import { supabase } from "@/integrations/supabase/client";
import { mathLessons7AF } from "@/data/mathLessons";
import { sciencesLessons7AF } from "@/data/sciencesLessons";
import { espagnolLessons7AF } from "@/data/espagnolLessons";
import { francaisLessons7AF } from "@/data/francaisLessons";
import { sciencesSocialesLessons7AF } from "@/data/sciencesSocialesLessons";
import { creoleLessons7AF } from "@/data/creoleLessons";

interface MigrationResult {
  success: boolean;
  subjectsCreated: number;
  lessonsCreated: number;
  errors: string[];
}

export const migrateContentToDatabase = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: false,
    subjectsCreated: 0,
    lessonsCreated: 0,
    errors: [],
  };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      result.errors.push("User not authenticated");
      return result;
    }

    // Create Math subject
    const { data: mathSubject, error: mathSubjectError } = await supabase
      .from('subjects')
      .upsert({
        name: "Mathématiques",
        slug: "mathematiques",
        description: "Cours de mathématiques niveau 7ème AF selon le programme MENFP",
        icon_name: "🔢",
        color: "blue",
        grade_level: "7AF",
        created_by: user.id,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (mathSubjectError) {
      result.errors.push(`Math subject error: ${mathSubjectError.message}`);
      return result;
    }

    result.subjectsCreated++;

    // Create Sciences subject
    const { data: sciencesSubject, error: sciencesSubjectError } = await supabase
      .from('subjects')
      .upsert({
        name: "Sciences",
        slug: "sciences",
        description: "Cours de sciences niveau 7ème AF selon le programme MENFP",
        icon_name: "🔬",
        color: "green",
        grade_level: "7AF",
        created_by: user.id,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (sciencesSubjectError) {
      result.errors.push(`Sciences subject error: ${sciencesSubjectError.message}`);
      return result;
    }

    result.subjectsCreated++;

    // Create Espagnol subject
    const { data: espagnolSubject, error: espagnolSubjectError } = await supabase
      .from('subjects')
      .upsert({
        name: "Espagnol",
        slug: "espagnol",
        description: "Cours d'espagnol niveau 7ème AF selon le programme MENFP",
        icon_name: "🇪🇸",
        color: "orange",
        grade_level: "7AF",
        created_by: user.id,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (espagnolSubjectError) {
      result.errors.push(`Espagnol subject error: ${espagnolSubjectError.message}`);
      return result;
    }

    result.subjectsCreated++;

    // Create Français subject
    const { data: francaisSubject, error: francaisSubjectError } = await supabase
      .from('subjects')
      .upsert({
        name: "Français",
        slug: "francais",
        description: "Communication française niveau 7ème AF selon le programme MENFP",
        icon_name: "📝",
        color: "purple",
        grade_level: "7AF",
        created_by: user.id,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (francaisSubjectError) {
      result.errors.push(`Français subject error: ${francaisSubjectError.message}`);
      return result;
    }

    result.subjectsCreated++;

    // Migrate Math lessons
    let mathOrder = 0;
    for (const [slug, content] of Object.entries(mathLessons7AF)) {
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert({
          subject_id: mathSubject.id,
          title: formatLessonTitle(slug),
          slug,
          objectif: content.objectif,
          introduction: content.introduction,
          contenu: content.contenu,
          exemples_exercices: content.exemplesExercices,
          order_index: mathOrder++,
          grade_level: "7AF",
          is_published: true,
          created_by: user.id,
        }, { onConflict: 'subject_id,slug' });

      if (lessonError) {
        result.errors.push(`Math lesson ${slug}: ${lessonError.message}`);
      } else {
        result.lessonsCreated++;
      }
    }

    // Migrate Sciences lessons
    let sciencesOrder = 0;
    for (const [slug, content] of Object.entries(sciencesLessons7AF)) {
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert({
          subject_id: sciencesSubject.id,
          title: formatLessonTitle(slug),
          slug,
          objectif: content.objectif,
          introduction: content.introduction,
          contenu: content.contenu,
          exemples_exercices: content.exemplesExercices,
          order_index: sciencesOrder++,
          grade_level: "7AF",
          is_published: true,
          created_by: user.id,
        }, { onConflict: 'subject_id,slug' });

      if (lessonError) {
        result.errors.push(`Sciences lesson ${slug}: ${lessonError.message}`);
      } else {
        result.lessonsCreated++;
      }
    }

    // Migrate Espagnol lessons
    let espagnolOrder = 0;
    for (const [slug, content] of Object.entries(espagnolLessons7AF)) {
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert({
          subject_id: espagnolSubject.id,
          title: formatLessonTitle(slug),
          slug,
          objectif: content.objectif,
          introduction: content.introduction,
          contenu: content.contenu,
          exemples_exercices: content.exemplesExercices,
          mois: content.mois,
          references: content.references,
          order_index: espagnolOrder++,
          grade_level: "7AF",
          is_published: true,
          created_by: user.id,
        }, { onConflict: 'subject_id,slug' });

      if (lessonError) {
        result.errors.push(`Espagnol lesson ${slug}: ${lessonError.message}`);
      } else {
        result.lessonsCreated++;
      }
    }

    // Update lesson counts
    await supabase
      .from('subjects')
      .update({ lesson_count: Object.keys(mathLessons7AF).length })
      .eq('id', mathSubject.id);

    await supabase
      .from('subjects')
      .update({ lesson_count: Object.keys(sciencesLessons7AF).length })
      .eq('id', sciencesSubject.id);

    await supabase
      .from('subjects')
      .update({ lesson_count: Object.keys(espagnolLessons7AF).length })
      .eq('id', espagnolSubject.id);

    // Migrate Français lessons (array format)
    for (let i = 0; i < francaisLessons7AF.length; i++) {
      const lesson = francaisLessons7AF[i];
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert({
          subject_id: francaisSubject.id,
          title: lesson.title,
          slug: lesson.id,
          objectif: lesson.objectif,
          introduction: lesson.introduction,
          contenu: lesson.contenu,
          exemples_exercices: lesson.exemplesExercices,
          mois: lesson.mois,
          order_index: i,
          grade_level: "7AF",
          is_published: true,
          created_by: user.id,
        }, { onConflict: 'subject_id,slug' });

      if (lessonError) {
        result.errors.push(`Français lesson ${lesson.id}: ${lessonError.message}`);
      } else {
        result.lessonsCreated++;
      }
    }

    // Update lesson count for Français
    await supabase
      .from('subjects')
      .update({ lesson_count: francaisLessons7AF.length })
      .eq('id', francaisSubject.id);

    // Create Sciences Sociales subject
    const { data: sciencesSocialesSubject, error: sciencesSocialesSubjectError } = await supabase
      .from('subjects')
      .upsert({
        name: "Sciences Sociales",
        slug: "sciences-sociales",
        description: "Histoire et géographie niveau 7ème AF selon le programme MENFP",
        icon_name: "🌍",
        color: "orange",
        grade_level: "7AF",
        created_by: user.id,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (sciencesSocialesSubjectError) {
      result.errors.push(`Sciences Sociales subject error: ${sciencesSocialesSubjectError.message}`);
      return result;
    }

    result.subjectsCreated++;

    // Migrate Sciences Sociales lessons
    for (let i = 0; i < sciencesSocialesLessons7AF.length; i++) {
      const lesson = sciencesSocialesLessons7AF[i];
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert({
          subject_id: sciencesSocialesSubject.id,
          title: lesson.title,
          slug: lesson.id,
          objectif: lesson.objectif,
          introduction: lesson.introduction,
          contenu: lesson.contenu,
          exemples_exercices: lesson.exemplesExercices,
          mois: lesson.mois,
          order_index: i,
          grade_level: "7AF",
          is_published: true,
          created_by: user.id,
        }, { onConflict: 'subject_id,slug' });

      if (lessonError) {
        result.errors.push(`Sciences Sociales lesson ${lesson.id}: ${lessonError.message}`);
      } else {
        result.lessonsCreated++;
      }
    }

    // Update lesson count for Sciences Sociales
    await supabase
      .from('subjects')
      .update({ lesson_count: sciencesSocialesLessons7AF.length })
      .eq('id', sciencesSocialesSubject.id);

    // Create Creole subject
    const { data: creoleSubject, error: creoleSubjectError } = await supabase
      .from('subjects')
      .upsert({
        name: "Kreyòl Ayisyen",
        slug: "creole",
        description: "Lang, literati ak kilti ayisyèn",
        icon_name: "👥",
        color: "pink",
        grade_level: "7AF",
        created_by: user.id,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (creoleSubjectError) {
      result.errors.push(`Creole subject error: ${creoleSubjectError.message}`);
      return result;
    }

    result.subjectsCreated++;

    // Migrate Creole lessons
    for (let i = 0; i < creoleLessons7AF.length; i++) {
      const lesson = creoleLessons7AF[i];
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert({
          subject_id: creoleSubject.id,
          title: lesson.title,
          slug: lesson.id.toString(),
          objectif: lesson.description,
          introduction: lesson.description,
          contenu: lesson.contenu,
          exemples_exercices: "",
          order_index: i,
          grade_level: "7AF",
          is_published: true,
          created_by: user.id,
        }, { onConflict: 'subject_id,slug' });

      if (lessonError) {
        result.errors.push(`Creole lesson ${lesson.id}: ${lessonError.message}`);
      } else {
        result.lessonsCreated++;
      }
    }

    // Update lesson count for Creole
    await supabase
      .from('subjects')
      .update({ lesson_count: creoleLessons7AF.length })
      .eq('id', creoleSubject.id);

    result.success = result.errors.length === 0;
    return result;

  } catch (error) {
    result.errors.push(`Migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};

// Helper function to format lesson titles from slugs
const formatLessonTitle = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Check if migration has been run
export const checkMigrationStatus = async (): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });

    if (error) return false;
    return (count || 0) > 0;
  } catch {
    return false;
  }
};
