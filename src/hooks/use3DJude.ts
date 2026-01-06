import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Phoneme } from '@/components/jude3d/JudeLipSync';
import { EmotionType } from '@/components/jude3d/JudeEmotions';

interface Message {
  content: string;
  sender: 'user' | 'jude';
  navigationPath?: string;
}

interface JudeAIResponse {
  response: string;
  animation?: string;
  emotion?: string;
  audioUrl?: string;
  phonemes?: Phoneme[];
  duration?: number;
  navigate?: string;
}

interface Use3DJudeOptions {
  enableVoice?: boolean;
  enable3D?: boolean;
  userNickname?: string;
}

interface Use3DJudeReturn {
  // State
  isLoading: boolean;
  isSpeaking: boolean;
  currentAnimation: string;
  currentEmotion: string;
  messages: Message[];
  phonemes: Phoneme[];
  
  // Audio
  audioRef: React.RefObject<HTMLAudioElement>;
  isAudioPlaying: boolean;
  
  // Preferences
  enable3D: boolean;
  enableVoice: boolean;
  
  // Actions
  sendMessage: (text: string) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  playAnimation: (name: string) => void;
  setEmotion: (emotion: EmotionType) => void;
  toggleVoice: () => void;
  toggle3D: () => void;
  stopAudio: () => void;
}

export const use3DJude = (options: Use3DJudeOptions = {}): Use3DJudeReturn => {
  const {
    enableVoice: initialEnableVoice = true,
    enable3D: initialEnable3D = true,
    userNickname = ''
  } = options;

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral');
  const [messages, setMessages] = useState<Message[]>([]);
  const [phonemes, setPhonemes] = useState<Phoneme[]>([]);
  const [enable3D, setEnable3D] = useState(initialEnable3D);
  const [enableVoice, setEnableVoice] = useState(initialEnableVoice);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load user preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: prefs } = await supabase
          .from('user_jude_preferences')
          .select('enable_3d, enable_voice')
          .eq('user_id', user.id)
          .single();

        if (prefs) {
          setEnable3D(prefs.enable_3d ?? true);
          setEnableVoice(prefs.enable_voice ?? true);
        }
      } catch (error) {
        console.log('No preferences found, using defaults');
      }
    };

    loadPreferences();
  }, []);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsAudioPlaying(true);
      setIsSpeaking(true);
      setCurrentAnimation('talking');
    };

    const handleEnded = () => {
      setIsAudioPlaying(false);
      setIsSpeaking(false);
      setCurrentAnimation('idle');
      setPhonemes([]);
    };

    const handlePause = () => {
      setIsAudioPlaying(false);
      setIsSpeaking(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Send message to Jude AI
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setCurrentAnimation('thinking');

    // Add user message
    setMessages(prev => [...prev, { content: text, sender: 'user' }]);

    try {
      const { data, error } = await supabase.functions.invoke<JudeAIResponse>('jude-ai-tutor', {
        body: {
          message: text,
          userNickname,
          enableVoice,
          chatHistory: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        }
      });

      if (error) throw error;

      if (data) {
        // Add Jude's response
        setMessages(prev => [...prev, {
          content: data.response,
          sender: 'jude',
          navigationPath: data.navigate
        }]);

        // Set animation and emotion
        if (data.animation) {
          setCurrentAnimation(data.animation);
        }
        if (data.emotion) {
          setCurrentEmotion(data.emotion as EmotionType);
        }

        // Handle audio playback
        if (data.audioUrl && enableVoice && audioRef.current) {
          setPhonemes(data.phonemes || []);
          audioRef.current.src = data.audioUrl;
          await audioRef.current.play().catch(console.error);
        } else {
          // No audio - reset to idle after a delay
          setTimeout(() => {
            setCurrentAnimation('idle');
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error sending message to Jude:', error);
      setMessages(prev => [...prev, {
        content: "Désolé, j'ai rencontré un problème. Réessayez dans un moment.",
        sender: 'jude'
      }]);
      setCurrentAnimation('idle');
    } finally {
      setIsLoading(false);
    }
  }, [messages, userNickname, enableVoice]);

  // Play specific animation
  const playAnimation = useCallback((name: string) => {
    setCurrentAnimation(name);
  }, []);

  // Set emotion
  const setEmotion = useCallback((emotion: EmotionType) => {
    setCurrentEmotion(emotion);
  }, []);

  // Toggle voice
  const toggleVoice = useCallback(async () => {
    const newValue = !enableVoice;
    setEnableVoice(newValue);

    // Save preference
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_jude_preferences')
          .upsert({
            user_id: user.id,
            enable_voice: newValue,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Error saving voice preference:', error);
    }
  }, [enableVoice]);

  // Toggle 3D
  const toggle3D = useCallback(async () => {
    const newValue = !enable3D;
    setEnable3D(newValue);

    // Save preference
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_jude_preferences')
          .upsert({
            user_id: user.id,
            enable_3d: newValue,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Error saving 3D preference:', error);
    }
  }, [enable3D]);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setIsAudioPlaying(false);
    setPhonemes([]);
  }, []);

  return {
    // State
    isLoading,
    isSpeaking,
    currentAnimation,
    currentEmotion,
    messages,
    phonemes,
    
    // Audio
    audioRef,
    isAudioPlaying,
    
    // Preferences
    enable3D,
    enableVoice,
    
    // Actions
    sendMessage,
    setMessages,
    playAnimation,
    setEmotion,
    toggleVoice,
    toggle3D,
    stopAudio
  };
};
