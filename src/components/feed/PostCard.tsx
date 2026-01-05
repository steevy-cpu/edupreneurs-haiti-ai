import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Trash2, BadgeCheck } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarMap";
import { formatTimeAgo } from "@/utils/dateUtils";
import { Post } from "@/types/feed";

const MAX_CONTENT_LENGTH = 150;

// Function to render content with clickable links and styled mentions
const renderContentWithLinks = (content: string) => {
  // Match:
  // 1. @mentions (@username)
  // 2. Full URLs (https://example.com or http://example.com)
  // 3. Plain domains (example.com, sub.example.com)
  // 4. Internal routes (/path/to/page)
  const combinedRegex = /(@\w+|https?:\/\/[^\s]+|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+(?:com|org|net|io|dev|co|edu|gov|app|ht|fr)[^\s]*|\/[a-zA-Z0-9\-_/]+)/gi;
  
  const parts = content.split(combinedRegex);
  
  return parts.map((part, index) => {
    if (!part) return null;
    
    // 1. @mentions - link to user profile
    if (part.startsWith('@')) {
      const nickname = part.slice(1);
      return (
        <Link 
          key={index} 
          to={`/profile/${nickname}`}
          className="text-primary font-semibold hover:underline"
        >
          {part}
        </Link>
      );
    }
    
    // 2. Full URLs with http/https
    if (part.match(/^https?:\/\//i)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          {part}
        </a>
      );
    }
    
    // 3. Plain domains (add https:// for the href)
    if (part.match(/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+(?:com|org|net|io|dev|co|edu|gov|app|ht|fr)/i)) {
      return (
        <a 
          key={index} 
          href={`https://${part}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          {part}
        </a>
      );
    }
    
    // 4. Internal routes
    if (part.startsWith('/') && part.length > 1) {
      return (
        <Link 
          key={index} 
          to={part} 
          className="text-primary hover:underline font-medium"
        >
          {part}
        </Link>
      );
    }
    
    return part;
  });
};

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onLike: (postId: string, isLiked: boolean) => void;
  onComment: (postId: string) => void;
  onShare: (post: Post) => void;
  onDelete: (postId: string) => void;
}

export function PostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onDelete,
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = post.content.length > MAX_CONTENT_LENGTH;
  const displayContent = shouldTruncate && !isExpanded 
    ? post.content.slice(0, MAX_CONTENT_LENGTH) 
    : post.content;

  return (
    <div className="border-b border-border/50 bg-background">
      {/* Post Header */}
      <div className="flex items-center gap-3 px-3 xs:px-4 py-2.5 xs:py-3">
        <Avatar className="h-9 w-9 xs:h-10 xs:w-10 shrink-0">
          <AvatarImage src={getAvatarUrl(post.profile?.avatar_url)} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-foreground text-xs">
            {post.profile?.full_name?.[0] || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-xs xs:text-sm truncate">
              {post.profile?.full_name || "Utilisateur"}
            </p>
            {post.profile?.verified && (
              <BadgeCheck className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-primary fill-primary/20 shrink-0" />
            )}
          </div>
          <p className="text-[10px] xs:text-xs text-muted-foreground">
            {formatTimeAgo(post.created_at)}
          </p>
        </div>
        {post.user_id === currentUserId && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(post.id)}
            className="shrink-0 h-8 w-8 p-0"
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
        )}
      </div>

      {/* Post Content */}
      <div className="px-3 xs:px-4 pb-2.5 xs:pb-3">
        <p className="text-xs xs:text-sm whitespace-pre-wrap break-words leading-relaxed">
          {renderContentWithLinks(displayContent)}
          {shouldTruncate && !isExpanded && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-muted-foreground hover:text-foreground ml-1 font-medium"
            >
              ...voir plus
            </button>
          )}
          {shouldTruncate && isExpanded && (
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground ml-1 font-medium block mt-1"
            >
              voir moins
            </button>
          )}
        </p>
        {post.image_url && (
          <img 
            src={post.image_url} 
            alt="Post" 
            loading="lazy"
            decoding="async"
            className="mt-2 xs:mt-3 w-full rounded-lg object-contain bg-muted/20 max-h-[400px]"
          />
        )}
        {post.video_url && (
          <video 
            src={post.video_url} 
            controls 
            preload="metadata"
            className="mt-2 xs:mt-3 w-full rounded-lg bg-muted/20 max-h-[400px]"
          />
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-4 xs:gap-6 px-3 xs:px-4 py-1.5 xs:py-2 border-t border-border/30">
        <button
          onClick={() => onLike(post.id, post.isLiked || false)}
          className="flex items-center gap-1.5 xs:gap-2 group"
        >
          <Heart
            size={18}
            className={`transition-colors ${
              post.isLiked
                ? "fill-red-500 text-red-500"
                : "text-foreground group-hover:text-red-500"
            }`}
          />
          <span className={`text-xs xs:text-sm ${post.isLiked ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
            {post.likes || 0}
          </span>
        </button>

        <button
          onClick={() => onComment(post.id)}
          className="flex items-center gap-1.5 xs:gap-2 group"
        >
          <MessageCircle size={18} className="text-foreground group-hover:text-primary transition-colors" />
          <span className="text-xs xs:text-sm text-muted-foreground">
            {post.commentCount || 0}
          </span>
        </button>

        <button
          onClick={() => onShare(post)}
          className="flex items-center gap-1.5 xs:gap-2 group"
        >
          <Share2
            size={18}
            className={`transition-colors ${
              post.isShared
                ? "fill-primary text-primary"
                : "text-foreground group-hover:text-primary"
            }`}
          />
          <span className={`text-xs xs:text-sm ${post.isShared ? "text-primary font-medium" : "text-muted-foreground"}`}>
            {post.shareCount || 0}
          </span>
        </button>
      </div>
    </div>
  );
}
