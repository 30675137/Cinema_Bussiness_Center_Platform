import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CategoryItem } from '../types/category';

interface CategoryState {
  items: CategoryItem[];
  loading: boolean;
  error?: string;

  setItems: (items: CategoryItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  reset: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set) => ({
      items: [],
      loading: false,
      error: undefined,

      setItems: (items) => set({ items }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () => set({ items: [], loading: false, error: undefined })
    }),
    {
      name: 'category-store'
    }
  )
);