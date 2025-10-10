-- Function to auto-follow Eric and send welcome message when a new user signs up
CREATE OR REPLACE FUNCTION public.auto_follow_eric_and_welcome()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  eric_user_id uuid := '68f2f959-e14a-47f9-8277-07df3a6fcd79';
  new_conversation_id uuid;
BEGIN
  -- Only proceed if this is not Eric's own profile
  IF NEW.user_id != eric_user_id THEN
    -- Create automatic follow relationship with Eric (accepted status)
    INSERT INTO public.follows (follower_id, following_id, status)
    VALUES (NEW.user_id, eric_user_id, 'accepted')
    ON CONFLICT DO NOTHING;
    
    -- Create a new conversation
    INSERT INTO public.conversations (id, created_at, updated_at)
    VALUES (gen_random_uuid(), now(), now())
    RETURNING id INTO new_conversation_id;
    
    -- Add both Eric and the new user as participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
      (new_conversation_id, eric_user_id),
      (new_conversation_id, NEW.user_id);
    
    -- Send welcome message from Eric
    INSERT INTO public.messages (conversation_id, sender_id, content, created_at, read)
    VALUES (
      new_conversation_id,
      eric_user_id,
      '👋 Bienvenue sur Edupreneurs! Je suis Eric, votre assistant IA éducatif. 🤖📚

Je suis là pour vous accompagner dans votre parcours d''apprentissage! N''hésitez pas à me poser des questions sur vos cours, demander de l''aide pour vos devoirs, ou simplement discuter de sujets qui vous intéressent. 💡

Comment puis-je vous aider aujourd''hui? ✨🎓',
      now(),
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_user_profile_created ON public.profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_follow_eric_and_welcome();

-- Send welcome messages to all existing users (except Eric)
DO $$
DECLARE
  eric_user_id uuid := '68f2f959-e14a-47f9-8277-07df3a6fcd79';
  user_record RECORD;
  new_conversation_id uuid;
  existing_conversation_id uuid;
BEGIN
  FOR user_record IN 
    SELECT user_id, id FROM public.profiles 
    WHERE user_id != eric_user_id
  LOOP
    -- Check if conversation already exists between Eric and this user
    SELECT DISTINCT cp1.conversation_id INTO existing_conversation_id
    FROM public.conversation_participants cp1
    INNER JOIN public.conversation_participants cp2 
      ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = eric_user_id 
      AND cp2.user_id = user_record.user_id;
    
    IF existing_conversation_id IS NULL THEN
      -- Create follow relationship if it doesn't exist
      INSERT INTO public.follows (follower_id, following_id, status)
      VALUES (user_record.user_id, eric_user_id, 'accepted')
      ON CONFLICT DO NOTHING;
      
      -- Create new conversation
      INSERT INTO public.conversations (id, created_at, updated_at)
      VALUES (gen_random_uuid(), now(), now())
      RETURNING id INTO new_conversation_id;
      
      -- Add participants
      INSERT INTO public.conversation_participants (conversation_id, user_id)
      VALUES 
        (new_conversation_id, eric_user_id),
        (new_conversation_id, user_record.user_id);
      
      -- Send welcome message
      INSERT INTO public.messages (conversation_id, sender_id, content, created_at, read)
      VALUES (
        new_conversation_id,
        eric_user_id,
        '👋 Bienvenue sur Edupreneurs! Je suis Eric, votre assistant IA éducatif. 🤖📚

Je suis là pour vous accompagner dans votre parcours d''apprentissage! N''hésitez pas à me poser des questions sur vos cours, demander de l''aide pour vos devoirs, ou simplement discuter de sujets qui vous intéressent. 💡

Comment puis-je vous aider aujourd''hui? ✨🎓',
        now(),
        false
      );
    END IF;
  END LOOP;
END $$;