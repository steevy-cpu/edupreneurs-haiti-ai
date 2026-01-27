/**
 * Template Card Component
 * 
 * Displays a template preview card for directory/category pages.
 */

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Star } from 'lucide-react';
import type { TemplateListItem } from '@/types/templates';

interface TemplateCardProps {
  template: TemplateListItem;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  // Format download count
  const formatDownloads = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Link to={`/templates/${template.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-primary/50 h-full">
        {/* Thumbnail */}
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {template.thumbnail_url ? (
            <img
              src={template.thumbnail_url}
              alt={template.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-4xl font-bold text-primary/20">
                {template.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Featured Badge */}
          {template.is_featured && (
            <Badge 
              className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Star className="h-3 w-3 mr-1 fill-current" />
              Populaire
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {template.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {template.description}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="capitalize">{template.category}</span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {formatDownloads(template.download_count)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
