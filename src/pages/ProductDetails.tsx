import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ChevronLeft, Heart, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, favorites, toggleFavorite } = useStore();
  
  const product = products.find(p => p.id === id);

  if (!product) {
    return <div className="text-center py-10">Product not found</div>;
  }

  const isFav = favorites.includes(product.id);

  return (
    <div className="absolute inset-0 bg-natural-light dark:bg-natural-dark z-20 flex flex-col h-full overflow-hidden">
      <div className="relative h-2/5 shrink-0 bg-natural-cream">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => toggleFavorite(product.id)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white"
          >
            <Heart className={clsx("w-5 h-5", isFav && "fill-natural-accent text-natural-accent")} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-natural-base dark:bg-natural-dark -mt-6 rounded-t-[3rem] relative px-6 py-8 flex flex-col min-h-0 border-t-[8px] border-[#1A1A1A]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-natural-dark dark:text-natural-light mb-1 font-serif">{product.name}</h1>
            <span className="inline-block px-3 py-1 bg-natural-cream dark:bg-white/10 text-natural-accent text-xs font-semibold rounded-full">
              {product.category}
            </span>
          </div>
          {/* TZS Formatting */}
          <span className="text-2xl font-bold text-natural-accent whitespace-nowrap">
            TZS {product.price.toLocaleString()}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <h3 className="font-semibold text-natural-dark dark:text-natural-light mb-2">Description</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
            {product.description}
          </p>

          <h3 className="font-semibold text-natural-dark dark:text-natural-light mb-2">Ingredients</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed pb-24">
            Prepared with fresh local Tanzanian spices, high-quality farm produce, and cooked to perfection for an authentic taste.
          </p>
        </div>

        <div className="absolute bottom-0 w-full left-0 bg-natural-base dark:bg-natural-dark p-6 border-t border-natural-cream dark:border-white/10 z-10 flex gap-4">
          <button 
            onClick={() => {
              addToCart(product);
              navigate(-1);
            }}
            className="flex-1 bg-natural-accent text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
          >
            <ShoppingBag className="w-5 h-5" />
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}