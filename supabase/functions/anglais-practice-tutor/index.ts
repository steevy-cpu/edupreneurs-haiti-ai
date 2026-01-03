import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, lessonContext, chatHistory, userNickname, isInitialGreeting } = await req.json();

    console.log("Anglais practice tutor request:", {
      message,
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
    const systemPrompt = `You are Jude, a friendly and patient English teacher helping a ${lessonContext.gradeLevel} grade student practice conversational English.

LESSON TOPIC: "${lessonContext.title}"
LESSON OBJECTIVE: "${lessonContext.objective}"
STUDENT NAME: ${userNickname}
GRADE LEVEL: ${lessonContext.gradeLevel}

YOUR ROLE:
- Have a natural English conversation related to the lesson topic
- Guide the student to practice relevant vocabulary and phrases
- Ask simple, clear questions to keep the conversation flowing
- Be encouraging, supportive, and patient
- Use appropriate vocabulary for ${lessonContext.gradeLevel} level

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
"Hello ${userNickname}! 👋😊 Let's practice English together! We'll focus on '${lessonContext.title}'. I'm here to help you, so don't worry about making mistakes - that's how we learn! Are you ready to start?"
`
    : ""
}

IMPORTANT REMINDERS:
- This is PRACTICE only - not a test or graded activity
- Focus on natural conversation, not grammar drills
- Keep it fun, encouraging, and stress-free
- Always give error explanations in French for better understanding
- Help the student feel comfortable and confident speaking English
- Stay on topic related to: ${lessonContext.title}`;

    // Build messages array
    const messages = [{ role: "system", content: systemPrompt }];

    // Add chat history
    if (chatHistory && chatHistory.length > 0) {
      messages.push(
        ...chatHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please contact your administrator." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
