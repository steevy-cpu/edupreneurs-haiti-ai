import { Link, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
  badge?: number;
  badgeLabel?: string;
  collapsed?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  variant?: "default" | "founder";
}

export const SidebarNavLink = ({
  to,
  icon,
  label,
  badge,
  badgeLabel,
  collapsed = false,
  onClick,
  variant = "default",
}: SidebarNavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const activeClasses = variant === "founder"
    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
    : "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white";

  const inactiveClasses = variant === "founder"
    ? "text-amber-600 dark:text-amber-400 hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-500 hover:text-white"
    : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white";

  const linkContent = (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-2 sm:gap-2.5 lg:gap-3 
        py-2.5 sm:py-3 lg:py-3.5 
        rounded-lg sm:rounded-xl text-sm sm:text-base font-medium 
        transition-all duration-300
        ${collapsed 
          ? 'px-3 mx-1 lg:justify-center' 
          : 'px-3 sm:px-4 lg:px-5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 hover:translate-x-1'
        }
        ${isActive ? activeClasses : inactiveClasses}
      `}
      title={collapsed ? label : undefined}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span>{label}</span>}
      {badge !== undefined && badge > 0 && !collapsed && (
        <span className="ml-auto flex items-center justify-center h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] px-1 sm:px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-semibold">
          {badge}
        </span>
      )}
      {badge !== undefined && badge > 0 && collapsed && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
      )}
      {badgeLabel && !collapsed && (
        <span className="ml-auto text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
          {badgeLabel}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">{linkContent}</div>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="ml-2 text-destructive">({badge})</span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
};

export default SidebarNavLink;
