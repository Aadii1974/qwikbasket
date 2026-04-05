import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Package, Store as StoreIcon, Zap, Edit, Trash, Plus, Check } from 'lucide-react';
import { PRODUCTS as INITIAL_PRODUCTS, STORES as INITIAL_STORES } from '../services/mockData';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('b2b');

  // State Management
  const [stores, setStores] = useState(INITIAL_STORES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS.map(p => ({
    ...p,
    customerType: p.customerType || 'Both',
    storeId: p.storeId || '',
    isFlashSale: p.isFlashSale || false
  })));
  
  const [pendingUsers, setPendingUsers] = useState([
    { id: 'u1', name: 'Rohan Sharma', company: 'Sharma Kirana Store', date: '2026-04-04', status: 'pending' },
    { id: 'u2', name: 'Alia Bhatt', company: 'Daily Needs Supermarket', date: '2026-04-05', status: 'pending' }
  ]);

  // Modals / Forms state
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [editingStore, setEditingStore] = useState(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  if (user?.role !== 'admin') {
     return <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6 text-center"><h1 className="text-3xl font-black mb-4">Access Denied</h1><p className="text-gray-500 font-medium max-w-sm">Admins only. Please log in with admin credentials.</p></div>;
  }

  // --- Handlers ---
  const approveUser = (id) => setPendingUsers(prev => prev.filter(u => u.id !== id));
  
  const saveProduct = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const prod = {
       id: editingProduct?.id || `p${Date.now()}`,
       name: formData.get('name'),
       description: formData.get('description'),
       category: formData.get('category'),
       stock: Number(formData.get('stock')),
       customerType: formData.get('customerType'),
       b2cPrice: Number(formData.get('b2cPrice')),
       b2bPrice: Number(formData.get('b2bPrice')),
       storeId: formData.get('storeId'),
       isFlashSale: formData.get('isFlashSale') === 'on',
       images: [formData.get('image') || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200']
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, ...prod } : p));
    } else {
      setProducts(prev => [prod, ...prev]);
    }
    setIsProductModalOpen(false);
  };

  const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  const saveStore = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const store = {
       id: editingStore?.id || `store${Date.now()}`,
       name: formData.get('name'),
       subtitle: formData.get('subtitle'),
       rating: 4.8,
       items: 0,
       image: formData.get('image') || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
    };

    if (editingStore) {
      setStores(prev => prev.map(s => s.id === store.id ? { ...s, ...store } : s));
    } else {
      setStores(prev => [...prev, store]);
    }
    setIsStoreModalOpen(false);
  };

  const deleteStore = (id) => setStores(prev => prev.filter(s => s.id !== id));

  const toggleFlashSale = (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isFlashSale: !p.isFlashSale } : p));
  };


  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <h1 className="text-4xl font-black mb-10 tracking-tight text-slate-900">Admin Control Panel <span className="align-middle inline-block bg-[var(--secondary)] text-white text-xs px-3 py-1 rounded-full ml-3 tracking-widest uppercase">Super Admin</span></h1>
        
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
           {/* Sidebar Navigation */}
           <div className="w-full md:w-72 bg-slate-900 text-white p-6 flex flex-col gap-2 flex-shrink-0">
              <h3 className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase mb-4 mt-2 px-4">Dashboard Menu</h3>
              {[
                { id: 'b2b', label: 'B2B Verifications', icon: <Users size={20}/>, badge: pendingUsers.length }, 
                { id: 'products', label: 'Product Manager', icon: <Package size={20}/> }, 
                { id: 'stores', label: 'Store Management', icon: <StoreIcon size={20}/> },
                { id: 'flash', label: 'Flash Sale (Live)', icon: <Zap size={20}/> }
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={`flex items-center justify-between w-full text-left px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-[var(--secondary)] text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-3">{tab.icon} {tab.label}</div>
                  {tab.badge > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{tab.badge}</span>}
                </button>
              ))}
           </div>

           {/* Content Area */}
           <div className="flex-1 p-6 md:p-10 bg-white overflow-y-auto w-full">
              
              {/* B2B APPROVALS */}
              {activeTab === 'b2b' && (
                <div className="animate-fade-in">
                   <h2 className="text-2xl font-black mb-2 text-slate-900">Pending Business Approvals</h2>
                   <p className="text-gray-500 mb-8 font-medium">Review and verify B2B signups to grant them access to wholesale pricing.</p>
                   
                   {pendingUsers.length > 0 ? (
                     <div className="grid gap-4">
                        {pendingUsers.map(u => (
                          <div key={u.id} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 border border-gray-100 rounded-2xl gap-4 hover:shadow-md transition">
                             <div className="flex items-center gap-5 w-full sm:w-auto">
                               <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0">{u.company[0]}</div>
                               <div>
                                 <h4 className="text-lg font-black text-slate-900">{u.company}</h4>
                                 <p className="text-sm text-gray-500 font-medium">Owner: {u.name} • Applied: {u.date}</p>
                               </div>
                             </div>
                             <div className="flex gap-3 w-full sm:w-auto">
                               <button onClick={() => approveUser(u.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg hover:bg-green-600 transition"><Check size={18} /> Verify</button>
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-gray-200"><h3 className="text-2xl font-black text-slate-300">All caught up!</h3></div>}
                </div>
              )}

              {/* PRODUCTS MANAGER */}
              {activeTab === 'products' && (
                 <div className="animate-fade-in">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <h2 className="text-2xl font-black mb-2 text-slate-900">Product Manager</h2>
                        <p className="text-gray-500 font-medium">Manage visibility (Normal/B2B), pricing, and assign to specific stores.</p>
                      </div>
                      <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-[var(--secondary)] text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg flex items-center gap-2 hover:opacity-90 transition"><Plus size={18} /> Add Product</button>
                    </div>

                    <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 font-black border-b border-gray-100">
                                <th className="p-5">Product</th>
                                <th className="p-5">Customer Type</th>
                                <th className="p-5">Store</th>
                                <th className="p-5">Normal Price</th>
                                <th className="p-5">B2B Price</th>
                                <th className="p-5 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {products.map(p => (
                               <tr key={p.id} className="hover:bg-slate-50/50 transition">
                                  <td className="p-5 flex items-center gap-4">
                                     <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm" />
                                     <div>
                                        <p className="font-black text-slate-900">{p.name}</p>
                                        <p className="text-xs text-gray-500 font-bold">{p.stock} in stock</p>
                                     </div>
                                  </td>
                                  <td className="p-5">
                                     <span className={`px-3 py-1 rounded-full text-xs font-black ${p.customerType === 'Both' ? 'bg-indigo-100 text-indigo-700' : p.customerType === 'Business' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                       {p.customerType}
                                     </span>
                                  </td>
                                  <td className="p-5 font-bold text-slate-700 text-sm">{stores.find(s => s.id === p.storeId)?.name || 'Main Catalog'}</td>
                                  <td className="p-5 font-black text-slate-900">₹{p.b2cPrice || '-'}</td>
                                  <td className="p-5 font-black text-[var(--secondary)]">₹{p.b2bPrice || '-'}</td>
                                  <td className="p-5 text-right">
                                     <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition mr-2"><Edit size={18} /></button>
                                     <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash size={18} /></button>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              )}

              {/* STORE MANAGEMENT */}
              {activeTab === 'stores' && (
                 <div className="animate-fade-in">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <h2 className="text-2xl font-black mb-2 text-slate-900">Specialty Stores</h2>
                        <p className="text-gray-500 font-medium">Create or remove physical-themed store directories.</p>
                      </div>
                      <button onClick={() => { setEditingStore(null); setIsStoreModalOpen(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg flex items-center gap-2 hover:bg-slate-800 transition"><Plus size={18} /> New Store</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                       {stores.map(s => (
                         <div key={s.id} className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition group relative">
                            <div className="h-32 w-full bg-slate-100 relative">
                               <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                               <div className="absolute inset-0 bg-black/20"></div>
                            </div>
                            <div className="p-6 relative">
                               <h3 className="font-black text-xl text-slate-900 mb-1">{s.name}</h3>
                               <p className="text-sm font-bold text-gray-500">{s.subtitle}</p>
                               <div className="absolute -top-6 right-4 flex gap-2">
                                  <button onClick={() => { setEditingStore(s); setIsStoreModalOpen(true); }} className="bg-white text-blue-600 p-3 rounded-full shadow-lg hover:scale-110 transition"><Edit size={16} /></button>
                                  <button onClick={() => deleteStore(s.id)} className="bg-white text-red-600 p-3 rounded-full shadow-lg hover:scale-110 transition"><Trash size={16} /></button>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              )}

              {/* FLASH SALE */}
              {activeTab === 'flash' && (
                 <div className="animate-fade-in">
                    <h2 className="text-2xl font-black mb-2 text-slate-900">Flash Sale Configuration</h2>
                    <p className="text-gray-500 mb-8 font-medium">Select multiple products to feature in the limited-time 3D Shelf on the homepage.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                       {products.map(p => (
                         <div key={p.id} onClick={() => toggleFlashSale(p.id)} className={`relative border-4 rounded-2xl p-3 cursor-pointer transition-all ${p.isFlashSale ? 'border-[var(--secondary)] bg-[#1FB33B05]' : 'border-transparent bg-slate-50 hover:border-slate-200'}`}>
                            {p.isFlashSale && <div className="absolute top-2 right-2 bg-[var(--secondary)] text-white p-1 rounded-full"><Check size={16} strokeWidth={4} /></div>}
                            <img src={p.images[0]} alt={p.name} className="w-full h-24 object-cover rounded-xl mb-3" />
                            <p className="font-black text-sm tracking-tight leading-tight">{p.name}</p>
                            <p className="text-xs font-bold text-gray-500 mt-1">₹{p.b2cPrice}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              )}

           </div>
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={saveProduct} className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-up">
            <div className="p-8 border-b flex justify-between items-center bg-slate-900 text-white rounded-t-3xl">
               <h2 className="text-2xl font-black">{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
               <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-white/60 hover:text-white bg-white/10 p-2 rounded-full"><Trash size={20} className="opacity-0 hidden" /> X</button>
            </div>
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Product Name</label>
                   <input required name="name" defaultValue={editingProduct?.name} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900" />
                 </div>
                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Image URL</label>
                   <input required name="image" defaultValue={editingProduct?.images?.[0]} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900" placeholder="https://..." />
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-6">
                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Customer Type</label>
                   <select name="customerType" defaultValue={editingProduct?.customerType || 'Both'} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold bg-white text-slate-900">
                      <option value="Both">Both</option>
                      <option value="Normal">Normal Consumers</option>
                      <option value="Business">Business (B2B)</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Normal Price (₹)</label>
                   <input required type="number" name="b2cPrice" defaultValue={editingProduct?.b2cPrice} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900" />
                 </div>
                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">B2B Price (₹)</label>
                   <input required type="number" name="b2bPrice" defaultValue={editingProduct?.b2bPrice} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900" />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Assign to Store</label>
                   <select name="storeId" defaultValue={editingProduct?.storeId || ''} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold bg-white text-slate-900">
                      <option value="">Main Catalog (No Store)</option>
                      {stores.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Stock Count</label>
                   <input required type="number" name="stock" defaultValue={editingProduct?.stock || 0} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900" />
                 </div>
               </div>

               <div className="flex items-center gap-3 bg-red-50 text-red-900 p-4 rounded-xl border border-red-100">
                  <input type="checkbox" name="isFlashSale" id="flashSale" defaultChecked={editingProduct?.isFlashSale} className="w-5 h-5 accent-red-600" />
                  <label htmlFor="flashSale" className="font-black cursor-pointer">Feature in Flash Sale (Live Homepage Shelf)</label>
               </div>
            </div>
            <div className="p-8 bg-slate-50 border-t rounded-b-3xl flex justify-end gap-4">
               <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-8 py-4 font-black text-slate-600 hover:text-slate-900 transition">Cancel</button>
               <button type="submit" className="bg-[var(--secondary)] text-white px-10 py-4 rounded-xl font-black shadow-lg hover:opacity-90 transition">Save Product</button>
            </div>
          </form>
        </div>
      )}

      {/* Store Modal */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={saveStore} className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-fade-up">
            <div className="p-8 border-b flex justify-between items-center bg-slate-900 text-white rounded-t-3xl">
               <h2 className="text-2xl font-black">{editingStore ? 'Edit Store' : 'Create Speciality Store'}</h2>
               <button type="button" onClick={() => setIsStoreModalOpen(false)} className="text-white/60 hover:text-white bg-white/10 p-2 rounded-full">X</button>
            </div>
            <div className="p-8 space-y-6">
               <div>
                 <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Store Name</label>
                 <input required name="name" defaultValue={editingStore?.name} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900" placeholder="e.g. ₹99 Store" />
               </div>
               <div>
                 <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Subtitle</label>
                 <input required name="subtitle" defaultValue={editingStore?.subtitle} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900" placeholder="e.g. Everything under ₹99" />
               </div>
               <div>
                 <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Cover Image URL</label>
                 <input required name="image" defaultValue={editingStore?.image} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900" placeholder="https://..." />
               </div>
            </div>
            <div className="p-8 bg-slate-50 border-t rounded-b-3xl flex justify-end gap-4">
               <button type="button" onClick={() => setIsStoreModalOpen(false)} className="px-8 py-4 font-black text-slate-600 hover:text-slate-900 transition">Cancel</button>
               <button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black shadow-lg hover:bg-slate-800 transition">Save Store</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Admin;
