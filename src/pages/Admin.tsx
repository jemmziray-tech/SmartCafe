import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, TrendingUp, ShoppingBag, Plus, 
  X, Image as ImageIcon, Link as LinkIcon, UploadCloud, Trash2,
  UtensilsCrossed, LogOut, Clock, CheckCircle2, ChevronRight, Settings
} from 'lucide-react';
import { writeBatch, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, app } from '../firebase'; // Ensure 'app' is exported from firebase.ts
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '../types';

// Initialize Firebase Storage safely
const storage = getStorage(app);

interface DraftProduct {
  id: string;
  name: string;
  price: number | '';
  category: Category;
  description: string;
  imageUrl: string;      // Used if mode is 'link'
  imageFile: File | null;// ELITE FIX: Hold actual file object
  imagePreview: string;  // Local blob URL for UI preview
  imageMode: 'link' | 'file';
}

type Tab = 'overview' | 'orders' | 'menu';

export default function Admin() {
  const { user, orders, products, fetchProducts, logout } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // ELITE FIX: Memoize expensive math operations
  const revenue = useMemo(() => orders.reduce((acc, sum) => acc + sum.total, 0), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: pendingOrders.length },
    { id: 'menu', label: 'Menu Editor', icon: UtensilsCrossed },
  ] as const;

  const addDraft = () => {
    setDrafts([...drafts, {
      id: `draft-${Date.now()}`,
      name: '', price: '', category: 'Main Course',
      description: '', imageUrl: '', imageFile: null, imagePreview: '', imageMode: 'link'
    }]);
  };

  const removeDraft = (id: string) => setDrafts(drafts.filter(d => d.id !== id));

  const updateDraft = (id: string, field: keyof DraftProduct, value: any) => {
    setDrafts(drafts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  // ELITE FIX: Handle raw files instead of Base64 strings
  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateDraft(id, 'imageFile', file);
      updateDraft(id, 'imagePreview', URL.createObjectURL(file)); // Fast local preview
    }
  };

  // ELITE FIX: Firebase Storage Upload + writeBatch for Firestore
  const handlePublish = async () => {
    const isValid = drafts.every(d => d.name && d.price && d.description && (d.imageMode === 'link' ? d.imageUrl : d.imageFile));
    if (!isValid) return alert("Please fill out all fields and provide an image for every item.");

    setIsUploading(true);
    try {
      const batch = writeBatch(db); // Initialize Atomic Batch

      for (const draft of drafts) {
        let finalImageUrl = draft.imageUrl;

        // 1. If it's a file, upload it to Firebase Storage first
        if (draft.imageMode === 'file' && draft.imageFile) {
          const fileRef = ref(storage, `products/${Date.now()}-${draft.imageFile.name}`);
          await uploadBytes(fileRef, draft.imageFile);
          finalImageUrl = await getDownloadURL(fileRef); // Get the permanent cloud URL
        }

        // 2. Prep the Firestore document
        const productId = draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const productRef = doc(db, 'products', productId);
        
        batch.set(productRef, {
          name: draft.name,
          price: Number(draft.price),
          category: draft.category,
          description: draft.description,
          imageUrl: finalImageUrl,
          isFeatured: true
        });
      }

      // 3. Commit the entire batch at once
      await batch.commit();
      
      alert(`Successfully published ${drafts.length} items to the live menu!`);
      setShowUploadModal(false);
      setDrafts([]);
      fetchProducts(); 
    } catch (error) {
      console.error(error);
      alert('Error publishing to cloud. Check console.');
    }
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121212] flex flex-col md:flex-row font-sans -mx-4 sm:mx-0">
      
      <aside className="w-full md:w-72 bg-white dark:bg-[#1A1A1A] border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 flex flex-col shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-10 sticky top-0 md:h-screen shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-natural-accent to-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg shadow-natural-accent/30">
            <span className="text-xl">☕️</span>
          </div>
          <div>
            <h2 className="font-bold text-lg text-natural-dark dark:text-white leading-tight">SmartCafe</h2>
            <p className="text-[10px] uppercase tracking-widest text-natural-accent font-bold">Admin Command</p>
          </div>
        </div>

        <nav className="flex-1 px-4 pb-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group whitespace-nowrap md:whitespace-normal ${
                activeTab === tab.id ? 'text-natural-accent font-bold' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="adminTab" className="absolute inset-0 bg-orange-50 dark:bg-orange-500/10 rounded-2xl -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-natural-accent' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
              {tab.label}
              {tab.badge > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">{tab.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 hidden md:block border-t border-gray-100 dark:border-white/5">
          <button onClick={() => { logout(); navigate('/profile'); }} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors font-medium">
            <LogOut className="w-5 h-5" /> Exit Portal
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-80px)] md:h-screen">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-natural-dark dark:text-white capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-natural-cream dark:bg-white/10 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm overflow-hidden shrink-0">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Admin" /> : <span className="font-bold text-natural-accent">{user?.name?.charAt(0)}</span>}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 text-green-600 rounded-2xl flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
                    </div>
                    <h3 className="text-3xl font-bold text-natural-dark dark:text-white relative z-10">TZS {revenue.toLocaleString()}</h3>
                  </div>

                  <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 dark:bg-orange-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 text-orange-600 rounded-2xl flex items-center justify-center"><ShoppingBag className="w-6 h-6" /></div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                    </div>
                    <h3 className="text-3xl font-bold text-natural-dark dark:text-white relative z-10">{orders.length}</h3>
                  </div>

                  <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-2xl flex items-center justify-center"><UtensilsCrossed className="w-6 h-6" /></div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Menu Items</p>
                    </div>
                    <h3 className="text-3xl font-bold text-natural-dark dark:text-white relative z-10">{products.length}</h3>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 mt-8">
                    <h3 className="text-lg font-bold text-natural-dark dark:text-white">Recent Activity</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-natural-accent hover:text-orange-600 flex items-center gap-1">
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="bg-white dark:bg-[#1A1A1A] rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 dark:border-white/5 p-2">
                    {orders.length === 0 ? (
                       <div className="p-8 text-center text-gray-500">No orders have been placed yet.</div>
                    ) : (
                      orders.slice(0, 4).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'pending' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20' : 'bg-green-100 text-green-600 dark:bg-green-500/20'}`}>
                              {order.status === 'pending' ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-natural-dark dark:text-white">{order.id}</p>
                              <p className="text-xs text-gray-500">{order.items.length} items</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-natural-dark dark:text-white">TZS {order.total.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">No live orders right now.</div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-[#1A1A1A] p-5 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-natural-dark dark:text-white">{order.id}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}</p>
                      </div>
                      <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 dark:border-white/10 justify-between md:justify-end">
                        <span className="font-bold text-lg text-natural-accent">TZS {order.total.toLocaleString()}</span>
                        {order.status === 'pending' && <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm">Complete Order</button>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'menu' && (
              <div>
                <button onClick={() => { if(drafts.length === 0) addDraft(); setShowUploadModal(true); }} className="w-full md:w-auto mb-6 flex items-center justify-center gap-2 bg-natural-dark dark:bg-white text-white dark:text-natural-dark px-6 py-3 rounded-xl font-bold shadow-md hover:scale-[1.02] transition-transform">
                  <Plus className="w-5 h-5" /> Add New Item
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-white dark:bg-[#1A1A1A] p-4 rounded-[1.5rem] border border-gray-50 dark:border-white/5 shadow-sm flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0">
                         {product.image || product.imageUrl ? <img src={product.image || product.imageUrl} className="w-full h-full object-cover" alt="food"/> : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-natural-dark dark:text-white truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.category}</p>
                        <p className="text-sm font-bold text-natural-accent mt-1">TZS {product.price.toLocaleString()}</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-natural-dark dark:hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* BATCH UPLOAD MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-black/60 backdrop-blur-md p-0 sm:p-4">
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="bg-natural-base dark:bg-[#1A1A1A] w-full max-w-xl sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-natural-cream dark:border-white/10 bg-natural-light dark:bg-[#2A1E14]">
                <div>
                  <h2 className="text-xl font-bold font-serif text-natural-dark dark:text-natural-light">Batch Upload</h2>
                  <p className="text-xs text-gray-500">Add multiple items to your live menu.</p>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="w-8 h-8 flex items-center justify-center bg-natural-cream dark:bg-white/10 rounded-full text-gray-500 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-natural-base dark:bg-[#1A1A1A]">
                {drafts.map((draft, index) => (
                  <div key={draft.id} className="bg-white dark:bg-[#2A1E14] p-5 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-natural-accent">Item #{index + 1}</h3>
                      {drafts.length > 1 && <button onClick={() => removeDraft(draft.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
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
                            <span className="text-xs text-gray-500 font-medium">Tap to upload local image</span>
                          </div>
                        )}

                        {/* ELITE FIX: Render UI from local preview blob or external link */}
                        {(draft.imagePreview || draft.imageUrl) && (
                          <div className="w-full h-32 rounded-xl overflow-hidden bg-natural-cream border border-natural-cream dark:border-white/10 relative mt-2">
                            <img src={draft.imageMode === 'file' ? draft.imagePreview : draft.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md">Preview</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button onClick={addDraft} className="w-full border-2 border-dashed border-natural-accent/50 text-natural-accent py-4 rounded-3xl font-bold flex justify-center items-center gap-2 hover:bg-natural-accent/10 transition-colors">
                  <Plus className="w-5 h-5" /> Add Another Item to Batch
                </button>
              </div>

              <div className="p-6 bg-natural-light dark:bg-[#2A1E14] border-t border-natural-cream dark:border-white/10 shrink-0">
                <button onClick={handlePublish} disabled={isUploading} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-green-500/20 hover:opacity-90 transition-opacity disabled:opacity-50">
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