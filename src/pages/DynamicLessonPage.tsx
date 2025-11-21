import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LessonPageTemplate } from "@/components/LessonPageTemplate";
import ericTeaching from "@/assets/eric-teaching.png";
import ericScientist from "@/assets/eric-scientist.png";

export default function DynamicLessonPage() {
  const { slug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLessonData();
  }, [lessonSlug, slug]);

  const loadLessonData = async () => {
    try {
      setIsLoading(true);

      // Decode URL-encoded slugs
      const decodedSubjectSlug = slug ? decodeURIComponent(slug) : '';
      const decodedLessonSlug = lessonSlug ? decodeURIComponent(lessonSlug) : '';

      // Load subject using the slug
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('slug', decodedSubjectSlug)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);

      // Load lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', decodedLessonSlug)
        .eq('subject_id', subjectData.id)
        .single();

      if (lessonError) throw lessonError;

      // Transform lesson data to match expected format
      const transformedLesson = {
        title: lessonData.title,
        objectif: lessonData.objectif || '',
        introduction: lessonData.introduction || '',
        contenu: lessonData.contenu || '',
        exemples_exercices: lessonData.exemples_exercices || '',
        activites_interactives: lessonData.activites_interactives || '',
        quiz_final: lessonData.quiz_final || '',
        youtube_url: lessonData.youtube_url || null,
      };

      setLesson(transformedLesson);
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la leçon...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Leçon non trouvée</h2>
          <button
            onClick={() => navigate('/matieres')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retour aux matières
          </button>
        </div>
      </div>
    );
  }

  // Use Eric scientist image for Chimie subjects
  const ericImage = subject.name.toLowerCase().includes('chimie') 
    ? ericScientist 
    : ericTeaching;

  return (
    <LessonPageTemplate
      lesson={lesson}
      lessonSlug={lessonSlug || ''}
      subjectName={subject.name}
      subjectSlug={slug || ''}
      gradeLevel={subject.grade_level}
      ericImage={ericImage}
    />
  );
}
