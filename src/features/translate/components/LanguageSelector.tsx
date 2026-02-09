/**
 * LanguageSelector Component
 * 
 * Dropdown for selecting source or target language.
 * Shows flag emoji + language name.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import type { LanguageCode } from '../types/translate.types';

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (value: LanguageCode) => void;
  disabledValue?: LanguageCode;
  label: string;
  id: string;
}

export function LanguageSelector({ 
  value, 
  onChange, 
  disabledValue,
  label,
  id 
}: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as LanguageCode)}>
        <SelectTrigger id={id} className="w-full min-w-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              disabled={lang.code === disabledValue}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span className="truncate">{lang.name}</span>
                <span className="text-muted-foreground text-xs hidden sm:inline">({lang.nativeName})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
