/**
 * AskJudeDrawer - Full chat drawer for deeper help
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { ContentBlocksRenderer } from '../../rendering/ContentBlocksRenderer';
import { MathText } from '@/components/MathContent';
import judeProfile from '@/assets/jude-profile.jpeg';
import type { TutorResponse, ContentBlock } from '../../types/exam.types';
import type { ExerciseForRunner } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  blocks?: ContentBlock[];
  timestamp: Date;
}

interface AskJudeDrawerProps {
  exercise: ExerciseForRunner;
  onAskJude: (question: string) => Promise<TutorResponse | null>;
}

export function AskJudeDrawer({ exercise, onAskJude }: AskJudeDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset messages when exercise changes
  useEffect(() => {
    setMessages([]);
  }, [exercise.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await onAskJude(userMessage.content);

      if (response) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.response || '',
          blocks: response.blocks,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error asking Jude:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full mt-2">
          <MessageCircle className="h-4 w-4 mr-2" />
          Demander à Jude
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh] min-h-[400px]">
        <div className="flex flex-col h-[70vh] max-h-[600px]">
          <DrawerHeader className="border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-primary/30">
                <AvatarImage src={judeProfile} alt="Jude" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">J</AvatarFallback>
              </Avatar>
              <div>
                <DrawerTitle>Demander à Jude</DrawerTitle>
                <p className="text-xs text-muted-foreground">
                  Q{exercise.exercise_number} - {exercise.concept}
                </p>
              </div>
            </div>
          </DrawerHeader>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 min-h-[200px]" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Pose ta question à Jude!</p>
                <p className="text-xs mt-1">Il t'aidera avec cet exercice.</p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 flex-shrink-0 border border-primary/30">
                      <AvatarImage src={judeProfile} alt="Jude" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">J</AvatarFallback>
                    </Avatar>
                  )}
                  <Card
                    className={`p-3 max-w-[85%] overflow-hidden ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border-primary/10'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed overflow-hidden">
                      {message.blocks && message.blocks.length > 0 ? (
                        <ContentBlocksRenderer blocks={message.blocks} />
                      ) : (
                        <MathText text={message.content} />
                      )}
                    </div>
                  </Card>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 border border-primary/30">
                    <AvatarImage src={judeProfile} alt="Jude" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">J</AvatarFallback>
                  </Avatar>
                  <Card className="p-4 bg-card border-primary/10">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Input area */}
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pose ta question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
