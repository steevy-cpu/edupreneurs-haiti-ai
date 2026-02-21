import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { useCallback, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Minus,
  Upload,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { compressImage, validateAndPrepareVideo } from "@/utils/mediaOptimization";
import { uploadWithProgress } from "@/utils/uploadWithProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BlogPostEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function BlogPostEditor({
  content,
  onChange,
  placeholder = "Commencez à écrire votre article...",
}: BlogPostEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  
  // File upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: element => element.getAttribute('style'),
              renderHTML: attributes => {
                if (!attributes.style) return {};
                return { style: attributes.style };
              },
            },
          };
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80",
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-lg",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
  });

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setLinkDialogOpen(false);
    }
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      // Build width/height style string
      let styleStr = "";
      if (imageWidth) {
        const w = imageWidth.includes('%') || imageWidth.includes('px') 
          ? imageWidth 
          : `${imageWidth}px`;
        styleStr += `width: ${w};`;
      }
      if (imageHeight) {
        const h = imageHeight.includes('%') || imageHeight.includes('px') 
          ? imageHeight 
          : `${imageHeight}px`;
        styleStr += `height: ${h};`;
      }
      
      // Insert image with inline style if dimensions specified
      if (styleStr) {
        editor.chain().focus().insertContent({
          type: 'image',
          attrs: { 
            src: imageUrl,
            style: styleStr
          }
        }).run();
      } else {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
      
      setImageUrl("");
      setImageWidth("");
      setImageHeight("");
      setImageDialogOpen(false);
    }
  }, [editor, imageUrl, imageWidth, imageHeight]);

  const addYoutube = useCallback(() => {
    if (youtubeUrl && editor) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
      setYoutubeUrl("");
      setYoutubeDialogOpen(false);
    }
  }, [editor, youtubeUrl]);

  const resetImageDialog = useCallback(() => {
    setImageDialogOpen(false);
    setImageUrl("");
    setImageWidth("");
    setImageHeight("");
    setImageFile(null);
    setUploadProgress(0);
  }, []);

  const handleImageFileUpload = useCallback(async () => {
    if (!imageFile || !editor) return;

    // Guard: reject images over 10MB before attempting compression or upload
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    if (imageFile.size > MAX_IMAGE_SIZE) {
      toast({ title: "Image trop volumineuse. Taille maximale: 10MB", variant: "destructive" });
      return;
    }
    
    setIsUploadingImage(true);
    setUploadProgress(0);
    
    try {
      // Compress image before upload
      const compressedFile = await compressImage(imageFile);
      
      // Generate unique filename
      const filename = `content/${Date.now()}-${imageFile.name.replace(/\s/g, "-")}`;
      
      // Upload with progress tracking
      const { error } = await uploadWithProgress(
        'blog-images',
        filename,
        compressedFile,
        (progress) => setUploadProgress(progress.progress)
      );
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filename);
      
      // Insert image into editor with optional dimensions
      let styleStr = "";
      if (imageWidth) {
        const w = imageWidth.includes('%') || imageWidth.includes('px') 
          ? imageWidth : `${imageWidth}px`;
        styleStr += `width: ${w};`;
      }
      if (imageHeight) {
        const h = imageHeight.includes('%') || imageHeight.includes('px') 
          ? imageHeight : `${imageHeight}px`;
        styleStr += `height: ${h};`;
      }
      
      if (styleStr) {
        editor.chain().focus().insertContent({
          type: 'image',
          attrs: { src: publicUrl, style: styleStr }
        }).run();
      } else {
        editor.chain().focus().setImage({ src: publicUrl }).run();
      }
      
      toast({
        title: "Image ajoutée",
        description: "L'image a été uploadée et insérée avec succès.",
      });
      
      resetImageDialog();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  }, [editor, imageFile, imageWidth, imageHeight, toast, resetImageDialog]);

  const resetVideoDialog = useCallback(() => {
    setVideoDialogOpen(false);
    setVideoFile(null);
    setVideoUploadProgress(0);
  }, []);

  const handleVideoFileUpload = useCallback(async () => {
    if (!videoFile || !editor) return;
    
    setIsUploadingVideo(true);
    setVideoUploadProgress(0);
    
    try {
      // Validate video size (max 50MB)
      const { file: validatedFile, needsWarning } = await validateAndPrepareVideo(videoFile);
      
      if (needsWarning) {
        toast({
          title: "Fichier volumineux",
          description: "Cette vidéo est volumineuse et peut prendre du temps à charger sur les connexions lentes.",
        });
      }
      
      // Generate unique filename
      const filename = `videos/${Date.now()}-${videoFile.name.replace(/\s/g, "-")}`;
      
      // Upload with progress tracking
      const { error } = await uploadWithProgress(
        'blog-images',
        filename,
        validatedFile,
        (progress) => setVideoUploadProgress(progress.progress)
      );
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filename);
      
      // Insert video as HTML5 video element
      editor.chain().focus().insertContent(
        `<video controls class="w-full rounded-lg my-4" src="${publicUrl}"></video>`
      ).run();
      
      toast({
        title: "Vidéo ajoutée",
        description: "La vidéo a été uploadée et insérée avec succès.",
      });
      
      resetVideoDialog();
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'uploader la vidéo.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingVideo(false);
      setVideoUploadProgress(0);
    }
  }, [editor, videoFile, toast, resetVideoDialog]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Formatting */}
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("code")}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Link */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setLinkDialogOpen(true)}
          className={`h-8 w-8 ${editor.isActive("link") ? "bg-accent" : ""}`}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        {/* Image */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setImageDialogOpen(true)}
          className="h-8 w-8"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* YouTube */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setYoutubeDialogOpen(true)}
          className="h-8 w-8"
          title="Vidéo YouTube"
        >
          <YoutubeIcon className="h-4 w-4" />
        </Button>

        {/* Video Upload */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setVideoDialogOpen(true)}
          className="h-8 w-8"
          title="Uploader une vidéo"
        >
          <Video className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Horizontal Rule */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>


      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="z-[1200]">
          <DialogHeader>
            <DialogTitle>Ajouter un lien</DialogTitle>
            <DialogDescription>Entrez l'URL du lien à insérer dans l'article.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={addLink}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={(open) => !open && resetImageDialog()}>
        <DialogContent className="z-[1200]">
          <DialogHeader>
            <DialogTitle>Ajouter une image</DialogTitle>
            <DialogDescription>
              Uploadez une image depuis votre appareil ou entrez une URL.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Uploader
              </TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>
            
            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Sélectionner une image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  disabled={isUploadingImage}
                />
                {imageFile && (
                  <p className="text-sm text-muted-foreground">
                    Fichier: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
              
              {isUploadingImage && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-center text-muted-foreground">
                    Upload en cours... {uploadProgress}%
                  </p>
                </div>
              )}
              
              {/* Dimension controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Largeur (optionnel)</Label>
                  <Input
                    placeholder="ex: 400px ou 50%"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hauteur (optionnel)</Label>
                  <Input
                    placeholder="ex: 300px ou auto"
                    value={imageHeight}
                    onChange={(e) => setImageHeight(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetImageDialog} disabled={isUploadingImage}>
                  Annuler
                </Button>
                <Button 
                  type="button"
                  onClick={handleImageFileUpload} 
                  disabled={!imageFile || isUploadingImage}
                >
                  {isUploadingImage ? "Upload..." : "Ajouter"}
                </Button>
              </DialogFooter>
            </TabsContent>
            
            {/* URL Tab */}
            <TabsContent value="url" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>URL de l'image</Label>
                <Input
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              
              {/* Dimension controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Largeur (optionnel)</Label>
                  <Input
                    placeholder="ex: 400px ou 50%"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hauteur (optionnel)</Label>
                  <Input
                    placeholder="ex: 300px ou auto"
                    value={imageHeight}
                    onChange={(e) => setImageHeight(e.target.value)}
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Laissez vide pour la taille originale. Utilisez "px" ou "%" (ex: 400px, 50%).
              </p>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetImageDialog}>Annuler</Button>
                <Button type="button" onClick={addImage} disabled={!imageUrl}>Ajouter</Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Video Upload Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={(open) => !open && resetVideoDialog()}>
        <DialogContent className="z-[1200]">
          <DialogHeader>
            <DialogTitle>Ajouter une vidéo</DialogTitle>
            <DialogDescription>
              Uploadez une vidéo depuis votre appareil (max 50MB).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sélectionner une vidéo</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                disabled={isUploadingVideo}
              />
              {videoFile && (
                <p className="text-sm text-muted-foreground">
                  Fichier: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
            </div>
            
            {isUploadingVideo && (
              <div className="space-y-2">
                <Progress value={videoUploadProgress} />
                <p className="text-xs text-center text-muted-foreground">
                  Upload en cours... {videoUploadProgress}%
                </p>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Pour les vidéos YouTube, utilisez le bouton YouTube à la place.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetVideoDialog} disabled={isUploadingVideo}>
              Annuler
            </Button>
            <Button 
              type="button"
              onClick={handleVideoFileUpload} 
              disabled={!videoFile || isUploadingVideo}
            >
              {isUploadingVideo ? "Upload..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Dialog */}
      <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
        <DialogContent className="z-[1200]">
          <DialogHeader>
            <DialogTitle>Ajouter une vidéo YouTube</DialogTitle>
            <DialogDescription>Collez le lien YouTube de la vidéo à intégrer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">URL YouTube</Label>
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setYoutubeDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={addYoutube}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
