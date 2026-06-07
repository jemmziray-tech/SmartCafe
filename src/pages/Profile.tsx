import React from 'react';
import { useStore } from '../store';
import { Heart, Clock, LogOut, Settings, MessageCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, loginWithGoogle, logout, orders, favorites, products } = useStore();
  const navigate = useNavigate();

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  // --- UNAUTHENTICATED VIEW ---
  if (!user) {
    return (
      <div className="flex flex-col h-full justify-center p-6 space-y-8 pb-20">
        <div className="text-center">
          <div className="w-24 h-24 bg-natural-cream dark:bg-white/10 rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner">
            <span className="text-5xl">☕️</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-natural-dark dark:text-natural-light mb-2">Karibu SmartCafe</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm px-4">Sign in to save favorites, track your orders, and speed up checkout.</p>
        </div>

        <button 
          onClick={loginWithGoogle}
          className="w-full bg-white dark:bg-[#2A1E14] border border-natural-cream dark:border-white/10 text-natural-dark dark:text-natural-light py-4 rounded-2xl font-bold flex justify-center items-center gap-3 shadow-sm hover:shadow-md transition-all"
        >
          {/* Official Google SVG Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
    );
  }

  // --- AUTHENTICATED VIEW ---
  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 bg-natural-light dark:bg-natural-dark p-5 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-natural-cream flex shrink-0 items-center justify-center border-2 border-white dark:border-natural-dark shadow-md">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-natural-accent">{user.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-natural-dark dark:text-natural-light line-clamp-1">{user.name}</h1>
            {user.role === 'admin' && <ShieldCheck className="w-4 h-4 text-green-500" />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{user.email}</p>
        </div>
      </div>

      {user.role === 'admin' && (
        <button 
          onClick={() => navigate('/admin')}
          className="w-full bg-natural-dark dark:bg-natural-light text-white dark:text-natural-dark py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
        >
          <ShieldCheck className="w-5 h-5" />
          Enter Admin Portal
        </button>
      )}

      <div>
        <h3 className="font-bold text-natural-dark dark:text-natural-light mb-3 px-1">Recent Orders</h3>
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
                    <h4 className="font-bold text-sm text-natural-dark dark:text-natural-light">{order.id}</h4>
                    <p className="text-xs text-gray-400 capitalize">{order.status}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
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
            <MessageCircle className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-natural-dark dark:text-natural-light">WhatsApp Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <button 
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl font-semibold mt-4 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </div>
  );
}