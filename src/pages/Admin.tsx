import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, TrendingUp, ShoppingBag, Plus, 
  X, Image as ImageIcon, Link as LinkIcon, UploadCloud, Trash2,
  UtensilsCrossed, LogOut, Clock, CheckCircle2, ChevronRight, MoreVertical
} from 'lucide-react';
import { writeBatch, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, app } from '../firebase'; 
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '../types';

const storage = getStorage(app);

interface DraftProduct {
  id: string;
  name: string;
  price: number | '';
  category: Category;
  description: string;
  imageUrl: string;      
  imageFile: File | null;
  imagePreview: string;  
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

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateDraft(id, 'imageFile', file);
      updateDraft(id, 'imagePreview', URL.createObjectURL(file)); 
    }
  };

  const handlePublish = async () => {
    const isValid = drafts.every(d => d.name && d.price && d.description && (d.imageMode === 'link' ? d.imageUrl : d.imageFile));
    if (!isValid) return alert("Please ensure all fields and images are provided.");

    setIsUploading(true);
    try {
      const batch = writeBatch(db); 

      for (const draft of drafts) {
        let finalImageUrl = draft.imageUrl;

        if (draft.imageMode === 'file' && draft.imageFile) {
          const fileRef = ref(storage, `products/${Date.now()}-${draft.imageFile.name}`);
          await uploadBytes(fileRef, draft.imageFile);
          finalImageUrl = await getDownloadURL(fileRef); 
        }

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

      await batch.commit();
      
      setShowUploadModal(false);
      setDrafts([]);
      fetchProducts(); 
    } catch (error) {
      console.error(error);
      alert('Error publishing to cloud. Please check your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121212] flex flex-col md:flex-row font-sans w-full">
      
      {/* SIDEBAR (Elegant & Sticky) */}
      <aside className="w-full md:w-72 bg-white dark:bg-[#1A1A1A] border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 flex flex-col shadow-sm z-40 sticky top-0 md:h-screen shrink-0">
        
        {/* Mobile-friendly Header */}
        <div className="p-4 md:p-6 flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-natural-dark to-gray-800 dark:from-white dark:to-gray-200 rounded-xl flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-5 h-5 text-white dark:text-natural-dark" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-natural-dark dark:text-white leading-tight">SmartCafe</h2>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Admin Portal</p>
            </div>
          </div>
          {/* Mobile Logout (Hidden on Desktop) */}
          <button onClick={() => { logout(); navigate('/profile'); }} className="md:hidden p-2 text-gray-400 hover:text-red-500 rounded-full bg-gray-50 dark:bg-white/5">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 pb-4 md:pb-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group whitespace-nowrap md:whitespace-normal ${
                activeTab === tab.id ? 'text-natural-dark dark:text-white font-bold' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="adminTab" className="absolute inset-0 bg-gray-100 dark:bg-white/10 rounded-2xl -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-natural-dark dark:text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
              {tab.label}
              {tab.badge > 0 && <span className="ml-auto bg-natural-dark dark:bg-white text-white dark:text-natural-dark text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">{tab.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Desktop Logout */}
        <div className="p-4 hidden md:block border-t border-gray-100 dark:border-white/5 mt-auto">
          <button onClick={() => { logout(); navigate('/profile'); }} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors font-medium">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full overflow-x-hidden md:h-screen md:overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          
          <header className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-natural-dark dark:text-white capitalize tracking-tight">{activeTab.replace('-', ' ')}</h1>
              <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-natural-cream dark:bg-white/10 flex items-center justify-center border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden shrink-0">
              {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Admin" /> : <span className="font-bold text-natural-dark dark:text-white">{user?.name?.charAt(0)}</span>}
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Metric Card 1 */}
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-black/30 text-natural-dark dark:text-white rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/5"><TrendingUp className="w-5 h-5" /></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Revenue</p>
                      </div>
                      <h3 className="text-3xl font-bold text-natural-dark dark:text-white relative z-10">TZS {revenue.toLocaleString()}</h3>
                    </div>

                    {/* Metric Card 2 */}
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-black/30 text-natural-dark dark:text-white rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/5"><ShoppingBag className="w-5 h-5" /></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                      </div>
                      <h3 className="text-3xl font-bold text-natural-dark dark:text-white relative z-10">{orders.length}</h3>
                    </div>

                    {/* Metric Card 3 */}
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-black/30 text-natural-dark dark:text-white rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/5"><UtensilsCrossed className="w-5 h-5" /></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menu Items</p>
                      </div>
                      <h3 className="text-3xl font-bold text-natural-dark dark:text-white relative z-10">{products.length}</h3>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4 mt-8">
                      <h3 className="text-lg font-bold text-natural-dark dark:text-white">Recent Activity</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-sm font-medium text-gray-500 hover:text-natural-dark dark:hover:text-white flex items-center gap-1 transition-colors">
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 p-2 overflow-hidden">
                      {orders.length === 0 ? (
                         <div className="p-10 text-center text-gray-400 text-sm">No activity to display.</div>
                      ) : (
                        orders.slice(0, 4).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${order.status === 'pending' ? 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/20' : 'bg-gray-50 border-gray-100 text-gray-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-300'}`}>
                                {order.status === 'pending' ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
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

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No active orders right now.</div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="bg-white dark:bg-[#1A1A1A] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-natural-dark dark:text-white">{order.id}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${order.status === 'pending' ? 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/20' : 'bg-green-50 border-green-100 text-green-600 dark:bg-green-500/10 dark:border-green-500/20'}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">{order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}</p>
                        </div>
                        <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 dark:border-white/10 justify-between md:justify-end shrink-0">
                          <span className="font-bold text-lg text-natural-dark dark:text-white">TZS {order.total.toLocaleString()}</span>
                          {order.status === 'pending' && <button className="px-5 py-2.5 bg-natural-dark dark:bg-white text-white dark:text-natural-dark rounded-xl text-sm font-bold transition-colors hover:opacity-90">Mark Complete</button>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* MENU EDITOR TAB */}
              {activeTab === 'menu' && (
                <div>
                  <button onClick={() => { if(drafts.length === 0) addDraft(); setShowUploadModal(true); }} className="w-full sm:w-auto mb-6 flex items-center justify-center gap-2 bg-natural-dark dark:bg-white text-white dark:text-natural-dark px-6 py-3.5 rounded-2xl font-bold shadow-sm hover:opacity-90 transition-opacity">
                    <Plus className="w-5 h-5" /> Add New Item
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map(product => (
                      <div key={product.id} className="bg-white dark:bg-[#1A1A1A] p-4 rounded-[1.5rem] border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 group">
                        <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-black/30 overflow-hidden shrink-0 border border-gray-100 dark:border-white/5">
                           {product.image || product.imageUrl ? <img src={product.image || product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name}/> : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-natural-dark dark:text-white truncate">{product.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{product.category}</p>
                          <p className="text-sm font-bold text-natural-dark dark:text-white mt-1">TZS {product.price.toLocaleString()}</p>
                        </div>
                        <button className="p-2 text-gray-300 hover:text-natural-dark dark:hover:text-white transition-colors shrink-0">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* SECURE BATCH UPLOAD MODAL (Strict z-index and padding constraints) */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 md:p-6">
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-2xl sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col max-h-[95dvh] sm:max-h-[85dvh] overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 bg-white dark:bg-[#1A1A1A] border-b border-gray-100 dark:border-white/5 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-natural-dark dark:text-white">Batch Upload</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Prepare items to publish to the live menu.</p>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-full text-gray-500 hover:text-natural-dark dark:hover:text-white transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Draft List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
                {drafts.map((draft, index) => (
                  <div key={draft.id} className="bg-white dark:bg-[#1A1A1A] p-5 sm:p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 relative">
                    <div className="flex justify-between items-center mb-5 border-b border-gray-50 dark:border-white/5 pb-3">
                      <h3 className="font-bold text-sm text-natural-dark dark:text-white">Menu Item #{index + 1}</h3>
                      {drafts.length > 1 && (
                        <button onClick={() => removeDraft(draft.id)} className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-xs font-medium transition-colors">
                          <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-5">
                      {/* Flex grid handles mobile squishing natively */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Item Name</label>
                          <input type="text" placeholder="e.g. Zanzibar Pizza" value={draft.name} onChange={(e) => updateDraft(draft.id, 'name', e.target.value)} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-dark dark:focus:ring-white dark:text-white transition-shadow" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Price (TZS)</label>
                          <input type="number" placeholder="e.g. 5000" value={draft.price} onChange={(e) => updateDraft(draft.id, 'price', e.target.value)} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-dark dark:focus:ring-white dark:text-white transition-shadow" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Category</label>
                        <select value={draft.category} onChange={(e) => updateDraft(draft.id, 'category', e.target.value)} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-dark dark:focus:ring-white dark:text-white transition-shadow cursor-pointer appearance-none">
                          <option value="Breakfast">Breakfast</option>
                          <option value="Main Course">Main Course</option>
                          <option value="Snacks">Snacks</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Desserts">Desserts</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Appetizing Description</label>
                        <textarea placeholder="Keep it short and delicious..." rows={2} value={draft.description} onChange={(e) => updateDraft(draft.id, 'description', e.target.value)} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-dark dark:focus:ring-white dark:text-white transition-shadow resize-none" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Image</label>
                          <div className="flex bg-gray-100 dark:bg-black/50 rounded-lg p-1 border border-gray-200 dark:border-white/5">
                            <button onClick={() => updateDraft(draft.id, 'imageMode', 'link')} className={`px-3 py-1.5 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition-all ${draft.imageMode === 'link' ? 'bg-white dark:bg-[#1A1A1A] text-natural-dark dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                              <LinkIcon className="w-3 h-3" /> Link
                            </button>
                            <button onClick={() => updateDraft(draft.id, 'imageMode', 'file')} className={`px-3 py-1.5 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition-all ${draft.imageMode === 'file' ? 'bg-white dark:bg-[#1A1A1A] text-natural-dark dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                              <ImageIcon className="w-3 h-3" /> Upload
                            </button>
                          </div>
                        </div>

                        {draft.imageMode === 'link' ? (
                          <input type="text" placeholder="https://images.unsplash.com/..." value={draft.imageUrl} onChange={(e) => updateDraft(draft.id, 'imageUrl', e.target.value)} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-dark dark:focus:ring-white dark:text-white transition-shadow" />
                        ) : (
                          <div className="relative w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-gray-50 dark:bg-black/20 group">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(draft.id, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs text-gray-500 font-medium">Click or drag image to upload</span>
                          </div>
                        )}

                        {(draft.imagePreview || draft.imageUrl) && (
                          <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/10 relative mt-3 shadow-inner">
                            <img src={draft.imageMode === 'file' ? draft.imagePreview : draft.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-md font-medium tracking-wide">Image Preview</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button onClick={addDraft} className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:text-natural-dark dark:hover:text-white py-4 rounded-[2rem] font-bold flex justify-center items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                  <Plus className="w-5 h-5" /> Add Another Item
                </button>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 bg-white dark:bg-[#1A1A1A] border-t border-gray-100 dark:border-white/5 shrink-0 safe-area-bottom">
                <button onClick={handlePublish} disabled={isUploading} className="w-full bg-natural-dark dark:bg-white text-white dark:text-natural-dark py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50">
                  {isUploading ? <UploadCloud className="w-5 h-5 animate-bounce" /> : <UploadCloud className="w-5 h-5" />}
                  {isUploading ? 'Syncing to Database...' : `Publish ${drafts.length} ${drafts.length === 1 ? 'Item' : 'Items'} to Live Menu`}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}