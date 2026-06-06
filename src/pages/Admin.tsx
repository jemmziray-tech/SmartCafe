import React, { useState } from 'react';
import { useStore } from '../store';
import { Navigate } from 'react-router-dom';
import { 
  TrendingUp, Users, Package, ShoppingBag, Plus, 
  X, Image as ImageIcon, Link as LinkIcon, UploadCloud, Trash2 
} from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '../types';

interface DraftProduct {
  id: string;
  name: string;
  price: number | '';
  category: Category;
  description: string;
  imageUrl: string;
  imageMode: 'link' | 'file';
}

export default function Admin() {
  const { user, orders, products, fetchProducts } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'menu'>('overview');
  
  // --- Upload Modal State ---
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const revenue = orders.reduce((acc, sum) => acc + sum.total, 0);

  // --- Draft Management Logic ---
  const addDraft = () => {
    setDrafts([...drafts, {
      id: `draft-${Date.now()}`,
      name: '',
      price: '',
      category: 'Main Course',
      description: '',
      imageUrl: '',
      imageMode: 'link'
    }]);
  };

  const removeDraft = (id: string) => {
    setDrafts(drafts.filter(d => d.id !== id));
  };

  const updateDraft = (id: string, field: keyof DraftProduct, value: any) => {
    setDrafts(drafts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  // Convert uploaded local file to Base64 for database storage
  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) { // 1MB limit for Firestore Base64
        alert('File is too large. Please upload an image under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateDraft(id, 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Firebase Batch Upload Logic ---
  const handlePublish = async () => {
    // Validation
    const isValid = drafts.every(d => d.name && d.price && d.description && d.imageUrl);
    if (!isValid) return alert("Please fill out all fields and provide an image for every item.");

    setIsUploading(true);
    try {
      for (const draft of drafts) {
        // Generate a clean ID (e.g., "Spiced Masala Chai" -> "spiced-masala-chai")
        const productId = draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const productRef = doc(db, 'products', productId);
        
        await setDoc(productRef, {
          name: draft.name,
          price: Number(draft.price),
          category: draft.category,
          description: draft.description,
          imageUrl: draft.imageUrl,
          isFeatured: true
        });
      }
      alert(`Successfully published ${drafts.length} items to the live menu!`);
      setShowUploadModal(false);
      setDrafts([]);
      fetchProducts(); // Sync Zustand with new live data
    } catch (error) {
      console.error(error);
      alert('Error publishing to cloud. Check console.');
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* --- Admin Header & Tabs --- */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-natural-dark dark:text-natural-light font-serif">
          Admin Portal
        </h1>
        <div className="flex gap-2 bg-natural-light dark:bg-natural-dark p-1 rounded-2xl border border-natural-cream dark:border-white/10">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-white dark:bg-[#3D2B1F] text-natural-accent shadow-sm' : 'text-gray-500'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'menu' ? 'bg-white dark:bg-[#3D2B1F] text-natural-accent shadow-sm' : 'text-gray-500'}`}
          >
            Manage Menu
          </button>
        </div>
      </div>

      {/* =========================================
          TAB: OVERVIEW
          ========================================= */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Total Revenue</p>
              <p className="text-lg font-bold dark:text-natural-light whitespace-nowrap">TZS {revenue.toLocaleString()}</p>
            </div>
            <div className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Total Orders</p>
              <p className="text-xl font-bold dark:text-natural-light">{orders.length}</p>
            </div>
          </div>

          {/* Pending Orders */}
          <div>
            <h2 className="font-bold text-natural-dark dark:text-natural-light mb-3">Recent Orders</h2>
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl flex items-center justify-between border border-natural-cream dark:border-white/10">
                  <div>
                    <p className="font-bold text-sm text-natural-dark dark:text-natural-light">{order.id}</p>
                    <p className="text-xs text-gray-500">{order.items.length} items</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-bold text-natural-accent">TZS {order.total.toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      order.status === 'pending' ? 'bg-natural-cream text-natural-accent dark:bg-natural-accent/20' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4 bg-natural-light dark:bg-natural-dark rounded-xl">No orders yet.</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* =========================================
          TAB: MANAGE MENU
          ========================================= */}
      {activeTab === 'menu' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <button 
            onClick={() => {
              if(drafts.length === 0) addDraft();
              setShowUploadModal(true);
            }}
            className="w-full bg-gradient-to-r from-natural-accent to-[#FF6B35] text-white py-4 rounded-3xl font-bold flex justify-center items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Upload New Products
          </button>

          <h2 className="font-bold text-natural-dark dark:text-natural-light pt-2">Live Menu Items ({products.length})</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {products.map(product => (
              <div key={product.id} className="bg-natural-light dark:bg-natural-dark rounded-2xl overflow-hidden shadow-sm border border-natural-cream dark:border-white/10 flex flex-col">
                <div className="h-24 w-full bg-gray-200">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h4 className="font-bold text-xs line-clamp-1 dark:text-natural-light">{product.name}</h4>
                  <p className="text-natural-accent text-xs font-bold mt-1">TZS {product.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* =========================================
          THE ELEGANT BATCH UPLOAD MODAL
          ========================================= */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-black/60 backdrop-blur-md p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-natural-base dark:bg-[#1A1A1A] w-full max-w-xl sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-natural-cream dark:border-white/10 bg-natural-light dark:bg-[#2A1E14]">
                <div>
                  <h2 className="text-xl font-bold font-serif text-natural-dark dark:text-natural-light">Batch Upload</h2>
                  <p className="text-xs text-gray-500">Add multiple items to your live menu.</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="w-8 h-8 flex items-center justify-center bg-natural-cream dark:bg-white/10 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrolling Form Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-natural-base dark:bg-[#1A1A1A]">
                {drafts.map((draft, index) => (
                  <div key={draft.id} className="bg-white dark:bg-[#2A1E14] p-5 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10 relative">
                    
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-natural-accent">Item #{index + 1}</h3>
                      {drafts.length > 1 && (
                        <button onClick={() => removeDraft(draft.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">Item Name</label>
                          <input type="text" placeholder="e.g. Zanzibar Pizza" value={draft.name} onChange={(e) => updateDraft(draft.id, 'name', e.target.value)} className="w-full bg-natural-light dark:bg-black/20 border border-natural-cream dark:border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-accent dark:text-white" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">Price (TZS)</label>
                          <input type="number" placeholder="e.g. 5000" value={draft.price} onChange={(e) => updateDraft(draft.id, 'price', e.target.value)} className="w-full bg-natural-light dark:bg-black/20 border border-natural-cream dark:border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-accent dark:text-white" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Category</label>
                        <select value={draft.category} onChange={(e) => updateDraft(draft.id, 'category', e.target.value)} className="w-full bg-natural-light dark:bg-black/20 border border-natural-cream dark:border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-accent dark:text-white">
                          <option value="Breakfast">Breakfast</option>
                          <option value="Main Course">Main Course</option>
                          <option value="Snacks">Snacks</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Desserts">Desserts</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Appetizing Description</label>
                        <textarea placeholder="Describe the flavors..." rows={2} value={draft.description} onChange={(e) => updateDraft(draft.id, 'description', e.target.value)} className="w-full bg-natural-light dark:bg-black/20 border border-natural-cream dark:border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-accent dark:text-white" />
                      </div>

                      {/* Intelligent Image Handling */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-gray-500">Image Source</label>
                          <div className="flex bg-natural-light dark:bg-black/40 rounded-lg p-1">
                            <button onClick={() => updateDraft(draft.id, 'imageMode', 'link')} className={`px-3 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors ${draft.imageMode === 'link' ? 'bg-white dark:bg-natural-dark text-natural-accent shadow-sm' : 'text-gray-400'}`}>
                              <LinkIcon className="w-3 h-3" /> Link
                            </button>
                            <button onClick={() => updateDraft(draft.id, 'imageMode', 'file')} className={`px-3 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors ${draft.imageMode === 'file' ? 'bg-white dark:bg-natural-dark text-natural-accent shadow-sm' : 'text-gray-400'}`}>
                              <ImageIcon className="w-3 h-3" /> Upload
                            </button>
                          </div>
                        </div>

                        {draft.imageMode === 'link' ? (
                          <input type="text" placeholder="Paste high-res image URL (e.g., Unsplash)" value={draft.imageUrl} onChange={(e) => updateDraft(draft.id, 'imageUrl', e.target.value)} className="w-full bg-natural-light dark:bg-black/20 border border-natural-cream dark:border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-accent dark:text-white mb-2" />
                        ) : (
                          <div className="relative w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-natural-accent transition-colors mb-2">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(draft.id, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <span className="text-xs text-gray-500 font-medium">Tap to upload local image (Max 1MB)</span>
                          </div>
                        )}

                        {draft.imageUrl && (
                          <div className="w-full h-32 rounded-xl overflow-hidden bg-natural-cream border border-natural-cream dark:border-white/10 relative">
                            <img src={draft.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md">Preview</div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))}

                <button 
                  onClick={addDraft}
                  className="w-full border-2 border-dashed border-natural-accent/50 text-natural-accent py-4 rounded-3xl font-bold flex justify-center items-center gap-2 hover:bg-natural-accent/10 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Item to Batch
                </button>
              </div>

              {/* Sticky Footer */}
              <div className="p-6 bg-natural-light dark:bg-[#2A1E14] border-t border-natural-cream dark:border-white/10 shrink-0">
                <button 
                  onClick={handlePublish}
                  disabled={isUploading}
                  className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-green-500/20 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isUploading ? <UploadCloud className="w-5 h-5 animate-bounce" /> : <UploadCloud className="w-5 h-5" />}
                  {isUploading ? 'Publishing to Cloud...' : `Publish ${drafts.length} Items to Live Menu`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}