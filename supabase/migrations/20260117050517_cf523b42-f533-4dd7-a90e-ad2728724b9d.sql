-- Step 1: Create is_founder() without parameters (fixes existing bug in Feed.tsx)
CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IN (
    '0de08330-4183-48f9-b169-19b92f4d114f'::uuid,
    '7580cd10-e18c-4b2f-ac50-def28d046c9d'::uuid
  )
$$;

-- Step 2: Create is_jude_post() helper function
CREATE OR REPLACE FUNCTION public.is_jude_post(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = '68f2f959-e14a-47f9-8277-07df3a6fcd79'::uuid
$$;

-- Step 3: Update RLS policies on posts table for UPDATE
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;

CREATE POLICY "Users can update posts" ON public.posts
FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id 
  OR (
    public.is_founder(auth.uid()) 
    AND public.is_jude_post(user_id)
  )
);

-- Step 4: Update RLS policies on posts table for DELETE
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

CREATE POLICY "Users can delete posts" ON public.posts
FOR DELETE TO authenticated
USING (
  auth.uid() = user_id 
  OR (
    public.is_founder(auth.uid()) 
    AND public.is_jude_post(user_id)
  )
);

-- Step 5: Insert Jude's announcement post
INSERT INTO posts (id, user_id, content, is_public, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '68f2f959-e14a-47f9-8277-07df3a6fcd79',
  '📚 NOUVELLE FONCTIONNALITÉ : Page Lecture ! 🎉

Chers amis Edupreneurs,

J''ai le plaisir de vous annoncer le lancement de notre toute nouvelle section "Lecture" ! 📖✨

Vous pouvez maintenant :
• Découvrir une bibliothèque de livres et documents éducatifs
• Lire directement sur la plateforme
• Enrichir vos connaissances au-delà des matières scolaires

Rendez-vous dans le menu pour explorer cette nouvelle fonctionnalité ! 🚀

Bonne lecture à tous ! 📚💡

#Edupreneurs #Lecture #NouvellesFonctionnalités #Éducation',
  true,
  NOW(),
  NOW()
);