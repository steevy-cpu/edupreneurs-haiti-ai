import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Send,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import {
  useAllBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  BlogPost,
} from "@/hooks/useBlogPosts";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function BlogModule() {
  const { toast } = useToast();
  const { data: posts, isLoading } = useAllBlogPosts();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);

  const handleCreate = async (data: any) => {
    try {
      await createPost.mutateAsync(data);
      toast({
        title: "Article créé",
        description:
          data.status === "published"
            ? "L'article a été publié avec succès."
            : "Le brouillon a été enregistré.",
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'article.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingPost) return;

    try {
      await updatePost.mutateAsync({ id: editingPost.id, ...data });
      toast({
        title: "Article mis à jour",
        description: "Les modifications ont été enregistrées.",
      });
      setEditingPost(null);
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'article.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingPost) return;

    try {
      await deletePost.mutateAsync(deletingPost.id);
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé définitivement.",
      });
      setDeletingPost(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article.",
        variant: "destructive",
      });
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    try {
      await updatePost.mutateAsync({
        id: post.id,
        status: newStatus,
        published_at: newStatus === "published" ? new Date().toISOString() : null,
      });

      // Soumettre l'URL du nouvel article à Bing IndexNow — fire-and-forget
      if (newStatus === "published" && post.slug) {
        supabase.functions
          .invoke("indexnow-submit", {
            body: {
              urls: [
                `https://mon-edupreneur.com/blog/${post.slug}`,
                `https://mon-edupreneur.com/blog`,
              ],
            },
          })
          .catch(() => {}); // ne pas bloquer la publication si IndexNow échoue
      }

      toast({
        title: newStatus === "published" ? "Article publié" : "Article dépublié",
        description:
          newStatus === "published"
            ? "L'article est maintenant visible au public."
            : "L'article est maintenant un brouillon.",
      });
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Publié</Badge>;
      case "draft":
        return <Badge variant="secondary">Brouillon</Badge>;
      case "archived":
        return <Badge variant="outline">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: posts?.length || 0,
    published: posts?.filter((p) => p.status === "published").length || 0,
    drafts: posts?.filter((p) => p.status === "draft").length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Publiés</CardTitle>
            <Send className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.drafts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gestion du Blog</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Posts Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {post.cover_image_url && (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-16 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium line-clamp-1">{post.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          /blog/{post.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.author ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={post.author.avatar_url || undefined}
                            alt={post.author.display_name}
                          />
                          <AvatarFallback className="text-xs">
                            {post.author.display_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{post.author.display_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Non assigné</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.updated_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePublish(post)}
                        title={
                          post.status === "published" ? "Dépublier" : "Publier"
                        }
                      >
                        {post.status === "published" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingPost(post)}
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {post.status === "published" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Voir l'article"
                        >
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingPost(post)}
                        className="text-destructive hover:text-destructive"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun article pour le moment</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer le premier article
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouvel article</DialogTitle>
          </DialogHeader>
          <BlogPostForm
            onSubmit={handleCreate}
            isSubmitting={createPost.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <BlogPostForm
              post={editingPost}
              onSubmit={handleUpdate}
              isSubmitting={updatePost.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPost} onOpenChange={() => setDeletingPost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'article "{deletingPost?.title}" sera
              supprimé définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
