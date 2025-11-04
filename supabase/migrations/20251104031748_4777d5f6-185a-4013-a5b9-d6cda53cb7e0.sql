-- Create Anglais subject for AF9
INSERT INTO public.subjects (name, slug, description, icon_name, color, grade_level, lesson_count, created_by)
VALUES (
  'Anglais',
  'anglais',
  'English language course covering grammar, comprehension, and communication skills',
  'BookOpen',
  'bg-purple-500',
  'AF9',
  26,
  '68f2f959-e14a-47f9-8277-07df3a6fcd79'
)
ON CONFLICT DO NOTHING;