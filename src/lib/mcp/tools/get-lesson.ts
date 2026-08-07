import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

/** Lesson bodies are long HTML; cap each section so tool results stay small enough
 *  to be useful inside an assistant's context window. */
const MAX_SECTION_CHARS = 4000;

function trim(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length > MAX_SECTION_CHARS ? `${value.slice(0, MAX_SECTION_CHARS)}…` : value;
}

export default defineTool({
  name: "get_lesson",
  title: "Get lesson",
  description:
    "Get the full text of one published lesson by its slug: objective, introduction, content and worked examples.",
  inputSchema: {
    slug: z.string().trim().min(1).describe("Lesson slug from list_lessons."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("lessons")
      .select("id, title, slug, grade_level, objectif, introduction, contenu, exemples_exercices, references, youtube_url")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No published lesson with slug "${slug}".` }], isError: true };

    const lesson = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      grade_level: data.grade_level,
      objectif: trim(data.objectif),
      introduction: trim(data.introduction),
      contenu: trim(data.contenu),
      exemples_exercices: trim(data.exemples_exercices),
      references: data.references,
      youtube_url: data.youtube_url,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(lesson) }],
      structuredContent: { lesson },
    };
  },
});
