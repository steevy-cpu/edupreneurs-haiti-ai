/**
 * Template Canvas Component
 * 
 * Renders the template preview using HTML/CSS for consistent display.
 * The actual PDF rendering happens server-side for branding enforcement.
 */

import { useRef, useEffect } from 'react';
import type { TemplateSchema } from '@/types/templates';

interface TemplateCanvasProps {
  schema: TemplateSchema;
  values: Record<string, unknown>;
  selectedElementId: string | null;
  onElementSelect: (elementId: string | null) => void;
}

// Calculate transform based on element type and alignment
const getTransform = (element: import('@/types/templates').TemplateElement): string => {
  if (element.type === 'table') {
    return 'translate(0, 0)';
  }
  
  if (element.type === 'text') {
    const align = element.style?.textAlign || 'left';
    if (align === 'center') return 'translate(-50%, 0)';
    if (align === 'right') return 'translate(-100%, 0)';
    return 'translate(0, 0)';
  }
  
  // Default for checkbox, date, image
  return 'translate(0, 0)';
};

export default function TemplateCanvas({ 
  schema, 
  values, 
  selectedElementId, 
  onElementSelect 
}: TemplateCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate scale to fit container while maintaining aspect ratio
  const aspectRatio = schema.dimensions.width / schema.dimensions.height;
  
  return (
    <div 
      ref={containerRef}
      className="relative bg-white shadow-xl rounded-lg overflow-auto"
      style={{
        width: '100%',
        maxWidth: `${schema.dimensions.width}px`,
        aspectRatio: `${aspectRatio}`,
      }}
      onClick={() => onElementSelect(null)}
    >
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: schema.background }}
      />

      {/* Elements */}
      {schema.elements.map((element) => {
        const value = values[element.id];
        const isSelected = selectedElementId === element.id;

        // Calculate position as percentage
        const left = (element.position.x / schema.dimensions.width) * 100;
        const top = (element.position.y / schema.dimensions.height) * 100;

        return (
          <div
            key={element.id}
            className={`absolute cursor-pointer transition-all ${
              isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/50'
            }`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              transform: getTransform(element),
            }}
            onClick={(e) => {
              e.stopPropagation();
              onElementSelect(element.id);
            }}
          >
            {element.type === 'text' && (
              <div
                style={{
                  fontSize: `${(element.style?.fontSize || 14) * 0.8}px`,
                  fontWeight: element.style?.fontWeight || 'normal',
                  textAlign: element.style?.textAlign || 'left',
                  color: element.style?.color || '#000000',
                }}
                className="whitespace-pre-wrap min-w-[50px] px-1"
              >
                {(value as string) || element.placeholder || element.label}
              </div>
            )}

            {element.type === 'table' && (
              <div className="overflow-auto max-w-full">
                <table className="border-collapse text-xs">
                  <thead>
                    <tr>
                      {element.headers.map((header, i) => (
                        <th 
                          key={i}
                          className="border px-2 py-1 bg-muted/50 font-medium"
                          style={{ 
                            borderColor: element.style?.borderColor || '#e5e7eb',
                            padding: element.style?.cellPadding ? `${element.style.cellPadding * 0.5}px` : undefined,
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {((value as string[][]) || element.defaultData || []).map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td 
                            key={ci}
                            className="border px-2 py-1"
                            style={{ 
                              borderColor: element.style?.borderColor || '#e5e7eb',
                              padding: element.style?.cellPadding ? `${element.style.cellPadding * 0.5}px` : undefined,
                            }}
                          >
                            {cell || '\u00A0'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {element.type === 'checkbox' && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  readOnly
                  className="h-4 w-4"
                />
                {element.checkboxLabel}
              </label>
            )}

            {element.type === 'date' && (
              <div
                style={{
                  fontSize: `${(element.style?.fontSize || 14) * 0.8}px`,
                  color: element.style?.color || '#000000',
                }}
              >
                {(value as string) || element.format}
              </div>
            )}
          </div>
        );
      })}

      {/* Branding Preview */}
      <div 
        className={`absolute text-[8px] text-muted-foreground/70 ${
          schema.branding.logoPosition === 'bottom-right' ? 'bottom-2 right-2' :
          schema.branding.logoPosition === 'bottom-left' ? 'bottom-2 left-2' :
          schema.branding.logoPosition === 'top-right' ? 'top-2 right-2' :
          'top-2 left-2'
        }`}
      >
        {schema.branding.footerText}
      </div>
    </div>
  );
}
