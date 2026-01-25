import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

/**
 * Reusable error state component for feature-level error handling.
 * Displays an error message with optional retry button.
 */
export const ErrorState = ({ message, onRetry, compact = false }: ErrorStateProps) => (
  <div 
    className={`flex flex-col items-center justify-center text-center ${
      compact ? 'py-4 px-2' : 'py-8 px-4'
    }`}
    role="alert"
  >
    <AlertCircle className={`text-destructive mb-2 ${compact ? 'w-6 h-6' : 'w-8 h-8'}`} />
    <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
      {message}
    </p>
    {onRetry && (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onRetry} 
        className="mt-2 gap-1.5"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Réessayer
      </Button>
    )}
  </div>
);

export default ErrorState;
