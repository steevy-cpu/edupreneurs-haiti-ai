import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSecureHeaders, secureJsonResponse, secureErrorResponse, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const inputSchema = z.object({
  lessonTitle: z.string().min(1).max(500),
  contenu: z.string().max(50000).optional(),
  exemplesExercices: z.string().max(50000).optional(),
  gradeLevel: z.string().max(10).optional(),
  subject: z.string().max(200).optional(),
  numberOfQuestions: z.number().min(5).max(20).optional().default(10),
}).strict();

const QUIZGECKO_BASE_URL = "https://quizgecko.com/api/v2";
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_TIME_MS = 90000; // 90s timeout

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  try {
    const QUIZGECKO_API_KEY = Deno.env.get("QUIZGECKO_API_KEY");
    if (!QUIZGECKO_API_KEY) {
      return secureErrorResponse(
        "QUIZGECKO_API_KEY not configured. Please add your Quizgecko API key.",
        500
      );
    }

    const rawInput = await req.json();
    const parseResult = inputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return secureErrorResponse("Invalid input", 400, parseResult.error.errors.map(e => e.message));
    }

    const { lessonTitle, contenu, exemplesExercices, gradeLevel, subject, numberOfQuestions } = parseResult.data;
    const combinedContent = `${contenu || ""}\n\n${exemplesExercices || ""}`.trim();

    if (!combinedContent || combinedContent.length < 50) {
      return secureErrorResponse("Lesson content too short for quiz generation", 400);
    }

    console.log("📝 Quizgecko: Generating quiz for:", lessonTitle);

    const headers = {
      Authorization: `Bearer ${QUIZGECKO_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Step 1: POST to generate
    const generateRes = await fetch(`${QUIZGECKO_BASE_URL}/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: combinedContent.substring(0, 30000), // Quizgecko may have text limits
        title: lessonTitle,
        options: {
          language: "fr",
          question_type: "multiple_choice",
          number_of_questions: numberOfQuestions,
          difficulty: gradeToDifficulty(gradeLevel),
        },
      }),
    });

    if (!generateRes.ok) {
      const errText = await generateRes.text();
      console.error("Quizgecko generate error:", generateRes.status, errText);
      return secureErrorResponse(`Quizgecko API error: ${generateRes.status}`, generateRes.status);
    }

    const generateData = await generateRes.json();
    const courseId = generateData?.id || generateData?.course?.id;

    if (!courseId) {
      console.error("No course ID returned:", JSON.stringify(generateData));
      return secureErrorResponse("Quizgecko did not return a course ID", 500);
    }

    console.log("⏳ Quizgecko: Polling generation status for course:", courseId);

    // Step 2: Poll for completion
    const startTime = Date.now();
    let status = "processing";
    let courseData: any = null;

    while (status !== "completed" && Date.now() - startTime < MAX_POLL_TIME_MS) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const statusRes = await fetch(
        `${QUIZGECKO_BASE_URL}/courses/${courseId}/generation-status`,
        { headers }
      );

      if (!statusRes.ok) {
        const errText = await statusRes.text();
        console.error("Quizgecko status poll error:", statusRes.status, errText);
        continue; // retry
      }

      const statusData = await statusRes.json();
      status = statusData?.status || statusData?.generation_status || "processing";
      courseData = statusData;

      console.log(`⏳ Quizgecko status: ${status} (${Math.round((Date.now() - startTime) / 1000)}s)`);

      if (status === "failed" || status === "error") {
        return secureErrorResponse("Quizgecko generation failed", 500);
      }
    }

    if (status !== "completed") {
      return secureErrorResponse("Quizgecko generation timed out after 90s", 504);
    }

    // Step 3: Fetch the generated quiz
    const quizIds = courseData?.quizzes || courseData?.quiz_ids || [];
    let questions: any[] = [];

    if (quizIds.length > 0) {
      // Fetch first quiz
      const quizId = typeof quizIds[0] === "object" ? quizIds[0].id : quizIds[0];
      const quizRes = await fetch(`${QUIZGECKO_BASE_URL}/quizzes/${quizId}`, { headers });

      if (quizRes.ok) {
        const quizData = await quizRes.json();
        questions = quizData?.questions || quizData?.quiz?.questions || [];
      } else {
        console.error("Failed to fetch quiz:", quizRes.status);
      }
    }

    // Fallback: try to get questions from course data directly
    if (questions.length === 0 && courseData?.questions) {
      questions = courseData.questions;
    }

    if (questions.length === 0) {
      return secureErrorResponse("Quizgecko returned no questions", 500);
    }

    console.log(`✅ Quizgecko: ${questions.length} questions received. Transforming to HTML...`);

    // Step 4: Transform to canonical HTML format
    const quizContent = transformToHtml(questions, lessonTitle);

    return secureJsonResponse({ quizContent });
  } catch (error) {
    console.error("Error in generate-quiz-quizgecko:", error);
    return secureErrorResponse(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
});

// ============================================================================
// Helpers
// ============================================================================

function gradeToDifficulty(gradeLevel?: string): string {
  if (!gradeLevel) return "medium";
  const gl = gradeLevel.toUpperCase();
  if (gl.includes("6") || gl.includes("7") || gl.includes("NS1")) return "easy";
  if (gl.includes("9") || gl.includes("NS4") || gl.includes("RHETO") || gl.includes("PHILO") || gl.includes("TERM"))
    return "hard";
  return "medium";
}

function transformToHtml(questions: any[], lessonTitle: string): string {
  const letters = ["A", "B", "C", "D"];

  const questionsHtml = questions
    .map((q: any, idx: number) => {
      const questionText = q.question_text || q.question || q.prompt || "";
      const explanation = q.explanation || q.answer_explanation || "";

      // Extract answer options
      let options: { text: string; isCorrect: boolean }[] = [];

      if (Array.isArray(q.answer_options)) {
        options = q.answer_options.map((o: any) => ({
          text: o.option_text || o.text || o.answer || String(o),
          isCorrect: o.is_correct || o.correct || false,
        }));
      } else if (Array.isArray(q.answers)) {
        options = q.answers.map((o: any) => ({
          text: o.text || o.answer || String(o),
          isCorrect: o.is_correct || o.correct || false,
        }));
      } else if (Array.isArray(q.choices)) {
        options = q.choices.map((c: any, i: number) => ({
          text: typeof c === "string" ? c : c.text || String(c),
          isCorrect: i === (q.answerIndex ?? q.correct_index ?? -1),
        }));
      }

      // Ensure exactly 4 options
      while (options.length < 4) {
        options.push({ text: `Option ${letters[options.length]}`, isCorrect: false });
      }
      options = options.slice(0, 4);

      // Find correct answer letter
      const correctIdx = options.findIndex((o) => o.isCorrect);
      const correctLetter = correctIdx >= 0 ? letters[correctIdx] : "A";

      const optionsHtml = options
        .map(
          (o, i) =>
            `      <div class="option" data-answer="${letters[i]}">${letters[i]}) ${escapeHtml(o.text)}</div>`
        )
        .join("\n");

      return `  <div class="quiz-question" data-number="${idx + 1}">
    <h3>Question ${idx + 1}</h3>
    <p>${escapeHtml(questionText)}</p>
    <div class="quiz-options">
${optionsHtml}
    </div>
    <div class="correct-answer" data-correct="${correctLetter}">
      <p><strong>Réponse correcte: ${correctLetter}</strong></p>
      <p>${escapeHtml(explanation)}</p>
    </div>
  </div>`;
    })
    .join("\n");

  return `<div class="quiz-container">\n${questionsHtml}\n</div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
