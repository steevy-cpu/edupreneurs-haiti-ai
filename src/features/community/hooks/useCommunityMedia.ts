/**
 * @file useCommunityMedia — Manages media selection, optimization, preview, and download
 * for the Community messaging system. Fully self-contained — no realtime, no cross-hook deps.
 */
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { optimizeMediaFile, formatFileSize, generateImageThumbnail } from "@/utils/mediaOptimization";
import { logger } from "@/utils/logger";

export interface UseCommunityMediaReturn {
  selectedMediaFile: File | null;
  mediaPreview: string | null;
  mediaType: 'image' | 'video' | 'document' | null;
  uploadProgress: number | null;
  setUploadProgress: React.Dispatch<React.SetStateAction<number | null>>;
  handleMediaSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearMedia: () => void;
  handleDownloadMedia: (url: string, type: 'image' | 'video') => Promise<void>;
}

export function useCommunityMedia(): UseCommunityMediaReturn {
  const { toast } = useToast();

  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'document' | null>(null);
  // Video upload progress (0-100) for 3G feedback
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleMediaSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isDocument = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ].includes(file.type) || file.name.endsWith('.txt');

    if (!isImage && !isVideo && !isDocument) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image, vidéo ou document (PDF, Word, TXT)",
        variant: "destructive",
      });
      return;
    }

    // Check document size limit (10MB)
    if (isDocument && file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "Le document ne doit pas dépasser 10 Mo",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isDocument) {
        // For documents, no optimization needed
        setSelectedMediaFile(file);
        setMediaType('document');
        setMediaPreview(file.name); // Use filename as preview
        
        toast({
          title: "Document prêt",
          description: `${file.name} (${formatFileSize(file.size)})`,
        });
      } else {
        // Handle images and videos with optimization
        const mediaTypeValue = isImage ? 'image' : 'video';
        
        if (isImage) {
          toast({
            title: "Optimisation...",
            description: "Compression de l'image en cours...",
          });
        }

        const { file: optimizedFile, originalSize, optimizedSize, savings } = await optimizeMediaFile(file, mediaTypeValue);
        
        setSelectedMediaFile(optimizedFile);
        setMediaType(mediaTypeValue);

        // For images, use FileReader for preview
        // For videos, use createObjectURL for instant preview (much faster)
        if (isImage) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setMediaPreview(reader.result as string);
          };
          reader.readAsDataURL(optimizedFile);
        } else {
          // For videos, createObjectURL is instant (no file reading needed)
          const videoUrl = URL.createObjectURL(optimizedFile);
          setMediaPreview(videoUrl);
        }

        if (isImage && savings > 10) {
          toast({
            title: "Image optimisée!",
            description: `Taille réduite de ${savings.toFixed(0)}% (${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)})`,
          });
        } else if (isVideo) {
          const sizeInMB = optimizedSize / (1024 * 1024);
          if (sizeInMB > 10) {
            toast({
              title: "Vidéo prête",
              description: `Taille: ${formatFileSize(optimizedSize)}. Prête à être envoyée!`,
            });
          }
        }
      }
    } catch (error: any) {
      logger.error('Error processing media:', error);
      toast({
        title: "Erreur",
        description: error.message || `Impossible de traiter le fichier`,
        variant: "destructive",
      });
      e.target.value = ''; // Reset input
    }
  }, [toast]);

  const clearMedia = useCallback(() => {
    // Revoke object URL if it was created for video preview
    if (mediaPreview && mediaType === 'video') {
      URL.revokeObjectURL(mediaPreview);
    }
    setSelectedMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  }, [mediaPreview, mediaType]);

  const handleDownloadMedia = useCallback(async (url: string, type: 'image' | 'video') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      const timestamp = new Date().getTime();
      const extension = type === 'image' ? 'jpg' : 'mp4';
      link.download = `edupreneurs-${type}-${timestamp}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Téléchargement réussi",
        description: `${type === 'image' ? 'L\'image' : 'La vidéo'} a été enregistrée sur votre appareil`,
      });
    } catch (error) {
      logger.error('Error downloading media:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    selectedMediaFile,
    mediaPreview,
    mediaType,
    uploadProgress,
    setUploadProgress,
    handleMediaSelect,
    clearMedia,
    handleDownloadMedia,
  };
}
