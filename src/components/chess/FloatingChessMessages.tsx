import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, MessageCircle, X } from 'lucide-react';
import ericChairDesk from '@/assets/eric-chair-desk.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FloatingChessMessagesProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const FloatingChessMessages: React.FC<FloatingChessMessagesProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isOpen,
  onToggle
}) => {
  const [inputMessage, setInputMessage] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const quickReplies = [
    "Pourquoi?",
    "Aide-moi",
    "Stratégie?"
  ];

  // Show last message as floating bubble when closed
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];

  return (
    <>
      {/* Floating toggle button with Eric avatar */}
      <button
        onClick={onToggle}
        className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-3 py-2 shadow-lg hover:scale-105 transition-transform"
      >
        <img 
          src={ericChairDesk} 
          alt="Eric" 
          className="w-8 h-8 rounded-full object-cover border-2 border-primary-foreground/20"
        />
        {!isOpen && (
          <span className="text-sm font-medium max-w-[120px] truncate">
            Chat avec Eric
          </span>
        )}
        {isOpen ? <X className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
      </button>

      {/* Last message floating bubble (when chat is closed) */}
      {!isOpen && lastAssistantMessage && (
        <div 
          className="absolute bottom-20 right-4 left-4 z-10 animate-fade-in cursor-pointer"
          onClick={onToggle}
        >
          <div className="bg-card/95 backdrop-blur-sm border rounded-2xl rounded-br-md p-3 shadow-lg max-w-[280px] ml-auto">
            <div className="flex items-start gap-2">
              <img 
                src={ericChairDesk} 
                alt="Eric" 
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
              <p className="text-sm text-foreground line-clamp-3">
                {lastAssistantMessage.content}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded chat panel */}
      {isOpen && (
        <div className="absolute inset-4 z-20 bg-card/95 backdrop-blur-md border rounded-2xl shadow-xl flex flex-col animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <img 
                src={ericChairDesk} 
                alt="Eric" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-foreground text-sm">Eric - Coach</h3>
                <p className="text-xs text-muted-foreground">Pose tes questions!</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3" ref={scrollRef}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs text-muted-foreground">Eric réfléchit...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Replies */}
          <div className="px-3 py-2 border-t flex gap-1.5 overflow-x-auto">
            {quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs h-7 px-2"
                onClick={() => onSendMessage(reply)}
                disabled={isLoading}
              >
                {reply}
              </Button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Question..."
                className="flex-1 h-9 text-sm"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon"
                className="h-9 w-9"
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingChessMessages;
