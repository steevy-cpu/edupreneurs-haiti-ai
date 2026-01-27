/**
 * Editor Sidebar Component
 * 
 * Provides input fields for editing template elements.
 * Supports horizontal swipe navigation on mobile.
 */

import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TemplateSchema, TemplateElement } from '@/types/templates';

interface EditorSidebarProps {
  schema: TemplateSchema;
  values: Record<string, unknown>;
  selectedElementId: string | null;
  onFieldChange: (fieldId: string, value: unknown) => void;
  onTableCellChange: (fieldId: string, rowIndex: number, colIndex: number, value: string) => void;
  onElementSelect: (elementId: string | null) => void;
}

export default function EditorSidebar({
  schema,
  values,
  selectedElementId,
  onFieldChange,
  onTableCellChange,
  onElementSelect,
}: EditorSidebarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const elements = schema.elements;

  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && currentIndex < elements.length - 1) {
      setCurrentIndex(prev => prev + 1);
      onElementSelect(elements[currentIndex + 1].id);
    } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      onElementSelect(elements[currentIndex - 1].id);
    }
  };

  const goToElement = (index: number) => {
    setCurrentIndex(index);
    onElementSelect(elements[index].id);
  };
  const renderElementEditor = (element: TemplateElement) => {
    const isSelected = selectedElementId === element.id;

    return (
      <div
        key={element.id}
        className={`p-2 sm:p-3 rounded-lg border transition-colors cursor-pointer ${
          isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'
        }`}
        onClick={() => onElementSelect(element.id)}
      >
        <Label className="text-xs sm:text-sm font-medium mb-2 block">{element.label}</Label>

        {element.type === 'text' && (
          <Input
            value={(values[element.id] as string) || ''}
            onChange={(e) => onFieldChange(element.id, e.target.value)}
            placeholder={element.placeholder || `Entrez ${element.label.toLowerCase()}`}
            maxLength={element.maxLength}
            className="mt-1"
          />
        )}

        {element.type === 'date' && (
          <Input
            type="date"
            value={(values[element.id] as string) || ''}
            onChange={(e) => onFieldChange(element.id, e.target.value)}
            className="mt-1"
          />
        )}

        {element.type === 'checkbox' && (
          <div className="flex items-center gap-2 mt-1">
            <Checkbox
              id={element.id}
              checked={(values[element.id] as boolean) || false}
              onCheckedChange={(checked) => onFieldChange(element.id, checked)}
            />
            <label htmlFor={element.id} className="text-sm">
              {element.checkboxLabel}
            </label>
          </div>
        )}

        {element.type === 'table' && (
          <div className="mt-2 overflow-x-auto">
            <p className="text-xs text-muted-foreground mb-2">
              Cliquez sur une cellule pour la modifier
            </p>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {element.headers.map((header, i) => (
                    <th key={i} className="border p-1 bg-muted text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {((values[element.id] as string[][]) || element.defaultData || []).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border p-0">
                        <Input
                          value={cell}
                          onChange={(e) => onTableCellChange(element.id, ri, ci, e.target.value)}
                          className="border-0 h-7 text-xs rounded-none focus-visible:ring-1 focus-visible:ring-inset"
                          placeholder="..."
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="shrink-0 pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">Personnaliser</CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{currentIndex + 1}/{elements.length}</span>
          </div>
        </div>
        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-2">
          {elements.map((_, index) => (
            <button
              key={index}
              onClick={() => goToElement(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-primary scale-110' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to field ${index + 1}`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        {/* Navigation arrows for desktop */}
        <div className="hidden sm:flex items-center justify-between px-2 mb-2">
          <button
            onClick={() => currentIndex > 0 && goToElement(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="p-1 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous field"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => currentIndex < elements.length - 1 && goToElement(currentIndex + 1)}
            disabled={currentIndex === elements.length - 1}
            className="p-1 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next field"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Swipeable content */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleSwipe}
          className="px-3 sm:px-4 pb-4 touch-pan-y"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="max-h-[50vh] lg:max-h-[calc(100vh-320px)] overflow-y-auto"
            >
              {renderElementEditor(elements[currentIndex])}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Swipe hint on mobile */}
        <p className="text-[10px] text-center text-muted-foreground pb-2 sm:hidden">
          ← Glissez pour naviguer →
        </p>
      </CardContent>
    </Card>
  );
}
