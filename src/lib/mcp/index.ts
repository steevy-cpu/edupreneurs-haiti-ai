import { defineMcp, auth } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import listSubjects from "./tools/list-subjects";
import listLessons from "./tools/list-lessons";
import getLesson from "./tools/get-lesson";
import listMyCompletedLessons from "./tools/list-my-completed-lessons";
import getWordOfTheDay from "./tools/get-word-of-the-day";


// The OAuth issuer must be the direct Supabase host, not the Cloud proxy URL.
// VITE_SUPABASE_PROJECT_ID is inlined as a literal at build time, so this stays import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "edupreneurs-haiti-ai",
  title: "edupreneurs-haiti-ai",
  version: "0.1.0",
  instructions:
    "Tools for Edupreneurs Haiti, a French-language learning platform for Haitian students. Use list_subjects and list_lessons to browse the curriculum, get_lesson to read a lesson, get_my_profile and list_my_completed_lessons for the signed-in student's progress, and get_word_of_the_day for the daily vocabulary word.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyProfile, listSubjects, listLessons, getLesson, listMyCompletedLessons, getWordOfTheDay],
});
