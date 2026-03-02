import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, CheckCheck, Download, Edit2, FileText, Smile, Trash2, X } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { Message, Reaction } from "@/types/community";
import { FloatingReaction } from "./FloatingReaction";
import { ChatMessageRenderer } from "@/components/ChatMessageRenderer";
import { MessageTypewriter } from "./MessageTypewriter";
import { NetworkAwareImage, NetworkAwareVideo } from "@/components/feed/NetworkAwareMedia";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  userId?: string;
  reactions: Reaction[];
  editingMessageId: string | null;
  editedContent: string;
  showReactionPicker: string | null;
  onSetReplyingTo: (message: Message | null) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (messageId: string) => void;
  onSetEditedContent: (content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onSetShowReactionPicker: (messageId: string | null) => void;
  onDownloadMedia: (url: string | null | undefined, type: 'image' | 'video') => void;
  onSetFullSizeImage: (url: string | null) => void;
  formatTime: (timestamp: string) => string;
  messageIndex?: number;
  shouldAnimate?: boolean;
  shouldShowFloatingReactions?: boolean;
  /** Enable typewriter effect for this message */
  isTypewriting?: boolean;
  /** Callback when typewriter animation completes */
  onTypewriterComplete?: () => void;
}

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '🎉'];

export function MessageBubble({
  message,
  isOwn,
  userId,
  reactions,
  editingMessageId,
  editedContent,
  showReactionPicker,
  onSetReplyingTo,
  onEditMessage,
  onCancelEdit,
  onSaveEdit,
  onSetEditedContent,
  onDeleteMessage,
  onToggleReaction,
  onSetShowReactionPicker,
  onDownloadMedia,
  onSetFullSizeImage,
  formatTime,
  messageIndex = 0,
  shouldAnimate = true,
  shouldShowFloatingReactions = true,
  isTypewriting = false,
  onTypewriterComplete,
}: MessageBubbleProps) {
  const navigate = useNavigate();
  const [floatingReactions, setFloatingReactions] = useState<string[]>([]);
  const prevReactionsRef = useRef<Reaction[]>(reactions);

  // Track new reactions for floating animation
  useEffect(() => {
    if (!shouldShowFloatingReactions) return;
    
    const prevReactions = prevReactionsRef.current;
    const newReactions = reactions.filter(
      r => !prevReactions.some(pr => pr.id === r.id)
    );
    
    if (newReactions.length > 0) {
      setFloatingReactions(prev => [...prev, ...newReactions.map(r => r.emoji)]);
    }
    
    prevReactionsRef.current = reactions;
  }, [reactions, shouldShowFloatingReactions]);

  const handleFloatingReactionComplete = (index: number) => {
    setFloatingReactions(prev => prev.filter((_, i) => i !== index));
  };

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction.user_id);
    return acc;
  }, {} as Record<string, string[]>);

  const handleMessageClick = (e: React.MouseEvent) => {
    // Don't trigger reply if clicking on avatar or post
    if (!(e.target as HTMLElement).closest('.no-reply-trigger')) {
      onSetReplyingTo(message);
    }
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (message.profile?.user_id) {
      navigate(`/profile/${message.profile.user_id}`);
    }
  };

  // Animation styles for staggered entry
  const getAnimationStyle = () => {
    if (!shouldAnimate || messageIndex >= 8) return {};
    
    return {
      '--msg-index': messageIndex,
      animation: 'messageSlideIn 0.3s ease-out forwards',
      animationDelay: `${messageIndex * 40}ms`,
      opacity: 0,
    } as React.CSSProperties;
  };

  // Shared Post Display
  const renderSharedPost = () => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        navigate("/feed");
      }}
      className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 cursor-pointer hover:opacity-90 transition-opacity no-reply-trigger break-words ${
        isOwn
          ? "bg-primary/90 text-primary-foreground"
          : "bg-muted"
      }`}
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/20">
        <span className="text-xs font-semibold opacity-80">
          📝 Post partagé de {message.shared_post?.profile?.nickname || message.shared_post?.profile?.full_name}
        </span>
      </div>
      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words mb-2">
        {message.shared_post?.content}
      </p>
      {message.shared_post?.image_url && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium flex items-center gap-1">
              📷 Image
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-background/50 no-reply-trigger"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadMedia(message.shared_post?.image_url, 'image');
              }}
            >
              <Download size={14} />
            </Button>
          </div>
          <img
            src={message.shared_post.image_url}
            alt="Post"
            className="rounded-lg w-full max-h-48 object-contain bg-muted/20 cursor-pointer hover:opacity-90 transition-opacity"
            loading="lazy"
            decoding="async"
            onClick={(e) => {
              e.stopPropagation();
              onSetFullSizeImage(message.shared_post?.image_url || null);
            }}
          />
        </div>
      )}
      <p className="text-xs opacity-70 mt-2">Cliquez pour voir le post</p>
    </div>
  );

  // Editing Mode
  const renderEditMode = () => (
    <div className="flex flex-col gap-2 w-full">
      <Textarea
        value={editedContent}
        onChange={(e) => onSetEditedContent(e.target.value)}
        className="min-h-[60px] resize-none"
        autoFocus
        onClick={(e) => e.stopPropagation()}
      />
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onCancelEdit();
          }}
          className="no-reply-trigger"
        >
          <X size={14} className="mr-1" />
          Annuler
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSaveEdit(message.id);
          }}
          className="no-reply-trigger"
        >
          <Check size={14} className="mr-1" />
          Enregistrer
        </Button>
      </div>
    </div>
  );

  // Document detection via dedicated columns (replaces legacy doc: string parsing)
  const isDocument = !!message.document_url;
  const documentInfo = isDocument ? {
    name: message.document_name || 'Document',
    url: message.document_url!,
  } : null;

  // Regular Message Display
  const renderRegularMessage = () => (
    <div className="relative group/message">
      <div
        className={`rounded-2xl px-3 py-2 sm:px-4 break-words overflow-wrap-anywhere ${
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <div className={`flex items-start ${(message.image_url && !isDocument) ? 'justify-between' : 'justify-start'} gap-2`}>
          <div className="text-xs sm:text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere flex-1">
            {isTypewriting ? (
              <MessageTypewriter 
                content={message.content} 
                onComplete={onTypewriterComplete}
              />
            ) : (
              <ChatMessageRenderer content={message.content} />
            )}
          </div>
          {message.image_url && !isDocument && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-background/50 no-reply-trigger shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadMedia(message.image_url, 'image');
              }}
            >
              <Download size={14} />
            </Button>
          )}
        </div>
        {/* Document display */}
        {isDocument && documentInfo && (
          <div 
            className={`mt-2 flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity no-reply-trigger ${
              isOwn ? 'bg-primary-foreground/20' : 'bg-muted/50'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              window.open(documentInfo.url, '_blank');
            }}
          >
            <FileText size={20} className="shrink-0" />
            <span className="text-xs font-medium truncate flex-1">{documentInfo.name}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-background/50 no-reply-trigger shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                const link = document.createElement('a');
                link.href = documentInfo.url;
                link.download = documentInfo.name;
                link.click();
              }}
            >
              <Download size={14} />
            </Button>
          </div>
        )}
        {/* Image display */}
        {message.image_url && !isDocument && (
          <div
            className="mt-2 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              // Open full-size image (always use image_url, not thumbnail)
              onSetFullSizeImage(message.image_url || null);
            }}
          >
            {/* Display thumbnail if available, fallback to full image for older messages */}
            <NetworkAwareImage
              src={(message.thumbnail_url || message.image_url)!}
              alt="Image"
              className="rounded-lg w-full max-h-64 object-contain bg-muted/20"
            />
          </div>
        )}
        {message.video_url && (
          <div className="relative group/video mt-2">
            {/* Network-aware: shows tap-to-load placeholder on 3G */}
            <NetworkAwareVideo
              src={message.video_url!}
              className="rounded-lg w-full max-h-64"
            />
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-2 h-8 w-8 p-0 opacity-0 group-hover/video:opacity-100 transition-opacity bg-background/90 hover:bg-background no-reply-trigger shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadMedia(message.video_url, 'video');
              }}
            >
              <Download size={16} />
            </Button>
          </div>
        )}
      </div>
      {isOwn && (
        <div className="absolute -right-2 top-0 opacity-0 group-hover/message:opacity-100 transition-opacity flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 bg-background/90 hover:bg-background no-reply-trigger"
            onClick={(e) => {
              e.stopPropagation();
              onEditMessage(message.id, message.content);
            }}
          >
            <Edit2 size={12} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 bg-background/90 hover:bg-destructive hover:text-destructive-foreground no-reply-trigger"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteMessage(message.id);
            }}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      )}
    </div>
  );

  // Reactions Display
  const renderReactions = () => {
    const hasReactions = reactions.length > 0;

    return (
      <div className="relative">
        {/* Floating reactions container */}
        {floatingReactions.length > 0 && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 pointer-events-none">
            {floatingReactions.map((emoji, index) => (
              <FloatingReaction
                key={`${emoji}-${index}`}
                emoji={emoji}
                onComplete={() => handleFloatingReactionComplete(index)}
              />
            ))}
          </div>
        )}

        {hasReactions && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(groupedReactions).map(([emoji, userIds]) => {
              const hasUserReacted = userIds.includes(userId || '');
              return (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleReaction(message.id, emoji);
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors no-reply-trigger ${
                    hasUserReacted 
                      ? "bg-primary/20 border border-primary/50" 
                      : "bg-muted border border-border hover:bg-muted/80"
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] font-medium">{userIds.length}</span>
                </button>
              );
            })}
            
            {/* Add Reaction Button */}
            <Popover 
              open={showReactionPicker === message.id} 
              onOpenChange={(open) => onSetShowReactionPicker(open ? message.id : null)}
            >
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-0.5 rounded-full text-xs bg-muted border border-border hover:bg-muted/80 transition-colors no-reply-trigger"
                >
                  ➕
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-2" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-2">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleReaction(message.id, emoji);
                      }}
                      className="text-xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
        
        {/* Add Reaction Button (when no reactions exist) */}
        {!hasReactions && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <Popover 
              open={showReactionPicker === message.id} 
              onOpenChange={(open) => onSetShowReactionPicker(open ? message.id : null)}
            >
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-0.5 rounded-full text-xs bg-muted border border-border hover:bg-muted/80 transition-colors no-reply-trigger flex items-center gap-1"
                >
                  <Smile size={12} />
                  <span className="text-[10px]">Réagir</span>
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-2" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-2">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleReaction(message.id, emoji);
                      }}
                      className="text-xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`flex ${isOwn ? "justify-end" : "justify-start"} px-2`}
      style={getAnimationStyle()}
    >
      <div 
        className={`flex gap-1.5 sm:gap-2 max-w-[85%] sm:max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"} cursor-pointer group`}
        onClick={handleMessageClick}
      >
        <Avatar 
          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 cursor-pointer no-reply-trigger avatar-interactive"
          onClick={handleAvatarClick}
        >
          <AvatarImage src={getAvatarUrl(message.profile?.avatar_url)} loading="lazy" decoding="async" />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-[10px] sm:text-xs">
            {(message.profile?.nickname || message.profile?.full_name)?.[0] || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 min-w-0 max-w-full">
          {/* Reply reference */}
          {message.replied_to && (
            <div className={`text-xs px-2 py-1 rounded-lg border break-words ${
              isOwn ? "bg-primary/20 border-primary/30" : "bg-muted/60 border-border/30"
            }`}>
              <div className="font-semibold opacity-70">
                {message.replied_to.profile?.nickname || message.replied_to.profile?.full_name}
              </div>
              <div className="opacity-60 truncate">
                {message.replied_to.content.substring(0, 50)}
                {message.replied_to.content.length > 50 && "..."}
              </div>
            </div>
          )}

          {/* Message content */}
          {message.shared_post ? (
            renderSharedPost()
          ) : editingMessageId === message.id ? (
            renderEditMode()
          ) : (
            renderRegularMessage()
          )}

          {/* Timestamp and read status */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
            {message.edited_at && (
              <span className="text-xs text-muted-foreground italic">· modifié</span>
            )}
            {isOwn && (
              <span className="inline-flex">
                {message.read ? (
                  <CheckCheck size={14} className="text-primary" />
                ) : (
                  <Check size={14} className="text-muted-foreground" />
                )}
              </span>
            )}
          </div>
          
          {/* Reactions */}
          {renderReactions()}
        </div>
      </div>
    </div>
  );
}
