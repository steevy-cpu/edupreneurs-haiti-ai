/**
 * Editor Sidebar Component
 * 
 * Provides input fields for editing template elements.
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const renderElementEditor = (element: TemplateElement) => {
    const isSelected = selectedElementId === element.id;

    return (
      <div
        key={element.id}
        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
          isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'
        }`}
        onClick={() => onElementSelect(element.id)}
      >
        <Label className="text-sm font-medium mb-2 block">{element.label}</Label>

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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Personnaliser</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-320px)] px-4 pb-4">
          <div className="space-y-2">
            {schema.elements.map(renderElementEditor)}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
