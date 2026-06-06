import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem, User, Order, Category } from './types';

const MOCK_PRODUCTS: Product[] = [
  // BEVERAGES
  { id: 'p1', name: 'Spiced Masala Chai', description: 'Authentic Tanzanian tea brewed with fresh ginger, cardamom, and cinnamon.', price: 2000, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1576092762791-dd9e2220afa1?auto=format&fit=crop&q=80&w=600', isFeatured: true },
  { id: 'p2', name: 'Fresh Passion Juice', description: '100% natural, freshly squeezed passion fruit juice chilled to perfection.', price: 3000, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1622597467836-f38240662c8c?auto=format&fit=crop&q=80&w=600', isFeatured: false },
  
  // BREAKFAST
  { id: 'p3', name: 'Uji wa Lishe', description: 'Nutritious mixed-grain porridge served hot, perfect for starting your day.', price: 2500, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600', isFeatured: true },
  { id: 'p4', name: 'Chapati & Maharage', description: 'Soft, flaky chapatis served with rich coconut-infused beans.', price: 3500, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=600', isFeatured: false },
  { id: 'p5', name: 'Supu ya Ng\'ombe', description: 'Hearty beef broth slow-cooked with local herbs, served with a dash of lime.', price: 4000, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=600', isFeatured: false },

  // SNACKS
  { id: 'p6', name: 'Crispy Beef Samosa', description: 'Golden, crispy pastry stuffed with minced beef, onions, and local spices.', price: 1500, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600', isFeatured: true },
  { id: 'p7', name: 'Vitumbua (3 pcs)', description: 'Sweet, fluffy rice cakes infused with cardamom and coconut milk.', price: 1000, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1605333390234-eb163777d8b5?auto=format&fit=crop&q=80&w=600', isFeatured: false },

  // MAIN COURSE
  { id: 'p8', name: 'Chips Mayai', description: 'The iconic Tanzanian street food classic: French fries baked into a savory Spanish omelette.', price: 4500, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&q=80&w=600', isFeatured: true },
  { id: 'p9', name: 'Pilau Kuku', description: 'Fragrant spiced rice cooked with tender chicken pieces, served with fresh kachumbari.', price: 8000, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1550928431-ee0ecb00c1d5?auto=format&fit=crop&q=80&w=600', isFeatured: true },
  { id: 'p10', name: 'Nyama Choma & Ugali', description: 'Premium grilled beef paired with traditional stiff maize porridge and fresh greens.', price: 15000, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600', isFeatured: true },

  // DESSERTS
  { id: 'p11', name: 'Tropical Fruit Salad', description: 'A refreshing bowl of freshly cut mangoes, pineapples, watermelon, and bananas.', price: 3500, category: 'Desserts', imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9f527d0597?auto=format&fit=crop&q=80&w=600', isFeatured: false }
];

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  
  orders: Order[];
  placeOrder: () => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  isDarkMode: boolean;
  toggleTheme: () => void;

  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: { id: 'u1', name: 'Student Guest', email: 'guest@smartcafe.tz', role: 'customer' },
      setUser: (user) => set({ user }),
      
      favorites: [],
      toggleFavorite: (productId) => set((state) => ({
        favorites: state.favorites.includes(productId)
          ? state.favorites.filter(id => id !== productId)
          : [...state.favorites, productId]
      })),

      products: MOCK_PRODUCTS,
      setProducts: (products) => set({ products }),

      cart: [],
      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.product.id === product.id);
        const newCart = existing 
          ? state.cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
          : [...state.cart, { product, quantity: 1 }];
          
        return { 
          cart: newCart,
          toastMessage: `${product.name} added to order` 
        };
      }),
      
      removeFromCart: (productId) => set((state) => ({ cart: state.cart.filter(item => item.product.id !== productId) })),
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(item => item.product.id === productId ? { ...item, quantity } : item)
      })),
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((total, item) => total + (item.product.price * item.quantity), 0),

      orders: [],
      placeOrder: () => set((state) => {
        if (state.cart.length === 0 || !state.user) return state;
        const newOrder: Order = {
          id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          userId: state.user.id,
          items: [...state.cart],
          total: get().cartTotal(),
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        return { orders: [newOrder, ...state.orders], cart: [] };
      }),
      updateOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
      })),

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
      name: 'smartcafe-storage', // The key used in localStorage
      partialize: (state) => ({ 
        cart: state.cart, 
        favorites: state.favorites, 
        isDarkMode: state.isDarkMode,
        orders: state.orders 
      }), // We only save these specific states permanently
    }
  )
);