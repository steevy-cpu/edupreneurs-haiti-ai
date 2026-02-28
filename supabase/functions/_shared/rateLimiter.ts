/**
 * Security: Rate Limiter Utility
 * 
 * Provides IP-based and user-based rate limiting for edge functions.
 * Optimized for 200+ concurrent users with burst allowances.
 * 
 * OWASP Reference: API4:2023 - Unrestricted Resource Consumption
 */

// Using 'any' for SupabaseClient to avoid version conflicts between edge functions
// deno-lint-ignore no-explicit-any
type SupabaseClientType = any;

// Rate limit configuration interface
export interface RateLimitConfig {
  windowMs: number;        // Time window in milliseconds
  maxRequests: number;     // Max requests per window (authenticated users)
  maxAnonRequests: number; // Max requests for anonymous/IP-based (stricter)
  keyPrefix: string;       // Endpoint identifier
}

// Predefined rate limit configurations for different endpoint types
export const RATE_LIMITS = {
  // AI Tutors: Higher limits for auth users, supports active learning sessions
  AI_TUTOR: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 60,          // Auth: 60 req/min (supports rapid Q&A)
    maxAnonRequests: 10,      // Anon: 10 req/min (stricter)
    keyPrefix: 'ai_tutor'
  },
  
  // Email endpoints: Strict limits to prevent spam
  EMAIL: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 10,          // Auth: 10 req/min
    maxAnonRequests: 3,       // Anon: 3 req/min (very strict)
    keyPrefix: 'email'
  },
  
  // Payment endpoints: Moderate limits
  PAYMENT: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 30,          // Auth: 30 req/min
    maxAnonRequests: 5,       // Anon: 5 req/min
    keyPrefix: 'payment'
  },
  
  // Auth endpoints: Moderate limits with abuse prevention
  AUTH: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 20,          // Auth: 20 req/min
    maxAnonRequests: 5,       // Anon: 5 req/min
    keyPrefix: 'auth'
  },
  
  // General API endpoints
  GENERAL: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,         // Auth: 100 req/min
    maxAnonRequests: 20,      // Anon: 20 req/min
    keyPrefix: 'general'
  },
  
  // Home page chatbot: More permissive for anonymous visitors
  HOME_CHAT: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 60,          // Auth: 60 req/min
    maxAnonRequests: 20,      // Anon: 20 req/min (doubled from AI_TUTOR)
    keyPrefix: 'home_chat'
  },
  
  // TTS/Avatar generation: Resource-intensive, stricter limits
  RESOURCE_INTENSIVE: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 15,          // Auth: 15 req/min
    maxAnonRequests: 3,       // Anon: 3 req/min
    keyPrefix: 'resource'
  },
  
  // Contact form submissions: Strict to prevent spam
  CONTACT_FORM: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 5,           // Auth: 5 req/min
    maxAnonRequests: 3,       // Anon: 3 req/min (strict to prevent spam)
    keyPrefix: 'contact_form'
  },

  // Device verification: legitimate security flow — keep same limit for anon and auth
  // Intentionally separate from EMAIL so other email calls can't consume this budget
  DEVICE_VERIFY: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 5,           // Auth: 5 req/min
    maxAnonRequests: 5,       // Anon: 5/min — same because this IS the auth flow
    keyPrefix: 'device_verify'
  }
} as const;

// Rate limit check result
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;  // Seconds until rate limit resets
}

/**
 * Check rate limit for a request
 * Uses user-based limiting for authenticated users (higher limits)
 * Falls back to IP-based limiting for anonymous requests (stricter)
 * 
 * @param supabase - Supabase client with service role
 * @param config - Rate limit configuration
 * @param userId - Authenticated user ID (null for anonymous)
 * @param clientIp - Client IP address for anonymous limiting
 * @returns RateLimitResult indicating if request is allowed
 */
export async function checkRateLimit(
  supabase: SupabaseClientType,
  config: RateLimitConfig,
  userId: string | null,
  clientIp: string
): Promise<RateLimitResult> {
  // Determine key and max requests based on auth status
  const isAuthenticated = !!userId;
  const maxRequests = isAuthenticated ? config.maxRequests : config.maxAnonRequests;
  const keyType = isAuthenticated ? 'user' : 'ip';
  const keyId = isAuthenticated ? userId : clientIp;
  const key = `${keyType}:${keyId}:${config.keyPrefix}`;
  // Convert window from ms to seconds for the DB function
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  try {
    // Single atomic RPC call — eliminates the TOCTOU race condition
    // The DB function handles UPSERT + window expiry reset in one statement
    const { data, error } = await supabase.rpc('check_and_increment_rate_limit', {
      p_key: key,
      p_window_seconds: windowSeconds,
      p_max_requests: maxRequests,
    });

    if (error) {
      throw error;
    }

    // RPC returns a single-row table; Supabase client returns it as an array
    const row = Array.isArray(data) ? data[0] : data;

    if (!row) {
      throw new Error('Empty response from rate limit RPC');
    }

    if (row.allowed) {
      return {
        allowed: true,
        remaining: maxRequests - row.request_count,
      };
    }

    // Rate limited — compute retry-after from the window expiry
    const retryAfter = Math.ceil(
      (new Date(row.expires_at).getTime() - Date.now()) / 1000
    );
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, retryAfter),
    };
  } catch (error) {
    // Security: fail CLOSED — reject requests when the rate limit service is degraded.
    // This prevents a DB outage from silently disabling all rate limiting.
    console.error('[RateLimiter] Service unavailable — failing closed. Key:', key, 'Error:', error);
    return {
      allowed: false,
      remaining: 0,
      retryAfter: 30,
    };
  }
}

/**
 * Extract client IP from request headers
 * Handles various proxy configurations
 */
export function getClientIp(req: Request): string {
  // Check common proxy headers
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take first IP in chain (original client)
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  // Fallback for direct connections
  return 'unknown';
}

/**
 * Generate a standardized 429 response
 */
export function rateLimitResponse(
  retryAfter: number,
  remaining: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: 'Limite de requêtes atteinte',
      message: 'Veuillez patienter avant de renvoyer un message.',
      retryAfter
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Remaining': String(remaining)
      }
    }
  );
}
