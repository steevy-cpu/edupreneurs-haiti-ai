/**
 * Security: HTTP Security Headers
 * 
 * Provides consistent security headers for all edge function responses.
 * 
 * OWASP Reference: Security Headers
 * https://owasp.org/www-project-secure-headers/
 */

/**
 * Standard CORS headers for cross-origin requests
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Security headers to add to all responses
 * These protect against common web vulnerabilities
 */
export const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Enable browser XSS protection (legacy, but still useful)
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * Cache control for sensitive endpoints (auth, payments)
 */
export const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
};

/**
 * Combine CORS and security headers
 */
export function getSecureHeaders(includeNoCache = false): Record<string, string> {
  return {
    ...corsHeaders,
    ...securityHeaders,
    ...(includeNoCache ? noCacheHeaders : {}),
  };
}

/**
 * Create a secure JSON response
 */
export function secureJsonResponse(
  data: unknown,
  status = 200,
  includeNoCache = false
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...getSecureHeaders(includeNoCache),
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Create a secure error response
 */
export function secureErrorResponse(
  message: string,
  status = 500,
  details?: string[]
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      ...(details ? { details } : {}),
    }),
    {
      status,
      headers: {
        ...getSecureHeaders(true),
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * CORS preflight response with security headers
 */
export function corsPreflightResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}
