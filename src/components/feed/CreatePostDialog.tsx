import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Image, Globe, Lock, Video, AtSign, Loader2, BadgeCheck, X, PenSquare, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { optimizeMediaFile, formatFileSize } from "@/utils/mediaOptimization";
import { getAvatarUrl } from "@/lib/avatarMap";

interface CreatePostDialogProps {
  currentUser: any;
  onPostCreated: () => void;
}

interface FollowerProfile {
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  verified: boolean | null;
}

export function CreatePostDialog({ currentUser, onPostCreated }: CreatePostDialogProps) {
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isPublicPost, setIsPublicPost] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention feature state
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<FollowerProfile[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [followers, setFollowers] = useState<FollowerProfile[]>([]);

  // Fetch followers on mount (two-step query to avoid join issues)
  useEffect(() => {
    const fetchFollowers = async () => {
      if (!currentUser) return;
      
      // Step 1: Get all following IDs
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id)
        .eq('status', 'accepted');
      
      if (followsError) {
        console.error('Error fetching follows:', followsError);
        return;
      }
      
      if (!followsData || followsData.length === 0) {
        setFollowers([]);
        return;
      }
      
      const followingIds = followsData.map(f => f.following_id);
      
      // Step 2: Get profiles for those IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, nickname, avatar_url, verified')
        .in('user_id', followingIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }
      
      if (profilesData) {
        console.log('[Mentions] Loaded', profilesData.length, 'followers');
        setFollowers(profilesData as FollowerProfile[]);
      }
    };
    
    if (open) {
      fetchFollowers();
    }
  }, [currentUser, open]);

  // Update suggestions when followers load and dropdown is active
  useEffect(() => {
    if (showMentionSuggestions && mentionQuery === '' && followers.length > 0) {
      setMentionSuggestions(followers);
    }
  }, [followers, showMentionSuggestions, mentionQuery]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    setNewPostContent(value);
    setCursorPosition(cursorPos);
    
    // Detect @ mention
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionQuery(query);
      
      // If query is empty (just @), show all followers
      // Otherwise filter by name/nickname
      let filtered;
      if (query === '') {
        filtered = followers;
      } else {
        filtered = followers.filter(f => 
          f.full_name.toLowerCase().includes(query) || 
          f.nickname.toLowerCase().includes(query)
        );
      }
      setMentionSuggestions(filtered);
      setShowMentionSuggestions(filtered.length > 0);
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const insertMention = (profile: FollowerProfile) => {
    const textBeforeCursor = newPostContent.slice(0, cursorPosition);
    const textAfterCursor = newPostContent.slice(cursorPosition);
    
    // Find the @ symbol position
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    const beforeMention = newPostContent.slice(0, mentionStart);
    
    // Insert the mention
    const mention = `@${profile.nickname} `;
    const newContent = beforeMention + mention + textAfterCursor;
    
    setNewPostContent(newContent);
    setShowMentionSuggestions(false);
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const insertAtSymbol = () => {
    const pos = textareaRef.current?.selectionStart || newPostContent.length;
    const newContent = newPostContent.slice(0, pos) + '@' + newPostContent.slice(pos);
    setNewPostContent(newContent);
    setCursorPosition(pos + 1);
    
    // Show all followers immediately when @ is inserted
    setMentionQuery('');
    setMentionSuggestions(followers);
    setShowMentionSuggestions(followers.length > 0);
    
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(pos + 1, pos + 1);
    }, 0);
  };

  // Extract mentions from content
  const extractMentions = (content: string): string[] => {
    const mentionPattern = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionPattern.exec(content)) !== null) {
      mentions.push(match[1]); // nickname without @
    }
    
    return [...new Set(mentions)]; // Remove duplicates
  };

  // Resolve nicknames to user IDs
  const resolveMentionsToUserIds = async (nicknames: string[]): Promise<string[]> => {
    if (nicknames.length === 0) return [];
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, nickname')
      .in('nickname', nicknames);
    
    return profiles?.map(p => p.user_id) || [];
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast({
        title: "Optimisation...",
        description: "Compression de l'image en cours...",
      });

      const { file: optimizedFile, originalSize, optimizedSize, savings } = await optimizeMediaFile(file, 'image');
      
      setSelectedImage(optimizedFile);
      setSelectedVideo(null);
      setVideoPreview(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(optimizedFile);

      if (savings > 10) {
        toast({
          title: "Image optimisée!",
          description: `Taille réduite de ${savings.toFixed(0)}% (${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)})`,
        });
      }
    } catch (error) {
      console.error('Error optimizing image:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'optimiser l'image",
        variant: "destructive",
      });
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file: validatedFile } = await optimizeMediaFile(file, 'video');
      
      setSelectedVideo(validatedFile);
      setSelectedImage(null);
      setImagePreview(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(validatedFile);

      const sizeInMB = validatedFile.size / (1024 * 1024);
      if (sizeInMB > 10) {
        toast({
          title: "Vidéo volumineuse",
          description: `Taille: ${formatFileSize(validatedFile.size)}. Envisagez de compresser pour économiser de l'espace.`,
        });
      }
    } catch (error: any) {
      console.error('Error validating video:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger la vidéo",
        variant: "destructive",
      });
      e.target.value = '';
    }
  };

  const createPost = async () => {
    if ((!newPostContent.trim() && !selectedImage && !selectedVideo) || !currentUser) return;

    setIsCreatingPost(true);
    let imageUrl = null;
    let videoUrl = null;

    if (selectedImage) {
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${currentUser.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, selectedImage);

      if (uploadError) {
        toast({
          title: "Erreur",
          description: "Impossible de télécharger l'image",
          variant: "destructive",
        });
        setIsCreatingPost(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    }

    if (selectedVideo) {
      const fileExt = selectedVideo.name.split('.').pop();
      const fileName = `${currentUser.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, selectedVideo);

      if (uploadError) {
        toast({
          title: "Erreur",
          description: "Impossible de télécharger la vidéo",
          variant: "destructive",
        });
        setIsCreatingPost(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);
      
      videoUrl = publicUrl;
    }

    const { data: newPost, error } = await supabase
      .from("posts")
      .insert({
        user_id: currentUser.id,
        content: newPostContent.trim(),
        image_url: imageUrl,
        video_url: videoUrl,
        is_public: isPublicPost,
      })
      .select('id')
      .single();

    if (error || !newPost) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le post",
        variant: "destructive",
      });
      setIsCreatingPost(false);
      return;
    }

    // Process mentions via backend function
    try {
      console.log('[Mentions] Calling notify-mentions backend function...');
      const { data: mentionResult, error: mentionError } = await supabase.functions.invoke('notify-mentions', {
        body: {
          postId: newPost.id,
          content: newPostContent.trim(),
          url: '/feed',
        }
      });

      if (mentionError) {
        console.error('[Mentions] Backend function error:', mentionError);
      } else {
        console.log('[Mentions] Backend function result:', mentionResult);
      }
    } catch (mentionError) {
      console.error('[Mentions] Error calling backend function:', mentionError);
      // Don't fail the post creation if mention notifications fail
    }

    setNewPostContent("");
    setSelectedImage(null);
    setSelectedVideo(null);
    setImagePreview(null);
    setVideoPreview(null);
    setIsPublicPost(false);
    setIsCreatingPost(false);
    setOpen(false);
    setShowMentionSuggestions(false);
    
    toast({
      title: "Succès",
      description: isPublicPost ? "Post public créé avec succès" : "Post créé avec succès",
    });
    
    onPostCreated();
  };

  const isEmpty = !newPostContent.trim() && !selectedImage && !selectedVideo;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="hover:bg-accent/50">
          <Plus size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto p-0">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 p-4 sm:p-6 overflow-hidden">
          {/* Animated background circles */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-2 right-8 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-2 left-8 w-12 h-12 bg-accent/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '150ms' }} />
          </div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="p-2.5 bg-primary/20 rounded-full shadow-lg shadow-primary/20">
                <PenSquare className="h-5 w-5 text-primary" />
              </div>
              <span>Créer un post</span>
              <Sparkles className="h-4 w-4 text-primary/60 ml-auto animate-pulse" />
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Partagez vos pensées avec vos amis
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-4 sm:p-6 pt-4">
          {/* Textarea with mention suggestions */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Quoi de neuf ? Utilisez @ pour mentionner un ami..."
              value={newPostContent}
              onChange={handleContentChange}
              className="min-h-[140px] resize-none border-2 border-muted bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 rounded-xl transition-all text-base"
            />
            
            {/* Mention suggestions dropdown */}
            {showMentionSuggestions && mentionSuggestions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full max-w-xs bg-popover border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 text-xs text-muted-foreground border-b bg-muted/30 flex items-center gap-2">
                  <AtSign className="h-3 w-3" />
                  Mentionner un ami
                </div>
                <ScrollArea className="max-h-48">
                  {mentionSuggestions.map((profile) => (
                    <div
                      key={profile.user_id}
                      className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => insertMention(profile)}
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                        <AvatarImage src={getAvatarUrl(profile.avatar_url)} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {profile.full_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium flex items-center gap-1 truncate">
                          {profile.full_name}
                          {profile.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">@{profile.nickname}</p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={imagePreview} alt="Preview" className="w-full max-h-96 object-contain bg-muted/20" loading="lazy" decoding="async" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Video Preview */}
          {videoPreview && (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <video src={videoPreview} controls className="w-full max-h-96 bg-muted/20" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                onClick={() => {
                  setSelectedVideo(null);
                  setVideoPreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Enhanced Public/Private Toggle */}
          <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
            isPublicPost 
              ? 'bg-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/20' 
              : 'bg-muted/40 border-2 border-muted-foreground/20 hover:border-muted-foreground/40'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full transition-colors ${
                isPublicPost ? 'bg-primary/20' : 'bg-muted'
              }`}>
                {isPublicPost ? (
                  <Globe size={20} className="text-primary" />
                ) : (
                  <Lock size={20} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {isPublicPost ? 'Post public' : 'Post privé'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPublicPost 
                    ? 'Visible par tous les utilisateurs' 
                    : 'Visible uniquement par vos abonnés'}
                </p>
              </div>
            </div>
            <Switch
              checked={isPublicPost}
              onCheckedChange={setIsPublicPost}
              className="shadow-lg ring-2 ring-offset-2 ring-offset-background data-[state=checked]:ring-primary data-[state=unchecked]:ring-muted-foreground/30 data-[state=checked]:bg-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-2 pt-2 border-t border-border/50">
            <div className="flex gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Image size={18} />
                <span className="text-xs hidden sm:inline">Photo</span>
              </Button>
              
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
                id="video-upload"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Video size={18} />
                <span className="text-xs hidden sm:inline">Vidéo</span>
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={insertAtSymbol}
                className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <AtSign size={18} />
                <span className="text-xs hidden sm:inline">Mentionner</span>
              </Button>
            </div>
            
            <Button
              onClick={createPost}
              disabled={isEmpty || isCreatingPost}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold"
            >
              {isCreatingPost ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publication...
                </>
              ) : (
                'Publier'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
