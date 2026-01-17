import { useState, useRef, useEffect, KeyboardEvent, FocusEvent } from "react";
import { Input } from "@/components/ui/input";

interface PageNumberInputProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PageNumberInput({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = ""
}: PageNumberInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(currentPage));
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when currentPage changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(currentPage));
    }
  }, [currentPage, isEditing]);

  // Focus and select input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
    setInputValue(String(currentPage));
  };

  const validateAndNavigate = () => {
    const parsed = parseInt(inputValue, 10);
    
    if (isNaN(parsed) || inputValue.trim() === "") {
      // Invalid input - revert to current page
      setInputValue(String(currentPage));
    } else if (parsed < 1) {
      // Below minimum - go to first page
      onPageChange(1);
      setInputValue("1");
    } else if (parsed > totalPages) {
      // Above maximum - go to last page
      onPageChange(totalPages);
      setInputValue(String(totalPages));
    } else {
      // Valid page number
      onPageChange(parsed);
      setInputValue(String(parsed));
    }
    
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateAndNavigate();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setInputValue(String(currentPage));
      setIsEditing(false);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    validateAndNavigate();
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="h-7 w-12 px-1 text-center text-sm"
        />
        <span className="text-sm text-muted-foreground">/ {totalPages}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`min-w-[80px] cursor-pointer rounded-md px-2 py-1 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:min-w-[100px] ${className}`}
      title="Cliquez pour aller à une page"
    >
      Page {currentPage} / {totalPages}
    </button>
  );
}
