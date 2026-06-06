import React from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Star } from 'lucide-react';
import { Category } from '../types';

const CATEGORIES: ('All' | Category)[] = ['All', 'Beverages', 'Breakfast', 'Snacks', 'Main Course', 'Desserts'];

export default function Home() {
  const { user, products } = useStore();
  const navigate = useNavigate();
  const featuredProducts = products.filter(p => p.isFeatured);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium text-gray-400 dark:text-gray-400">Karibu,</h2>
        <h1 className="text-2xl font-bold tracking-tight text-natural-dark dark:text-natural-light">
          {user ? user.name : 'Guest'}
        </h1>
      </div>

      <div 
        onClick={() => navigate('/menu')}
        className="flex items-center gap-3 px-4 py-3 bg-natural-light dark:bg-natural-dark rounded-2xl shadow-sm border border-natural-cream dark:border-white/10 cursor-text"
      >
        <Search className="w-5 h-5 text-gray-400" />
        <span className="text-gray-400 flex-1">Search for local food...</span>
      </div>

      <div className="relative rounded-2xl overflow-hidden h-40 shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800" 
          alt="Cafe Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-6">
          <span className="text-natural-accent font-medium text-sm mb-1 uppercase tracking-widest text-[10px]">Chula Bites</span>
          <h2 className="text-white text-xl font-bold leading-tight w-2/3">Free Delivery on Main Courses</h2>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-sm font-bold text-natural-dark dark:text-natural-light">Categories</h3>
          <button onClick={() => navigate('/menu')} className="text-xs text-natural-accent font-medium flex items-center">
            See all <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              onClick={() => navigate('/menu')}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm transition-colors shadow-sm ${
                i === 0 
                  ? 'bg-natural-accent text-white font-bold' 
                  : 'bg-natural-light text-natural-dark border border-natural-cream dark:bg-natural-dark dark:border-white/10 dark:text-natural-light'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-natural-dark dark:text-natural-light mb-3">Popular Choices</h3>
        <div className="grid grid-cols-1 gap-4">
          {featuredProducts.map((product) => (
            <div 
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-natural-light dark:bg-natural-dark rounded-3xl p-4 shadow-sm border border-natural-cream dark:border-white/10 flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-natural-cream">
                <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                <div className="absolute top-1 right-1 bg-white/90 dark:bg-natural-dark/90 backdrop-blur-sm p-1 rounded-full">
                  <Star className="w-3 h-3 text-natural-accent fill-natural-accent" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm line-clamp-1 text-natural-dark dark:text-natural-light">{product.name}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-1">{product.description}</p>
                </div>
                <div className="flex justify-between items-end">
                  {/* TZS Formatting */}
                  <span className="text-sm font-bold text-natural-accent">TZS {product.price.toLocaleString()}</span>
                  <button className="w-8 h-8 bg-natural-dark text-white dark:bg-natural-light dark:text-natural-dark rounded-xl text-lg font-light flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}