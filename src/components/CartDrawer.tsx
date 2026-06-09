import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, user, setToastMessage, clearCart } = useStore();
  const navigate = useNavigate();

  // Purely frontend mock checkout to avoid hitting the paused database
  const handleCheckout = () => {
    if (!user) {
      setToastMessage("Please sign in to complete your order");
      onClose();
      navigate('/profile');
      return;
    }
    
    if (cart.length === 0) return;

    setToastMessage("Processing your order...");
    
    // Simulate a network delay for the UX feel
    setTimeout(() => {
      clearCart();
      setToastMessage("Order placed successfully! (Frontend Mock)");
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glassmorphic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          {/* Sliding Drawer Panel */}
          <motion.div
            initial={{ x: "100%", borderTopLeftRadius: "100%" }}
            animate={{ x: 0, borderTopLeftRadius: "0%" }}
            exit={{ x: "100%", borderTopLeftRadius: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[101] h-full w-full sm:w-[420px] bg-natural-base dark:bg-[#1A1A1A] shadow-2xl flex flex-col border-l border-white/20 dark:border-white/10"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-natural-cream dark:border-white/5 flex items-center justify-between bg-natural-light dark:bg-[#2A1E14]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-natural-accent/10 flex items-center justify-center text-natural-accent">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-natural-dark dark:text-natural-light">Your Order</h2>
                  <p className="text-xs text-gray-500 font-medium">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/10 rounded-full text-gray-400 hover:text-natural-accent shadow-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                  <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-inner">
                    <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-natural-dark dark:text-natural-light text-lg">Your cart is empty</p>
                    <p className="text-sm text-gray-500 max-w-[200px] mt-1">Looks like you haven't added any meals yet.</p>
                  </div>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.product.id} 
                    className="flex items-center gap-4 bg-white dark:bg-natural-dark p-4 rounded-3xl border border-gray-50 dark:border-white/5 shadow-sm group"
                  >
                    {/* Item Image / Placeholder */}
                    <div className="w-16 h-16 rounded-2xl bg-natural-cream dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border-2 border-transparent group-hover:border-natural-accent/20 transition-colors">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🍲</span>
                      )}
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-natural-dark dark:text-natural-light truncate">{item.product.name}</h4>
                      <p className="text-natural-accent font-bold text-sm mt-0.5">TZS {item.product.price.toLocaleString()}</p>
                    </div>

                    {/* Quantity Pill */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center bg-natural-base dark:bg-white/5 rounded-full p-1 border border-natural-cream dark:border-white/10">
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-natural-dark shadow-sm text-gray-500 hover:text-natural-accent transition-colors"
                        >
                          <Minus className="w-3 h-3"/>
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-natural-dark dark:text-natural-light">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-natural-dark shadow-sm text-gray-500 hover:text-natural-accent transition-colors"
                        >
                          <Plus className="w-3 h-3"/>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Checkout Area */}
            {cart.length > 0 && (
              <div className="p-6 bg-white dark:bg-natural-dark border-t border-gray-100 dark:border-white/5 shadow-[0_-10px_40px_rgb(0,0,0,0.05)] z-10">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-natural-dark dark:text-natural-light">TZS {cartTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className="font-semibold text-green-500">Free</span>
                  </div>
                  <div className="h-px w-full bg-gray-100 dark:bg-white/10"></div>
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-natural-dark dark:text-natural-light">Total</span>
                    <span className="text-2xl font-bold text-natural-accent">TZS {cartTotal().toLocaleString()}</span>
                  </div>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] dark:from-white dark:to-gray-200 text-white dark:text-natural-dark py-4 rounded-2xl font-bold flex justify-center items-center gap-3 shadow-[0_8px_30px_rgb(255,140,0,0.2)] hover:shadow-[0_8px_30px_rgb(255,140,0,0.4)] transition-all"
                >
                  Confirm Order
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}