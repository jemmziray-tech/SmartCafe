import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Star, Clock, ChefHat, Sparkles } from 'lucide-react';

export default function Home() {
  const { products } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Grab a few products to act as our "Trending" or "Featured" items
  const featuredProducts = products.slice(0, 4);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, you might pass this state to the Menu page
      navigate('/menu');
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 pb-24">
      
      {/* --- IMMERSIVE HERO SECTION --- */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-[480px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col justify-end p-6 sm:p-10"
      >
        {/* Background Image & Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-natural-dark">
          <img 
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2874&auto=format&fit=crop" 
            alt="Luxury Restaurant" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-2xl text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-4 border border-white/30">
              <Sparkles className="w-3 h-3 text-natural-accent" />
              Premium Dining
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold font-serif leading-[1.1] tracking-tight mb-4 drop-shadow-lg">
              Taste the Soul of <span className="text-transparent bg-clip-text bg-gradient-to-r from-natural-accent to-[#FF6B35]">Tanzania.</span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base mb-8 max-w-md font-medium leading-relaxed">
              Experience authentic, chef-crafted meals delivered directly to your door with uncompromising quality.
            </p>
          </motion.div>

          {/* Glassmorphic Search Bar */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }}
            onSubmit={handleSearch}
            className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl focus-within:bg-white/20 transition-all"
          >
            <div className="pl-4">
              <Search className="w-5 h-5 text-gray-300" />
            </div>
            <input 
              type="text" 
              placeholder="What are you craving today?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-400 text-sm font-medium py-3"
            />
            <button 
              type="submit"
              className="bg-natural-accent hover:bg-[#FF6B35] text-white px-6 py-3 rounded-full font-bold shadow-lg transition-colors flex items-center gap-2"
            >
              Search
            </button>
          </motion.form>
        </div>
      </motion.section>

      {/* --- BENTO BOX CATEGORIES --- */}
      <motion.section variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: "Main Course", icon: ChefHat, color: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
          { title: "Quick Snacks", icon: Clock, color: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
          { title: "Beverages", icon: Star, color: "bg-green-50 dark:bg-green-500/10", text: "text-green-600 dark:text-green-400" },
          { title: "Desserts", icon: Sparkles, color: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }
        ].map((cat, idx) => (
          <motion.div 
            key={idx}
            variants={fadeUp}
            onClick={() => navigate('/menu')}
            className="group bg-white dark:bg-[#1A1A1A] p-5 rounded-[2rem] border border-gray-50 dark:border-white/5 shadow-sm hover:shadow-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-3"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
              <cat.icon className={`w-6 h-6 ${cat.text}`} />
            </div>
            <h3 className="font-bold text-natural-dark dark:text-white text-sm">{cat.title}</h3>
          </motion.div>
        ))}
      </motion.section>

      {/* --- TRENDING HORIZONTAL CAROUSEL --- */}
      <section className="space-y-6 pt-4">
        <div className="flex items-end justify-between px-2">
          <div>
            <h2 className="text-2xl font-bold font-serif text-natural-dark dark:text-white tracking-tight">Trending Now</h2>
            <p className="text-gray-500 text-sm mt-1">Our most loved signature dishes.</p>
          </div>
          <button 
            onClick={() => navigate('/menu')}
            className="text-natural-accent font-bold text-sm hover:text-[#FF6B35] flex items-center gap-1 transition-colors"
          >
            Full Menu <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          {featuredProducts.length === 0 ? (
            <div className="w-full p-10 text-center text-gray-500 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10">
              No trending items right now. Check back later!
            </div>
          ) : (
            featuredProducts.map((product) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={product.id}
                onClick={() => navigate('/menu')}
                className="min-w-[260px] sm:min-w-[300px] bg-white dark:bg-[#1A1A1A] p-3 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 dark:border-white/5 cursor-pointer snap-start"
              >
                <div className="w-full h-48 rounded-[1.5rem] bg-gray-100 dark:bg-white/5 mb-4 overflow-hidden relative group">
                  <img 
                    src={product.imageUrl || product.image} 
                    alt={product.name} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-natural-dark dark:text-white shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    4.9
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <h3 className="font-bold text-natural-dark dark:text-white truncate text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-3 h-8 leading-relaxed">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-natural-accent text-lg">TZS {product.price.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}