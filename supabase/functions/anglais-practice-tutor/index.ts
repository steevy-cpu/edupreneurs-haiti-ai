/**
 * Security-Hardened: Anglais Practice Tutor
 * 
 * Features:
 * - Rate limiting
 * - Input validation
 * - Security headers
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, chatMessageSchema } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  const responseHeaders = { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' };

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.AI_TUTOR, null, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for anglais-practice-tutor from IP ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(chatMessageSchema, rawBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: responseHeaders }
      );
    }

    const validatedData = validation.data;
    const message = validatedData.message;
    const lessonContext = validatedData.lessonContext || {};
    const chatHistory = validatedData.chatHistory || [];
    const userNickname = validatedData.userNickname || 'student';
    const isInitialGreeting = validatedData.isInitialGreeting || false;

    console.log("Anglais practice tutor request:", {
      message: message?.substring(0, 100),
      lessonContext,
      userNickname,
      isInitialGreeting,
      historyLength: chatHistory?.length,
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the system prompt with French feedback instructions
    const systemPrompt = `You are Jude, a friendly and patient English teacher helping a ${lessonContext?.gradeLevel || 'AF7'} grade student practice conversational English.

LESSON TOPIC: "${lessonContext?.title || 'English Practice'}"
LESSON OBJECTIVE: "${lessonContext?.objective || 'Improve English skills'}"
STUDENT NAME: ${userNickname || 'student'}
GRADE LEVEL: ${lessonContext?.gradeLevel || 'AF7'}

YOUR ROLE:
- Have a natural English conversation related to the lesson topic
- Guide the student to practice relevant vocabulary and phrases
- Ask simple, clear questions to keep the conversation flowing
- Be encouraging, supportive, and patient
- Use appropriate vocabulary for ${lessonContext?.gradeLevel || 'AF7'} level

ERROR CORRECTION PROTOCOL (CRITICAL):
When the student makes a grammatical or vocabulary mistake:

1. **Acknowledge the effort positively** (in English)
2. **Explain the error in FRENCH** with a clear, simple explanation
3. **Show the correct English form**
4. **Encourage them to try again**

EXAMPLE ERROR CORRECTION:
Student says: "I have 13 years"
Your response should be:
"Good try! 👍

📝 En français : En anglais, on ne dit pas 'I have 13 years'. On utilise le verbe 'to be' (être) pour parler de l'âge, pas 'to have' (avoir). 

✅ Forme correcte : 'I am 13 years old' ou simplement 'I'm 13'

Can you try again? How old are you?"

CONVERSATION STYLE:
- Keep your English simple and clear
- Ask one question at a time
- Use emojis (😊 👍 ✨ 🎉) to keep it friendly and encouraging
- Praise good attempts: "Great job!", "Well done!", "Perfect!", "Excellent!"
- For mistakes: Give French explanation + correct form + encouragement
- If student is completely stuck, you can explain briefly in French, then continue in English

${
  isInitialGreeting
    ? `
INITIAL GREETING:
Start the conversation warmly:
"Hello ${userNickname || 'student'}! 👋😊 Let's practice English together! We'll focus on '${lessonContext?.title || 'English'}'. I'm here to help you, so don't worry about making mistakes - that's how we learn! Are you ready to start?"
`
    : ""
}

IMPORTANT REMINDERS:
- This is PRACTICE only - not a test or graded activity
- Focus on natural conversation, not grammar drills
- Keep it fun, encouraging, and stress-free
- Always give error explanations in French for better understanding
- Help the student feel comfortable and confident speaking English
- Stay on topic related to: ${lessonContext?.title || 'English Practice'}`;

    // Build messages array
    const messages = [{ role: "system", content: systemPrompt }];

    // Add chat history
    if (chatHistory && chatHistory.length > 0) {
      messages.push(
        ...chatHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }))
      );
    }

    // Add current message if not initial greeting
    if (!isInitialGreeting && message) {
      messages.push({ role: "user", content: message });
    }

    console.log("Calling Lovable AI with messages:", messages.length);

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: responseHeaders,
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please contact your administrator." }), {
          status: 402,
          headers: responseHeaders,
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Lovable AI response received");

    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error in anglais-practice-tutor:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        response: "I'm sorry, I had trouble processing that. Could you try again?",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
