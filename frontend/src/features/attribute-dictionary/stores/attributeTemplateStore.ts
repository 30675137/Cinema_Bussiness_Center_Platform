/**
 * Zustand Store for Attribute Template Management
 *
 * Manages attribute templates and attributes with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AttributeTemplate,
  Attribute,
  CreateAttributeTemplateRequest,
  UpdateAttributeTemplateRequest,
  CreateAttributeRequest,
  UpdateAttributeRequest,
} from '../types';

interface AttributeTemplateStore {
  // State
  attributeTemplates: Map<string, AttributeTemplate>; // categoryId -> template
  attributes: Map<string, Attribute[]>; // templateId -> attributes[]

  // Attribute Template Actions
  addAttributeTemplate: (template: AttributeTemplate) => void;
  updateAttributeTemplate: (id: string, updates: UpdateAttributeTemplateRequest) => void;
  deleteAttributeTemplate: (id: string) => void;
  getAttributeTemplate: (id: string) => AttributeTemplate | undefined;
  getAttributeTemplateByCategoryId: (categoryId: string) => AttributeTemplate | undefined;

  // Attribute Actions
  addAttribute: (attribute: Attribute) => void;
  updateAttribute: (id: string, updates: UpdateAttributeRequest) => void;
  deleteAttribute: (id: string) => void;
  getAttributes: (templateId: string) => Attribute[];
  getAttribute: (id: string) => Attribute | undefined;

  // Utility Actions
  initializeData: () => void;
  clearAll: () => void;
}

// Custom serialization for Map
const serializeMap = <T>(map: Map<string, T>) => {
  return Object.fromEntries(map.entries());
};

const deserializeMap = <T>(obj: Record<string, T>): Map<string, T> => {
  return new Map(Object.entries(obj));
};

export const useAttributeTemplateStore = create<AttributeTemplateStore>()(
  persist(
    (set, get) => ({
      // Initial state
      attributeTemplates: new Map(),
      attributes: new Map(),

      // Attribute Template Actions
      addAttributeTemplate: (template) =>
        set((state) => {
          const newTemplatesMap = new Map(state.attributeTemplates);
          newTemplatesMap.set(template.categoryId, template);
          return { attributeTemplates: newTemplatesMap };
        }),

      updateAttributeTemplate: (id, updates) =>
        set((state) => {
          const newTemplatesMap = new Map(state.attributeTemplates);
          for (const [categoryId, template] of newTemplatesMap.entries()) {
            if (template.id === id) {
              newTemplatesMap.set(categoryId, {
                ...template,
                ...updates,
                updatedAt: new Date().toISOString(),
              });
              break;
            }
          }
          return { attributeTemplates: newTemplatesMap };
        }),

      deleteAttributeTemplate: (id) =>
        set((state) => {
          const newTemplatesMap = new Map(state.attributeTemplates);
          const newAttributesMap = new Map(state.attributes);

          // Find and remove template
          for (const [categoryId, template] of newTemplatesMap.entries()) {
            if (template.id === id) {
              newTemplatesMap.delete(categoryId);
              // Also remove associated attributes
              newAttributesMap.delete(id);
              break;
            }
          }

          return {
            attributeTemplates: newTemplatesMap,
            attributes: newAttributesMap,
          };
        }),

      getAttributeTemplate: (id) => {
        const state = get();
        for (const template of state.attributeTemplates.values()) {
          if (template.id === id) return template;
        }
        return undefined;
      },

      getAttributeTemplateByCategoryId: (categoryId) => {
        const state = get();
        return state.attributeTemplates.get(categoryId);
      },

      // Attribute Actions
      addAttribute: (attribute) =>
        set((state) => {
          const newAttributesMap = new Map(state.attributes);
          const existingAttributes = newAttributesMap.get(attribute.templateId) || [];
          newAttributesMap.set(attribute.templateId, [...existingAttributes, attribute]);
          return { attributes: newAttributesMap };
        }),

      updateAttribute: (id, updates) =>
        set((state) => {
          const newAttributesMap = new Map(state.attributes);
          for (const [templateId, attributes] of newAttributesMap.entries()) {
            const index = attributes.findIndex((attr) => attr.id === id);
            if (index !== -1) {
              newAttributesMap.set(templateId, [
                ...attributes.slice(0, index),
                {
                  ...attributes[index],
                  ...updates,
                  updatedAt: new Date().toISOString(),
                },
                ...attributes.slice(index + 1),
              ]);
              break;
            }
          }
          return { attributes: newAttributesMap };
        }),

      deleteAttribute: (id) =>
        set((state) => {
          const newAttributesMap = new Map(state.attributes);
          for (const [templateId, attributes] of newAttributesMap.entries()) {
            const filteredAttributes = attributes.filter((attr) => attr.id !== id);
            if (filteredAttributes.length !== attributes.length) {
              newAttributesMap.set(templateId, filteredAttributes);
              break;
            }
          }
          return { attributes: newAttributesMap };
        }),

      getAttributes: (templateId) => {
        const state = get();
        return (state.attributes.get(templateId) || []).sort((a, b) => a.sort - b.sort);
      },

      getAttribute: (id) => {
        const state = get();
        for (const attributes of state.attributes.values()) {
          const attribute = attributes.find((attr) => attr.id === id);
          if (attribute) return attribute;
        }
        return undefined;
      },

      // Utility Actions
      initializeData: () => {
        // Initialize with default data if empty
        const state = get();
        if (state.attributeTemplates.size === 0) {
          // Default templates will be loaded from mock data
          console.log('Initializing attribute template store with default data');
        }
      },

      clearAll: () =>
        set({
          attributeTemplates: new Map(),
          attributes: new Map(),
        }),
    }),
    {
      name: 'attribute-template-store',
      storage: createJSONStorage(() => localStorage),
      // Custom serialization for Map
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          state: {
            ...state.state,
            attributeTemplates: serializeMap(state.state.attributeTemplates),
            attributes: serializeMap(state.state.attributes),
          },
        });
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          state: {
            ...parsed.state,
            attributeTemplates: deserializeMap(parsed.state.attributeTemplates || {}),
            attributes: deserializeMap(parsed.state.attributes || {}),
          },
        };
      },
    }
  )
);
