import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  onToggle
}) => {
  const latestEricMessage = [...messages].reverse().find(m => m.role === 'assistant');
  
  if (!latestEricMessage && !isThinking) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl overflow-hidden">
      {/* Collapsed View - Single Line */}
      <div 
        className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-primary/5 transition-colors"
        onClick={onToggle}
      >
        <img 
          src={ericChairDesk} 
          alt="Eric" 
          className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-primary/30"
        />
        
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

        <Button variant="ghost" size="sm" className="flex-shrink-0 h-8 w-8 p-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Expanded View - Chat History */}
      {isExpanded && (
        <div className="border-t border-primary/10">
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
                        : 'bg-muted'
                    }`}
                  >
                    {msg.role === 'assistant' ? cleanMarkdown(msg.content) : msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default EricCoachBanner;
