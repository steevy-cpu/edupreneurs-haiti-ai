// Media optimization utilities for reducing storage costs

const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1920;
const IMAGE_QUALITY = 0.85;
const MAX_VIDEO_SIZE_MB = 50;

/**
 * Compress and resize an image file
 */
export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
          const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Create new file from blob
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, '.jpg'),
              { type: 'image/jpeg' }
            );
            
            console.log(`Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          IMAGE_QUALITY
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Check if video needs compression and validate size
 */
export const validateAndPrepareVideo = async (file: File): Promise<{ file: File; needsWarning: boolean }> => {
  const sizeInMB = file.size / (1024 * 1024);
  
  // Check if video is too large
  if (sizeInMB > MAX_VIDEO_SIZE_MB) {
    throw new Error(`La vidéo est trop volumineuse. Taille maximale: ${MAX_VIDEO_SIZE_MB}MB (Taille actuelle: ${sizeInMB.toFixed(1)}MB)`);
  }
  
  // Warn if video is larger than 10MB
  const needsWarning = sizeInMB > 10;
  
  console.log(`Video size: ${sizeInMB.toFixed(2)}MB${needsWarning ? ' (consider compressing)' : ''}`);
  
  return { file, needsWarning };
};

/**
 * Generate video thumbnail
 */
export const generateVideoThumbnail = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      // Seek to 1 second or 10% of video length, whichever is less
      video.currentTime = Math.min(1, video.duration * 0.1);
    };
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(video.videoWidth, MAX_IMAGE_WIDTH);
      canvas.height = Math.min(video.videoHeight, MAX_IMAGE_HEIGHT);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Video thumbnail generated');
            resolve(blob);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
          
          // Cleanup
          URL.revokeObjectURL(video.src);
        },
        'image/jpeg',
        0.8
      );
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
      URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Get optimized file with metadata
 */
export const optimizeMediaFile = async (
  file: File,
  type: 'image' | 'video'
): Promise<{ file: File; originalSize: number; optimizedSize: number; savings: number }> => {
  const originalSize = file.size;
  
  if (type === 'image') {
    const optimizedFile = await compressImage(file);
    const optimizedSize = optimizedFile.size;
    const savings = ((originalSize - optimizedSize) / originalSize) * 100;
    
    return {
      file: optimizedFile,
      originalSize,
      optimizedSize,
      savings
    };
  } else {
    // For video, just validate
    const { file: validatedFile } = await validateAndPrepareVideo(file);
    return {
      file: validatedFile,
      originalSize,
      optimizedSize: originalSize,
      savings: 0
    };
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
