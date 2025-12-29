import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import ericChairDesk from '@/assets/eric-chair-desk.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EricCoachBannerProps {
  messages: Message[];
  isThinking: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSendMessage?: (message: string) => void;
}

// Clean markdown formatting from text
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{3}[\s\S]*?`{3}/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
};

const EricCoachBanner: React.FC<EricCoachBannerProps> = ({
  messages,
  isThinking,
  isExpanded,
  onToggle,
  onSendMessage
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const latestEricMessage = [...messages].reverse().find(m => m.role === 'assistant');
  
  const handleSend = () => {
    if (inputMessage.trim() && onSendMessage) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  if (!latestEricMessage && !isThinking) return null;

  return (
    <div className="relative flex items-start gap-2">
      {/* Eric Avatar - Floating outside */}
      <img 
        src={ericChairDesk} 
        alt="Eric" 
        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-primary/30 shadow-md cursor-pointer hover:scale-105 transition-transform"
        onClick={onToggle}
      />
      
      {/* Speech Bubble */}
      <div className="relative flex-1">
        {/* Bubble pointer */}
        <div className="absolute left-0 top-4 -ml-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-muted" />
        
        <div className="bg-muted rounded-2xl shadow-lg overflow-hidden">
          {/* Collapsed View - Single Line */}
          <div 
            className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-muted-foreground/5 transition-colors"
            onClick={onToggle}
          >
            <div className="flex-1 min-w-0">
              {isThinking ? (
                <p className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  Eric réfléchit...
                </p>
              ) : latestEricMessage ? (
                <p className="text-sm text-foreground truncate">
                  {cleanMarkdown(latestEricMessage.content)}
                </p>
              ) : null}
            </div>

            <Button variant="ghost" size="sm" className="flex-shrink-0 h-7 w-7 p-0 rounded-full">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Expanded View - Chat History + Input */}
          {isExpanded && (
            <div className="border-t border-border/50">
              <ScrollArea className="max-h-48">
                <div className="p-3 space-y-2">
                  {messages.slice(-6).map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <img 
                          src={ericChairDesk} 
                          alt="Eric" 
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-1.5 text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background'
                        }`}
                      >
                        {msg.role === 'assistant' ? cleanMarkdown(msg.content) : msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Message Input */}
              {onSendMessage && (
                <div className="p-2 border-t border-border/50 flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Posez une question à Eric..."
                    className="flex-1 h-9 text-sm rounded-full"
                    disabled={isThinking}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || isThinking}
                    className="h-9 w-9 p-0 rounded-full"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EricCoachBanner;
