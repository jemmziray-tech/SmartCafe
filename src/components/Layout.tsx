import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Coffee, ShoppingBag, User as UserIcon, Moon, Sun, Shield, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Added fetchProducts to our Zustand store destructing
  const { isDarkMode, toggleTheme, cart, user, toastMessage, setToastMessage, fetchProducts } = useStore();

  // 2. Added fetchProducts() to the useEffect so it fires immediately when the app opens
  useEffect(() => {
    fetchProducts(); // Pulls the latest menu from Firebase on load!
    
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage, fetchProducts]);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Menu', path: '/menu', icon: Coffee },
    { name: 'Cart', path: '/cart', icon: ShoppingBag, badge: cart.reduce((acc, item) => acc + item.quantity, 0) },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: Shield });
  }

  return (
    // FIXED INSET-0: Locks the app to the exact screen bounds, preventing body scroll
    <div className="fixed inset-0 flex justify-center bg-natural-light dark:bg-[#1A1A1A] font-sans sm:py-8 overflow-hidden">
      
      {/* MAX-H: Acts as a phone mockup on PC, takes full space on mobile */}
      <div className="w-full h-full max-w-md sm:max-h-[850px] bg-natural-base dark:bg-[#2A1E14] shadow-2xl sm:border-[8px] sm:rounded-[3rem] border-[#1A1A1A] flex flex-col relative overflow-hidden transition-colors duration-300">
        
        {/* Header (Shrink-0 prevents it from squishing) */}
        <header className="shrink-0 flex justify-between items-center px-6 py-4 bg-transparent z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-natural-cream dark:bg-natural-dark rounded-full flex items-center justify-center relative">
               <Coffee className="w-5 h-5 text-natural-dark dark:text-natural-light" />
            </div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-natural-dark dark:text-natural-light">Smart<span className="text-natural-accent">Cafe</span></h1>
          </div>
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-natural-cream/50 dark:bg-natural-dark/50 text-natural-dark dark:text-natural-light transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Main Scrolling Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="px-6 pb-6 pt-4"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 30, x: '-50%', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
              exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-20 left-1/2 flex items-center gap-3 bg-natural-dark dark:bg-natural-light text-natural-light dark:text-natural-dark px-5 py-3.5 rounded-full shadow-2xl z-50 text-sm font-semibold whitespace-nowrap"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400 dark:text-green-600" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATIC NAV: Naturally sits at the bottom without floating */}
        <nav className="shrink-0 w-full bg-white dark:bg-natural-dark border-t border-gray-100 dark:border-white/10 px-6 py-4 flex justify-around items-center z-20 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/menu' && location.pathname.startsWith('/product'));
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={clsx(
                  "relative flex flex-col items-center gap-1 transition-colors",
                  isActive ? "text-natural-accent" : "text-gray-400 dark:text-gray-500 hover:text-natural-accent"
                )}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[8px] font-bold text-white bg-natural-accent rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase">{item.name}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  );
}