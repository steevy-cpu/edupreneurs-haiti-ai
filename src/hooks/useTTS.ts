import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTTSReturn {
  isSpeaking: boolean;
  isPaused: boolean;
  currentSection: string;
  isSupported: boolean;
  speak: (text: string, sectionId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

// Singleton instance tracker to ensure only one section speaks at a time
let activeSectionId: string | null = null;
const listeners = new Set<(sectionId: string | null) => void>();

const notifyListeners = (sectionId: string | null) => {
  listeners.forEach(listener => listener(sectionId));
};

export const useTTS = (): UseTTSReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [isSupported] = useState(() => 'speechSynthesis' in window);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sectionIdRef = useRef<string>('');

  // Listen to active section changes
  useEffect(() => {
    const handleActiveChange = (sectionId: string | null) => {
      if (sectionId !== sectionIdRef.current) {
        // Another section started speaking
        setIsSpeaking(false);
        setIsPaused(false);
      }
    };

    listeners.add(handleActiveChange);
    return () => {
      listeners.delete(handleActiveChange);
    };
  }, []);

  const stripHtmlTags = useCallback((html: string): string => {
    // Remove figure elements and illustrations
    let text = html.replace(/<figure[^>]*>.*?<\/figure>/gis, '');
    text = text.replace(/Cette illustration.*?$/gim, '');
    
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    text = textarea.value;
    
    // Remove all HTML tags
    text = text.replace(/<[^>]*>/g, ' ');
    
    // Clean up bullet points and formatting
    text = text.replace(/•/g, '. ');
    text = text.replace(/\n\s*\n/g, '\n');
    text = text.replace(/\s+/g, ' ');
    
    // Clean encoding artifacts
    text = text.replace(/[â€¢â€™â€œâ€]/g, '');
    
    return text.trim();
  }, []);

  const stop = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentSection('');
    utteranceRef.current = null;
    
    if (activeSectionId === sectionIdRef.current) {
      activeSectionId = null;
      notifyListeners(null);
    }
    sectionIdRef.current = '';
  }, [isSupported]);

  const speak = useCallback((text: string, sectionId: string) => {
    if (!isSupported) return;

    // Stop any currently playing speech
    window.speechSynthesis.cancel();

    // Update active section
    activeSectionId = sectionId;
    sectionIdRef.current = sectionId;
    notifyListeners(sectionId);

    // Clean the text
    const cleanText = stripHtmlTags(text);
    
    if (!cleanText) return;

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;
    
    // Configure for French
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1.0;
    
    // Try to find a French voice
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentSection(sectionId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentSection('');
      utteranceRef.current = null;
      if (activeSectionId === sectionId) {
        activeSectionId = null;
        notifyListeners(null);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentSection('');
      utteranceRef.current = null;
      if (activeSectionId === sectionId) {
        activeSectionId = null;
        notifyListeners(null);
      }
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, [isSupported, stripHtmlTags]);

  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
        if (activeSectionId === sectionIdRef.current) {
          activeSectionId = null;
          notifyListeners(null);
        }
      }
    };
  }, [isSupported]);

  // Load voices (some browsers load them asynchronously)
  useEffect(() => {
    if (isSupported && window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        window.speechSynthesis.getVoices();
      });
    }
  }, [isSupported]);

  return {
    isSpeaking,
    isPaused,
    currentSection,
    isSupported,
    speak,
    pause,
    resume,
    stop,
  };
};
