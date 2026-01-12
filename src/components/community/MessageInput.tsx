import { useState, useCallback, type FocusEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ImageIcon, Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { Message } from "@/types/community";

interface MessageInputProps {
  newMessage: string;
  isSending: boolean;
  showEmojiPicker: boolean;
  mediaPreview: string | null;
  mediaType: 'image' | 'video' | null;
  replyingTo: Message | null;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onEmojiPickerChange: (open: boolean) => void;
  onEmojiSelect: (emoji: string) => void;
  onMediaSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearMedia: () => void;
  onCancelReply: () => void;
}

export const MessageInput = ({
  newMessage,
  isSending,
  showEmojiPicker,
  mediaPreview,
  mediaType,
  replyingTo,
  onMessageChange,
  onSend,
  onEmojiPickerChange,
  onEmojiSelect,
  onMediaSelect,
  onClearMedia,
  onCancelReply,
}: MessageInputProps) => {
  const [isSendAnimating, setIsSendAnimating] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = useCallback(() => {
    if ((!newMessage.trim() && !mediaPreview) || isSending) return;
    
    // Trigger send animation
    setIsSendAnimating(true);
    
    // Call actual send
    onSend();
    
    // Reset animation after it completes
    setTimeout(() => {
      setIsSendAnimating(false);
    }, 150);
  }, [newMessage, mediaPreview, isSending, onSend]);

  const handleInputFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, []);

  return (
    <div className="border-t border-border/50 bg-background/95 backdrop-blur-md shrink-0" style={{
      position: 'sticky',
      bottom: 0,
      transform: `translateY(calc(-1 * var(--kb)))`,
      paddingBottom: 'calc(0.5rem + var(--safe-bottom))'
    }}>
      <div className="p-4 pt-2">
        {replyingTo && (
          <div className="mb-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/30 flex items-start justify-between max-w-full overflow-hidden">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-primary mb-0.5">
                Répondre à {replyingTo.profile?.nickname || replyingTo.profile?.full_name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {replyingTo.content}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0"
              onClick={onCancelReply}
            >
              ✕
            </Button>
          </div>
        )}
        
        {/* Media Preview with slide-up animation on send */}
        {mediaPreview && (
          <div 
            className="mb-2 relative transition-all duration-200"
            style={{
              opacity: isSendAnimating ? 0 : 1,
              transform: isSendAnimating ? 'translateY(-20px)' : 'translateY(0)',
            }}
          >
            {mediaType === 'image' ? (
              <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg object-contain bg-muted/20" loading="lazy" decoding="async" />
            ) : (
              <video src={mediaPreview} controls className="max-h-48 rounded-lg bg-muted/20" />
            )}
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={onClearMedia}
            >
              ×
            </Button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <Popover open={showEmojiPicker} onOpenChange={onEmojiPickerChange}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 h-10 w-10"
              >
                <Smile size={20} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-0" align="start">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  onEmojiSelect(emojiData.emoji);
                  onEmojiPickerChange(false);
                }}
                width="100%"
                height="400px"
              />
            </PopoverContent>
          </Popover>

          {/* Media Upload Button */}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={onMediaSelect}
            className="hidden"
            id="media-upload"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 h-10 w-10"
            onClick={() => document.getElementById('media-upload')?.click()}
          >
            <ImageIcon size={20} />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder="Écrivez un message..."
            className="flex-1 bg-muted/30 border-border/50 focus-visible:ring-primary/50 min-h-[40px] mobile-input tap-highlight-none"
            autoCapitalize="sentences"
            autoCorrect="on"
            spellCheck={false}
            enterKeyHint="send"
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && !mediaPreview) || isSending}
            size="icon"
            className={`shrink-0 h-10 w-10 bg-primary hover:bg-primary/90 transition-transform ${
              isSendAnimating ? 'animate-send-bounce' : ''
            }`}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
