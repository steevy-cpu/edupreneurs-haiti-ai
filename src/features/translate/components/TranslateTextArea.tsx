/**
 * TranslateTextArea Component
 * 
 * Textarea with character count and optional copy button.
 */

import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { MAX_TEXT_LENGTH } from '../constants/languages';
import { cn } from "@/lib/utils";

interface TranslateTextAreaProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  readOnly?: boolean;
  showCopy?: boolean;
  label: string;
  id: string;
}

export function TranslateTextArea({
  value,
  onChange,
  placeholder,
  readOnly = false,
  showCopy = false,
  label,
  id,
}: TranslateTextAreaProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const charCount = value.length;
  const isOverLimit = charCount > MAX_TEXT_LENGTH;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        {showCopy && value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1 text-primary" />
                Copié
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copier
              </>
            )}
          </Button>
        )}
      </div>
      <div className="relative">
        <Textarea
          id={id}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          readOnly={readOnly}
          className={cn(
            "min-h-[160px] resize-none",
            readOnly && "bg-muted/50 cursor-default",
            isOverLimit && "border-destructive focus-visible:ring-destructive"
          )}
          maxLength={MAX_TEXT_LENGTH + 100} // Allow slight overflow for UX
        />
      </div>
      {!readOnly && (
        <div className={cn(
          "text-xs text-right",
          isOverLimit ? "text-destructive" : "text-muted-foreground"
        )}>
          {charCount.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
        </div>
      )}
    </div>
  );
}
