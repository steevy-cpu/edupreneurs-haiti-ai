/**
 * SwapLanguagesButton Component
 * 
 * Button to swap source and target languages.
 */

import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";

interface SwapLanguagesButtonProps {
  onSwap: () => void;
  disabled?: boolean;
}

export function SwapLanguagesButton({ onSwap, disabled }: SwapLanguagesButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onSwap}
      disabled={disabled}
      className="shrink-0 rounded-full"
      aria-label="Inverser les langues"
    >
      <ArrowRightLeft className="h-4 w-4" />
    </Button>
  );
}
