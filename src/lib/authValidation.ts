import { z } from "zod";

// Valid academic grade values (standardized format)
export const ACADEMIC_GRADES = ['7AF', '8AF', '9AF', 'NS1', 'NS2', 'NS3', 'NS4'] as const;
export type AcademicGrade = typeof ACADEMIC_GRADES[number];

// Grade options for signup dropdown
export const GRADE_OPTIONS: { value: AcademicGrade; label: string }[] = [
  { value: '7AF', label: '7ème année fondamentale' },
  { value: '8AF', label: '8ème année fondamentale' },
  { value: '9AF', label: '9ème année fondamentale' },
  { value: 'NS1', label: 'Nouveau Secondaire 1' },
  { value: 'NS2', label: 'Nouveau Secondaire 2' },
  { value: 'NS3', label: 'Nouveau Secondaire 3 (Rhéto)' },
  { value: 'NS4', label: 'Nouveau Secondaire 4 (Philo)' },
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
  fullName: z
    .string()
    .trim()
    .max(100, "Le nom complet ne peut pas dépasser 100 caractères")
    .optional(),
  nickname: z
    .string()
    .trim()
    .min(3, "Le pseudo doit contenir au moins 3 caractères")
    .max(30, "Le pseudo ne peut pas dépasser 30 caractères")
    .regex(/^[a-zA-Z0-9_]+$/, "Le pseudo ne peut contenir que des lettres, chiffres et underscores"),
  academicGrade: z
    .string()
    .min(1, "Le niveau académique est requis")
    .refine((val) => ACADEMIC_GRADES.includes(val as AcademicGrade), {
      message: "Niveau académique invalide",
    }),
  phoneNumber: z
    .string()
    .trim()
    .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères")
    .regex(/^[\d\s\-\+\(\)]*$/, "Format de téléphone invalide")
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule"),
  school: z
    .string()
    .trim()
    .min(1, "L'école est requise")
    .max(100, "Le nom de l'école ne peut pas dépasser 100 caractères"),
  gender: z
    .string()
    .min(1, "Le genre est requis"),
  dateOfBirth: z
    .string()
    .trim()
    .optional(),
  privacy: z.literal(true, { 
    errorMap: () => ({ message: "Vous devez accepter les politiques de confidentialité" }) 
  }),
  payment: z.string().optional(),
}).refine((data) => data.email === data.emailConfirm, {
  message: "Les emails ne correspondent pas",
  path: ["emailConfirm"],
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
