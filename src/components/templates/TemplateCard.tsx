/**
 * Template Card Component
 * 
 * Displays a template preview card for directory/category pages.
 * Enhanced with visual previews and polished styling.
 */

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Star, Calendar, ClipboardList, Wallet, Award, FileText, Receipt, LucideIcon } from 'lucide-react';
import type { TemplateListItem } from '@/types/templates';
import TemplatePreview from './TemplatePreview';

interface TemplateCardProps {
  template: TemplateListItem;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  schedule: Calendar,
  planner: ClipboardList,
  budget: Wallet,
  certificate: Award,
  resume: FileText,
  invoice: Receipt,
};

const CATEGORY_LABELS: Record<string, string> = {
  schedule: 'Emploi du temps',
  planner: 'Planificateur',
  budget: 'Budget',
  certificate: 'Certificat',
  resume: 'CV',
  invoice: 'Facture',
};

export default function TemplateCard({ template }: TemplateCardProps) {
  const formatDownloads = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const CategoryIcon = CATEGORY_ICONS[template.category] || FileText;
  const categoryLabel = CATEGORY_LABELS[template.category] || template.category;

  return (
    <Link to={`/templates/edit/${template.slug}`}>
      <Card className="group overflow-hidden h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card/80 backdrop-blur-sm">
        {/* Thumbnail with visual preview */}
        <div className="aspect-[4/3] relative overflow-hidden">
          {template.thumbnail_url ? (
            <img
              src={template.thumbnail_url}
              alt={template.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <TemplatePreview category={template.category} />
          )}

          {/* Category badge */}
          <Badge 
            variant="secondary"
            className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground gap-1.5 shadow-sm"
          >
            <CategoryIcon className="h-3 w-3" />
            {categoryLabel}
          </Badge>

          {/* Featured Badge */}
          {template.is_featured && (
            <Badge 
              className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-600 text-white shadow-lg"
            >
              <Star className="h-3 w-3 mr-1 fill-current" />
              Populaire
            </Badge>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
            {template.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
            {template.description}
          </p>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              Gratuit
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              <span className="font-medium">{formatDownloads(template.download_count)}</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
