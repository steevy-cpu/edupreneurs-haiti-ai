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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MessageCircle, Send, Loader2, Trash2 } from 'lucide-react';
import { ContentBlocksRenderer } from '../../rendering/ContentBlocksRenderer';
import { MathText } from '@/components/MathContent';
import { useExamTutorChat, type ChatMessage } from '../hooks/useExamTutorChat';
import judeProfile from '@/assets/jude-profile.jpeg';
import type { TutorResponse } from '../../types/exam.types';
import type { ExerciseForRunner } from '../types';

interface AskJudeDrawerProps {
  exercise: ExerciseForRunner;
  sessionId: string;
  onAskJude: (question: string) => Promise<TutorResponse | null>;
}

export function AskJudeDrawer({ exercise, sessionId, onAskJude }: AskJudeDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    saveUserMessage,
    saveAssistantMessage,
    deleteAllMessages,
    addOptimisticMessage,
    replaceOptimisticMessage,
  } = useExamTutorChat(sessionId, exercise.id);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userContent = input.trim();
    setInput('');
    setIsSending(true);

    // Create optimistic user message with temp ID
    const tempUserId = `temp-user-${Date.now()}`;
    const optimisticUserMsg: ChatMessage = {
      id: tempUserId,
      role: 'user',
      content: userContent,
      timestamp: new Date(),
    };
    addOptimisticMessage(optimisticUserMsg);

    try {
      // Save user message to DB and replace optimistic with real
      const savedUserMsg = await saveUserMessage(userContent);
      if (savedUserMsg) {
        replaceOptimisticMessage(tempUserId, savedUserMsg);
      }

      // Call the tutor API
      const response = await onAskJude(userContent);

      if (response) {
        // Create optimistic assistant message with temp ID
        const tempAssistantId = `temp-assistant-${Date.now()}`;
        const optimisticAssistantMsg: ChatMessage = {
          id: tempAssistantId,
          role: 'assistant',
          content: response.response || '',
          blocks: response.blocks,
          timestamp: new Date(),
        };
        addOptimisticMessage(optimisticAssistantMsg);

        // Save assistant response and replace optimistic with real
        const savedAssistantMsg = await saveAssistantMessage(response.response || '', response.blocks);
        if (savedAssistantMsg) {
          replaceOptimisticMessage(tempAssistantId, savedAssistantMsg);
        }
      }
    } catch (error) {
      console.error('Error asking Jude:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async () => {
    await deleteAllMessages();
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
            <div className="flex items-center justify-between">
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
              
              {/* Delete button with confirmation */}
              {messages.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer cette conversation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Tous les messages de cette conversation seront supprimés.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </DrawerHeader>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 min-h-[200px]" ref={scrollRef}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Pose ta question à Jude!</p>
                <p className="text-xs mt-1">Il t'aidera avec cet exercice.</p>
              </div>
            ) : (
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

                {isSending && (
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
            )}
          </div>

          {/* Input area */}
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pose ta question..."
                disabled={isSending || isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isSending || isLoading}>
                {isSending ? (
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
