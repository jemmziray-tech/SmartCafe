import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, getDocs, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase'; 
import { Product, CartItem, User, Order } from './types';

interface AppState {
  user: User | null;
  isAuthReady: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;

  favorites: string[];
  toggleFavorite: (productId: string) => void;
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
      user: null, 
      isAuthReady: false,
      
      initAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              set({ toastMessage: "Verifying Google credentials..." });
              
              const MASTER_ADMIN_EMAILS = ['jem.mziray@gmail.com'];
              const userEmail = firebaseUser.email || '';
              const isWhitelisted = MASTER_ADMIN_EMAILS.includes(userEmail);
              
              const userRef = doc(db, 'users', firebaseUser.uid);
              const userSnap = await getDoc(userRef);
              
              let finalRole: 'customer' | 'admin' = isWhitelisted ? 'admin' : 'customer';

              if (userSnap.exists()) {
                if (isWhitelisted && userSnap.data().role !== 'admin') {
                  await setDoc(userRef, { role: 'admin' }, { merge: true });
                } else {
                  finalRole = userSnap.data().role;
                }
              } else {
                await setDoc(userRef, {
                  name: firebaseUser.displayName,
                  email: userEmail,
                  role: finalRole,
                  createdAt: new Date().toISOString()
                });
              }

              set({ 
                user: { 
                  id: firebaseUser.uid, 
                  name: firebaseUser.displayName || 'Guest', 
                  email: userEmail, 
                  role: finalRole,
                  avatar: firebaseUser.photoURL || undefined
                },
                isAuthReady: true,
                toastMessage: finalRole === 'admin' ? "Welcome to Admin Command!" : "Successfully logged in!"
              });

            } catch (error: any) {
              console.error("Firestore Database Error:", error);
              set({ 
                user: { 
                  id: firebaseUser.uid, 
                  name: firebaseUser.displayName || 'Guest', 
                  email: firebaseUser.email || '', 
                  role: 'customer', 
                  avatar: firebaseUser.photoURL || undefined
                },
                isAuthReady: true,
                toastMessage: "Connection weak. Logged in as customer."
              });
            }
          } else {
            set({ user: null, isAuthReady: true });
          }
        });
      },

      loginWithGoogle: async () => {
        try {
          set({ toastMessage: "Connecting to Google..." });
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' }); 
          await signInWithPopup(auth, provider);
        } catch (error: any) {
          console.error("Google Sign-In Error:", error);
          set({ toastMessage: `Login Canceled` });
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, toastMessage: "Successfully logged out" });
        } catch (error) {
          console.error("Logout Error:", error);
        }
      },

      favorites: [],
      toggleFavorite: (productId) => set((state) => ({ favorites: state.favorites.includes(productId) ? state.favorites.filter(id => id !== productId) : [...state.favorites, productId] })),
      products: [],
      isLoadingProducts: false,
      fetchProducts: async () => {
        set({ isLoadingProducts: true });
        try {
          const querySnapshot = await getDocs(collection(db, 'products'));
          const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
          set({ products: fetchedProducts, isLoadingProducts: false });
        } catch (error) {
          set({ isLoadingProducts: false });
        }
      },
      cart: [],
      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.product.id === product.id);
        const newCart = existing ? state.cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...state.cart, { product, quantity: 1 }];
        return { cart: newCart, toastMessage: `${product.name} added to order` };
      }),
      removeFromCart: (productId) => set((state) => ({ cart: state.cart.filter(item => item.product.id !== productId) })),
      updateCartQuantity: (productId, quantity) => set((state) => ({ cart: state.cart.map(item => item.product.id === productId ? { ...item, quantity } : item) })),
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((total, item) => total + (item.product.price * item.quantity), 0),
      orders: [],
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
          await addDoc(collection(db, 'orders'), newOrder);
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