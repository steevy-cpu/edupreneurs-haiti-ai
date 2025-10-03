import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mic, Send, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ericAvatar from "@/assets/ai-assistant.png";

interface Message {
  content: string;
  sender: "user" | "eric";
}

export const EricChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Salut ! Je suis Eric, votre professeur. Comment puis-je vous aider ? 😊",
      sender: "eric"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speakMessage = (text: string, index: number) => {
    if (isSpeaking === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(null);
    
    setIsSpeaking(index);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages(prev => [...prev, { content: userMessage, sender: "user" }]);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('math-ai-tutor', {
        body: {
          message: userMessage,
          lessonType: 'tutor',
          chatHistory: messages.map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content
          }))
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        content: data.response, 
        sender: "eric" 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Character */}
      <div 
        className="eric-floating-character"
        onClick={() => setIsOpen(true)}
      >
        <div className="eric-tooltip">
          Cliquez sur moi
        </div>
        <img 
          src={ericAvatar} 
          alt="Eric - Assistant IA" 
          className="w-full h-auto"
        />
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <div className="eric-chat-interface animate-slide-in-right">
          <Button
            variant="destructive"
            size="icon"
            className="eric-close-btn"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Messages */}
          <div className="eric-chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`eric-message ${message.sender === "user" ? "eric-message-user" : "eric-message-eric"}`}
              >
                <img 
                  src={message.sender === "eric" ? ericAvatar : "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>"}
                  alt={message.sender}
                  className="eric-message-avatar"
                />
                <div className="eric-message-content">
                  {message.content}
                </div>
                {message.sender === "eric" && (
                  <div className="eric-message-controls">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`eric-speaker-btn ${isSpeaking === index ? "speaking" : ""}`}
                      onClick={() => speakMessage(message.content, index)}
                      title="Écouter ce message"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="eric-typing-indicator">
                Eric écrit<span className="eric-dots">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="eric-input-area">
            <div className="flex gap-2 items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre question..."
                maxLength={200}
                className="flex-1 border-none bg-transparent"
              />
              <Button
                variant="ghost"
                size="icon"
                className="eric-voice-btn"
                title="Enregistrement vocal"
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                className="eric-send-btn"
                onClick={sendMessage}
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
