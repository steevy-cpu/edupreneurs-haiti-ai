/**
 * TranslateButton Component
 * 
 * Submit button with loading state.
 */

import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";

interface TranslateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function TranslateButton({ onClick, isLoading, disabled }: TranslateButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full sm:w-auto min-w-[140px]"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Traduction...
        </>
      ) : (
        <>
          <Languages className="h-4 w-4 mr-2" />
          Traduire
        </>
      )}
    </Button>
  );
}
