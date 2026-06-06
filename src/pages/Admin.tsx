import React, { useState } from 'react';
import { useStore } from '../store';
import { Navigate } from 'react-router-dom';
import { TrendingUp, Users, Package, ShoppingBag, CloudUpload } from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Admin() {
  const { user, orders, products, fetchProducts } = useStore();
  const [isPushing, setIsPushing] = useState(false);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const revenue = orders.reduce((acc, sum) => acc + sum.total, 0);

  // --- THE MAGIC SYNC SCRIPT ---
  const pushMenuToCloud = async () => {
    setIsPushing(true);
    const MOCK_PRODUCTS = [
      { id: 'p1', name: 'Spiced Masala Chai', description: 'Authentic Tanzanian tea brewed with fresh ginger, cardamom, and cinnamon.', price: 2000, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1576092762791-dd9e2220afa1?auto=format&fit=crop&q=80&w=600', isFeatured: true },
      { id: 'p3', name: 'Uji wa Lishe', description: 'Nutritious mixed-grain porridge served hot.', price: 2500, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600', isFeatured: true },
      { id: 'p6', name: 'Crispy Beef Samosa', description: 'Golden pastry stuffed with minced beef.', price: 1500, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600', isFeatured: true },
      { id: 'p8', name: 'Chips Mayai', description: 'French fries baked into a savory Spanish omelette.', price: 4500, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&q=80&w=600', isFeatured: true },
      { id: 'p9', name: 'Pilau Kuku', description: 'Fragrant spiced rice cooked with tender chicken.', price: 8000, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1550928431-ee0ecb00c1d5?auto=format&fit=crop&q=80&w=600', isFeatured: true },
    ];

    try {
      // Loop through and push each item to the cloud
      for (const product of MOCK_PRODUCTS) {
        const productRef = doc(db, 'products', product.id);
        await setDoc(productRef, product);
      }
      alert('Tanzanian Menu successfully pushed to Firebase Cloud!');
      fetchProducts(); // Refresh the app with live data
    } catch (error) {
      console.error(error);
      alert('Error pushing to cloud. Check console.');
    }
    setIsPushing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-natural-dark dark:text-natural-light font-serif">SmartCafe Admin</h1>
        {/* Magic Sync Button */}
        <button 
          onClick={pushMenuToCloud}
          disabled={isPushing}
          className="bg-natural-accent text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 hover:opacity-90"
        >
          <CloudUpload className="w-4 h-4" />
          {isPushing ? 'Pushing...' : 'Sync Menu to Cloud'}
        </button>
      </div>
      
      {/* Rest of Admin Stats Grid... */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Cloud Revenue</p>
          <p className="text-xl font-bold dark:text-natural-light">TZS {revenue.toLocaleString()}</p>
        </div>
        <div className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-natural-accent mb-3">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Live Products</p>
          <p className="text-xl font-bold dark:text-natural-light">{products.length}</p>
        </div>
      </div>
    </div>
  );
}