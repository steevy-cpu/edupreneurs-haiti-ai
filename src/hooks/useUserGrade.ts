import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Super users who can access ALL grades (Steevy & Djood only)
const SUPER_USER_IDS = [
  '0de08330-4183-48f9-b169-19b92f4d114f', // Steevy
  '7580cd10-e18c-4b2f-ac50-def28d046c9d', // Djood
];

// Valid grade levels
export const VALID_GRADES = ['7AF', '8AF', '9AF', 'NS1', 'NS2', 'NS3', 'NS4'] as const;
export type GradeLevel = typeof VALID_GRADES[number];

// Legacy grade mapping (old format -> new format)
const LEGACY_GRADE_MAP: Record<string, GradeLevel> = {
  '7e': '7AF',
  '8e': '8AF',
  '9e': '9AF',
  'S1': 'NS1',
  'S2': 'NS2',
  'Rheto': 'NS3',
  'Philo': 'NS4',
};

// Normalize grade to new format
export const normalizeGrade = (grade: string | null): GradeLevel | null => {
  if (!grade) return null;
  
  // Check if already in new format
  if (VALID_GRADES.includes(grade as GradeLevel)) {
    return grade as GradeLevel;
  }
  
  // Check legacy mapping
  return LEGACY_GRADE_MAP[grade] || null;
};

// Grade labels for display
export const GRADE_LABELS: Record<GradeLevel, string> = {
  '7AF': '7ème année fondamentale',
  '8AF': '8ème année fondamentale',
  '9AF': '9ème année fondamentale',
  'NS1': 'Nouveau Secondaire 1',
  'NS2': 'Nouveau Secondaire 2',
  'NS3': 'Nouveau Secondaire 3 (Rhéto)',
  'NS4': 'Nouveau Secondaire 4 (Philo)',
};

interface UseUserGradeResult {
  userGrade: GradeLevel | null;
  isSuperUser: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  canAccessGrade: (gradeId: string) => boolean;
  userId: string | null;
}

export function useUserGrade(): UseUserGradeResult {
  const [userGrade, setUserGrade] = useState<GradeLevel | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUserGrade = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAuthenticated(false);
          setUserGrade(null);
          setUserId(null);
          setIsLoading(false);
          return;
        }

        setUserId(user.id);
        setIsAuthenticated(true);

        // Fetch user's profile to get academic_grade
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('academic_grade')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user grade:', error);
          setUserGrade(null);
        } else {
          // Normalize the grade to new format
          const normalizedGrade = normalizeGrade(profile?.academic_grade);
          setUserGrade(normalizedGrade);
        }
      } catch (error) {
        console.error('Error in useUserGrade:', error);
        setUserGrade(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserGrade();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserGrade(null);
        setUserId(null);
      } else if (session?.user) {
        fetchUserGrade();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if current user is a super user
  const isSuperUser = userId ? SUPER_USER_IDS.includes(userId) : false;

  // Function to check if user can access a specific grade
  const canAccessGrade = (gradeId: string): boolean => {
    // Super users (Steevy & Djood) can access all grades
    if (isSuperUser) return true;
    
    // Normalize the requested grade for comparison
    const normalizedRequestedGrade = normalizeGrade(gradeId);
    
    // User can only access their registered grade
    if (!userGrade) return false;
    return userGrade === normalizedRequestedGrade;
  };

  return {
    userGrade,
    isSuperUser,
    isLoading,
    isAuthenticated,
    canAccessGrade,
    userId,
  };
}
