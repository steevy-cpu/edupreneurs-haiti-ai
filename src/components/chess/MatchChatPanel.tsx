import React, { useEffect, useRef, useCallback, type FocusEvent, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage, PlayerInfo } from '@/hooks/useChessMultiplayer';

interface MatchChatPanelProps {
  messages: ChatMessage[];
  userId: string | null;
  opponent: PlayerInfo | null;
  userProfile: { nickname: string; avatar_url: string | null } | null;
  onSendMessage: (message: string) => Promise<void>;
  onClose: () => void;
}

const MatchChatPanel: React.FC<MatchChatPanelProps> = ({
  messages,
  userId,
  opponent,
  userProfile,
  onSendMessage,
  onClose,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isSending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isSending) {
      setIsSending(true);
      await onSendMessage(inputMessage.trim());
      setInputMessage('');
      setIsSending(false);
    }
  };

  const handleInputFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, []);

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return undefined;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/user-avatars/${avatarUrl}`;
  };

  const quickReplies = [
    "Bien joué!",
    "GG",
    "Bonne chance!"
  ];

  return (
    <div className="fixed inset-0 sm:inset-4 md:inset-8 z-50 bg-card/95 backdrop-blur-md sm:border sm:rounded-2xl shadow-xl flex flex-col animate-scale-in overflow-hidden max-h-[100dvh]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={getAvatarUrl(opponent?.avatar_url || null)} />
            <AvatarFallback className="text-xs">
              {opponent?.nickname?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{opponent?.nickname || 'Adversaire'}</h3>
            <p className="text-xs text-muted-foreground">En partie</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              Commencez la conversation!
            </div>
          )}
          
          {messages.map((msg, index) => {
            const isMe = msg.sender_id === userId;
            const senderProfile = isMe ? userProfile : opponent;
            
            return (
              <div
                key={msg.id || index}
                className={cn("flex gap-2", isMe ? 'justify-end' : 'justify-start')}
              >
                {!isMe && (
                  <Avatar className="w-6 h-6 shrink-0">
                    <AvatarImage src={getAvatarUrl(senderProfile?.avatar_url || null)} />
                    <AvatarFallback className="text-[10px]">
                      {senderProfile?.nickname?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
                {isMe && (
                  <Avatar className="w-6 h-6 shrink-0">
                    <AvatarImage src={getAvatarUrl(userProfile?.avatar_url || null)} />
                    <AvatarFallback className="text-[10px]">
                      {userProfile?.nickname?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          
          {isSending && (
            <div className="flex justify-end gap-2">
              <div className="bg-primary/50 text-primary-foreground rounded-2xl rounded-br-md px-3 py-2">
                <Loader2 className="w-3 h-3 animate-spin" />
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
            onClick={async () => {
              setIsSending(true);
              await onSendMessage(reply);
              setIsSending(false);
            }}
            disabled={isSending}
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
            onFocus={handleInputFocus}
            placeholder="Message..."
            className="flex-1 h-9 text-sm mobile-input tap-highlight-none"
            autoCapitalize="sentences"
            autoCorrect="on"
            spellCheck={false}
            enterKeyHint="send"
            disabled={isSending}
          />
          <Button 
            type="submit" 
            size="icon"
            className="h-9 w-9"
            disabled={!inputMessage.trim() || isSending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MatchChatPanel;
