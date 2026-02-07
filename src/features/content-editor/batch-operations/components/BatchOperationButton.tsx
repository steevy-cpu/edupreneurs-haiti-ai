import { Button } from "@/components/ui/button";
import type { BatchOperationTheme } from "../types";

interface BatchOperationButtonProps {
  label: string;
  sublabel?: string;
  theme: BatchOperationTheme;
  disabled?: boolean;
  onClick?: () => void;
}

export const BatchOperationButton = ({
  label,
  sublabel,
  theme,
  disabled = false,
  onClick,
}: BatchOperationButtonProps) => {
  const Icon = theme.icon;
  
  return (
    <Button 
      size="sm" 
      variant="outline"
      className={`w-full ${theme.borderClass} ${theme.textClass} ${theme.hoverClass} h-auto py-2`}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 mr-2" />
      <div className="flex flex-col items-start text-left">
        <span>{label}</span>
        {sublabel && (
          <span className="text-[10px] text-muted-foreground">
            {sublabel}
          </span>
        )}
      </div>
    </Button>
  );
};
