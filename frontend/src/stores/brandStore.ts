import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BrandItem } from '../types/brand';

interface BrandState {
  items: BrandItem[];
  loading: boolean;
  error?: string;

  setItems: (items: BrandItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  reset: () => void;
}

export const useBrandStore = create<BrandState>()(
  devtools(
    (set) => ({
      items: [],
      loading: false,
      error: undefined,

      setItems: (items) => set({ items }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () => set({ items: [], loading: false, error: undefined }),
    }),
    {
      name: 'brand-store',
    }
  )
);
