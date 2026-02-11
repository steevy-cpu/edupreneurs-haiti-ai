/**
 * Security: Input Validation Schemas
 * 
 * Zod-based validation for all edge function inputs.
 * Implements strict type checking, length limits, and sanitization.
 * 
 * OWASP Reference: API3:2023 - Broken Object Property Level Authorization
 * OWASP Reference: API8:2023 - Security Misconfiguration
 */

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ============================================
// AI Chat / Tutor Schemas
// ============================================

/**
 * Base chat history schema - reusable
 */
const chatHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(50000)
});

/**
 * Helper to strip HTML and normalize text for validation
 */
const sanitizeTextForValidation = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, ' ')  // Strip HTML tags
    .replace(/&nbsp;/g, ' ')   // Replace HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim()
    .slice(0, 1000);           // Truncate to max length
};

/**
 * Lesson context schema for language tutors
 * - objective is preprocessed to strip HTML and truncate
 */
const lessonContextSchema = z.object({
  title: z.string().max(500).optional(),
  objective: z.preprocess(
    sanitizeTextForValidation,
    z.string().max(1000).optional()
  ),
  gradeLevel: z.string().max(50).optional(),
  slug: z.string().max(200).optional(),
}).optional();

/**
 * Chat message validation for AI tutors
 * - Permissive to handle varied tutor inputs
 * - Core fields validated, extras passed through
 */
export const chatMessageSchema = z.object({
  message: z.string()
    .max(10000, "Message trop long (max 10000 caractères)")
    .optional()
    .default('')
    .transform(s => s?.trim() ?? ''),
  chatHistory: z.array(chatHistoryItemSchema).max(50).optional().default([]),
  userNickname: z.string().max(100).optional(),
  currentPage: z.union([z.string(), z.number()]).transform(v => String(v)).optional(),
  enableVoice: z.boolean().optional().default(true),
  lessonTitle: z.string().max(500).optional(),
  lessonContent: z.string().max(100000).optional(),
  gradeLevel: z.string().max(50).optional(),
  subject: z.string().max(100).optional(),
  // Francais tutor specific
  lessonType: z.string().max(50).optional(),
  lessonTopic: z.string().max(500).optional(),
  // Passion tutor specific
  category: z.string().max(100).optional(),
  // Language practice specific
  lessonContext: lessonContextSchema,
  isInitialGreeting: z.boolean().optional(),
  // Bac philosophy specific
  subjects: z.array(z.string().max(2000)).max(5).optional(),
  userMessage: z.string().max(10000).optional(),
  conversationHistory: z.array(z.object({
    message_role: z.string().max(50),
    message_content: z.string().max(50000)
  })).max(100).optional(),
  currentStep: z.string().max(100).optional(),
  studentText: z.string().max(50000).optional(),
  chosenSubjectIndex: z.number().int().min(0).max(10).optional(),
}).passthrough().refine(
  (data) => {
    // Allow empty message ONLY if isInitialGreeting is true
    if (data.isInitialGreeting === true) {
      return true;
    }
    // Otherwise, message must be non-empty
    return data.message && data.message.length > 0;
  },
  {
    message: "Message requis",
    path: ["message"]
  }
);

/**
 * Eric chat specific schema
 */
export const ericChatSchema = z.object({
  message: z.string()
    .min(1, "Message requis")
    .max(10000, "Message trop long")
    .transform(s => s.trim()),
  chatHistory: z.array(chatHistoryItemSchema).max(50).optional().default([]),
  userNickname: z.string().max(100).optional(),
  userGrade: z.string().max(50).optional(),
  currentPage: z.string().max(200).optional(),
  enableVoice: z.boolean().optional().default(true),
  localHour: z.number().int().min(0).max(23).optional(),
}).passthrough();

/**
 * Exam tutor schema - comprehensive for exam exercises
 */
export const examTutorSchema = z.object({
  message: z.string().max(10000).optional().default(''),
  userMessage: z.string().max(10000).optional(),
  exercise: z.object({
    exercise_number: z.number().optional().nullable(),
    question_text: z.string().max(10000),
    options: z.union([
      z.array(z.string().max(1000)).max(10),
      z.record(z.string().max(1), z.string().max(1000))
    ]).optional().nullable(),
    correct_answer: z.string().max(5000).optional().nullable(),
    concept: z.string().max(500).optional().nullable(),
    points: z.number().optional().nullable(),
    explanation: z.string().max(10000).optional().nullable(),
  }),
  conversationHistory: z.array(z.object({
    message_role: z.string().max(50),
    message_content: z.string().max(50000)
  })).max(100).optional().default([]),
  chatHistory: z.array(chatHistoryItemSchema).max(50).optional(),
  studentAnswer: z.string().max(5000).optional(),
  revealAnswer: z.boolean().optional(),
  referenceTexts: z.array(z.object({
    section: z.string().max(200).optional(),
    title: z.string().max(500).optional(),
    text: z.string().max(50000)
  })).max(20).optional(),
  userNickname: z.string().max(100).optional(),
  enableVoice: z.boolean().optional().default(true),
}).passthrough();

/**
 * Chess AI tutor schema - handles game state and moves
 */
export const chessTutorSchema = z.object({
  message: z.string().max(5000).optional().default(''),
  userMessage: z.string().max(5000).optional(),
  fen: z.string().max(200).optional(),
  chatHistory: z.array(chatHistoryItemSchema).max(30).optional().default([]),
  gameState: z.object({
    fen: z.string().max(200).optional(),
    lastMove: z.string().max(20).optional(),
    moveHistory: z.array(z.string().max(20)).max(500).optional(),
    isGameOver: z.boolean().optional(),
    result: z.string().max(50).optional(),
  }).optional(),
  userNickname: z.string().max(100).optional(),
  isEricTurn: z.boolean().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  isAnalysis: z.boolean().optional(),
  moveHistory: z.array(z.string().max(20)).max(500).optional(),
  enableVoice: z.boolean().optional().default(true),
}).passthrough();

// ============================================
// Email Schemas
// ============================================

/**
 * Confirmation email validation
 * - Strict email format
 * - 6-digit code validation
 */
export const confirmationEmailSchema = z.object({
  email: z.string()
    .email("Email invalide")
    .max(255, "Email trop long"),
  fullName: z.string()
    .min(2, "Nom trop court")
    .max(200, "Nom trop long")
    .transform(s => s.trim()),
  nickname: z.string()
    .min(2, "Pseudo trop court")
    .max(50, "Pseudo trop long")
    .transform(s => s.trim()),
  academicGrade: z.string().max(50),
  confirmationCode: z.string()
    .length(6, "Code doit être 6 chiffres")
    .regex(/^\d{6}$/, "Code invalide"),
}).strict();

/**
 * Welcome email validation
 */
export const welcomeEmailSchema = z.object({
  email: z.string().email("Email invalide").max(255),
  fullName: z.string().min(2).max(200).transform(s => s.trim()),
  nickname: z.string().min(2).max(50).transform(s => s.trim()),
}).strict();

/**
 * Password reset email validation
 */
export const passwordResetEmailSchema = z.object({
  email: z.string().email("Email invalide").max(255),
  resetUrl: z.string().url("URL invalide").max(500),
  fullName: z.string().max(200).optional(),
}).strict();

/**
 * Push notification validation
 * Note: url accepts both full URLs and relative paths (e.g., "/feed", "/notifications")
 */
export const pushNotificationSchema = z.object({
  recipientUserId: z.string().uuid("ID utilisateur invalide"),
  title: z.string().max(200).transform(s => s.trim()).optional(),
  body: z.string().max(1000).transform(s => s.trim()).optional(),
  conversationId: z.string().uuid().optional(),
  type: z.enum([
    'message', 'like', 'comment', 'share', 
    'follow', 'follow_accepted', 'mention', 'post',
    'word_of_day'
  ]).optional(),
  actorId: z.string().uuid().optional(),
  entityId: z.string().uuid().optional(),
  notificationId: z.string().uuid().optional(),
  url: z.string().max(500).optional(),
}).strict();

// ============================================
// Payment Schemas
// ============================================

/**
 * Payment creation validation
 */
export const paymentSchema = z.object({
  amount: z.number()
    .positive("Montant doit être positif")
    .max(1000000, "Montant trop élevé"),
  description: z.string().max(500).optional(),
  orderId: z.string().max(100).optional(),
  isSignupPayment: z.boolean().optional(),
  email: z.string().email().max(320).optional(),
}).strict();

/**
 * Payment verification validation
 */
export const paymentVerifySchema = z.object({
  transactionId: z.string().max(100),
}).strict();

/**
 * NatCash order validation
 */
export const natcashOrderSchema = z.object({
  amount: z.number().positive().max(1000000),
  description: z.string().max(500).optional(),
  natcashPhone: z.string()
    .regex(/^\+?[0-9]{8,15}$/, "Numéro de téléphone invalide"),
}).strict();

/**
 * NatCash receipt upload validation
 */
export const natcashReceiptSchema = z.object({
  orderId: z.string().uuid("ID commande invalide"),
  receiptUrl: z.string().url("URL invalide").max(1000),
  natcashReference: z.string().max(100).optional(),
}).strict();

// ============================================
// Auth Schemas
// ============================================

/**
 * Password reset validation
 * - Strong password requirements
 */
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(10, "Token invalide")
    .max(500, "Token invalide"),
  newPassword: z.string()
    .min(8, "Mot de passe trop court (min 8 caractères)")
    .max(128, "Mot de passe trop long")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
}).strict();

/**
 * Promo code validation
 */
export const promoCodeSchema = z.object({
  code: z.string()
    .min(3, "Code trop court")
    .max(50, "Code trop long")
    .transform(s => s.trim().toUpperCase()),
}).strict();

// ============================================
// Content Generation Schemas
// ============================================

/**
 * Avatar generation validation
 */
export const avatarGenerationSchema = z.object({
  prompt: z.string()
    .min(10, "Description trop courte")
    .max(1000, "Description trop longue")
    .transform(s => s.trim()),
  userId: z.string().uuid("ID utilisateur invalide"),
}).strict();

/**
 * TTS generation validation
 */
export const ttsSchema = z.object({
  text: z.string()
    .min(1, "Texte requis")
    .max(5000, "Texte trop long (max 5000 caractères)")
    .transform(s => s.trim()),
  voiceId: z.string().max(100).optional(),
}).strict();

/**
 * Translation validation
 * - Supports: en, ht (Haitian Creole), fr, es
 * - Ensures source and target languages are different
 */
export const translateSchema = z.object({
  text: z.string()
    .min(1, "Texte requis")
    .max(5000, "Texte trop long (max 5000 caractères)")
    .transform(s => s.trim()),
  sourceLang: z.enum(['en', 'ht', 'fr', 'es']),
  targetLang: z.enum(['en', 'ht', 'fr', 'es']),
}).strict().refine(
  data => data.sourceLang !== data.targetLang,
  { message: "Les langues source et cible doivent être différentes" }
);

/**
 * YouTube search validation
 */
export const youtubeSearchSchema = z.object({
  query: z.string()
    .min(2, "Recherche trop courte")
    .max(200, "Recherche trop longue")
    .transform(s => s.trim()),
  maxResults: z.number().int().min(1).max(50).optional().default(10),
}).strict();

/**
 * Contact form submission validation
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .transform(s => s.trim()),
  email: z.string()
    .email("Veuillez entrer une adresse email valide")
    .max(255, "L'email ne peut pas dépasser 255 caractères")
    .transform(s => s.toLowerCase().trim()),
  message: z.string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères")
    .transform(s => s.trim()),
}).strict();

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validate input against a schema
 * Returns typed result with success/failure
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map(i => i.message)
  };
}

/**
 * Generate a standardized 400 validation error response
 */
export function validationErrorResponse(
  errors: string[],
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: 'Données invalides',
      details: errors
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}
