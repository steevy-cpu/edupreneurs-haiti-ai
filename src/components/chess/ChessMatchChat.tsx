import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage, PlayerInfo } from '@/hooks/useChessMultiplayer';

interface ChessMatchChatProps {
  messages: ChatMessage[];
  userId: string | null;
  opponent: PlayerInfo | null;
  userProfile: { nickname: string; avatar_url: string | null } | null;
  onSendMessage: (message: string) => Promise<void>;
  onClose: () => void;
}

export const ChessMatchChat = ({
  messages,
  userId,
  opponent,
  userProfile,
  onSendMessage,
  onClose,
}: ChessMatchChatProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage);
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return undefined;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/user-avatars/${avatarUrl}`;
  };

  const getSenderInfo = (senderId: string) => {
    if (senderId === userId) {
      return {
        name: userProfile?.nickname || 'Vous',
        avatar: userProfile?.avatar_url,
        isMe: true,
      };
    }
    return {
      name: opponent?.nickname || 'Adversaire',
      avatar: opponent?.avatar_url,
      isMe: false,
    };
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="flex flex-col h-[500px] lg:h-full">
      <CardHeader className="py-3 px-4 border-b shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Chat</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Aucun message. Dites bonjour! 👋
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const sender = getSenderInfo(message.sender_id);
                
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      sender.isMe ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={getAvatarUrl(sender.avatar || null)} />
                      <AvatarFallback className="text-xs">
                        {sender.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={cn(
                      "max-w-[75%]",
                      sender.isMe ? "text-right" : "text-left"
                    )}>
                      <div className={cn(
                        "inline-block px-3 py-2 rounded-lg text-sm",
                        sender.isMe 
                          ? "bg-primary text-primary-foreground rounded-br-none" 
                          : "bg-muted rounded-bl-none"
                      )}>
                        {message.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-3 border-t shrink-0">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Votre message..."
              className="flex-1"
              maxLength={200}
            />
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
