/**
 * Template Editor State Hook
 * 
 * Manages editor state with localStorage persistence for returning users.
 * No auth required - edits survive page refreshes.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Template, EditorState, TemplateElement } from '@/types/templates';

// Storage key generator
const STORAGE_KEY = (id: string) => `template_edits_${id}`;

/**
 * Extract default values from template schema
 */
function getDefaultValues(elements: TemplateElement[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const element of elements) {
    switch (element.type) {
      case 'text':
        values[element.id] = element.defaultValue ?? '';
        break;
      case 'table':
        values[element.id] = element.defaultData ?? [];
        break;
      case 'checkbox':
        values[element.id] = element.defaultChecked ?? false;
        break;
      case 'date':
        values[element.id] = element.defaultValue ?? '';
        break;
      case 'image':
        values[element.id] = element.defaultUrl ?? '';
        break;
    }
  }

  return values;
}

/**
 * Safely load state from localStorage
 */
function loadSavedState(templateId: string): EditorState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY(templateId));
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate structure
      if (parsed && typeof parsed.values === 'object') {
        return parsed as EditorState;
      }
    }
  } catch (e) {
    console.warn('Failed to load template edits from localStorage:', e);
  }
  return null;
}

/**
 * Template Editor Hook
 * 
 * Provides state management for template editing with auto-save to localStorage.
 */
export function useTemplateEditor(template: Template) {
  const [state, setState] = useState<EditorState>(() => {
    const saved = loadSavedState(template.id);
    
    if (saved && saved.templateId === template.id) {
      // Merge saved values with defaults (in case schema added new fields)
      const defaults = getDefaultValues(template.schema.elements);
      return {
        templateId: template.id,
        values: { ...defaults, ...saved.values },
        isDirty: saved.isDirty || false,
        selectedElementId: null, // Don't restore selection
      };
    }

    return {
      templateId: template.id,
      values: getDefaultValues(template.schema.elements),
      isDirty: false,
      selectedElementId: null,
    };
  });

  // Auto-save to localStorage when state changes
  useEffect(() => {
    if (state.isDirty) {
      try {
        localStorage.setItem(STORAGE_KEY(template.id), JSON.stringify({
          templateId: state.templateId,
          values: state.values,
          isDirty: state.isDirty,
        }));
      } catch (e) {
        console.warn('Failed to save template edits to localStorage:', e);
      }
    }
  }, [state, template.id]);

  /**
   * Update a single field value
   */
  const updateField = useCallback((fieldId: string, value: unknown) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [fieldId]: value },
      isDirty: true,
    }));
  }, []);

  /**
   * Update a table cell value
   */
  const updateTableCell = useCallback((
    fieldId: string, 
    rowIndex: number, 
    colIndex: number, 
    value: string
  ) => {
    setState(prev => {
      const currentTable = (prev.values[fieldId] as string[][] | undefined) || [];
      const newTable = currentTable.map((row, ri) =>
        ri === rowIndex
          ? row.map((cell, ci) => (ci === colIndex ? value : cell))
          : row
      );
      return {
        ...prev,
        values: { ...prev.values, [fieldId]: newTable },
        isDirty: true,
      };
    });
  }, []);

  /**
   * Select an element for editing
   */
  const selectElement = useCallback((elementId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedElementId: elementId,
    }));
  }, []);

  /**
   * Reset to default values
   */
  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY(template.id));
    setState({
      templateId: template.id,
      values: getDefaultValues(template.schema.elements),
      isDirty: false,
      selectedElementId: null,
    });
  }, [template.id, template.schema.elements]);

  /**
   * Check if a specific field has been modified
   */
  const isFieldModified = useCallback((fieldId: string): boolean => {
    const element = template.schema.elements.find(e => e.id === fieldId);
    if (!element) return false;

    const currentValue = state.values[fieldId];
    const defaultValue = getDefaultValues([element])[fieldId];

    return JSON.stringify(currentValue) !== JSON.stringify(defaultValue);
  }, [template.schema.elements, state.values]);

  return {
    state,
    updateField,
    updateTableCell,
    selectElement,
    reset,
    isFieldModified,
  };
}
