import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { useStore } from '../store';
import CartDrawer from './CartDrawer';

export default function FloatingCart() {
  const { cart } = useStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Calculate total number of items, not just unique products
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      {/* The Floating Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDrawerOpen(true)}
          className="relative bg-natural-accent text-white p-4 rounded-full shadow-[0_8px_30px_rgb(255,140,0,0.3)] hover:shadow-[0_8px_30px_rgb(255,140,0,0.5)] transition-all"
        >
          <ShoppingBag className="w-6 h-6" />
          
          {/* Notification Badge */}
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-[#1A1A1A] dark:bg-white text-white dark:text-natural-dark text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-natural-base dark:border-[#1A1A1A] shadow-sm"
              >
                {totalItems}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* The Drawer */}
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}