import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Heart, Clock, LogOut, Settings, MessageCircle, 
  ChevronRight, ShieldCheck, Loader2, Crown, ShoppingBag,
  X, Moon, Sun, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const { user, loginWithGoogle, logout, orders, favorites, products, isDarkMode, toggleTheme } = useStore();
  const navigate = useNavigate();
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  const handleLogin = async () => {
    setIsLoggingIn(true);
    await loginWithGoogle();
    setIsLoggingIn(false);
  };

  const handleWhatsAppSupport = () => {
    const phoneNumber = "255762446706"; 
    const message = encodeURIComponent("Hello SmartCafe team, I need some assistance with my account.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  // --- UNAUTHENTICATED VIEW ---
  if (!user) {
    return (
      <div className="flex flex-col h-full justify-center p-6 space-y-8 pb-20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-natural-accent/20 rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#25D366]/20 rounded-full blur-3xl z-0 pointer-events-none"></div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center z-10 relative">
          <div className="w-28 h-28 bg-gradient-to-br from-natural-accent to-[#FF6B35] rounded-[2rem] mx-auto mb-8 flex items-center justify-center shadow-xl shadow-natural-accent/30 rotate-3 hover:rotate-0 transition-transform">
            <span className="text-5xl drop-shadow-md">☕️</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-natural-dark dark:text-natural-light mb-3 tracking-tight">Karibu SmartCafe</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm px-4 leading-relaxed">Sign in to save your favorite Tanzanian meals, track your orders, and speed up checkout.</p>
        </motion.div>

        <motion.button 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full bg-white dark:bg-[#2A1E14] border border-gray-100 dark:border-white/5 text-natural-dark dark:text-natural-light py-4 rounded-2xl font-bold flex justify-center items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all disabled:opacity-50 z-10 relative"
        >
          {isLoggingIn ? (
            <><Loader2 className="w-5 h-5 animate-spin text-natural-accent" /> Authenticating...</>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </motion.button>
      </div>
    );
  }

  // --- AUTHENTICATED VIEW ---
  return (
    <div className="space-y-6 pb-20 relative">
      {/* Hero Header */}
      <div className="relative">
        <div className="h-32 rounded-3xl bg-gradient-to-r from-natural-accent to-[#FF6B35] w-full overflow-hidden absolute top-0 left-0 -z-10 shadow-lg">
          <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        </div>
        
        <div className="pt-20 px-4">
          <div className="bg-natural-light dark:bg-natural-dark rounded-[2rem] p-5 shadow-xl shadow-black/5 border border-white/50 dark:border-white/10 flex flex-col items-center relative backdrop-blur-sm">
            <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden bg-natural-cream flex items-center justify-center border-4 border-natural-light dark:border-natural-dark shadow-md absolute -top-10 rotate-3 hover:rotate-0 transition-transform duration-300">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-natural-accent">{user.name.charAt(0)}</span>
              )}
            </div>
            
            <div className="mt-10 text-center w-full">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="font-bold text-xl text-natural-dark dark:text-natural-light font-serif tracking-tight">{user.name}</h1>
                {user.role === 'admin' ? (
                  <ShieldCheck className="w-5 h-5 text-natural-accent drop-shadow-sm" />
                ) : (
                  <Crown className="w-4 h-4 text-yellow-500 drop-shadow-sm" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-white/5 inline-block px-3 py-1 rounded-full">{user.email}</p>
            </div>

            <div className="flex justify-around w-full mt-6 pt-5 border-t border-gray-100 dark:border-white/10">
              <div className="text-center">
                <p className="text-xl font-bold text-natural-dark dark:text-natural-light">{orders.length}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Orders</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-white/10"></div>
              <div className="text-center">
                <p className="text-xl font-bold text-natural-dark dark:text-natural-light">{favorites.length}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Favorites</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {user.role === 'admin' && (
        <motion.button 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/admin')}
          className="w-full bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] dark:from-white dark:to-gray-200 text-white dark:text-natural-dark py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-[0_8px_30px_rgb(255,140,0,0.2)] hover:shadow-[0_8px_30px_rgb(255,140,0,0.4)] transition-all border border-[#333] dark:border-white"
        >
          <ShieldCheck className="w-5 h-5" />
          Access Admin Portal
        </motion.button>
      )}

      {/* Recent Orders List */}
      <div>
        <h3 className="font-bold text-natural-dark dark:text-natural-light mb-3 px-1 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-natural-accent" /> Recent Activity
        </h3>
        {orders.length === 0 ? (
          <div className="bg-natural-base dark:bg-natural-dark/50 p-6 rounded-3xl text-center border border-dashed border-gray-200 dark:border-white/10">
            <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No orders yet.</p>
            <p className="text-xs text-gray-400 mt-1">Time to grab a coffee!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="bg-white dark:bg-natural-dark p-4 rounded-2xl flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-50 dark:border-white/5 hover:border-natural-accent/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-natural-accent">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-natural-dark dark:text-natural-light">{order.id}</h4>
                    <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-sm text-natural-dark dark:text-natural-light">TZS {order.total.toLocaleString()}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    order.status === 'pending' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <div className="bg-white dark:bg-natural-dark rounded-[2rem] p-2 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-50 dark:border-white/5">
        <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-natural-base dark:hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4 text-red-500" />
            </div>
            <span className="font-semibold text-sm text-natural-dark dark:text-natural-light">Saved Favorites ({favoriteProducts.length})</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-natural-accent transition-colors" />
        </button>
        <div className="h-px w-full bg-gray-50 dark:bg-white/5"></div>
        <button 
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-natural-base dark:hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="w-4 h-4 text-blue-500" />
            </div>
            <span className="font-semibold text-sm text-natural-dark dark:text-natural-light">Account Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-natural-accent transition-colors" />
        </button>
        <div className="h-px w-full bg-gray-50 dark:bg-white/5"></div>
        <button 
          onClick={handleWhatsAppSupport}
          className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-natural-base dark:hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-4 h-4 text-green-500" />
            </div>
            <span className="font-semibold text-sm text-natural-dark dark:text-natural-light">WhatsApp Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-natural-accent transition-colors" />
        </button>
      </div>

      {/* Logout */}
      <button 
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 p-4 text-gray-400 hover:text-red-500 font-bold transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </button>

      {/* --- SETTINGS BOTTOM SHEET --- */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end items-center bg-black/40 backdrop-blur-sm sm:p-4 p-0">
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-natural-base dark:bg-[#1A1A1A] w-full max-w-md sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-natural-cream dark:border-white/10 bg-natural-light dark:bg-[#2A1E14]">
                <div>
                  <h2 className="text-xl font-bold font-serif text-natural-dark dark:text-natural-light">Settings</h2>
                  <p className="text-xs text-gray-500">Manage your preferences</p>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 flex items-center justify-center bg-natural-cream dark:bg-white/10 rounded-full text-gray-500 hover:text-natural-accent transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-natural-light dark:bg-white/10 flex items-center justify-center text-natural-dark dark:text-natural-light">
                      {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-natural-dark dark:text-natural-light">Appearance</p>
                      <p className="text-xs text-gray-500">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-natural-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <motion.div 
                      layout
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                      animate={{ x: isDarkMode ? 24 : 0 }}
                    />
                  </button>
                </div>

                {/* Notifications Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-natural-light dark:bg-white/10 flex items-center justify-center text-natural-dark dark:text-natural-light">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-natural-dark dark:text-natural-light">Push Notifications</p>
                      <p className="text-xs text-gray-500">Order updates & offers</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <motion.div 
                      layout
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                      animate={{ x: notificationsEnabled ? 24 : 0 }}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}