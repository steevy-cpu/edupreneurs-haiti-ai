/**
 * SwapLanguagesButton Component
 * 
 * Button to swap source and target languages with rotation animation.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwapLanguagesButtonProps {
  onSwap: () => void;
  disabled?: boolean;
}

export function SwapLanguagesButton({ onSwap, disabled }: SwapLanguagesButtonProps) {
  const [isRotating, setIsRotating] = useState(false);

  const handleSwap = () => {
    setIsRotating(true);
    onSwap();
    setTimeout(() => setIsRotating(false), 200);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleSwap}
      disabled={disabled}
      className={cn(
        "shrink-0 rounded-full transition-transform duration-200 ease-out",
        isRotating && "rotate-180"
      )}
      aria-label="Inverser les langues"
    >
      <ArrowRightLeft className="h-4 w-4" />
    </Button>
  );
}
