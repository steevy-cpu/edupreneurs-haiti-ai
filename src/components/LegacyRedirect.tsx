import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface LegacyRedirectProps {
  to: string;
  preserveParams?: boolean;
}

/**
 * Component to redirect legacy routes to new unified routes
 */
export const LegacyRedirect = ({ to, preserveParams = false }: LegacyRedirectProps) => {
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    let targetPath = to;
    
    if (preserveParams) {
      // Replace any :param patterns with actual values
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          targetPath = targetPath.replace(`:${key}`, value);
        }
      });
    }
    
    navigate(targetPath, { replace: true });
  }, [to, navigate, params, preserveParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

// Pre-configured legacy route mappings
export const legacyRouteMap: Record<string, string> = {
  // 7AF courses
  "/math-course": "/course/mathematiques",
  "/sciences-course": "/course/sciences-experimentales-7af",
  "/anglais-course": "/course/anglais",
  "/espagnol-course": "/course/espagnol",
  "/francais-course": "/course/francais",
  "/creole-course": "/course/creole",
  "/sciences-sociales-course": "/course/sciences-sociales",
  "/histoire-geographie-7af-course": "/course/histoire-geographie-7af",
  "/arts-course": "/course/arts",
  "/education-physique-course": "/course/education-physique",
  "/sciences-experimentales-7af": "/course/sciences-experimentales-7af",
  
  // 8AF courses
  "/math-af8-course": "/course/matematik-8af",
  "/sciences-af8-course": "/course/sciences-experimentales-8af",
  "/anglais-af8-course": "/course/anglais-8af",
  "/espagnol-af8-course": "/course/espagnol-8af",
  "/creole-af8-course": "/course/creole-8af",
  "/sciences-sociales-af8-course": "/course/sciences-sociales-8af",
  
  // 9AF courses  
  "/mathematiques-af9": "/course/mathematiques-af9",
  "/sciences-experimentales-af9": "/course/sciences-experimentales",
  "/anglais-af9": "/course/anglais-af9",
  "/espagnol-af9": "/course/espagnol-af9",
  "/francais-af9": "/course/français-9af",
};

// Lesson route patterns for redirects
export const legacyLessonRouteMap: Record<string, string> = {
  // 7AF lessons
  "/math-lesson/:topicId": "/course/mathematiques/:topicId",
  "/sciences-lesson/:topicId": "/course/sciences-experimentales-7af/:topicId",
  "/anglais-lesson/:topicId": "/course/anglais/:topicId",
  "/espagnol-lesson/:topicId": "/course/espagnol/:topicId",
  "/francais-lesson/:topicId": "/course/francais/:topicId",
  "/creole-lesson/:topicId": "/course/creole/:topicId",
  "/sciences-sociales-lesson/:topicId": "/course/sciences-sociales/:topicId",
  "/arts-lesson/:topicId": "/course/arts/:topicId",
  "/education-physique-lesson/:topicId": "/course/education-physique/:topicId",
  
  // 8AF lessons
  "/math-af8-lesson/:topicId": "/course/matematik-8af/:topicId",
  "/sciences-af8-lesson/:topicId": "/course/sciences-experimentales-8af/:topicId",
  "/anglais-af8-lesson/:topicId": "/course/anglais-8af/:topicId",
  "/espagnol-af8-lesson/:topicId": "/course/espagnol-8af/:topicId",
  "/creole-af8-lesson/:topicId": "/course/creole-8af/:topicId",
  "/sciences-sociales-af8-lesson/:topicId": "/course/sciences-sociales-8af/:topicId",
  
  // 9AF lessons
  "/mathematiques-af9/:lessonSlug": "/course/mathematiques-af9/:lessonSlug",
  "/sciences-experimentales-af9/:lessonSlug": "/course/sciences-experimentales/:lessonSlug",
  "/anglais-af9/:lessonSlug": "/course/anglais-af9/:lessonSlug",
  "/espagnol-af9/:lessonSlug": "/course/espagnol-af9/:lessonSlug",
  "/francais-af9/:lessonSlug": "/course/français-9af/:lessonSlug",
};
