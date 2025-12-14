/**
 * Zustand Store for Dictionary Management
 * 
 * Manages dictionary types and items with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  DictionaryType,
  DictionaryItem,
  CreateDictionaryTypeRequest,
  UpdateDictionaryTypeRequest,
  CreateDictionaryItemRequest,
  UpdateDictionaryItemRequest,
} from '../types';

interface DictionaryStore {
  // State
  dictionaryTypes: DictionaryType[];
  dictionaryItems: Map<string, DictionaryItem[]>; // typeId -> items[]

  // Dictionary Type Actions
  addDictionaryType: (type: DictionaryType) => void;
  updateDictionaryType: (id: string, updates: UpdateDictionaryTypeRequest) => void;
  deleteDictionaryType: (id: string) => void;
  getDictionaryType: (id: string) => DictionaryType | undefined;
  getDictionaryTypeByCode: (code: string) => DictionaryType | undefined;

  // Dictionary Item Actions
  addDictionaryItem: (item: DictionaryItem) => void;
  updateDictionaryItem: (id: string, updates: UpdateDictionaryItemRequest) => void;
  deleteDictionaryItem: (id: string) => void;
  getDictionaryItems: (typeId: string) => DictionaryItem[];
  getActiveDictionaryItems: (typeId: string) => DictionaryItem[];
  getDictionaryItem: (id: string) => DictionaryItem | undefined;

  // Utility Actions
  initializeData: () => void;
  clearAll: () => void;
}

// Custom serialization for Map
const serializeMap = (map: Map<string, DictionaryItem[]>) => {
  return Object.fromEntries(map.entries());
};

const deserializeMap = (obj: Record<string, DictionaryItem[]>): Map<string, DictionaryItem[]> => {
  return new Map(Object.entries(obj));
};

export const useDictionaryStore = create<DictionaryStore>()(
  persist(
    (set, get) => ({
      // Initial state
      dictionaryTypes: [],
      dictionaryItems: new Map(),

      // Dictionary Type Actions
      addDictionaryType: (type) =>
        set((state) => ({
          dictionaryTypes: [...state.dictionaryTypes, type],
        })),

      updateDictionaryType: (id, updates) =>
        set((state) => ({
          dictionaryTypes: state.dictionaryTypes.map((type) =>
            type.id === id
              ? {
                  ...type,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : type
          ),
        })),

      deleteDictionaryType: (id) =>
        set((state) => {
          const newItemsMap = new Map(state.dictionaryItems);
          newItemsMap.delete(id);
          return {
            dictionaryTypes: state.dictionaryTypes.filter((type) => type.id !== id),
            dictionaryItems: newItemsMap,
          };
        }),

      getDictionaryType: (id) => {
        const state = get();
        return state.dictionaryTypes.find((type) => type.id === id);
      },

      getDictionaryTypeByCode: (code) => {
        const state = get();
        return state.dictionaryTypes.find((type) => type.code === code);
      },

      // Dictionary Item Actions
      addDictionaryItem: (item) =>
        set((state) => {
          const newItemsMap = new Map(state.dictionaryItems);
          const existingItems = newItemsMap.get(item.typeId) || [];
          newItemsMap.set(item.typeId, [...existingItems, item]);
          return { dictionaryItems: newItemsMap };
        }),

      updateDictionaryItem: (id, updates) =>
        set((state) => {
          const newItemsMap = new Map(state.dictionaryItems);
          for (const [typeId, items] of newItemsMap.entries()) {
            const index = items.findIndex((item) => item.id === id);
            if (index !== -1) {
              newItemsMap.set(typeId, [
                ...items.slice(0, index),
                {
                  ...items[index],
                  ...updates,
                  updatedAt: new Date().toISOString(),
                },
                ...items.slice(index + 1),
              ]);
              break;
            }
          }
          return { dictionaryItems: newItemsMap };
        }),

      deleteDictionaryItem: (id) =>
        set((state) => {
          const newItemsMap = new Map(state.dictionaryItems);
          for (const [typeId, items] of newItemsMap.entries()) {
            const filteredItems = items.filter((item) => item.id !== id);
            if (filteredItems.length !== items.length) {
              newItemsMap.set(typeId, filteredItems);
              break;
            }
          }
          return { dictionaryItems: newItemsMap };
        }),

      getDictionaryItems: (typeId) => {
        const state = get();
        return state.dictionaryItems.get(typeId) || [];
      },

      getActiveDictionaryItems: (typeId) => {
        const state = get();
        const items = state.dictionaryItems.get(typeId) || [];
        return items
          .filter((item) => item.status === 'active')
          .sort((a, b) => a.sort - b.sort);
      },

      getDictionaryItem: (id) => {
        const state = get();
        for (const items of state.dictionaryItems.values()) {
          const item = items.find((item) => item.id === id);
          if (item) return item;
        }
        return undefined;
      },

      // Utility Actions
      initializeData: () => {
        // Initialize with default data if empty
        const state = get();
        if (state.dictionaryTypes.length === 0) {
          // Default dictionary types will be loaded from mock data
          console.log('Initializing dictionary store with default data');
        }
      },

      clearAll: () =>
        set({
          dictionaryTypes: [],
          dictionaryItems: new Map(),
        }),
    }),
    {
      name: 'dictionary-store',
      storage: createJSONStorage(() => localStorage),
      // Custom serialization for Map
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          state: {
            ...state.state,
            dictionaryItems: serializeMap(state.state.dictionaryItems),
          },
        });
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          state: {
            ...parsed.state,
            dictionaryItems: deserializeMap(parsed.state.dictionaryItems || {}),
          },
        };
      },
    }
  )
);

