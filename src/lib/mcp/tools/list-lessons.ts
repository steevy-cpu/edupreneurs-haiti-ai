import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_lessons",
  title: "List lessons",
  description:
    "List published lessons, optionally filtered by subject id, academic grade, or a title search term.",
  inputSchema: {
    subject_id: z.string().uuid().optional().describe("Subject id from list_subjects."),
    grade_level: z.string().trim().optional().describe("Academic grade code, e.g. NS2."),
    search: z.string().trim().min(1).optional().describe("Search text matched against lesson titles."),
    limit: z.number().int().min(1).max(50).optional().describe("Max lessons to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ subject_id, grade_level, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("lessons")
      .select("id, title, slug, subject_id, grade_level, order_index, mois")
      .eq("is_published", true)
      .order("order_index", { ascending: true });
    if (subject_id) query = query.eq("subject_id", subject_id);
    if (grade_level) query = query.eq("grade_level", grade_level);
    // ilike wildcards are escaped by PostgREST parameter encoding; input stays untrusted text.
    if (search) query = query.ilike("title", `%${search}%`);
    const { data, error } = await query.limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { lessons: data ?? [] },
    };
  },
});
