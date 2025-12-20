import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Image, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { optimizeMediaFile, formatFileSize } from "@/utils/mediaOptimization";

interface CreatePostDialogProps {
  currentUser: any;
  onPostCreated: () => void;
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

    const { error } = await supabase.from("posts").insert({
      user_id: currentUser.id,
      content: newPostContent.trim(),
      image_url: imageUrl,
      video_url: videoUrl,
      is_public: isPublicPost,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le post",
        variant: "destructive",
      });
      setIsCreatingPost(false);
      return;
    }

    setNewPostContent("");
    setSelectedImage(null);
    setSelectedVideo(null);
    setImagePreview(null);
    setVideoPreview(null);
    setIsPublicPost(false);
    setIsCreatingPost(false);
    setOpen(false);
    
    toast({
      title: "Succès",
      description: isPublicPost ? "Post public créé avec succès" : "Post créé avec succès",
    });
    
    onPostCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="hover:bg-accent/50">
          <Plus size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            placeholder="Quoi de neuf ?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-[120px] resize-none border-none bg-muted/30 focus-visible:ring-1"
          />
          
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full max-h-96 object-contain rounded-lg bg-muted/20" loading="lazy" decoding="async" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
              >
                ×
              </Button>
            </div>
          )}

          {videoPreview && (
            <div className="relative">
              <video src={videoPreview} controls className="w-full max-h-96 rounded-lg bg-muted/20" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedVideo(null);
                  setVideoPreview(null);
                }}
              >
                ×
              </Button>
            </div>
          )}

          {/* Public post toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Globe size={18} className={isPublicPost ? "text-primary" : "text-muted-foreground"} />
              <div>
                <p className="text-sm font-medium">Post public</p>
                <p className="text-xs text-muted-foreground">Visible par tous les utilisateurs</p>
              </div>
            </div>
            <Switch
              checked={isPublicPost}
              onCheckedChange={setIsPublicPost}
            />
          </div>

          <div className="flex justify-between items-center gap-2">
            <div className="flex gap-2">
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
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title="Ajouter une image"
              >
                <Image size={20} />
              </Button>
              
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
                id="video-upload"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => document.getElementById('video-upload')?.click()}
                title="Ajouter une vidéo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </Button>
            </div>
            
            <Button
              onClick={createPost}
              disabled={(!newPostContent.trim() && !selectedImage && !selectedVideo) || isCreatingPost}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreatingPost ? "Publication..." : "Publier"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}