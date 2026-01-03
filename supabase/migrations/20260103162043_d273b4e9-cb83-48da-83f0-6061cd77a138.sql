-- First drop the existing trigger that depends on the old function
DROP TRIGGER IF EXISTS on_user_profile_created ON public.profiles;

-- Now drop and recreate the function with the new name
DROP FUNCTION IF EXISTS public.auto_follow_eric_and_welcome();

CREATE OR REPLACE FUNCTION public.auto_follow_jude_and_welcome()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
DECLARE
  jude_user_id uuid := '68f2f959-e14a-47f9-8277-07df3a6fcd79';
  new_conversation_id uuid;
BEGIN
  -- Only proceed if this is not Jude's own profile
  IF NEW.user_id != jude_user_id THEN
    -- Create automatic follow relationship with Jude (accepted status)
    INSERT INTO public.follows (follower_id, following_id, status)
    VALUES (NEW.user_id, jude_user_id, 'accepted')
    ON CONFLICT DO NOTHING;
    
    -- Create a new conversation
    INSERT INTO public.conversations (id, created_at, updated_at)
    VALUES (gen_random_uuid(), now(), now())
    RETURNING id INTO new_conversation_id;
    
    -- Add both Jude and the new user as participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
      (new_conversation_id, jude_user_id),
      (new_conversation_id, NEW.user_id);
    
    -- Send welcome message from Jude
    INSERT INTO public.messages (conversation_id, sender_id, content, created_at, read)
    VALUES (
      new_conversation_id,
      jude_user_id,
      '👋 Bienvenue sur Edupreneurs! Je suis Jude, votre assistant IA éducatif. 🤖📚

Je suis là pour vous accompagner dans votre parcours d''apprentissage! N''hésitez pas à me poser des questions sur vos cours, demander de l''aide pour vos devoirs, ou simplement discuter de sujets qui vous intéressent. 💡

Comment puis-je vous aider aujourd''hui? ✨🎓',
      now(),
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the new trigger with the new function
CREATE TRIGGER on_profile_created_follow_jude
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_follow_jude_and_welcome();

-- Update the create_group_chat function to reference Jude
CREATE OR REPLACE FUNCTION public.create_group_chat(p_name text, p_description text DEFAULT NULL::text, p_avatar_url text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_group_id uuid;
  v_user_id uuid;
  jude_user_id uuid := '68f2f959-e14a-47f9-8277-07df3a6fcd79';
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Insert the group
  INSERT INTO public.group_chats (name, description, avatar_url, created_by)
  VALUES (p_name, p_description, p_avatar_url, v_user_id)
  RETURNING id INTO v_group_id;
  
  -- Add the creator as an admin member
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'admin');
  
  -- Add Jude as a member automatically
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, jude_user_id, 'member')
  ON CONFLICT DO NOTHING;
  
  RETURN v_group_id;
END;
$function$;