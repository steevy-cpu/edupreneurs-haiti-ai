/**
 * TranslateTextArea Component
 * 
 * Textarea with character count, optional copy button, and clear button.
 */

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Check, X } from "lucide-react";
import { MAX_TEXT_LENGTH } from '../constants/languages';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TranslateTextAreaProps {
  value: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  readOnly?: boolean;
  showCopy?: boolean;
  label: string;
  id: string;
}

export function TranslateTextArea({
  value,
  onChange,
  onClear,
  onKeyDown,
  placeholder,
  readOnly = false,
  showCopy = false,
  label,
  id,
}: TranslateTextAreaProps) {
  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copié dans le presse-papiers");
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error("Échec de la copie");
    }
  };

  const charCount = value.length;
  const isOverLimit = charCount > MAX_TEXT_LENGTH;
  const isNearLimit = charCount > MAX_TEXT_LENGTH * 0.9;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        <div className="flex items-center gap-1">
          {/* Clear button - only for editable areas with content */}
          {!readOnly && value && onClear && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Effacer
            </Button>
          )}
          {/* Copy button for output */}
          {showCopy && value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs"
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copier
            </Button>
          )}
        </div>
      </div>
      <div className="relative">
        <Textarea
          id={id}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          className={cn(
            "min-h-[120px] sm:min-h-[160px] resize-none",
            readOnly && "bg-muted/50 cursor-default",
            isOverLimit && "border-destructive focus-visible:ring-destructive"
          )}
          maxLength={MAX_TEXT_LENGTH + 100} // Allow slight overflow for UX
        />
      </div>
      {!readOnly && (
        <div className={cn(
          "text-xs text-right",
          isOverLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-muted-foreground"
        )}>
          {charCount.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
        </div>
      )}
    </div>
  );
}
