import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, Trash2, Eye, Edit2, Book, Globe, Loader2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEbooks, useCreateEbook, useUpdateEbook, useDeleteEbook, type Ebook } from "@/hooks/useEbooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PermissionGuard } from "./PermissionGuard";

const CATEGORIES = [
  { value: 'roman', label: 'Roman' },
  { value: 'poesie', label: 'Poésie' },
  { value: 'sciences', label: 'Sciences' },
  { value: 'histoire', label: 'Histoire' },
  { value: 'biographie', label: 'Biographie' },
  { value: 'philosophie', label: 'Philosophie' },
  { value: 'autre', label: 'Autre' },
];

interface EbookFormData {
  title: string;
  author: string;
  description: string;
  language: 'fr' | 'en';
  category: string;
  cover_url: string;
  file_url: string;
  page_count: number | null;
  is_published: boolean;
}

const defaultFormData: EbookFormData = {
  title: '',
  author: '',
  description: '',
  language: 'fr',
  category: '',
  cover_url: '',
  file_url: '',
  page_count: null,
  is_published: false,
};

export function EbookManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [formData, setFormData] = useState<EbookFormData>(defaultFormData);
  const [uploading, setUploading] = useState<'cover' | 'pdf' | null>(null);

  const { data: ebooks, isLoading } = useEbooks({ includeUnpublished: true });
  const createEbook = useCreateEbook();
  const updateEbook = useUpdateEbook();
  const deleteEbook = useDeleteEbook();

  const handleOpenDialog = (ebook?: Ebook) => {
    if (ebook) {
      setEditingEbook(ebook);
      setFormData({
        title: ebook.title,
        author: ebook.author || '',
        description: ebook.description || '',
        language: ebook.language as 'fr' | 'en',
        category: ebook.category || '',
        cover_url: ebook.cover_url || '',
        file_url: ebook.file_url,
        page_count: ebook.page_count,
        is_published: ebook.is_published,
      });
    } else {
      setEditingEbook(null);
      setFormData(defaultFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEbook(null);
    setFormData(defaultFormData);
  };

  const handleFileUpload = async (file: File, type: 'cover' | 'pdf') => {
    const bucket = type === 'cover' ? 'ebook-covers' : 'ebook-files';
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    setUploading(type);

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      if (type === 'cover') {
        setFormData(prev => ({ ...prev, cover_url: publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, file_url: publicUrl }));
      }

      toast.success(`${type === 'cover' ? 'Image' : 'PDF'} téléchargé avec succès`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Erreur lors du téléchargement`);
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.file_url) {
      toast.error('Titre et fichier PDF sont requis');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (editingEbook) {
      updateEbook.mutate({
        id: editingEbook.id,
        ...formData,
        category: formData.category || null,
      }, {
        onSuccess: handleCloseDialog,
      });
    } else {
      createEbook.mutate({
        ...formData,
        category: formData.category || null,
        uploaded_by: user?.id || null,
      }, {
        onSuccess: handleCloseDialog,
      });
    }
  };

  const handleDelete = (ebook: Ebook) => {
    if (confirm(`Voulez-vous vraiment supprimer "${ebook.title}"?`)) {
      deleteEbook.mutate(ebook.id);
    }
  };

  const togglePublish = (ebook: Ebook) => {
    updateEbook.mutate({
      id: ebook.id,
      is_published: !ebook.is_published,
    });
  };

  return (
    <PermissionGuard requireEdit>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Book className="h-6 w-6 text-primary" />
              Bibliothèque d'E-books
            </h2>
            <p className="text-muted-foreground">
              Gérez les livres disponibles pour les étudiants
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un livre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEbook ? 'Modifier le livre' : 'Ajouter un nouveau livre'}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations du livre et téléchargez le fichier PDF
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Le Petit Prince"
                  />
                </div>

                {/* Author */}
                <div className="space-y-2">
                  <Label htmlFor="author">Auteur</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Ex: Antoine de Saint-Exupéry"
                  />
                </div>

                {/* Language & Category Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Langue *</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value: 'fr' | 'en') => 
                        setFormData(prev => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={formData.category || undefined}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Résumé du livre..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.description.length}/500
                  </p>
                </div>

                {/* Cover Upload */}
                <div className="space-y-2">
                  <Label>Image de couverture</Label>
                  <div className="flex items-center gap-4">
                    {formData.cover_url && (
                      <img 
                        src={formData.cover_url} 
                        alt="Cover" 
                        className="h-24 w-16 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'cover');
                        }}
                        disabled={uploading === 'cover'}
                      />
                      {uploading === 'cover' && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Téléchargement...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* PDF Upload */}
                <div className="space-y-2">
                  <Label>Fichier PDF *</Label>
                  {formData.file_url && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      PDF téléchargé
                    </p>
                  )}
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'pdf');
                    }}
                    disabled={uploading === 'pdf'}
                  />
                  {uploading === 'pdf' && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Téléchargement du PDF...
                    </p>
                  )}
                </div>

                {/* Page Count */}
                <div className="space-y-2">
                  <Label htmlFor="pageCount">Nombre de pages</Label>
                  <Input
                    id="pageCount"
                    type="number"
                    value={formData.page_count || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      page_count: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    placeholder="Ex: 150"
                  />
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Publier immédiatement</Label>
                    <p className="text-sm text-muted-foreground">
                      Le livre sera visible par tous les utilisateurs
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_published: checked }))
                    }
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createEbook.isPending || updateEbook.isPending || !formData.file_url}
                >
                  {(createEbook.isPending || updateEbook.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingEbook ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!ebooks || ebooks.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Book className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun livre dans la bibliothèque</p>
              <Button className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter votre premier livre
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ebooks Grid */}
        {!isLoading && ebooks && ebooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ebooks.map((ebook) => (
              <Card key={ebook.id} className="overflow-hidden">
                {/* Cover */}
                <div className="relative aspect-[3/4] bg-muted">
                  {ebook.cover_url ? (
                    <img
                      src={ebook.cover_url}
                      alt={ebook.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Book className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <Badge 
                    className="absolute top-2 right-2"
                    variant={ebook.is_published ? "default" : "secondary"}
                  >
                    {ebook.is_published ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">{ebook.title}</h3>
                  {ebook.author && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {ebook.author}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Globe className="mr-1 h-3 w-3" />
                      {ebook.language.toUpperCase()}
                    </Badge>
                    {ebook.page_count && (
                      <span className="text-xs text-muted-foreground">
                        {ebook.page_count} pages
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenDialog(ebook)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`/lecture/${ebook.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={ebook.is_published ? "secondary" : "default"}
                      onClick={() => togglePublish(ebook)}
                      className="flex-1"
                    >
                      {ebook.is_published ? 'Dépublier' : 'Publier'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(ebook)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
