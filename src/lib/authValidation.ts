import { z } from "zod";
import { containsProfanity, isReservedUsername } from "./textModeration";

// Valid academic grade values (standardized format)
export const ACADEMIC_GRADES = ['7AF', '8AF', '9AF', 'NS1', 'NS2', 'NS3', 'NS4', 'UNIV', 'NONE'] as const;
export type AcademicGrade = typeof ACADEMIC_GRADES[number];

// Non-academic grades (no access to Matieres/Exams)
export const NON_ACADEMIC_GRADES: AcademicGrade[] = ['UNIV', 'NONE'];

// Grade options for signup dropdown
export const GRADE_OPTIONS: { value: AcademicGrade; label: string }[] = [
  { value: '7AF', label: '7ème année fondamentale' },
  { value: '8AF', label: '8ème année fondamentale' },
  { value: '9AF', label: '9ème année fondamentale' },
  { value: 'NS1', label: 'Nouveau Secondaire 1' },
  { value: 'NS2', label: 'Nouveau Secondaire 2' },
  { value: 'NS3', label: 'Nouveau Secondaire 3 (Rhéto)' },
  { value: 'NS4', label: 'Nouveau Secondaire 4 (Philo)' },
  { value: 'UNIV', label: 'Université' },
  { value: 'NONE', label: 'Pas d\'école / Autodidacte' },
];

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères"),
});

// Signup validation schema
// Signup schema — only validates fields collected during signup (email, password, privacy).
// Profile fields (nickname, grade, gender, school) are collected post-login in OnboardingQuiz.
export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  emailConfirm: z
    .string()
    .trim()
    .min(1, "La confirmation d'email est requise")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule"),
  privacy: z.literal(true, { 
    errorMap: () => ({ message: "Vous devez accepter les politiques de confidentialité" }) 
  }),
  // Profile fields — optional at signup, collected during onboarding quiz
  fullName: z.string().trim().max(100).optional().or(z.literal('')),
  nickname: z.string().trim().optional().or(z.literal('')),
  academicGrade: z.string().optional().or(z.literal('')),
  phoneNumber: z.string().trim().optional().or(z.literal('')),
  school: z.string().trim().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().trim().optional(),
  payment: z.string().optional(),
}).refine((data) => data.email === data.emailConfirm, {
  message: "Les emails ne correspondent pas",
  path: ["emailConfirm"],
});

// Full profile validation schema — used in Settings page for profile updates
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(100, "Le nom complet ne peut pas dépasser 100 caractères")
    .refine((val) => !val || !containsProfanity(val), {
      message: "Le nom contient des termes inappropriés",
    })
    .optional(),
  nickname: z
    .string()
    .trim()
    .min(3, "Le pseudo doit contenir au moins 3 caractères")
    .max(30, "Le pseudo ne peut pas dépasser 30 caractères")
    .regex(/^[a-zA-Z0-9_]+$/, "Le pseudo ne peut contenir que des lettres, chiffres et underscores")
    .refine((val) => !containsProfanity(val), {
      message: "Ce pseudo contient des termes inappropriés",
    })
    .refine((val) => !isReservedUsername(val), {
      message: "Ce pseudo est réservé",
    }),
  academicGrade: z
    .string()
    .min(1, "Le niveau académique est requis")
    .refine((val) => ACADEMIC_GRADES.includes(val as AcademicGrade), {
      message: "Niveau académique invalide",
    }),
  gender: z
    .string()
    .min(1, "Le genre est requis"),
  school: z
    .string()
    .trim()
    .max(100, "Le nom de l'école ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal('N/A'))
    .or(z.literal('')),
});

// Password reset validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
});

// Verification code schema
export const verificationCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Le code doit contenir exactement 6 chiffres")
    .regex(/^\d+$/, "Le code ne doit contenir que des chiffres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type VerificationCodeFormData = z.infer<typeof verificationCodeSchema>;
