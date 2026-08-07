import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_subjects",
  title: "List subjects",
  description:
    "List the school subjects (matières) available on Edupreneurs, optionally filtered by academic grade code (7AF, 8AF, 9AF, NS1-NS4).",
  inputSchema: {
    grade_level: z
      .string()
      .trim()
      .optional()
      .describe("Academic grade code, e.g. 9AF or NS4. Omit for all grades."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ grade_level }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("subjects")
      .select("id, name, slug, grade_level, series, lesson_count")
      .order("name");
    if (grade_level) query = query.eq("grade_level", grade_level);
    const { data, error } = await query.limit(100);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { subjects: data ?? [] },
    };
  },
});
