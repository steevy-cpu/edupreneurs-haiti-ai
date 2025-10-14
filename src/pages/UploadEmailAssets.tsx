import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, CheckCircle2 } from "lucide-react";
import ericWelcome from "@/assets/eric-welcome.png";
import ericThumbUp from "@/assets/eric-thumb-up.png";
import ericThinking from "@/assets/eric-thinking-pose.png";

const UploadEmailAssets = () => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const uploadImages = async () => {
    setUploading(true);
    try {
      const images = [
        { name: "eric-welcome.png", src: ericWelcome },
        { name: "eric-thumb-up.png", src: ericThumbUp },
        { name: "eric-thinking.png", src: ericThinking },
      ];

      const uploadedUrls: Record<string, string> = {};

      for (const image of images) {
        // Fetch the image as a blob
        const response = await fetch(image.src);
        const blob = await response.blob();
        
        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from("email-assets")
          .upload(image.name, blob, {
            contentType: "image/png",
            upsert: true,
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("email-assets")
          .getPublicUrl(image.name);

        uploadedUrls[image.name] = publicUrl;
      }

      setUrls(uploadedUrls);
      setUploaded(true);
      toast.success("Images uploaded successfully! URLs are ready for EmailJS templates.");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Eric Images for Email Templates</CardTitle>
            <CardDescription>
              Click the button below to upload Eric's images to storage and get public URLs for your EmailJS templates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={uploadImages} 
              disabled={uploading || uploaded}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : uploaded ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Images Uploaded
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Images
                </>
              )}
            </Button>

            {uploaded && (
              <div className="space-y-4 mt-6">
                <h3 className="font-semibold text-lg">Public URLs (use these in EmailJS templates):</h3>
                {Object.entries(urls).map(([name, url]) => (
                  <div key={name} className="space-y-2">
                    <p className="font-medium">{name}:</p>
                    <code className="block p-2 bg-muted rounded text-xs break-all">
                      {url}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {uploaded && (
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>1. Copy the URLs above</p>
              <p>2. Go to your EmailJS dashboard</p>
              <p>3. Update your templates with these image URLs in the &lt;img src="" /&gt; tags</p>
              <p>4. The images will now appear in your email templates!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadEmailAssets;
