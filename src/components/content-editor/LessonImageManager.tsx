import React, { useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Image, 
  ChevronDown, 
  Replace, 
  Trash2, 
  Wand2, 
  Upload,
  Loader2,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LessonImageManagerProps {
  lessonId: string;
  lessonTitle: string;
  contenu: string | null;
  exemplesExercices: string | null;
  onContentUpdate: (field: 'contenu' | 'exemples_exercices', newContent: string) => void;
}

interface ExtractedImage {
  src: string;
  alt: string;
  field: 'contenu' | 'exemples_exercices';
  index: number;
  fullMatch: string;
}

export const LessonImageManager: React.FC<LessonImageManagerProps> = ({
  lessonId,
  lessonTitle,
  contenu,
  exemplesExercices,
  onContentUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ExtractedImage | null>(null);
  const [regeneratePrompt, setRegeneratePrompt] = useState('');
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract images from HTML content
  const extractedImages = useMemo(() => {
    const images: ExtractedImage[] = [];
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi;

    // Extract from contenu
    if (contenu) {
      let match;
      let index = 0;
      const regex = new RegExp(imgRegex);
      while ((match = regex.exec(contenu)) !== null) {
        images.push({
          src: match[1],
          alt: match[2] || `Image ${index + 1}`,
          field: 'contenu',
          index,
          fullMatch: match[0]
        });
        index++;
      }
    }

    // Extract from exemples_exercices
    if (exemplesExercices) {
      let match;
      let index = 0;
      const regex = new RegExp(imgRegex);
      while ((match = regex.exec(exemplesExercices)) !== null) {
        images.push({
          src: match[1],
          alt: match[2] || `Exercice Image ${index + 1}`,
          field: 'exemples_exercices',
          index,
          fullMatch: match[0]
        });
        index++;
      }
    }

    return images;
  }, [contenu, exemplesExercices]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedImage) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to storage
      const timestamp = Date.now();
      const fileName = `${lessonId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lesson-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lesson-images')
        .getPublicUrl(fileName);

      // Replace in content
      const content = selectedImage.field === 'contenu' ? contenu : exemplesExercices;
      if (!content) return;

      const newImgTag = `<img src="${publicUrl}" alt="${selectedImage.alt}" class="w-full max-w-2xl mx-auto rounded-lg shadow-md my-4">`;
      const newContent = content.replace(selectedImage.fullMatch, newImgTag);

      onContentUpdate(selectedImage.field === 'contenu' ? 'contenu' : 'exemples_exercices', newContent);

      // Try to delete old image from storage if it's in our bucket
      if (selectedImage.src.includes('lesson-images')) {
        const oldPath = selectedImage.src.split('lesson-images/')[1];
        if (oldPath) {
          await supabase.storage.from('lesson-images').remove([oldPath]).catch(() => {});
        }
      }

      toast.success('Image remplacée avec succès');
      setSelectedImage(null);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (image: ExtractedImage) => {
    const content = image.field === 'contenu' ? contenu : exemplesExercices;
    if (!content) return;

    // Remove the image tag from content
    const newContent = content.replace(image.fullMatch, '');
    onContentUpdate(image.field === 'contenu' ? 'contenu' : 'exemples_exercices', newContent);

    // Try to delete from storage
    if (image.src.includes('lesson-images')) {
      const path = image.src.split('lesson-images/')[1];
      if (path) {
        await supabase.storage.from('lesson-images').remove([path]).catch(() => {});
      }
    }

    toast.success('Image supprimée');
  };

  const handleRegenerate = async () => {
    if (!selectedImage || !regeneratePrompt.trim()) {
      toast.error('Veuillez entrer une description pour l\'image');
      return;
    }

    setIsRegenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-explanatory-images', {
        body: {
          lessonTitle,
          contenu: regeneratePrompt,
          exemplesExercices: '',
          gradeLevel: '9AF',
          subject: 'general',
          model: 'lovable'
        }
      });

      if (error) throw error;

      if (data.images && data.images.length > 0) {
        // The edge function returns base64Data, convert to data URL
        const base64Data = data.images[0].base64Data;
        const newImageUrl = base64Data.startsWith('data:') 
          ? base64Data 
          : `data:image/png;base64,${base64Data}`;
        
        // Replace in content
        const content = selectedImage.field === 'contenu' ? contenu : exemplesExercices;
        if (!content) return;

        const newImgTag = `<img src="${newImageUrl}" alt="${regeneratePrompt.substring(0, 50)}" class="w-full max-w-2xl mx-auto rounded-lg shadow-md my-4">`;
        const newContent = content.replace(selectedImage.fullMatch, newImgTag);

        onContentUpdate(selectedImage.field === 'contenu' ? 'contenu' : 'exemples_exercices', newContent);

        toast.success('Image régénérée avec succès');
        setShowRegenerateDialog(false);
        setSelectedImage(null);
        setRegeneratePrompt('');
      }

    } catch (error) {
      console.error('Regenerate error:', error);
      toast.error('Erreur lors de la régénération');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (extractedImages.length === 0) {
    return null;
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-dashed">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Gestion des Images ({extractedImages.length})
                </CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {extractedImages.map((image, idx) => (
                  <div 
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border bg-muted/20"
                  >
                    <div className="aspect-video">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedImage(image);
                          fileInputRef.current?.click();
                        }}
                        title="Remplacer"
                      >
                        <Replace className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedImage(image);
                          setRegeneratePrompt(image.alt);
                          setShowRegenerateDialog(true);
                        }}
                        title="Régénérer avec IA"
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => handleDelete(image)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Field badge */}
                    <div className="absolute bottom-1 left-1">
                      <span className="text-[10px] bg-background/80 px-1.5 py-0.5 rounded">
                        {image.field === 'contenu' ? 'Contenu' : 'Exercices'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Survolez une image pour voir les options: Remplacer, Régénérer avec IA, ou Supprimer.
              </p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Regenerate Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Régénérer l'image avec IA
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="prompt">Description de la nouvelle image</Label>
              <Input
                id="prompt"
                value={regeneratePrompt}
                onChange={(e) => setRegeneratePrompt(e.target.value)}
                placeholder="Décrivez l'image souhaitée..."
              />
              <p className="text-xs text-muted-foreground">
                Soyez précis pour obtenir une meilleure image.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRegenerateDialog(false);
                setSelectedImage(null);
                setRegeneratePrompt('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating || !regeneratePrompt.trim()}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Régénérer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Téléchargement en cours...</p>
          </div>
        </div>
      )}
    </>
  );
};
