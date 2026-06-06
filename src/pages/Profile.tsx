import React, { useState } from 'react';
import { useStore } from '../store';
import { Heart, Clock, LogOut, Settings, MessageCircle, ChevronRight } from 'lucide-react';

export default function Profile() {
  const { user, setUser, orders, favorites, products } = useStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ id: 'u2', name: 'John Mziray', email: 'john@smartcafe.tz', role: 'customer' });
  };

  if (!user) {
    return (
      <div className="flex flex-col h-full justify-center p-6 space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-natural-cream dark:bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl text-natural-accent">☕️</span>
          </div>
          <h1 className="text-2xl font-bold text-natural-dark dark:text-natural-light mb-2">Welcome to SmartCafe</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to earn rewards and track orders</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 pt-4">
          <input 
            type="email" 
            placeholder="Email address"
            className="w-full bg-natural-light dark:bg-natural-dark border border-natural-cream dark:border-white/10 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-natural-accent dark:focus:ring-natural-accent dark:text-white placeholder:text-gray-400"
            defaultValue="john@smartcafe.tz"
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full bg-natural-light dark:bg-natural-dark border border-natural-cream dark:border-white/10 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-natural-accent dark:focus:ring-natural-accent dark:text-white placeholder:text-gray-400"
            defaultValue="password123"
          />
          <button type="submit" className="w-full bg-natural-accent text-white py-3 rounded-xl font-bold mt-2">
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-natural-light dark:bg-natural-dark p-5 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10">
        <div className="w-16 h-16 bg-natural-accent rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="font-bold text-lg text-natural-dark dark:text-natural-light">{user.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-natural-dark dark:text-natural-light mb-3 px-1">Orders</h3>
        {orders.length === 0 ? (
          <div className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl text-center text-gray-500 text-sm border border-natural-cream dark:border-white/10">
            No orders yet
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl flex items-center justify-between shadow-sm border border-natural-cream dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-natural-cream dark:bg-white/10 flex items-center justify-center text-natural-accent">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-natural-dark dark:text-natural-light">Order {order.id}</h4>
                    <p className="text-xs text-gray-400 capitalize">{order.status}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {/* TZS Formatting */}
                  <span className="font-bold text-natural-accent">TZS {order.total.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-natural-light dark:bg-natural-dark rounded-3xl p-2 shadow-sm border border-natural-cream dark:border-white/10">
        <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-natural-base dark:hover:bg-white/5 transition">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-natural-dark dark:text-natural-light">Favorites ({favoriteProducts.length})</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-natural-base dark:hover:bg-white/5 transition">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-natural-dark dark:text-natural-light">Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-natural-base dark:hover:bg-white/5 transition">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-natural-dark dark:text-natural-light">WhatsApp Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <button 
        onClick={() => setUser(null)}
        className="w-full flex items-center justify-center gap-2 p-4 text-red-500 font-semibold mt-4"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>

      <div className="pt-8 flex justify-center">
        <button
          onClick={() => setUser({ ...user, role: user.role === 'admin' ? 'customer' : 'admin' })}
          className="text-xs text-slate-400 underline"
        >
          Toggle Admin Role (Current: {user.role})
        </button>
      </div>
    </div>
  );
}