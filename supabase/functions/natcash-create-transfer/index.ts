/**
 * NatCash Create Transfer (Payout)
 * 
 * Admin-only endpoint to send money from the platform wallet
 * to a user's NatCash phone via Bazik.io API.
 * 
 * Security:
 * - Admin role verification via content_editor_roles
 * - Rate limiting
 * - Input validation with Zod
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
import { getMonCashCredentials, getBazikToken, createNatCashTransfer } from "../_shared/bazik.ts";

// Validation schema
const transferSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive().max(100000),
  wallet: z.string().regex(/^\d{8}$/, "NatCash phone must be 8 digits"),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255).optional(),
  description: z.string().max(500).optional(),
  transferType: z.enum(["payout", "refund", "reward", "prize"]).default("payout"),
}).strict();

function generateTransferReferenceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `NTX-${timestamp}-${random}`.toUpperCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  try {
    console.log("[NatCash Transfer] Starting transfer...");

    // Auth check
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
      console.error("[NatCash Transfer] Non-admin attempt:", user.id);
      return secureErrorResponse("Admin access required", 403);
    }

    // Validate input
    const body = await req.json();
    const validation = transferSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      return secureErrorResponse("Invalid input", 400, errors);
    }

    const { userId, amount, wallet, firstName, lastName, email, description, transferType } = validation.data;

    // Verify target user exists
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("user_id, nickname, full_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (!targetUser) {
      return secureErrorResponse("Target user not found", 404);
    }

    // Get Bazik credentials
    const { userID: bazikUserID, secretKey: bazikSecretKey } = getMonCashCredentials();
    if (!bazikUserID || !bazikSecretKey) {
      return secureErrorResponse("Payment gateway not configured", 503);
    }

    // Generate reference
    const referenceId = generateTransferReferenceId();

    // Get webhook URL
    const siteUrl = Deno.env.get("SITE_URL") || Deno.env.get("SUPABASE_URL");
    const webhookUrl = siteUrl
      ? `${Deno.env.get("SUPABASE_URL")}/functions/v1/moncash-webhook`
      : undefined;

    console.log(`[NatCash Transfer] Sending ${amount} HTG to ${wallet} (ref: ${referenceId})`);

    // Authenticate with Bazik
    const accessToken = await getBazikToken(bazikUserID, bazikSecretKey);

    // Execute transfer
    const bazikResponse = await createNatCashTransfer(accessToken, {
      amount,
      wallet,
      customerFirstName: firstName,
      customerLastName: lastName,
      description: description || `Edupreneurs ${transferType}: ${targetUser.nickname || targetUser.full_name}`,
      referenceId,
      customerEmail: email,
      webhookUrl,
    });

    console.log(`[NatCash Transfer] Bazik response: ${bazikResponse.transaction_id}, status: ${bazikResponse.status}`);

    // Store in database
    const { data: transfer, error: insertError } = await supabase
      .from("natcash_transfers")
      .insert({
        user_id: userId,
        initiated_by: user.id,
        amount: bazikResponse.amount,
        fees: bazikResponse.fees,
        total: bazikResponse.total,
        currency: bazikResponse.currency || "HTG",
        wallet,
        recipient_first_name: firstName,
        recipient_last_name: lastName,
        recipient_email: email || null,
        description: description || null,
        reference_id: referenceId,
        bazik_transaction_id: bazikResponse.transaction_id,
        status: bazikResponse.status || "pending",
        transfer_type: transferType,
        metadata: {
          bazik_environment: bazikResponse.environment,
          initiated_at: new Date().toISOString(),
          target_nickname: targetUser.nickname,
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error("[NatCash Transfer] DB insert error:", insertError);
      // Transfer was sent but DB failed - log for manual reconciliation
      return secureJsonResponse({
        success: true,
        warning: "Transfer sent but database record failed - contact support",
        bazikTransactionId: bazikResponse.transaction_id,
        referenceId,
      }, 207);
    }

    return secureJsonResponse({
      success: true,
      transfer: {
        id: transfer.id,
        referenceId,
        bazikTransactionId: bazikResponse.transaction_id,
        amount: bazikResponse.amount,
        fees: bazikResponse.fees,
        total: bazikResponse.total,
        status: bazikResponse.status,
        wallet,
        recipient: `${firstName} ${lastName}`,
      },
    }, 201, true);

  } catch (error) {
    console.error("[NatCash Transfer] Error:", error);

    if (error instanceof Error && error.message === "INSUFFICIENT_FUNDS") {
      return secureErrorResponse("Solde insuffisant dans le portefeuille de la plateforme", 402);
    }

    return secureErrorResponse("Internal server error", 500);
  }
});
