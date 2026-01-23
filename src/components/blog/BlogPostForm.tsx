import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ImagePlus, X, Eye, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogPostEditor } from "./BlogPostEditor";
import {
  BlogPost,
  BlogAuthor,
  useBlogAuthors,
  generateUniqueSlug,
} from "@/hooks/useBlogPosts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/utils/mediaOptimization";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  slug: z.string().min(3, "Le slug doit contenir au moins 3 caractères"),
  excerpt: z.string().max(300, "L'extrait doit faire moins de 300 caractères").optional(),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  author_id: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
});

type FormData = z.infer<typeof formSchema>;

interface BlogPostFormProps {
  post?: BlogPost;
  onSubmit: (data: FormData & { cover_image_url?: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function BlogPostForm({ post, onSubmit, isSubmitting }: BlogPostFormProps) {
  const { toast } = useToast();
  const { data: authors } = useBlogAuthors();
  const [coverImage, setCoverImage] = useState<string | null>(
    post?.cover_image_url || null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      author_id: post?.author_id || "",
      status: post?.status || "draft",
    },
  });

  const title = form.watch("title");

  // Auto-generate slug when title changes (only for new posts)
  useEffect(() => {
    const generateSlug = async () => {
      if (!post && title && title.length >= 3) {
        setIsGeneratingSlug(true);
        const slug = await generateUniqueSlug(title);
        form.setValue("slug", slug);
        setIsGeneratingSlug(false);
      }
    };

    const debounce = setTimeout(generateSlug, 500);
    return () => clearTimeout(debounce);
  }, [title, post, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);

    try {
      // Compress image
      const compressedFile = await compressImage(file);

      // Generate unique filename
      const filename = `covers/${Date.now()}-${file.name.replace(/\s/g, "-")}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filename, compressedFile, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-images").getPublicUrl(filename);

      setCoverImage(publicUrl);
      toast({
        title: "Image uploadée",
        description: "L'image de couverture a été ajoutée avec succès.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
  };

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      ...data,
      cover_image_url: coverImage || undefined,
    });
  };

  const saveDraft = () => {
    form.setValue("status", "draft");
    form.handleSubmit(handleFormSubmit)();
  };

  const publish = () => {
    form.setValue("status", "published");
    form.handleSubmit(handleFormSubmit)();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Cover Image */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Image de couverture</label>
          {coverImage ? (
            <div className="relative aspect-video max-w-2xl rounded-lg overflow-hidden border">
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeCoverImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full max-w-2xl aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
              />
              {isUploadingImage ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Cliquez pour ajouter une image de couverture
                  </span>
                </>
              )}
            </label>
          )}
        </div>

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Le titre de votre article..."
                  className="text-lg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Slug (URL)
                {isGeneratingSlug && (
                  <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />
                )}
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/blog/</span>
                  <Input
                    placeholder="mon-article"
                    {...field}
                    disabled={isGeneratingSlug}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Author */}
        <FormField
          control={form.control}
          name="author_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Auteur</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un auteur" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper" className="z-[1200] bg-popover border border-border shadow-lg">
                  {!authors ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : authors.length === 0 ? (
                    <SelectItem value="none" disabled>Aucun auteur trouvé</SelectItem>
                  ) : (
                    authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.display_name} - {author.role}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Excerpt */}
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extrait (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Un court résumé de l'article pour les aperçus..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu</FormLabel>
              <FormControl>
                <BlogPostEditor
                  content={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {post ? "Modification de l'article" : "Nouvel article"}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={saveDraft}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer brouillon
            </Button>
            <Button
              type="button"
              onClick={publish}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publier
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
