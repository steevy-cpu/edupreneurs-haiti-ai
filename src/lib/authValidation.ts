import { z } from "zod";

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
    .min(1, "Le niveau académique est requis"),
  phoneNumber: z
    .string()
    .trim()
    .min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres")
    .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères")
    .regex(/^[\d\s\-\+\(\)]+$/, "Format de téléphone invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Le mot de passe doit contenir au moins un caractère spécial"),
  school: z
    .string()
    .trim()
    .min(1, "L'école est requise")
    .max(100, "Le nom de l'école ne peut pas dépasser 100 caractères"),
  gender: z
    .string()
    .min(1, "Le genre est requis"),
  privacy: z.boolean(),
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

// Phone OTP validation schema
export const phoneOtpSchema = z.object({
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
export type PhoneOtpFormData = z.infer<typeof phoneOtpSchema>;
