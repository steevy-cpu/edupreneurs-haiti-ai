import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Send, Paperclip, FileText } from "lucide-react";
import { Message } from "@/types/community";

// Lazy load EmojiPicker (~200KB) - only loaded when user opens emoji picker
const EmojiPicker = lazy(() => import("emoji-picker-react"));

export interface ChatComposerProps {
  newMessage: string;
  isSending: boolean;
  showEmojiPicker: boolean;
  mediaPreview: string | null;
  mediaType: 'image' | 'video' | 'document' | null;
  replyingTo: Message | null;
  isJudeConversation: boolean;
  hasMediaFile: boolean;
  onSend: () => void;
  onEmojiPickerChange: (open: boolean) => void;
  onEmojiSelect: (emoji: string) => void;
  onMediaSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearMedia: () => void;
  onCancelReply: () => void;
  onTyping: (value: string) => void;
}

export const ChatComposer = ({
  newMessage,
  isSending,
  showEmojiPicker,
  mediaPreview,
  mediaType,
  replyingTo,
  isJudeConversation,
  hasMediaFile,
  onSend,
  onEmojiPickerChange,
  onEmojiSelect,
  onMediaSelect,
  onClearMedia,
  onCancelReply,
  onTyping,
}: ChatComposerProps) => {
  return (
    <div 
      className="shrink-0 border-t border-border/50 bg-background/95 backdrop-blur-md z-10"
    >
      <div className="p-3 pt-2 md:p-4 md:pt-2">
        {/* Reply Preview */}
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
        
        {/* Media Preview */}
        {mediaPreview && (
          <div className="mb-2 relative">
            {mediaType === 'image' ? (
              <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg object-contain bg-muted/20" loading="lazy" decoding="async" />
            ) : mediaType === 'video' ? (
              <video src={mediaPreview} controls className="max-h-48 rounded-lg bg-muted/20" />
            ) : mediaType === 'document' ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-lg border border-border/50">
                <FileText size={24} className="text-primary shrink-0" />
                <span className="text-sm font-medium truncate">{mediaPreview}</span>
              </div>
            ) : null}
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
              <Suspense fallback={
                <div className="w-full h-[400px] flex items-center justify-center bg-background">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }>
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    onEmojiSelect(emojiData.emoji);
                    onEmojiPickerChange(false);
                  }}
                  width="100%"
                  height="400px"
                />
              </Suspense>
            </PopoverContent>
          </Popover>

          {/* Media Upload Button - Hidden for Jude conversations */}
          {!isJudeConversation && (
            <>
              <input
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
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
                title="Joindre une image, vidéo ou document"
              >
                <Paperclip size={20} />
              </Button>
            </>
          )}

          <Textarea
            placeholder="Écrivez un message..."
            value={newMessage}
            onChange={(e) => onTyping(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            onFocus={(e) => {
              setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 300);
            }}
            className="text-base resize-none min-h-[40px] max-h-[120px] overflow-y-auto mobile-input tap-highlight-none"
            autoCapitalize="sentences"
            autoCorrect="on"
            spellCheck={false}
            enterKeyHint="send"
            rows={1}
            style={{
              height: 'auto',
              minHeight: '40px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <Button
            size="icon"
            onClick={onSend}
            disabled={(!newMessage.trim() && !hasMediaFile) || isSending}
            className={`shrink-0 h-10 w-10 ${isSending ? 'animate-send-bounce' : ''}`}
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
