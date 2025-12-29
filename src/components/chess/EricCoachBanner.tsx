import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ericChairDesk from '@/assets/eric-chair-desk.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EricCoachBannerProps {
  messages: Message[];
  isThinking: boolean;
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
  onSendMessage
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    <>
      {/* Floating Bubble Banner */}
      <div className="relative flex items-start gap-2 sm:gap-3">
        {/* Eric Avatar - Clickable to open dialog */}
        <img 
          src={ericChairDesk} 
          alt="Eric" 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0 border-2 border-primary/30 shadow-md cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setIsDialogOpen(true)}
        />
        
        {/* Speech Bubble */}
        <div className="relative flex-1 min-w-0">
          {/* Bubble pointer */}
          <div className="absolute left-0 top-3 sm:top-4 -ml-2 w-0 h-0 border-t-[6px] sm:border-t-8 border-t-transparent border-b-[6px] sm:border-b-8 border-b-transparent border-r-[6px] sm:border-r-8 border-r-muted" />
          
          <div 
            className="bg-muted rounded-2xl shadow-lg px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => setIsDialogOpen(true)}
          >
            {isThinking ? (
              <p className="text-xs sm:text-sm text-muted-foreground animate-pulse flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                Eric réfléchit...
              </p>
            ) : latestEricMessage ? (
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                {cleanMarkdown(latestEricMessage.content)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Dialog for full chat */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <img 
                src={ericChairDesk} 
                alt="Eric" 
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
              />
              <span>Chat avec Eric</span>
            </DialogTitle>
          </DialogHeader>
          
          {/* Messages */}
          <ScrollArea className="flex-1 max-h-[50vh] pr-2">
            <div className="space-y-3 py-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <img 
                      src={ericChairDesk} 
                      alt="Eric" 
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.role === 'assistant' ? cleanMarkdown(msg.content) : msg.content}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex gap-2 justify-start">
                  <img 
                    src={ericChairDesk} 
                    alt="Eric" 
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="bg-muted rounded-xl px-3 py-2">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Message Input */}
          {onSendMessage && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez une question à Eric..."
                className="flex-1 h-10 text-sm rounded-full"
                disabled={isThinking}
              />
              <Button 
                size="sm" 
                onClick={handleSend}
                disabled={!inputMessage.trim() || isThinking}
                className="h-10 w-10 p-0 rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EricCoachBanner;
