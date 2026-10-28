import { create } from 'zustand';

export interface CartItem {
  id: string;
  productId: string;
  titleBn: string;
  titleEn: string;
  priceBdt: number;
  estimatedWeightGrams: number;
  shippingRatePerKgBdt: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getStage1TotalBdt: () => number;
  getStage2EstimatedShippingBdt: () => number;
  getTotalEstimatedWeightGrams: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQuantity: (id, delta) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    })),
  clearCart: () => set({ items: [] }),
  getStage1TotalBdt: () =>
    get().items.reduce((sum, item) => sum + item.priceBdt * item.quantity, 0),
  getStage2EstimatedShippingBdt: () =>
    get().items.reduce((sum, item) => {
      const itemWeightKg = (item.estimatedWeightGrams * item.quantity) / 1000;
      return sum + Math.round(itemWeightKg * item.shippingRatePerKgBdt);
    }, 0),
  getTotalEstimatedWeightGrams: () =>
    get().items.reduce((sum, item) => sum + item.estimatedWeightGrams * item.quantity, 0),
}));
