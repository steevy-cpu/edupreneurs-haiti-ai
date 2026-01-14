import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backPath?: string;
  backLabel?: string;
  showThemeToggle?: boolean;
  actions?: ReactNode;
  variant?: "gradient" | "simple";
  icon?: ReactNode;
  image?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  backPath,
  backLabel = "Retour",
  showThemeToggle = true,
  actions,
  variant = "gradient",
  icon,
  image,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  if (variant === "simple") {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {backPath && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(backPath)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          )}
          <div className="flex items-center gap-3">
            {icon && <div className="text-primary">{icon}</div>}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {showThemeToggle && <ThemeToggle />}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Theme Toggle - Fixed Position */}
      {showThemeToggle && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}

      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]" />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
          <div className="flex-1 relative z-10">
            {backPath && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(backPath)}
                className="gap-2 text-white/80 hover:text-white hover:bg-white/10 mb-2 -ml-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {backLabel}
              </Button>
            )}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base opacity-90">{subtitle}</p>
            )}
            {actions && <div className="mt-4">{actions}</div>}
          </div>

{image && (
            <div className="flex-shrink-0 relative z-10">
              <img
                src={image}
                alt=""
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 object-contain animate-[float_4s_ease-in-out_infinite]"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          {icon && !image && (
            <div className="flex-shrink-0 relative z-10 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
