/**
 * VisitorPreviewModal — Dialog shown when unauthenticated visitors click
 * blurred gated content. Promotes the 7-day free trial with a feature list
 * and dual CTAs (signup / login). No API calls — pure presentational.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, Trophy, Clock, ArrowRight, Sparkles, Eye } from 'lucide-react';

interface VisitorPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Human-readable feature name for contextual messaging */
  featureName?: string;
}

export function VisitorPreviewModal({ open, onOpenChange, featureName }: VisitorPreviewModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Accédez à tout gratuitement
          </DialogTitle>
        </DialogHeader>

        {/* Value proposition + feature list */}
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Créez un compte et accédez immédiatement à{' '}
            <span className="font-semibold text-foreground">
              {featureName ?? 'tout le contenu'}
            </span>{' '}
            et bien plus encore — pendant 7 jours complets, sans carte bancaire.
          </p>

          {/* Benefit grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen, label: 'Tous les cours', color: 'text-primary' },
              { icon: Trophy, label: 'Examens officiels', color: 'text-accent' },
              { icon: Brain, label: 'Jude, tuteur IA', color: 'text-purple-500' },
              { icon: Clock, label: '7 jours gratuits', color: 'text-green-500' },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-sm font-medium"
              >
                <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                {label}
              </div>
            ))}
          </div>

          {/* Trial callout */}
          <div className="rounded-xl bg-primary/10 p-4 text-center space-y-1">
            <p className="text-base font-bold text-foreground">
              🎉 Essai gratuit de 7 jours
            </p>
            <p className="text-xs text-muted-foreground">
              Aucune carte bancaire • Annulable à tout moment
            </p>
          </div>
        </div>

        {/* Dual CTAs — signup primary, login secondary */}
        <div className="flex flex-col gap-2.5 pt-1">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => {
              onOpenChange(false);
              navigate('/auth/signup/step-1');
            }}
          >
            Créer mon compte gratuitement
            <ArrowRight className="h-4 w-4" />
          </Button>
          {/* Demo lesson CTA — lets visitors preview a real lesson before signing up */}
          <Button
            variant="outline"
            className="w-full border-primary/30 text-primary"
            onClick={() => {
              onOpenChange(false);
              navigate('/demo/lesson');
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir une leçon exemple d'abord
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => {
              onOpenChange(false);
              navigate('/auth/login');
            }}
          >
            J'ai déjà un compte — Se connecter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
