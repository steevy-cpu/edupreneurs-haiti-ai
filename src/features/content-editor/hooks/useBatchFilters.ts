/**
 * @file useBatchFilters.ts
 * @description Manages grade-level, subject, series filters and lesson selection
 * for batch generation and validation operations.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SectionName } from "@/lib/lessonPrompts";

/** Available grade levels for batch filtering */
export const gradeLevels = [
  { value: "all", label: "Tous les niveaux" },
  { value: "7AF", label: "7AF" },
  { value: "8AF", label: "8AF" },
  { value: "9AF", label: "9AF" },
  { value: "NS1", label: "NS1" },
  { value: "NS2", label: "NS2" },
  { value: "NS3", label: "NS3" },
  { value: "NS4", label: "NS4" },
];

/** NS3/NS4 series options for Baccalauréat */
export const seriesOptions = [
  { value: "LLA", label: "LLA - Lettres, Langues et Arts" },
  { value: "SES", label: "SES - Sciences Économiques et Sociales" },
  { value: "SMP", label: "SMP - Sciences Mathématiques et Physiques" },
  { value: "SVT", label: "SVT - Sciences de la Vie et de la Terre" },
];

export const useBatchFilters = () => {
  // Shared filter states
  const [gradeLevel, setGradeLevel] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [series, setSeries] = useState<string[]>([]);
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  /** Derived flag — NS3/NS4 require series selection */
  const isNS3OrNS4 = gradeLevel === "NS3" || gradeLevel === "NS4";

  // Load subjects when grade level or series changes
  useEffect(() => {
    loadSubjects();
  }, [gradeLevel, series]);

  // Load lessons when grade level, subject, or series changes
  useEffect(() => {
    if (gradeLevel !== "all" || subject !== "all") {
      loadLessonsForSelection();
    } else {
      setAvailableLessons([]);
      setSelectedLessonIds([]);
    }
  }, [gradeLevel, subject, series]);

  /** Fetch available subjects filtered by grade and series */
  const loadSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      let query = supabase
        .from('subjects')
        .select('id, name, slug, grade_level, series')
        .order('name');

      if (gradeLevel !== "all") {
        query = query.eq('grade_level', gradeLevel);
      }

      if (isNS3OrNS4 && series.length > 0) {
        query = query.in('series', series);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAvailableSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error("Erreur lors du chargement des matières");
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  /** Fetch lessons for the selection list, with series filtering for NS3/NS4 */
  const loadLessonsForSelection = async () => {
    setIsLoadingLessons(true);
    try {
      let query = supabase
        .from('lessons')
        .select('id, title, grade_level, subject_id, audio_objectif_url, audio_introduction_url, audio_contenu_url, audio_exemples_url, subjects(name, series)')
        .order('title');

      if (gradeLevel !== "all") {
        query = query.eq('grade_level', gradeLevel);
      }

      if (subject !== "all") {
        query = query.eq('subject_id', subject);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Client-side series filter for NS3/NS4 when no specific subject selected
      let filteredData = data || [];
      if (isNS3OrNS4 && series.length > 0 && subject === "all") {
        filteredData = filteredData.filter(lesson => 
          lesson.subjects && series.includes((lesson.subjects as any).series)
        );
      }
      
      setAvailableLessons(filteredData);
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast.error("Erreur lors du chargement des leçons");
    } finally {
      setIsLoadingLessons(false);
    }
  };

  /** Toggle a content section in the selected sections array */
  const toggleSection = (section: SectionName, selectedSections: SectionName[], setSelectedSections: React.Dispatch<React.SetStateAction<SectionName[]>>) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return {
    gradeLevel, setGradeLevel,
    subject, setSubject,
    series, setSeries,
    availableLessons, setAvailableLessons,
    availableSubjects,
    selectedLessonIds, setSelectedLessonIds,
    isLoadingLessons,
    isLoadingSubjects,
    isNS3OrNS4,
    loadSubjects,
    loadLessonsForSelection,
    toggleSection,
  };
};
