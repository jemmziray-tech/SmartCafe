import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Plus, Coffee } from 'lucide-react';
import clsx from 'clsx';
import { Category } from '../types';

const CATEGORIES: ('All' | Category)[] = ['All', 'Beverages', 'Breakfast', 'Snacks', 'Main Course', 'Desserts'];

export default function Menu() {
  const { products, addToCart } = useStore();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | Category>('All');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Framer Motion staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif tracking-tight text-natural-dark dark:text-natural-light">
          Our Menu
        </h1>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-white dark:bg-natural-dark rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-50 dark:border-white/5 transition-all focus-within:shadow-[0_8px_30px_rgb(255,140,0,0.1)] focus-within:border-natural-accent/30">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for a meal..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-natural-dark dark:text-natural-light text-sm w-full placeholder:text-gray-400"
          />
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className="px-5 py-4 bg-natural-accent rounded-[1.5rem] flex items-center justify-center text-white shadow-[0_8px_30px_rgb(255,140,0,0.2)] font-bold"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              "px-6 py-2.5 rounded-full whitespace-nowrap text-sm transition-all duration-300 relative overflow-hidden",
              activeCategory === cat
                ? "text-white font-bold shadow-md"
                : "bg-white text-gray-500 border border-gray-100 hover:border-gray-200 dark:bg-[#1A1A1A] dark:border-white/5 dark:text-gray-400"
            )}
          >
            {activeCategory === cat && (
              <motion.div 
                layoutId="activeCategory" 
                className="absolute inset-0 bg-natural-accent -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </motion.button>
        ))}
      </div>

      {/* Product Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div 
              layout
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.9 }}
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="group bg-white dark:bg-[#1A1A1A] rounded-[2rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-50 dark:border-white/5 cursor-pointer flex flex-col transition-all duration-300"
            >
              {/* Image Wrapper */}
              <div className="relative aspect-square w-full rounded-[1.5rem] bg-natural-cream dark:bg-white/5 overflow-hidden mb-4">
                <img 
                  src={product.imageUrl || product.image} // Fallback to handle type differences
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                
                {/* Floating Add to Cart Button */}
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="absolute bottom-3 right-3 w-10 h-10 bg-white/80 dark:bg-black/50 backdrop-blur-md text-natural-dark dark:text-white rounded-full flex items-center justify-center shadow-lg hover:bg-natural-accent hover:text-white dark:hover:bg-natural-accent transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="px-2 pb-2 flex flex-col flex-1">
                <h3 className="font-bold text-natural-dark dark:text-natural-light truncate text-sm sm:text-base mb-1">
                  {product.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3 flex-1">
                  {product.description}
                </p>
                <span className="text-sm font-bold text-natural-accent">
                  TZS {product.price.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Coffee className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="font-bold text-natural-dark dark:text-natural-light text-lg">No meals found</h3>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or category filter.</p>
        </motion.div>
      )}
    </div>
  );
}