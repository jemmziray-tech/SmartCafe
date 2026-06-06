import React, { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-natural-dark dark:text-natural-light">Our Menu</h1>

      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-natural-light dark:bg-natural-dark rounded-2xl shadow-sm border border-natural-cream dark:border-white/10">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search details..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-natural-dark dark:text-natural-light text-sm w-full placeholder:text-gray-400"
          />
        </div>
        <button className="px-4 py-3 bg-natural-accent rounded-2xl flex items-center justify-center text-white shadow-sm font-bold">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              "px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors shadow-sm",
              activeCategory === cat
                ? "bg-natural-accent text-white font-bold"
                : "bg-natural-light text-natural-dark border border-natural-cream dark:bg-natural-dark dark:border-white/10 dark:text-natural-light"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <div 
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="flex items-center gap-4 p-3 bg-natural-light dark:bg-natural-dark rounded-3xl shadow-sm border border-natural-cream dark:border-white/10 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-natural-cream flex items-center justify-center">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 py-1">
              <h3 className="font-bold text-sm text-natural-dark dark:text-natural-light">{product.name}</h3>
              <p className="text-[10px] text-gray-500 line-clamp-1 mb-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                {/* TZS Formatting */}
                <span className="text-sm font-bold text-natural-accent">TZS {product.price.toLocaleString()}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-natural-dark text-white dark:bg-natural-light dark:text-natural-dark text-lg font-light"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
            No items found.
          </div>
        )}
      </div>
    </div>
  );
}