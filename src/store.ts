import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Product, CartItem, User, Order } from './types';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  
  // --- CLOUD STATE ---
  products: Product[];
  isLoadingProducts: boolean;
  fetchProducts: () => Promise<void>;
  
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  
  orders: Order[];
  placeOrder: () => Promise<void>;
  
  isDarkMode: boolean;
  toggleTheme: () => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: { id: 'u1', name: 'Student Guest', email: 'guest@smartcafe.tz', role: 'admin' }, // Set as admin temporarily for testing
      setUser: (user) => set({ user }),
      
      favorites: [],
      toggleFavorite: (productId) => set((state) => ({
        favorites: state.favorites.includes(productId)
          ? state.favorites.filter(id => id !== productId)
          : [...state.favorites, productId]
      })),

      // --- FIREBASE FETCHING LOGIC ---
      products: [],
      isLoadingProducts: false,
      fetchProducts: async () => {
        set({ isLoadingProducts: true });
        try {
          const querySnapshot = await getDocs(collection(db, 'products'));
          const fetchedProducts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
          
          set({ products: fetchedProducts, isLoadingProducts: false });
        } catch (error) {
          console.error("Error fetching products:", error);
          set({ isLoadingProducts: false });
        }
      },

      cart: [],
      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.product.id === product.id);
        const newCart = existing 
          ? state.cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
          : [...state.cart, { product, quantity: 1 }];
          
        return { cart: newCart, toastMessage: `${product.name} added to order` };
      }),
      removeFromCart: (productId) => set((state) => ({ cart: state.cart.filter(item => item.product.id !== productId) })),
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(item => item.product.id === productId ? { ...item, quantity } : item)
      })),
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((total, item) => total + (item.product.price * item.quantity), 0),

      orders: [],
      // --- FIREBASE PUSH LOGIC ---
      placeOrder: async () => {
        const state = get();
        if (state.cart.length === 0 || !state.user) return;
        
        const newOrder: Order = {
          id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          userId: state.user.id,
          items: [...state.cart],
          total: get().cartTotal(),
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        try {
          // Push to Firebase
          await addDoc(collection(db, 'orders'), newOrder);
          // Save locally for instant UI update
          set({ orders: [newOrder, ...state.orders], cart: [] });
        } catch (error) {
          console.error("Error pushing order to cloud:", error);
        }
      },

      isDarkMode: false,
      toggleTheme: () => set((state) => {
        const newMode = !state.isDarkMode;
        newMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
        return { isDarkMode: newMode };
      }),
      toastMessage: null,
      setToastMessage: (msg) => set({ toastMessage: msg })
    }),
    {
      name: 'smartcafe-storage',
      partialize: (state) => ({ cart: state.cart, favorites: state.favorites, isDarkMode: state.isDarkMode, orders: state.orders }),
    }
  )
);