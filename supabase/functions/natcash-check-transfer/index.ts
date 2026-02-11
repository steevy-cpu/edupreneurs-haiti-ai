/**
 * NatCash Check Transfer Status
 * 
 * Checks the status of a NatCash transfer from the database.
 * Admin-only endpoint.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  secureJsonResponse,
  secureErrorResponse,
  corsPreflightResponse,
} from "../_shared/securityHeaders.ts";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "../_shared/rateLimiter.ts";

const querySchema = z.object({
  transferId: z.string().uuid().optional(),
  referenceId: z.string().max(100).optional(),
}).refine((d) => d.transferId || d.referenceId, {
  message: "transferId or referenceId required",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return secureErrorResponse("Unauthorized", 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return secureErrorResponse("Unauthorized", 401);
    }

    // Rate limit
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.PAYMENT, user.id, clientIp);
    if (!rateCheck.allowed) {
      return secureErrorResponse("Too many requests", 429);
    }

    // Admin check
    const { data: adminRole } = await supabase
      .from("content_editor_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      return secureErrorResponse("Admin access required", 403);
    }

    // Parse input
    const body = await req.json();
    const validation = querySchema.safeParse(body);
    if (!validation.success) {
      return secureErrorResponse("Invalid input", 400);
    }

    const { transferId, referenceId } = validation.data;

    // Lookup transfer
    let query = supabase.from("natcash_transfers").select("*");

    if (transferId) {
      query = query.eq("id", transferId);
    } else if (referenceId) {
      query = query.eq("reference_id", referenceId);
    }

    const { data: transfer, error: fetchError } = await query.maybeSingle();

    if (fetchError || !transfer) {
      return secureErrorResponse("Transfer not found", 404);
    }

    return secureJsonResponse({
      success: true,
      transfer,
    }, 200, true);

  } catch (error) {
    console.error("[NatCash Check Transfer] Error:", error);
    return secureErrorResponse("Internal server error", 500);
  }
});
