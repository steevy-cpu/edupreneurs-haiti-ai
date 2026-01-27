/**
 * Template Preview Component
 * 
 * Renders a CSS-only visual representation of template structure.
 * No images needed - lightweight and 3G-optimized.
 */

import { Calendar, ClipboardList, Wallet, Award, FileText, Receipt, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplatePreviewProps {
  category: string;
  className?: string;
}

interface CategoryTheme {
  gradient: string;
  icon: LucideIcon;
  accentColor: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  schedule: { 
    gradient: 'from-blue-500/20 via-cyan-500/10 to-blue-600/20', 
    icon: Calendar,
    accentColor: 'bg-blue-500/30'
  },
  planner: { 
    gradient: 'from-purple-500/20 via-pink-500/10 to-purple-600/20', 
    icon: ClipboardList,
    accentColor: 'bg-purple-500/30'
  },
  budget: { 
    gradient: 'from-green-500/20 via-emerald-500/10 to-green-600/20', 
    icon: Wallet,
    accentColor: 'bg-green-500/30'
  },
  certificate: { 
    gradient: 'from-amber-500/20 via-yellow-500/10 to-amber-600/20', 
    icon: Award,
    accentColor: 'bg-amber-500/30'
  },
  resume: { 
    gradient: 'from-slate-500/20 via-gray-500/10 to-slate-600/20', 
    icon: FileText,
    accentColor: 'bg-slate-500/30'
  },
  invoice: { 
    gradient: 'from-indigo-500/20 via-violet-500/10 to-indigo-600/20', 
    icon: Receipt,
    accentColor: 'bg-indigo-500/30'
  },
};

// Schedule preview: 6-column table grid
function SchedulePreview({ accentColor }: { accentColor: string }) {
  return (
    <div className="w-full h-full p-3 flex flex-col gap-1.5">
      {/* Header row */}
      <div className="flex gap-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={cn("flex-1 h-3 rounded-sm", accentColor)} />
        ))}
      </div>
      {/* Data rows */}
      {[...Array(4)].map((_, row) => (
        <div key={row} className="flex gap-1">
          {[...Array(6)].map((_, col) => (
            <div key={col} className="flex-1 h-4 rounded-sm bg-foreground/10" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Planner preview: checklist with checkboxes
function PlannerPreview({ accentColor }: { accentColor: string }) {
  return (
    <div className="w-full h-full p-3 flex flex-col gap-2">
      {/* Header */}
      <div className={cn("w-2/3 h-3 rounded-sm", accentColor)} />
      {/* Checklist items */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded border-2", i < 2 ? accentColor : "border-foreground/20")} />
          <div className={cn("h-2.5 rounded-sm bg-foreground/10", i % 2 === 0 ? "w-3/4" : "w-1/2")} />
        </div>
      ))}
    </div>
  );
}

// Budget preview: 3-column money grid
function BudgetPreview({ accentColor }: { accentColor: string }) {
  return (
    <div className="w-full h-full p-3 flex flex-col gap-1.5">
      {/* Header */}
      <div className="flex gap-2">
        <div className={cn("flex-1 h-3 rounded-sm", accentColor)} />
        <div className={cn("flex-1 h-3 rounded-sm", accentColor)} />
        <div className={cn("flex-1 h-3 rounded-sm", accentColor)} />
      </div>
      {/* Rows */}
      {[...Array(3)].map((_, row) => (
        <div key={row} className="flex gap-2">
          <div className="flex-1 h-3.5 rounded-sm bg-foreground/10" />
          <div className="flex-1 h-3.5 rounded-sm bg-foreground/8" />
          <div className="flex-1 h-3.5 rounded-sm bg-foreground/10" />
        </div>
      ))}
      {/* Total */}
      <div className="flex gap-2 mt-1">
        <div className="flex-1" />
        <div className={cn("flex-1 h-4 rounded-sm", accentColor)} />
      </div>
    </div>
  );
}

// Certificate preview: decorative border frame
function CertificatePreview({ accentColor }: { accentColor: string }) {
  return (
    <div className="w-full h-full p-2">
      <div className={cn("w-full h-full rounded-lg border-2 border-dashed p-2 flex flex-col items-center justify-center gap-1.5", accentColor.replace('bg-', 'border-'))}>
        <div className={cn("w-8 h-8 rounded-full", accentColor)} />
        <div className="w-3/4 h-2.5 rounded-sm bg-foreground/15" />
        <div className="w-1/2 h-2 rounded-sm bg-foreground/10" />
        <div className="w-2/3 h-2 rounded-sm bg-foreground/10 mt-1" />
      </div>
    </div>
  );
}

// Resume preview: header + sections
function ResumePreview({ accentColor }: { accentColor: string }) {
  return (
    <div className="w-full h-full p-3 flex flex-col gap-2">
      {/* Header */}
      <div className="flex gap-2">
        <div className={cn("w-8 h-8 rounded-full", accentColor)} />
        <div className="flex-1 flex flex-col gap-1">
          <div className="w-2/3 h-2.5 rounded-sm bg-foreground/15" />
          <div className="w-1/2 h-2 rounded-sm bg-foreground/10" />
        </div>
      </div>
      {/* Sections */}
      <div className={cn("w-1/3 h-2 rounded-sm mt-1", accentColor)} />
      {[...Array(2)].map((_, i) => (
        <div key={i} className="w-full h-2 rounded-sm bg-foreground/8" />
      ))}
    </div>
  );
}

// Invoice preview: header + line items
function InvoicePreview({ accentColor }: { accentColor: string }) {
  return (
    <div className="w-full h-full p-3 flex flex-col gap-2">
      {/* Logo area */}
      <div className="flex justify-between">
        <div className={cn("w-10 h-4 rounded-sm", accentColor)} />
        <div className="w-8 h-3 rounded-sm bg-foreground/10" />
      </div>
      {/* Line items */}
      <div className="flex-1 flex flex-col gap-1.5 mt-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="w-2/3 h-2.5 rounded-sm bg-foreground/10" />
            <div className="w-1/5 h-2.5 rounded-sm bg-foreground/8" />
          </div>
        ))}
      </div>
      {/* Total */}
      <div className={cn("w-1/3 h-3 rounded-sm self-end", accentColor)} />
    </div>
  );
}

const PREVIEW_COMPONENTS: Record<string, React.FC<{ accentColor: string }>> = {
  schedule: SchedulePreview,
  planner: PlannerPreview,
  budget: BudgetPreview,
  certificate: CertificatePreview,
  resume: ResumePreview,
  invoice: InvoicePreview,
};

export default function TemplatePreview({ category, className }: TemplatePreviewProps) {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.schedule;
  const Icon = theme.icon;
  const PreviewComponent = PREVIEW_COMPONENTS[category] || SchedulePreview;

  return (
    <div 
      className={cn(
        "relative w-full h-full bg-gradient-to-br overflow-hidden",
        theme.gradient,
        className
      )}
    >
      {/* Abstract preview */}
      <PreviewComponent accentColor={theme.accentColor} />
      
      {/* Category icon watermark */}
      <div className="absolute bottom-2 right-2 opacity-20">
        <Icon className="h-8 w-8" />
      </div>
    </div>
  );
}
