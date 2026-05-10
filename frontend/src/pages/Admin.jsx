import React, { useState, useEffect } from 'react';
import { Users, Package, Store as StoreIcon, Zap, Edit, Trash, Plus, Check, LayoutGrid, MapPin, ShoppingBag, ChevronDown, Truck, Clock, BarChart3, TrendingUp, DollarSign, Activity, Tag as TagIcon, Image as ImageIcon, Calendar, Rocket, ToggleLeft, ToggleRight, Upload, Gift, Disc, Award, Star, Settings as SettingsIcon, MousePointerClick, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchStores, createStore, updateStore, deleteStore,
  fetchCategories, createCategory, updateCategory, deleteCategory, createSubCategory,
  fetchPendingB2B, approveB2B, fetchAdminPincodes, addAdminPincode, deleteAdminPincode,
  fetchAllOrders, updateOrderStatus, fetchAdminStats,
  fetchSettings, updateSettings,
  fetchDeliveryAgents, createDeliveryAgent, deleteDeliveryAgent, assignOrderToAgent, fetchSettlementData, processSettlement,
  fetchAllCoupons, createCoupon, updateCoupon, deleteCoupon,
  uploadImage,
  fetchValuePacks, createValuePack, updateValuePack, deleteValuePack
} from '../services/api';


const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // State Management
  const [stats, setStats] = useState(null);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [settlementData, setSettlementData] = useState([]);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Modals / Forms state
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [customerType, setCustomerType] = useState('BOTH');

  const [editingStore, setEditingStore] = useState(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [currentSubCatCategoryId, setCurrentSubCatCategoryId] = useState(null);
  
  // B2B Pricing Tiers State
  const [b2bTiers, setB2bTiers] = useState([]);
  const [productVariants, setProductVariants] = useState([]);

  const [pincodes, setPincodes] = useState([]);
  const [newPincode, setNewPincode] = useState('');

  const [valuePacks, setValuePacks] = useState([]);
  const [editingValuePack, setEditingValuePack] = useState(null);
  const [isValuePackModalOpen, setIsValuePackModalOpen] = useState(false);
  const [packItems, setPackItems] = useState([]);

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFiles, setImageFiles] = useState([]); // For multiple product images
  const [imagePreviews, setImagePreviews] = useState([]);

  // Settings State
  const [appSettings, setAppSettings] = useState({
    // Delivery Fees
    freeDeliveryThreshold: 200,
    standardDeliveryFee: 25,
    smallCartFeeThreshold: 100,
    smallCartFeeAmount: 10,
    lowOrderFeeThreshold: 50,
    lowOrderFeeAmount: 15,
    packagingFee: 10,
    qwikDeliveryFee: 30,
    qwikDeliveryCutoffHour: 20,
    // Night Mode
    nightModeStartHour: 0,
    nightModeEndHour: 6,
    // Payment
    razorpayKeyId: '',
    razorpayKeySecret: '',
    googleMapsApiKey: '',
    // Agent Config
    agentMinPayPerOrder: 20,
    agentIncentiveThreshold: 10,
    agentIncentiveAmount: 50,
    // Branding
    splashVideoUrl: '',
    // Home Page Carousel & Promo Cards
    heroImages: '[]',
    homePromoCards: '[]',
    deliverySectionImage: '',
    // Launch Mode
    isLaunchMode: false,
    launchDate: '',
    launchMessage: 'We are launching soon! Stay tuned.',
    // Delivery Slots
    deliverySlots: '[]',
    // Bulk Basket Deals
    bulkDiscountThreshold: 2000,
    bulkDiscountPercentage: 5,
    // Checkout Dynamic Sections
    checkoutSections: '[]',
  });



  useEffect(() => {
    if (user?.role === 'admin') {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [prodData, storeData, catData, pendingData, pincodeData, orderData, statsData, settingsData, agentData, settleData, couponData, packData] = await Promise.all([
        fetchProducts(true),
        fetchStores(),
        fetchCategories(),
        fetchPendingB2B(),
        fetchAdminPincodes(),
        fetchAllOrders(),
        fetchAdminStats(),
        fetchSettings(),
        fetchDeliveryAgents(),
        fetchSettlementData(),
        fetchAllCoupons(),
        fetchValuePacks()
      ]);

      setProducts(prodData || []);
      setStores(storeData || []);
      setCategories(catData || []);
      setPendingUsers(pendingData || []);
      setPincodes(pincodeData || []);
      setOrders(orderData || []);
      setStats(statsData);
      if (settingsData) setAppSettings(settingsData);
      setDeliveryAgents(agentData || []);
      setSettlementData(settleData || []);
      setCoupons(couponData || []);
      setValuePacks(packData || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'admin') {
     return <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6 text-center"><h1 className="text-3xl font-black mb-4">Access Denied</h1><p className="text-gray-500 font-medium max-w-sm">Admins only. Please log in with admin credentials.</p></div>;
  }

  // --- Handlers ---
  const approveUser = async (id) => {
    try {
      const res = await approveB2B(id);
      if (res.success) {
        setPendingUsers(prev => prev.filter(u => u.id !== id));
        alert("Business user approved successfully!");
      } else {
        alert(res.error || "Failed to approve user");
      }
    } catch (err) {
      console.error("Approval error:", err);
      alert("Error approving user");
    }
  };
  
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Create actual FormData for the API request
    const apiData = new FormData();
    apiData.append('name', formData.get('name'));
    apiData.append('description', formData.get('description'));
    apiData.append('unit', formData.get('unit') || 'piece');
    apiData.append('stock', Number(formData.get('stock')) || 0);
    apiData.append('customerType', formData.get('customerType'));
    
    // Explicitly handle decimal fields - send null if empty string
    const decimalFields = ['b2cOldPrice', 'b2cNewPrice', 'b2bOldPrice', 'b2bNewPrice'];
    decimalFields.forEach(field => {
      const val = formData.get(field);
      apiData.append(field, val === "" ? "" : val);
    });

    apiData.append('minB2BQty', formData.get('minB2BQty') || 1);
    apiData.append('b2bTiers', JSON.stringify(b2bTiers));
    apiData.append('variants', JSON.stringify(productVariants));
    
    // Explicitly handle UUID/optional fields
    apiData.append('storeId', formData.get('storeId') || "");
    apiData.append('categoryId', formData.get('categoryId') || "");
    apiData.append('subCategoryId', formData.get('subCategoryId') || "");
    
    apiData.append('isFlashSale', formData.get('isFlashSale') === 'on');
    apiData.append('isBulkOnly', formData.get('isBulkOnly') === 'on');
    apiData.append('packagingSize', formData.get('packagingSize') || '');
    apiData.append('ratePerUnit', formData.get('ratePerUnit') || '');
    
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => {
        apiData.append('images', file);
      });
    } else if (imageFile) {
      apiData.append('images', imageFile);
    } else if (formData.get('image')) {
      apiData.append('images', JSON.stringify([formData.get('image')]));
    }

    try {
      let res;
      if (editingProduct) {
        res = await updateProduct(editingProduct.id, apiData);
      } else {
        res = await createProduct(apiData);
      }
      if (!res.success) {
        alert('❌ Error saving product: ' + (res.error || 'Unknown error'));
        return;
      }
      alert('✅ Product saved successfully!');
      loadInitialData();
      setIsProductModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
      setImageFiles([]);
      setImagePreviews([]);
    } catch (err) {
      alert('❌ Error saving product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      loadInitialData();
    } catch (err) {
      alert("Error deleting product");
    }
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const apiData = new FormData();
    
    apiData.append('name', formData.get('name'));
    apiData.append('subtitle', formData.get('subtitle'));
    
    if (imageFile) {
      apiData.append('image', imageFile);
    } else {
      apiData.append('image', formData.get('image') || '');
    }

    // Collect checked sections
    const sectionOptions = ['trending','latest','mostPurchased','flashSale','categories'];
    const selectedSections = sectionOptions.filter(s => formData.get(`section_${s}`) === 'on');
    apiData.append('visibleSections', JSON.stringify(selectedSections.length > 0 ? selectedSections : ['trending','latest','mostPurchased']));

    try {
      if (editingStore) {
        await updateStore(editingStore.id, apiData);
      } else {
        await createStore(apiData);
      }
      alert("Store saved successfully!");
      loadInitialData();
      setIsStoreModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      alert("Error saving store: " + err.message);
    }
  };

  const handleDeleteStore = async (id) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;
    try {
      await deleteStore(id);
      loadInitialData();
    } catch (err) {
      alert("Error deleting store");
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const apiData = new FormData();
    
    const name = formData.get('name');
    if (!name || name.trim().length < 2) {
      alert('Category name must be at least 2 characters.');
      return;
    }
    apiData.append('name', name.trim());
    apiData.append('slug', name.trim().toLowerCase().replace(/\s+/g, '-'));
    apiData.append('isVegetable', formData.get('isVegetable') === 'on');

    if (imageFile) {
      apiData.append('image', imageFile);
    } else {
      apiData.append('image', formData.get('image') || '');
    }

    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, apiData);
      } else {
        result = await createCategory(apiData);
      }

      if (!result.success) {
        alert('❌ Error: ' + (result.error || 'Failed to save category'));
        return;
      }
      alert('✅ Category saved successfully!');
      loadInitialData();
      setIsCategoryModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
      setEditingCategory(null);
    } catch (err) {
      alert('❌ Error saving category: ' + err.message);
    }
  };

  const handleToggleVegetable = async (cat) => {
    try {
      await updateCategory(cat.id, { isVegetable: !cat.isVegetable });
      loadInitialData();
    } catch (err) {
      alert('Error updating category: ' + err.message);
    }
  };

  const handleSaveSubCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const subData = {
      name,
      // Append timestamp to ensure slug uniqueness across categories
      slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    };

    try {
      const result = await createSubCategory(currentSubCatCategoryId, subData);
      if (!result.success) {
        alert('Error: ' + (result.error || 'Failed to create subcategory'));
        return;
      }
      loadInitialData();
      setIsSubCategoryModalOpen(false);
    } catch (err) {
      alert('Error saving subcategory: ' + err.message);
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteCategory(id);
      loadInitialData();
    } catch (err) {
      alert("Error deleting category");
    }
  }

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const phone = formData.get('phone');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert('Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.');
      return;
    }
    try {
      await createDeliveryAgent({
        name: formData.get('name'),
        phone,
        password: formData.get('password')
      });
      alert('Delivery Agent created successfully!');
      setIsAgentModalOpen(false);
      loadInitialData();
    } catch (err) {
      alert('Failed to create agent: ' + err.message);
    }
  };

  const handleAssignAgent = async (orderId, agentId) => {
    if (!agentId) return;
    try {
      const earningsInput = prompt(
        'Set delivery earnings for this agent (₹):\n(This will be added to their dashboard when they mark it delivered)',
        '30'
      );
      if (earningsInput === null) return; // cancelled
      const agentEarnings = parseFloat(earningsInput) || appSettings.agentMinPayPerOrder || 20;
      await assignOrderToAgent(orderId, agentId, agentEarnings);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, deliveryAgentId: agentId } : o
      ));
      alert(`✅ Order assigned! Agent will earn ₹${agentEarnings} on delivery.`);
    } catch (err) {
      alert('Failed to assign agent: ' + err.message);
    }
  };

  const handleProcessSettlement = async (settle) => {
    if (!window.confirm(`Mark ₹${settle.totalPayable} as settled for ${settle.name}?`)) return;
    try {
      await processSettlement({
        agentId: settle.agentId,
        orderIds: settle.orderIds,
        amount: settle.totalPayable,
        period: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
      });
      alert('Settlement processed!');
      loadInitialData();
    } catch (err) {
      alert('Failed to process settlement');
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      code: formData.get('code').toUpperCase(),
      discountAmount: Number(formData.get('discountAmount')),
      isPublic: formData.get('isPublic') === 'on',
      isActive: formData.get('isActive') === 'on'
    };
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, data);
      } else {
        await createCoupon(data);
      }
      alert('Coupon saved!');
      loadInitialData();
      setIsCouponModalOpen(false);
    } catch (e) {
      alert('Error saving coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete coupon?')) return;
    try {
       await deleteCoupon(id);
       loadInitialData();
    } catch (e) { alert('Error deleting'); }
  };

  const handleSaveValuePack = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const calculatedPrice = packItems.reduce((sum, item) => sum + (Number(item.price || 0) * (item.quantity || 1)), 0);
    const calculatedOriginalPrice = packItems.reduce((sum, item) => sum + (Number(item.previousPrice || item.price || 0) * (item.quantity || 1)), 0);
    const data = {
       name: formData.get('name'),
       description: formData.get('description'),
       price: calculatedPrice,
       originalPrice: calculatedOriginalPrice,
       stock: Number(formData.get('stock') || 100),
       isActive: formData.get('isActive') === 'true' || formData.get('isActive') === null, 
       items: packItems,
       image: formData.get('image')
    };

    try {
       if (editingValuePack) {
          await updateValuePack(editingValuePack.id, data);
       } else {
          await createValuePack(data);
       }
       setIsValuePackModalOpen(false);
       loadInitialData();
    } catch (err) { alert('Error saving value pack'); }
  };

  const handleDeleteValuePack = async (id) => {
    if (!window.confirm('Delete this value pack?')) return;
    try {
       await deleteValuePack(id);
       loadInitialData();
    } catch (err) { alert('Error deleting value pack'); }
  };


  return (
    <div className="bg-slate-50 min-h-screen pt-4 md:pt-12 pb-24">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <h1 className="text-2xl md:text-4xl font-black mb-6 md:mb-10 tracking-tight text-slate-900 flex items-center gap-3">
          Admin Control
          <span className="bg-[var(--secondary)] text-white text-[10px] px-2.5 py-1 rounded-full tracking-widest uppercase font-black">Super Admin</span>
        </h1>
        
        <div className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px] md:min-h-[700px]">
           {/* Sidebar Navigation - Responsive Scroll on Mobile */}
           <div className="w-full md:w-72 bg-slate-900 text-white p-4 md:p-6 flex flex-row md:flex-col gap-2 flex-shrink-0 overflow-x-auto md:overflow-x-visible no-scrollbar">
              <h3 className="hidden md:block text-xs font-black text-slate-400 tracking-[0.2em] uppercase mb-4 mt-2 px-4">Dashboard Menu</h3>
              {[
                { id: 'dashboard', label: 'Admin Dashboard', icon: <BarChart3 size={20}/> },
                { id: 'products', label: 'Product Manager', icon: <Package size={20}/> }, 
                { id: 'stores', label: 'Store Management', icon: <StoreIcon size={20}/> },
                { id: 'categories', label: 'Categories', icon: <LayoutGrid size={20}/> },
                { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20}/>, badge: orders.filter(o => o.status === 'Pending').length },
                { id: 'delivery_agents', label: 'Delivery Agents', icon: <Truck size={20}/> },
                { id: 'settlements', label: 'Settlements', icon: <DollarSign size={20}/> },
                { id: 'b2b', label: 'B2B Verifications', icon: <Users size={20}/>, badge: pendingUsers.length }, 
                { id: 'serviceability', label: 'Serviceability', icon: <MapPin size={20}/> },
                { id: 'flash', label: 'Flash Sale', icon: <Zap size={20}/> },
                { id: 'settings', label: 'Global Settings', icon: <Edit size={20}/> },
                { id: 'coupons', label: 'Coupons Manager', icon: <TagIcon size={20}/> },
                { id: 'value_packs', label: 'Value Packs', icon: <Gift size={20}/> },
                { id: 'media', label: 'Media Manager', icon: <ImageIcon size={20}/> },

              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={`flex items-center justify-between gap-3 whitespace-nowrap md:whitespace-normal px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all flex-shrink-0 ${activeTab === tab.id ? 'bg-[var(--secondary)] text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base">{tab.icon} <span className="md:inline">{tab.label}</span></div>
                  {tab.badge > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-1">{tab.badge}</span>}
                </button>
              ))}
           </div>

           {/* Content Area */}
           <div className="flex-1 p-6 md:p-10 bg-white overflow-y-auto w-full">
              
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--secondary)]"></div>
                </div>
              ) : (
                <>
                  {/* DASHBOARD TAB */}
                  {activeTab === 'dashboard' && (
                    <div className="animate-fade-in space-y-8">
                       <div className="flex justify-between items-end mb-8">
                          <div>
                            <h2 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">Business Overview</h2>
                            <p className="text-gray-500 font-medium">Real-time metrics for QwikBasket by Real Farms sales and operations.</p>
                          </div>
                          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                             <TrendingUp size={14}/> Active Performance
                          </div>
                       </div>

                       {/* Stats Cards */}
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {[
                            { label: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: <DollarSign className="text-emerald-600"/>, color: 'emerald', detail: 'Combined earnings' },
                            { label: 'Active Orders', value: stats?.activeOrders || 0, icon: <Activity className="text-blue-600"/>, color: 'blue', detail: 'Awaiting fulfillment' },
                            { label: 'B2B Partners', value: stats?.totalB2B || 0, icon: <Users className="text-indigo-600"/>, color: 'indigo', detail: `${stats?.pendingB2B || 0} pending approval` },
                            { label: 'Total SKUs', value: products.length, icon: <Package className="text-orange-600"/>, color: 'orange', detail: 'Live on storefront' }
                          ].map((s, i) => (
                            <div key={i} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                               <div className={`absolute top-0 right-0 w-24 h-24 bg-${s.color}-500/5 rounded-bl-full transform translate-x-12 -translate-y-12 transition-transform group-hover:translate-x-10 group-hover:-translate-y-10`}></div>
                               <div className={`w-12 h-12 bg-${s.color}-50 rounded-2xl flex items-center justify-center mb-4 border border-${s.color}-100`}>
                                  {s.icon}
                               </div>
                               <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">{s.label}</h4>
                               <p className="text-2xl font-black text-slate-900 mb-2">{s.value}</p>
                               <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className={`w-1.5 h-1.5 rounded-full bg-${s.color}-400`}></div> {s.detail}
                               </div>
                            </div>
                          ))}
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                             <div className="relative z-10">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-3"><TrendingUp strokeWidth={3}/> Operational Performance</h3>
                                <div className="space-y-6">
                                   {[
                                      { label: 'Order Fulfillment Rate', percent: (stats?.deliveredOrders / stats?.totalOrders * 100) || 0, color: 'bg-[var(--secondary)]' },
                                      { label: 'Inventory Health', percent: (products.filter(p => p.stock > 0).length / products.length * 100) || 100, color: 'bg-orange-500' },
                                      { label: 'B2B Verification Speed', percent: 88, color: 'bg-indigo-500' }
                                   ].map((bar, i) => (
                                      <div key={i}>
                                         <div className="flex justify-between text-xs font-black uppercase tracking-wider mb-2 text-slate-400">
                                            <span>{bar.label}</span>
                                            <span>{Math.round(bar.percent)}%</span>
                                         </div>
                                         <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.percent}%` }}></div>
                                         </div>
                                      </div>
                                   ))}
                                </div>
                             </div>
                             <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[var(--secondary)]/10 rounded-full blur-3xl"></div>
                          </div>
                          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                             <h3 className="text-lg font-black mb-6 text-slate-900">Recent Status</h3>
                             <div className="space-y-5">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600"><Check size={20} strokeWidth={3}/></div>
                                   <div><p className="text-sm font-black">All Systems Online</p><p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Backend & Database Sync</p></div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><ShoppingBag size={20}/></div>
                                   <div><p className="text-sm font-black">{stats?.activeOrders} Pending Deliveries</p><p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Avg Delivery: 8.5 Mins</p></div>
                                </div>
                             </div>
                          </div>
                       </div>
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
                         <button onClick={() => { 
                           setEditingProduct(null); 
                           setSelectedCategoryId('');
                           setCustomerType('BOTH');
                           setB2bTiers([]); // Clear tiers for new product
                            setProductVariants([]); // Clear variants for new product
                           setImageFiles([]);
                           setImagePreviews([]);
                           setIsProductModalOpen(true); 
                         }} className="bg-[var(--secondary)] text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg flex items-center gap-2 hover:opacity-90 transition"><Plus size={18} /> Add Product</button>
                       </div>

                       <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <table className="w-full text-left border-collapse">
                             <thead>
                                <tr className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 font-black border-b border-gray-100">
                                   <th className="p-5">Product</th>
                                   <th className="p-5">Type</th>
                                   <th className="p-5">Stock</th>
                                   <th className="p-5">Price (B2C/B2B)</th>
                                   <th className="p-5 text-right">Actions</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50">
                                {products.map(p => {
                                   const stock = Number(p.stock) || 0;
                                   const isOut = stock <= 0;
                                   const isLow = stock > 0 && stock <= 10;
                                   let imgSrc = 'https://placehold.co/100';
                                   try { if (p.images) imgSrc = JSON.parse(p.images)[0] || imgSrc; } catch {}
                                   return (
                                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                                     <td className="p-5 flex items-center gap-4">
                                        <img src={imgSrc} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm" />
                                        <div>
                                           <div className="flex items-center gap-2">
                                              <p className="font-black text-slate-900">{p.name}</p>
                                              {p.isBulkOnly && <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Bulk Only</span>}
                                           </div>
                                           <p className="text-xs text-gray-500 font-bold">{p.unit} · {p.packagingSize || ''}</p>
                                        </div>
                                     </td>
                                     <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${p.customerType === 'BOTH' ? 'bg-indigo-100 text-indigo-700' : p.customerType === 'BUSINESS' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{p.customerType}</span>
                                     </td>
                                     <td className="p-5">
                                        <div className="flex items-center gap-2">
                                          <span className={`text-sm font-black px-3 py-1 rounded-full ${isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{isOut ? '❌ Out' : isLow ? `⚠️ ${stock}` : `✅ ${stock}`}</span>
                                          <button onClick={async () => { const ns = prompt(`Update stock for "${p.name}":`, stock); if (ns === null) return; const n = parseInt(ns, 10); if (isNaN(n) || n < 0) { alert('Invalid'); return; } const fd = new FormData(); fd.append('stock', n); const res = await updateProduct(p.id, fd); if (res.success) loadInitialData(); else alert('Error: ' + res.error); }} className="text-[10px] font-black text-blue-500 hover:underline">Edit</button>
                                        </div>
                                     </td>
                                     <td className="p-5">
                                        <div className="flex flex-col">
                                          {(p.customerType === 'BOTH' || p.customerType === 'NORMAL') && (
                                            <span className="font-black text-slate-900 text-sm">C: ₹{p.b2cNewPrice ? Number(p.b2cNewPrice).toFixed(2) : '-'} <span className="text-[10px] text-gray-400 line-through font-bold">₹{p.b2cOldPrice ? Number(p.b2cOldPrice).toFixed(2) : '-'}</span></span>
                                          )}
                                          {(p.customerType === 'BOTH' || p.customerType === 'BUSINESS') && (
                                            <span className="font-black text-[var(--secondary)] text-sm">B: ₹{p.b2bNewPrice ? Number(p.b2bNewPrice).toFixed(2) : '-'} <span className="text-[10px] text-gray-400 line-through font-bold">₹{p.b2bOldPrice ? Number(p.b2bOldPrice).toFixed(2) : '-'}</span></span>
                                          )}
                                        </div>
                                     </td>
                                     <td className="p-5 text-right">
                                        <button onClick={() => { 
                                          setEditingProduct(p); 
                                          setSelectedCategoryId(p.categoryId || '');
                                          setCustomerType(p.customerType || 'BOTH');
                                          setImageFiles([]);
                                          setImagePreviews([]);
                                          
                                          // Initialize tiers from product data
                                          try {
                                             setB2bTiers(p.b2bTiers ? JSON.parse(p.b2bTiers) : []); } catch (e) {} try { setProductVariants(p.variants ? (typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants) : []);
                                          } catch (e) {
                                             setB2bTiers([]);
                                          }
                                          
                                          setIsProductModalOpen(true); 
                                        }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition mr-2"><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash size={18} /></button>
                                     </td>
                                  </tr>
                                );
                                 })}
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
                            <p className="text-gray-500 font-medium">Create and manage physical-themed store directories.</p>
                          </div>
                          <button onClick={() => { setEditingStore(null); setIsStoreModalOpen(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg flex items-center gap-2 hover:bg-slate-800 transition"><Plus size={18} /> New Store</button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                      <button onClick={() => handleDeleteStore(s.id)} className="bg-white text-red-600 p-3 rounded-full shadow-lg hover:scale-110 transition"><Trash size={16} /></button>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* CATEGORY MANAGEMENT */}
                  {activeTab === 'categories' && (
                    <div className="animate-fade-in">
                       <div className="flex justify-between items-end mb-8">
                          <div>
                            <h2 className="text-2xl font-black mb-2 text-slate-900">Categories</h2>
                            <p className="text-gray-500 font-medium">Global categories for product organization.</p>
                          </div>
                          <button onClick={() => { 
                            setEditingCategory(null);
                            setImageFile(null);
                            setImagePreview(null);
                            setIsCategoryModalOpen(true); 
                          }} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg flex items-center gap-2 hover:bg-emerald-700 transition"><Plus size={18} /> Add Category</button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {categories.map(cat => (
                            <div key={cat.id} className="bg-slate-50 p-6 rounded-[28px] border border-gray-200 flex flex-col relative group">
                               <div className="flex items-center gap-4 mb-4">
                                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-sm border border-gray-100 relative">
                                    <img src={cat.image} className="w-full h-full object-cover rounded-2xl" alt={cat.name} />
                                    {cat.isVegetable && (
                                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">Veg</div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-black text-slate-900 leading-tight">{cat.name}</h4>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{cat.subcategories?.length || 0} Subcategories</p>
                                    <button
                                      onClick={() => handleToggleVegetable(cat)}
                                      className={`mt-1 text-[10px] font-black px-2 py-0.5 rounded-full border transition-all ${
                                        cat.isVegetable
                                          ? 'bg-green-100 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                                      }`}
                                    >
                                      {cat.isVegetable ? '🥦 Vegetable Category (Click to unmark)' : '+ Mark as Vegetable'}
                                    </button>
                                  </div>
                                  <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 bg-white text-red-500 rounded-xl shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition hover:bg-red-50"><Trash size={16}/></button>
                               </div>

                               <div className="space-y-1 mb-4 flex-1">
                                  {cat.subcategories?.map(sub => (
                                    <div key={sub.id} className="flex items-center justify-between text-xs font-bold text-slate-600 bg-white/50 px-3 py-2 rounded-lg">
                                       <span>{sub.name}</span>
                                    </div>
                                  ))}
                                  {(!cat.subcategories || cat.subcategories.length === 0) && (
                                    <p className="text-xs text-gray-400 italic">No subcategories yet</p>
                                  )}
                               </div>

                               <button 
                                 onClick={() => { setCurrentSubCatCategoryId(cat.id); setIsSubCategoryModalOpen(true); }} 
                                 className="w-full py-3 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-200 transition"
                               >
                                 Add Subcategory
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* B2B APPROVALS */}
                  {activeTab === 'b2b' && (
                    <div className="animate-fade-in">
                       <h2 className="text-2xl font-black mb-2 text-slate-900">Pending Business Approvals</h2>
                       <p className="text-gray-500 mb-8 font-medium">Review and verify B2B signups.</p>
                       {pendingUsers.length > 0 ? (
                         <div className="grid gap-4">
                            {pendingUsers.map(u => (
                              <div key={u.id} className="flex flex-row items-center justify-between p-6 bg-slate-50 border border-gray-100 rounded-2xl">
                                 <div className="flex items-center gap-5">
                                   <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">{(u.companyName || u.name)[0]}</div>
                                   <div>
                                     <h4 className="text-lg font-black text-slate-900">{u.companyName || 'Unknown Company'}</h4>
                                     <p className="text-sm text-gray-500 font-medium">Owner: {u.name} • Applied: {new Date(u.createdAt).toLocaleDateString()}</p>
                                   </div>
                                 </div>
                                 <button onClick={() => approveUser(u.id)} className="bg-green-500 text-white px-6 py-3 rounded-xl font-black text-sm"><Check size={18} /></button>
                              </div>
                            ))}
                         </div>
                       ) : <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-gray-200"><h3 className="text-2xl font-black text-slate-300">All caught up!</h3></div>}
                    </div>
                  )}

                  {/* SERVICEABILITY */}
                  {activeTab === 'serviceability' && (
                     <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-8">
                           <div>
                             <h2 className="text-2xl font-black mb-2 text-slate-900">Serviceable Pincodes</h2>
                             <p className="text-gray-500 font-medium">Manage areas where delivery is active.</p>
                           </div>
                        </div>
                        
                        <div className="flex gap-4 mb-8">
                           <input 
                             type="text" 
                             placeholder="Enter Pincode (e.g. 110001)" 
                             value={newPincode}
                             onChange={(e) => setNewPincode(e.target.value)}
                             maxLength={6}
                             className="px-5 py-3 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-900 flex-1 max-w-sm focus:border-[var(--secondary)] transition"
                           />
                           <button 
                             onClick={async () => {
                               if (newPincode.length < 5) return alert('Invalid pincode');
                               try {
                                 await addAdminPincode({ pincode: newPincode });
                                 setNewPincode('');
                                 const res = await fetchAdminPincodes();
                                 setPincodes(res || []);
                               } catch (e) {
                                 alert('Error adding pincode');
                               }
                             }}
                             className="bg-[var(--secondary)] text-white px-6 py-3 rounded-xl font-black text-sm shadow-sm flex items-center gap-2 hover:bg-[var(--secondary-dark)] transition"
                           >
                              <Plus size={18} /> Add Pincode
                           </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                           {pincodes.map(p => (
                             <div key={p.id} className="bg-white border-2 border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin size={16} className="text-emerald-500" />
                                  <span className="font-black text-slate-700">{p.pincode}</span>
                                </div>
                                <button 
                                  onClick={async () => {
                                     if(!window.confirm('Remove this pincode?')) return;
                                     await deleteAdminPincode(p.id);
                                     const res = await fetchAdminPincodes();
                                     setPincodes(res || []);
                                  }} 
                                  className="text-red-400 hover:text-red-600 transition p-1"
                                >
                                  <Trash size={16} />
                                </button>
                             </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* ORDERS MANAGEMENT */}
                  {activeTab === 'orders' && (() => {
                    const ORDER_STATUSES = ['Pending', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
                    const STATUS_COLORS = {
                      'Pending': 'bg-orange-100 text-orange-700',
                      'Processing': 'bg-blue-100 text-blue-700',
                      'Packed': 'bg-indigo-100 text-indigo-700',
                      'Shipped': 'bg-purple-100 text-purple-700',
                      'Out for Delivery': 'bg-cyan-100 text-cyan-700',
                      'Delivered': 'bg-green-100 text-green-700',
                      'Cancelled': 'bg-red-100 text-red-700',
                    };
                    // Apply filtering by status and dates
                    let processedOrders = orders;
                    if (orderFilter !== 'all') {
                      processedOrders = processedOrders.filter(o => o.status === orderFilter);
                    }
                    if (orderStartDate) {
                      const start = new Date(orderStartDate + 'T00:00:00');
                      processedOrders = processedOrders.filter(o => new Date(o.createdAt) >= start);
                    }
                    if (orderEndDate) {
                      const end = new Date(orderEndDate + 'T23:59:59');
                      processedOrders = processedOrders.filter(o => new Date(o.createdAt) <= end);
                    }
                    const filteredOrders = processedOrders;

                    const handleStatusChange = async (orderId, newStatus) => {
                      try {
                        await updateOrderStatus(orderId, { status: newStatus });
                        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                      } catch (err) {
                        alert('Failed to update status');
                      }
                    };

                    const handleDownloadPDF = () => {
                      const printWindow = window.open('', '_blank', 'width=1100,height=800');
                      if (!printWindow) {
                        alert('Please allow popups to download reports.');
                        return;
                      }

                      let rowsHtml = '';
                      filteredOrders.forEach((order) => {
                        const itemsList = order.items?.map(item => `${item.name} (${item.unit}) x${item.quantity}`).join(', ') || '';
                        rowsHtml += `
                          <tr>
                            <td style="font-weight: 800;">${order.orderNumber || order.id.slice(0, 8)}</td>
                            <td>${new Date(order.createdAt).toLocaleDateString('en-IN')} ${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>
                              <strong>${order.deliveryAddress?.fullName || 'N/A'}</strong><br>
                              <small style="color: #64748b;">Ph: ${order.deliveryAddress?.phone || ''}</small>
                            </td>
                            <td class="items">${itemsList}</td>
                            <td style="font-weight: 700;">₹${order.totalAmount ? Number(order.totalAmount).toFixed(2) : '0.00'}</td>
                            <td><span class="status-badge ${order.status.toLowerCase().replace(/\s+/g, '-')}">${order.status}</span></td>
                          </tr>
                        `;
                      });

                      const totalSales = filteredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

                      const htmlContent = `
                        <html>
                          <head>
                            <title>QwikBasket Orders Report</title>
                            <style>
                              @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
                              body {
                                font-family: 'Outfit', sans-serif;
                                color: #0f172a;
                                padding: 40px;
                                margin: 0;
                                background-color: #ffffff;
                              }
                              .header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                border-bottom: 2px solid #e2e8f0;
                                padding-bottom: 20px;
                                margin-bottom: 30px;
                              }
                              .logo {
                                font-size: 26px;
                                font-weight: 900;
                                color: #16a34a;
                                letter-spacing: -0.02em;
                              }
                              .subtitle {
                                font-size: 13px;
                                color: #64748b;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.1em;
                                margin-top: 4px;
                              }
                              .report-info {
                                text-align: right;
                                font-size: 13px;
                                color: #475569;
                                font-weight: 600;
                                line-height: 1.5;
                              }
                              .meta-grid {
                                display: grid;
                                grid-template-cols: repeat(3, 1fr);
                                gap: 20px;
                                margin-bottom: 30px;
                              }
                              .meta-card {
                                background: #f8fafc;
                                padding: 20px;
                                border-radius: 16px;
                                border: 1px solid #e2e8f0;
                              }
                              .meta-card h4 {
                                margin: 0 0 6px 0;
                                font-size: 11px;
                                text-transform: uppercase;
                                letter-spacing: 0.08em;
                                color: #64748b;
                                font-weight: 800;
                              }
                              .meta-card p {
                                margin: 0;
                                font-size: 22px;
                                font-weight: 900;
                                color: #0f172a;
                              }
                              table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 30px;
                              }
                              th {
                                background-color: #0f172a;
                                color: white;
                                font-size: 11px;
                                font-weight: 800;
                                text-transform: uppercase;
                                letter-spacing: 0.08em;
                                padding: 14px 16px;
                                text-align: left;
                              }
                              td {
                                padding: 14px 16px;
                                border-bottom: 1px solid #e2e8f0;
                                font-size: 13px;
                                color: #334155;
                                line-height: 1.5;
                              }
                              tr:nth-child(even) {
                                background-color: #f8fafc;
                              }
                              .items {
                                font-size: 12px;
                                color: #475569;
                                font-weight: 500;
                                max-width: 350px;
                              }
                              .status-badge {
                                display: inline-block;
                                padding: 4px 10px;
                                border-radius: 100px;
                                font-size: 10px;
                                font-weight: 800;
                                text-transform: uppercase;
                                letter-spacing: 0.05em;
                              }
                              .status-badge.pending { background: #ffedd5; color: #c2410c; }
                              .status-badge.processing { background: #dbeafe; color: #1d4ed8; }
                              .status-badge.packed { background: #e0e7ff; color: #4338ca; }
                              .status-badge.shipped { background: #f3e8ff; color: #7e22ce; }
                              .status-badge.out-for-delivery { background: #ecfeff; color: #0e7490; }
                              .status-badge.delivered { background: #dcfce7; color: #15803d; }
                              .status-badge.cancelled { background: #fee2e2; color: #b91c1c; }
                              .footer {
                                text-align: center;
                                font-size: 11px;
                                color: #94a3b8;
                                border-top: 1px solid #e2e8f0;
                                padding-top: 25px;
                                margin-top: 50px;
                                font-weight: 600;
                              }
                              @media print {
                                body { padding: 0; }
                                .no-print { display: none; }
                              }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <div>
                                <div class="logo">QwikBasket</div>
                                <div class="subtitle">Official Orders Report & Manifest</div>
                              </div>
                              <div class="report-info">
                                Generated: ${new Date().toLocaleDateString('en-IN')}<br>
                                Time: ${new Date().toLocaleTimeString('en-IN')}
                              </div>
                            </div>

                            <div class="meta-grid">
                              <div class="meta-card">
                                <h4>Total Orders</h4>
                                <p>${filteredOrders.length}</p>
                              </div>
                              <div class="meta-card">
                                <h4>Total Revenue</h4>
                                <p>₹${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                              <div class="meta-card">
                                <h4>Date Filter Range</h4>
                                <p style="font-size: 14px; margin-top: 6px;">${orderStartDate ? new Date(orderStartDate).toLocaleDateString('en-IN') : 'All History'} — ${orderEndDate ? new Date(orderEndDate).toLocaleDateString('en-IN') : 'Today'}</p>
                              </div>
                            </div>

                            <table>
                              <thead>
                                <tr>
                                  <th>Order #</th>
                                  <th>Date & Time</th>
                                  <th>Customer Info</th>
                                  <th>Items Manifest</th>
                                  <th>Total Paid</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${rowsHtml || '<tr><td colspan="6" style="text-align: center; color: #94a3b8;">No orders match the selected filters.</td></tr>'}
                              </tbody>
                            </table>

                            <div class="footer">
                              QwikBasket Administrative Operations Hub • Confidential Document
                            </div>

                            <script>
                              window.onload = function() {
                                setTimeout(function() {
                                  window.print();
                                  window.onafterprint = function() {
                                    window.close();
                                  };
                                }, 300);
                              }
                            </script>
                          </body>
                        </html>
                      `;

                      printWindow.document.write(htmlContent);
                      printWindow.document.close();
                    };

                    return (
                      <div className="animate-fade-in">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                          <div>
                            <h2 className="text-2xl font-black mb-1 text-slate-900">Order Management</h2>
                            <p className="text-gray-500 font-medium">View and update the status of all customer orders.</p>
                          </div>
                          <button onClick={loadInitialData} className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition">↻ Refresh</button>
                        </div>

                        {/* Date Filters & PDF Download Actions */}
                        <div className="bg-slate-50 p-6 rounded-[24px] border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8 shadow-sm">
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">From Date</span>
                              <input 
                                type="date" 
                                value={orderStartDate} 
                                onChange={(e) => setOrderStartDate(e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[var(--secondary)] bg-white shadow-sm transition cursor-pointer"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">To Date</span>
                              <input 
                                type="date" 
                                value={orderEndDate} 
                                onChange={(e) => setOrderEndDate(e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[var(--secondary)] bg-white shadow-sm transition cursor-pointer"
                              />
                            </div>
                            {(orderStartDate || orderEndDate) && (
                              <button 
                                onClick={() => { setOrderStartDate(''); setOrderEndDate(''); }}
                                className="lg:mt-5 text-xs font-black text-red-500 hover:text-red-700 hover:underline transition self-end"
                              >
                                Clear Date Filter
                              </button>
                            )}
                          </div>

                          <button 
                            onClick={handleDownloadPDF} 
                            disabled={filteredOrders.length === 0}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            📥 Download PDF Report
                          </button>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {['all', ...ORDER_STATUSES].map(status => (
                            <button
                              key={status}
                              onClick={() => setOrderFilter(status)}
                              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
                                orderFilter === status ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {status === 'all' ? `All (${orders.length})` : `${status} (${orders.filter(o => o.status === status).length})`}
                            </button>
                          ))}
                        </div>

                        {filteredOrders.length === 0 ? (
                          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-gray-200">
                            <ShoppingBag size={40} className="mx-auto text-slate-300 mb-3" />
                            <h3 className="font-black text-slate-300 text-xl">No orders here</h3>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {filteredOrders.map(order => (
                              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                                {/* Order Header */}
                                <div
                                  className="flex flex-wrap items-center gap-4 p-5 cursor-pointer"
                                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className="font-black text-slate-900">{order.orderNumber}</span>
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {order.status}
                                      </span>
                                      {order.deliveryType === 'Qwik' ? (
                                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full">⚡ Qwik</span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">🕐 Smart</span>
                                      )}
                                    </div>
                                    <p className="text-xs font-bold text-slate-400">
                                      {new Date(order.createdAt).toLocaleString()} · {order.items?.length} items · ₹{order.totalAmount ? Number(order.totalAmount).toFixed(2) : '0.00'}
                                    </p>
                                    {order.deliverySlot && (
                                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">📦 {order.deliverySlot}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <select
                                      value={order.deliveryAgentId || ''}
                                      onClick={e => e.stopPropagation()}
                                      onChange={e => handleAssignAgent(order.id, e.target.value)}
                                      className="border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-black outline-none focus:border-[var(--secondary)] bg-white transition cursor-pointer text-slate-500"
                                    >
                                      <option value="">Assign Agent</option>
                                      {deliveryAgents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                                      ))}
                                    </select>
                                    <select
                                      value={order.status}
                                      onClick={e => e.stopPropagation()}
                                      onChange={e => handleStatusChange(order.id, e.target.value)}
                                      className="border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-black outline-none focus:border-[var(--secondary)] bg-white transition cursor-pointer"
                                    >
                                      {ORDER_STATUSES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                      ))}
                                    </select>
                                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                                  </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrderId === order.id && (
                                  <div className="border-t border-gray-100 p-5 bg-slate-50 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Delivery Address</p>
                                        <p className="font-bold text-slate-900">{order.deliveryAddress?.fullName}</p>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                          {order.deliveryAddress?.houseNumber}, {order.deliveryAddress?.area}<br/>
                                          {order.deliveryAddress?.city}, {order.deliveryAddress?.state} – {order.deliveryAddress?.pincode}<br/>
                                          Ph: {order.deliveryAddress?.phone}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Order Summary</p>
                                        <p className="text-sm font-bold text-slate-600">Subtotal: ₹{order.subtotal ? Number(order.subtotal).toFixed(2) : '0.00'}</p>
                                        <p className="text-sm font-bold text-slate-600">Delivery: {order.deliveryFee === 0 ? 'FREE' : '₹' + (order.deliveryFee ? Number(order.deliveryFee).toFixed(2) : '0.00')}</p>
                                        <p className="text-base font-black text-slate-900 mt-1">Total: ₹{order.totalAmount ? Number(order.totalAmount).toFixed(2) : '0.00'}</p>
                                        <p className="text-xs mt-2 font-bold uppercase text-slate-400">Payment: {order.paymentMethod}</p>
                                        {order.deliverySlot && order.deliverySlot !== 'Now' && (
                                          <div className="mt-2 flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1.5 rounded-lg">
                                            <Clock size={13} />
                                            <span className="text-xs font-black">{order.deliverySlot}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Items Ordered</p>
                                      <div className="space-y-2">
                                        {order.items?.map((item, idx) => (
                                          <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                            <div className="flex-1">
                                              <p className="font-black text-slate-900 text-sm">{item.name}</p>
                                              <p className="text-xs text-slate-400 font-bold">{item.unit} × {item.quantity}</p>
                                            </div>
                                            <p className="font-black text-slate-900">₹{Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                   {/* DELIVERY AGENTS */}
                  {activeTab === 'delivery_agents' && (
                    <div className="animate-fade-in">
                       <div className="flex justify-between items-end mb-8">
                          <div>
                            <h2 className="text-2xl font-black mb-1 text-slate-900">Delivery Partners</h2>
                            <p className="text-gray-500 font-medium">Add and manage delivery agent accounts.</p>
                          </div>
                          <button onClick={() => setIsAgentModalOpen(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg flex items-center gap-2 hover:bg-slate-800 transition"><Plus size={18} /> Add New Agent</button>
                       </div>

                       <div className="grid gap-4">
                          {deliveryAgents.map(agent => (
                            <div key={agent.id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition">
                               <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                     <Truck size={24} />
                                  </div>
                                  <div>
                                     <h4 className="font-black text-slate-900 text-lg">{agent.name}</h4>
                                     <p className="text-sm font-bold text-slate-400">UID: {agent.id.slice(0,8)} • Phone: {agent.phone}</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                  <button onClick={async () => {
                                      if(!window.confirm('Remove this agent?')) return;
                                      await deleteDeliveryAgent(agent.id);
                                      loadInitialData();
                                  }} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"><Trash size={20}/></button>
                               </div>
                            </div>
                          ))}
                          {deliveryAgents.length === 0 && <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">No agents added yet.</div>}
                       </div>
                    </div>
                  )}

                  {/* SETTLEMENTS */}
                  {activeTab === 'settlements' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-8">
                          <div>
                            <h2 className="text-2xl font-black mb-1 text-slate-900">Agent Settlements</h2>
                            <p className="text-gray-500 font-medium">Process monthly payments and incentives for delivery partners.</p>
                          </div>
                       </div>
                       
                       <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
                          <table className="w-full text-left">
                             <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                   <th className="p-6">Delivery Agent</th>
                                   <th className="p-6">Performance</th>
                                   <th className="p-6">Earnings (Base + Incentive)</th>
                                   <th className="p-6 text-right">Action</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {settlementData.map((s, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                                     <td className="p-6">
                                        <p className="font-black text-slate-900">{s.name}</p>
                                        <p className="text-xs font-bold text-slate-400">{s.phone}</p>
                                     </td>
                                     <td className="p-6">
                                        <p className="font-bold text-slate-700">{s.orderCount} Orders Completed</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase">{s.totalDistance} km traveled</p>
                                     </td>
                                     <td className="p-6">
                                        <p className="font-black text-slate-900 text-lg">₹{s.totalPayable}</p>
                                        <p className="text-xs font-bold text-emerald-500">₹{s.baseEarnings} + ₹{s.incentives}</p>
                                     </td>
                                     <td className="p-6 text-right">
                                        <button 
                                          onClick={() => handleProcessSettlement(s)}
                                          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition"
                                        >
                                           Settle Payment
                                        </button>
                                     </td>
                                  </tr>
                                ))}
                                {settlementData.length === 0 && <tr><td colSpan="4" className="p-20 text-center text-slate-300 font-black">All payments settled!</td></tr>}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  )}

                  {/* FLASH SALE */}
                  {activeTab === 'flash' && (
                     <div className="animate-fade-in">
                        <h2 className="text-2xl font-black mb-2 text-slate-900">Flash Sale Configuration</h2>
                        <p className="text-gray-500 mb-8 font-medium">Products featured in the 3D Shelf on the homepage.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                           {products.map(p => (
                             <div key={p.id} className={`relative border-2 rounded-2xl p-3 cursor-pointer transition-all ${p.isFlashSale ? 'border-[var(--secondary)] bg-emerald-50' : 'border-transparent bg-slate-50'}`}>
                                <img src={p.images ? JSON.parse(p.images)[0] : ''} className="w-full h-24 object-cover rounded-xl mb-2" />
                                <p className="font-black text-xs leading-tight">{p.name}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* SETTINGS */}
                  {activeTab === 'settings' && (
                     <div className="animate-fade-in">
                        <h2 className="text-2xl font-black mb-2 text-slate-900">Global Settings</h2>
                        <p className="text-gray-500 mb-8 font-medium">Configure delivery fees, payment gateway, and vegetable delivery slots.</p>
                        
                        <div className="max-w-2xl space-y-6">
                           
                           {/* Branding Section */}
                           <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm ring-4 ring-emerald-50">
                             <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2">✨ Branding & Visuals</h3>
                             <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">Splash Screen & Theme</p>
                             
                             <div className="space-y-4">
                               <div>
                                 <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Splash Screen Video URL (.mp4)</label>
                                 <div className="flex gap-2">
                                   <input 
                                     type="text" 
                                     value={appSettings.splashVideoUrl} 
                                     onChange={e => setAppSettings({...appSettings, splashVideoUrl: e.target.value})} 
                                     className="flex-1 px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-sm bg-slate-50" 
                                     placeholder="https://example.com/video.mp4" 
                                   />
                                   {appSettings.splashVideoUrl && (
                                     <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-slate-200">
                                       <video src={appSettings.splashVideoUrl} className="w-full h-full object-cover" muted />
                                     </div>
                                   )}
                                 </div>
                                 <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                                   💡 This video plays in the background of your splash screen. Use a direct link to an MP4 file. 
                                   You can use high-quality farm videos to wow your customers!
                                 </p>
                               </div>
                             </div>
                           </div>

                           {/* Delivery Section Image */}
                           <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                             <h3 className="font-black text-slate-800 mb-1 flex items-center gap-2">Delivery Section Image</h3>
                             <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">Image shown on the right side of the Quality & Trust section (below Stores)</p>
                             <div className="flex gap-3 items-center">
                               <input
                                 type="text"
                                 value={appSettings.deliverySectionImage || ''}
                                 onChange={e => setAppSettings({...appSettings, deliverySectionImage: e.target.value})}
                                 className="flex-1 px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-sm bg-slate-50"
                                 placeholder="https://... or upload via Cloudinary"
                               />
                               {appSettings.deliverySectionImage && (
                                 <div className="w-14 h-10 rounded-xl overflow-hidden border-2 border-slate-200 flex-shrink-0">
                                   <img src={appSettings.deliverySectionImage} className="w-full h-full object-cover" alt="" />
                                 </div>
                               )}
                             </div>
                           </div>




                          {/* Delivery Fee Section */}
                          <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                            <h3 className="font-black text-slate-800 mb-1 flex items-center gap-2"><Truck size={18} className="text-[var(--secondary)]"/> Delivery Fee Config</h3>
                            <p className="text-xs text-slate-400 font-bold mb-4">Tiered flat-fee model — no distance tracking needed.</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Free Delivery Above (₹)</label>
                                <input type="number" value={appSettings.freeDeliveryThreshold} onChange={e => setAppSettings({...appSettings, freeDeliveryThreshold: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Orders above this get free delivery</p>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Standard Delivery Fee (₹)</label>
                                <input type="number" value={appSettings.standardDeliveryFee} onChange={e => setAppSettings({...appSettings, standardDeliveryFee: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Charged when below free threshold</p>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Small Cart Threshold (₹)</label>
                                <input type="number" value={appSettings.smallCartFeeThreshold} onChange={e => setAppSettings({...appSettings, smallCartFeeThreshold: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Below this → small batch service fee</p>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Small Batch Fee (₹)</label>
                                <input type="number" value={appSettings.smallCartFeeAmount} onChange={e => setAppSettings({...appSettings, smallCartFeeAmount: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Low Order Threshold (₹)</label>
                                <input type="number" value={appSettings.lowOrderFeeThreshold} onChange={e => setAppSettings({...appSettings, lowOrderFeeThreshold: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Below this → low-order handling fee</p>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Low Order Fee (₹)</label>
                                <input type="number" value={appSettings.lowOrderFeeAmount} onChange={e => setAppSettings({...appSettings, lowOrderFeeAmount: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                              </div>
                            </div>
                          </div>

                          {/* Care & Packaging + Qwik */}
                          <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">⚡ Care & Packaging · Qwik Delivery</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Care & Packaging Fee (₹)</label>
                                <input type="number" value={appSettings.packagingFee} onChange={e => setAppSettings({...appSettings, packagingFee: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Applied to every order — always shown positively</p>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Qwik Priority Fee (₹)</label>
                                <input type="number" value={appSettings.qwikDeliveryFee} onChange={e => setAppSettings({...appSettings, qwikDeliveryFee: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Added on top of delivery for instant orders</p>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Qwik Cutoff Hour (24h)</label>
                                <input type="number" min="0" max="23" value={appSettings.qwikDeliveryCutoffHour} onChange={e => setAppSettings({...appSettings, qwikDeliveryCutoffHour: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Qwik unavailable at or after this hour (default: 20 = 8PM)</p>
                              </div>
                            </div>
                          </div>

                          {/* Night Mode */}
                          <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                            <h3 className="font-black text-slate-800 mb-1 flex items-center gap-2">🌙 Night Mode (Store Shutter)</h3>
                            <p className="text-xs text-slate-400 font-bold mb-4">The app shows a beautiful "closed for the night" screen between these hours.</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Shutter Start Hour (24h)</label>
                                <input type="number" min="0" max="23" value={appSettings.nightModeStartHour} onChange={e => setAppSettings({...appSettings, nightModeStartHour: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">0 = midnight</p>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Reopen Hour (24h) ☀️</label>
                                <input type="number" min="0" max="23" value={appSettings.nightModeEndHour} onChange={e => setAppSettings({...appSettings, nightModeEndHour: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">6 = 6 AM</p>
                              </div>
                            </div>
                          </div>

                          {/* Farmer Coins Config */}
                          <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">🛒 Farmer Coin Config (Loyalty)</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Coin Earning Percentage (%)</label>
                                <input type="number" step="0.1" value={appSettings.farmerCoinEarningPercentage} onChange={e => setAppSettings({...appSettings, farmerCoinEarningPercentage: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Percentage of order total awarded as coins</p>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Redemption Rate (₹ per Coin)</label>
                                <input type="number" step="0.1" value={appSettings.farmerCoinRedemptionRate} onChange={e => setAppSettings({...appSettings, farmerCoinRedemptionRate: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Value of 1 Farmer Coin in Rupees (e.g. 1.0)</p>
                              </div>
                            </div>
                          </div>

                          {/* Bulk Basket Deals Config */}
                          <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm ring-4 ring-indigo-50">
                            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">📦 Bulk Basket Deals (Volume Discount)</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Min Order for Discount (₹)</label>
                                <input type="number" value={appSettings.bulkDiscountThreshold} onChange={e => setAppSettings({...appSettings, bulkDiscountThreshold: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Minimum subtotal in Bulk section to trigger discount</p>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Extra Discount Percentage (%)</label>
                                <input type="number" step="0.1" value={appSettings.bulkDiscountPercentage} onChange={e => setAppSettings({...appSettings, bulkDiscountPercentage: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Additional percentage off for hitting threshold</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 font-bold mt-3">💡 This applies only to items in the Bulk Basket section. Customers will see their progress toward this goal.</p>
                          </div>

                          {/* Delivery Agent Payment Section */}
                          <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><DollarSign size={18} className="text-emerald-500"/> Delivery Agent Pay Config</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Min Pay Per Order (₹)</label>
                                <input type="number" value={appSettings.agentMinPayPerOrder} onChange={e => setAppSettings({...appSettings, agentMinPayPerOrder: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Default earnings suggestion when assigning an order</p>
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Incentive Order Count</label>
                                <input type="number" value={appSettings.agentIncentiveThreshold} onChange={e => setAppSettings({...appSettings, agentIncentiveThreshold: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Incentive Amount (₹)</label>
                                <input type="number" value={appSettings.agentIncentiveAmount} onChange={e => setAppSettings({...appSettings, agentIncentiveAmount: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 font-bold mt-3">💡 Incentives are applied every time an agent completes the specified number of orders.</p>
                          </div>


                          {/* Checkout Dynamic Sections (Deals) */}
                          <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm ring-4 ring-purple-50">
                            <h3 className="font-black text-slate-800 mb-1 flex items-center gap-2"><Sparkles size={18} className="text-purple-500" /> Checkout Dynamic Deals</h3>
                            <p className="text-xs text-slate-400 font-bold mb-6 uppercase tracking-widest leading-relaxed">Create "Quick Add" sections that unlock when cart reaches a threshold. Great for ₹9 or ₹49 deals!</p>
                            
                            <div className="space-y-6">
                              {(() => {
                                let sections = [];
                                try { sections = JSON.parse(appSettings.checkoutSections || '[]'); } catch {}
                                
                                return (
                                  <>
                                    {sections.map((sec, sIdx) => (
                                      <div key={sec.id || sIdx} className="border-2 border-slate-100 rounded-[24px] p-5 bg-slate-50 relative group">
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            const updated = sections.filter((_, i) => i !== sIdx);
                                            setAppSettings({...appSettings, checkoutSections: JSON.stringify(updated)});
                                          }}
                                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Plus className="rotate-45" size={14} />
                                        </button>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                          <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400">Section Title</label>
                                            <input 
                                              className="w-full mt-1 p-3 rounded-xl bg-white border border-slate-200 font-bold text-sm" 
                                              value={sec.title} 
                                              onChange={e => {
                                                const updated = [...sections];
                                                updated[sIdx].title = e.target.value;
                                                setAppSettings({...appSettings, checkoutSections: JSON.stringify(updated)});
                                              }}
                                              placeholder="e.g. ₹9 Flash Deals"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400">Unlock Threshold (₹)</label>
                                            <input 
                                              type="number"
                                              className="w-full mt-1 p-3 rounded-xl bg-white border border-slate-200 font-bold text-sm" 
                                              value={sec.minCartValue} 
                                              onChange={e => {
                                                const updated = [...sections];
                                                updated[sIdx].minCartValue = Number(e.target.value);
                                                setAppSettings({...appSettings, checkoutSections: JSON.stringify(updated)});
                                              }}
                                              placeholder="e.g. 500"
                                            />
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                           <input 
                                              type="checkbox" 
                                              checked={sec.isVisible} 
                                              onChange={e => {
                                                const updated = [...sections];
                                                updated[sIdx].isVisible = e.target.checked;
                                                setAppSettings({...appSettings, checkoutSections: JSON.stringify(updated)});
                                              }}
                                              className="w-4 h-4 accent-purple-600"
                                           />
                                           <span className="text-xs font-black text-slate-600">Visible in Checkout</span>
                                        </div>

                                        <div className="bg-white rounded-2xl p-4 border border-slate-100">
                                           <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Custom Deal Items</p>
                                           <div className="space-y-3">
                                              {(sec.customItems || []).map((item, iIdx) => (
                                                <div key={iIdx} className="flex gap-3 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                   <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-white">
                                                      {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-[10px]">🖼️</div>}
                                                   </div>
                                                   <div className="flex-1 min-w-0">
                                                      <p className="text-[11px] font-black truncate">{item.name}</p>
                                                      <p className="text-[10px] font-bold text-[var(--secondary)]">₹{item.price} <span className="text-slate-300 line-through">₹{item.oldPrice}</span></p>
                                                   </div>
                                                   <button 
                                                      type="button" 
                                                      onClick={() => {
                                                        const updated = [...sections];
                                                        updated[sIdx].customItems = updated[sIdx].customItems.filter((_, i) => i !== iIdx);
                                                        setAppSettings({...appSettings, checkoutSections: JSON.stringify(updated)});
                                                      }}
                                                      className="text-red-300 hover:text-red-500"
                                                   >
                                                      <Trash size={14} />
                                                   </button>
                                                </div>
                                              ))}
                                              
                                              {/* Add custom item form */}
                                              <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                                                 <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <input id={`new-item-name-${sIdx}`} placeholder="Item Name" className="p-2 rounded-lg border border-slate-200 text-[11px] font-bold" />
                                                    <div className="flex gap-1">
                                                       <input id={`new-item-price-${sIdx}`} type="number" placeholder="Deal ₹" className="w-16 p-2 rounded-lg border border-slate-200 text-[11px] font-bold" />
                                                       <input id={`new-item-old-price-${sIdx}`} type="number" placeholder="MRP ₹" className="w-16 p-2 rounded-lg border border-slate-200 text-[11px] font-bold" />
                                                    </div>
                                                 </div>
                                                 <div className="flex gap-2">
                                                    <input id={`new-item-img-${sIdx}`} placeholder="Image URL (https://...)" className="flex-1 p-2 rounded-lg border border-slate-200 text-[11px] font-bold" />
                                                    <button 
                                                      type="button"
                                                      onClick={() => {
                                                        const name = document.getElementById(`new-item-name-${sIdx}`).value;
                                                        const price = document.getElementById(`new-item-price-${sIdx}`).value;
                                                        const oldPrice = document.getElementById(`new-item-old-price-${sIdx}`).value;
                                                        const image = document.getElementById(`new-item-img-${sIdx}`).value;
                                                        if (!name || !price) return alert('Name and Price are required');
                                                        
                                                        const updated = [...sections];
                                                        if (!updated[sIdx].customItems) updated[sIdx].customItems = [];
                                                        updated[sIdx].customItems.push({ id: 'c_' + Date.now(), name, price, oldPrice, image });
                                                        setAppSettings({...appSettings, checkoutSections: JSON.stringify(updated)});
                                                        
                                                        // Clear inputs
                                                        document.getElementById(`new-item-name-${sIdx}`).value = '';
                                                        document.getElementById(`new-item-price-${sIdx}`).value = '';
                                                        document.getElementById(`new-item-old-price-${sIdx}`).value = '';
                                                        document.getElementById(`new-item-img-${sIdx}`).value = '';
                                                      }}
                                                      className="px-3 bg-purple-600 text-white rounded-lg font-black text-[10px]"
                                                    >
                                                      Add Item
                                                    </button>
                                                 </div>
                                              </div>
                                           </div>
                                        </div>
                                      </div>
                                    ))}
                                    
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        const newSec = { id: Date.now().toString(), title: 'New Deals', minCartValue: 500, isVisible: true, customItems: [] };
                                        setAppSettings({...appSettings, checkoutSections: JSON.stringify([...sections, newSec])});
                                      }}
                                      className="w-full py-4 border-2 border-dashed border-purple-200 text-purple-600 rounded-2xl font-black text-sm hover:bg-purple-50 transition"
                                    >
                                      + Add New Deal Section
                                    </button>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Razorpay Section */}
                          <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">💳 Razorpay Payment Gateway</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Key ID</label>
                                <input type="text" value={appSettings.razorpayKeyId} onChange={e => setAppSettings({...appSettings, razorpayKeyId: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" placeholder="rzp_live_..." />
                              </div>
                              <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Key Secret</label>
                                <input type="password" value={appSettings.razorpayKeySecret} onChange={e => setAppSettings({...appSettings, razorpayKeySecret: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" placeholder="••••••••••••" />
                              </div>
                            </div>
                          </div>

                          {/* Ordering Capability */}
                           <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm ring-4 ring-orange-50">
                             <div className="flex items-center justify-between mb-4">
                               <div>
                                 <h3 className="font-black text-slate-800 flex items-center gap-2"><Rocket size={18} className="text-orange-500" /> Store Ordering Status</h3>
                                 <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Enable to start accepting orders. Disable to enter view-only Launch Mode.</p>
                               </div>
                               <label className="flex items-center gap-3 cursor-pointer">
                                  <span className={`text-sm font-black ${!appSettings.isLaunchMode ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {(!appSettings.isLaunchMode) ? 'Orders Started' : 'Orders Stopped'}
                                  </span>
                                  <div
                                    onClick={async () => {
                                      const newMode = !appSettings.isLaunchMode;
                                      const newSettings = {...appSettings, isLaunchMode: newMode};
                                      setAppSettings(newSettings);
                                      await updateSettings(newSettings);
                                    }}
                                    className={`w-14 h-7 rounded-full transition-all relative cursor-pointer shadow-inner flex items-center ${
                                      !appSettings.isLaunchMode ? 'bg-emerald-500' : 'bg-orange-500'
                                    }`}
                                  >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${
                                      !appSettings.isLaunchMode ? 'translate-x-8' : 'translate-x-1'
                                    }`} />
                                  </div>
                               </label>
                             </div>
                             {appSettings.isLaunchMode && (
                               <div className="space-y-4 mt-2 border-t border-orange-100 pt-4">
                                 <div>
                                   <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Launch Date (Ordering Opens On)</label>
                                   <input
                                     type="date"
                                     value={appSettings.launchDate || ''}
                                     onChange={e => setAppSettings({...appSettings, launchDate: e.target.value})}
                                     className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-orange-400 outline-none font-bold"
                                   />
                                   <p className="text-[10px] text-slate-400 font-bold mt-1">Ordering will automatically open from this date. Leave blank to keep closed indefinitely.</p>
                                 </div>
                                 <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                   <p className="text-xs font-black text-orange-700 flex items-center gap-1"><Rocket size={12} /> Currently in LAUNCH MODE — customers can browse but cannot place orders.</p>
                                 </div>
                               </div>
                             )}
                           </div>

                           {/* Delivery Slots Manager */}
                           <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                             <h3 className="font-black text-slate-800 mb-1 flex items-center gap-2"><Clock size={18} /> Delivery Slots</h3>
                             <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">Configure delivery time windows. Customers will see available slots when placing orders.</p>
                             <div className="space-y-3 mb-4">
                               {(() => {
                                 let slots = [];
                                 try { slots = JSON.parse(appSettings.deliverySlots || '[]'); } catch {}
                                 if (slots.length === 0) slots = [
                                   { id: 's1', label: '8 AM – 10 AM',  cutoffHour: 7 },
                                   { id: 's2', label: '12 PM – 2 PM',  cutoffHour: 11 },
                                   { id: 's3', label: '4 PM – 6 PM',   cutoffHour: 15 },
                                   { id: 's4', label: '7 PM – 9 PM',   cutoffHour: 18 },
                                 ];
                                 return slots.map((slot, idx) => (
                                   <div key={slot.id || idx} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                     <Clock size={16} className="text-slate-400 flex-shrink-0" />
                                     <input
                                       className="flex-1 bg-transparent font-bold text-sm outline-none"
                                       value={slot.label}
                                       onChange={e => {
                                         let curr = [];
                                         try { curr = JSON.parse(appSettings.deliverySlots || '[]'); } catch {}
                                         if (curr.length === 0) curr = slots;
                                         curr[idx] = { ...curr[idx], label: e.target.value };
                                         setAppSettings({...appSettings, deliverySlots: JSON.stringify(curr)});
                                       }}
                                       placeholder="e.g. 8 AM – 10 AM"
                                     />
                                     <div className="flex items-center gap-1">
                                       <label className="text-[10px] text-slate-400 font-bold">Cutoff Hr:</label>
                                       <input
                                         type="number" min="0" max="23"
                                         className="w-14 text-center bg-white border border-slate-200 rounded-lg py-1 font-bold text-sm outline-none focus:border-[var(--secondary)]"
                                         value={slot.cutoffHour ?? ''}
                                         onChange={e => {
                                           let curr = [];
                                           try { curr = JSON.parse(appSettings.deliverySlots || '[]'); } catch {}
                                           if (curr.length === 0) curr = slots;
                                           curr[idx] = { ...curr[idx], cutoffHour: parseInt(e.target.value) };
                                           setAppSettings({...appSettings, deliverySlots: JSON.stringify(curr)});
                                         }}
                                       />
                                     </div>
                                     <button
                                       type="button"
                                       onClick={() => {
                                         let curr = [];
                                         try { curr = JSON.parse(appSettings.deliverySlots || '[]'); } catch {}
                                         if (curr.length === 0) curr = slots;
                                         curr.splice(idx, 1);
                                         setAppSettings({...appSettings, deliverySlots: JSON.stringify(curr)});
                                       }}
                                       className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                                     >
                                       <Trash size={14} />
                                     </button>
                                   </div>
                                 ));
                               })()}
                             </div>
                             <button
                               type="button"
                               onClick={() => {
                                 let curr = [];
                                 try { curr = JSON.parse(appSettings.deliverySlots || '[]'); } catch {}
                                 curr.push({ id: `s${Date.now()}`, label: 'New Slot', cutoffHour: 8 });
                                 setAppSettings({...appSettings, deliverySlots: JSON.stringify(curr)});
                               }}
                               className="flex items-center gap-2 text-sm font-black text-[var(--secondary)] bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition"
                             >
                               <Plus size={16} /> Add Slot
                             </button>
                           </div>

                          {/* Vegetable Delivery Slots Section */}
                          <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-black text-slate-800 flex items-center gap-2">🥦 Vegetable Delivery Slots</h3>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div
                                  onClick={() => setAppSettings({...appSettings, vegetableSlotsEnabled: !appSettings.vegetableSlotsEnabled})}
                                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                                    appSettings.vegetableSlotsEnabled ? 'bg-[var(--secondary)]' : 'bg-slate-200'
                                  }`}
                                >
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                                    appSettings.vegetableSlotsEnabled ? 'left-7' : 'left-1'
                                  }`} />
                                </div>
                                <span className="text-sm font-black text-slate-700">{appSettings.vegetableSlotsEnabled ? 'Enabled' : 'Disabled'}</span>
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-1">☀️ Morning Slot</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-black text-slate-500 mb-1">Start Time</label>
                                    <input type="time" value={appSettings.vegetableMorningSlotStart} onChange={e => setAppSettings({...appSettings, vegetableMorningSlotStart: e.target.value})} className="w-full px-3 py-2 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-black text-slate-500 mb-1">End Time</label>
                                    <input type="time" value={appSettings.vegetableMorningSlotEnd} onChange={e => setAppSettings({...appSettings, vegetableMorningSlotEnd: e.target.value})} className="w-full px-3 py-2 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                  </div>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1">🌆 Evening Slot</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-black text-slate-500 mb-1">Start Time</label>
                                    <input type="time" value={appSettings.vegetableEveningSlotStart} onChange={e => setAppSettings({...appSettings, vegetableEveningSlotStart: e.target.value})} className="w-full px-3 py-2 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-black text-slate-500 mb-1">End Time</label>
                                    <input type="time" value={appSettings.vegetableEveningSlotEnd} onChange={e => setAppSettings({...appSettings, vegetableEveningSlotEnd: e.target.value})} className="w-full px-3 py-2 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={async () => {
                              try {
                                await updateSettings(appSettings);
                                alert('Settings updated successfully!');
                              } catch(e) {
                                alert('Failed to update settings');
                              }
                            }}
                            className="w-full bg-[var(--secondary)] text-white py-4 rounded-xl font-black shadow-lg hover:opacity-90 transition"
                          >
                            Save All Settings
                          </button>
                        </div>
                     </div>
                  )}

                  {/* VALUE PACKS */}
                  {activeTab === 'value_packs' && (
                     <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-8">
                           <div>
                             <h2 className="text-2xl font-black mb-2 text-slate-900">Value Packs / Monthly Stacks</h2>
                             <p className="text-gray-500 font-medium">Create curated bundles of products at discounted prices.</p>
                           </div>
                           <button onClick={() => { setEditingValuePack(null); setPackItems([]); setIsValuePackModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg flex items-center gap-2 hover:bg-blue-700 transition"><Plus size={18} /> New Value Pack</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {valuePacks.map(p => (
                             <div key={p.id} className="bg-white border-2 border-slate-100 rounded-[32px] p-6 relative shadow-sm hover:shadow-md transition group">
                                 <div className="relative h-40 rounded-2xl overflow-hidden mb-4 border border-slate-50">
                                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[var(--secondary)] font-black text-xs px-3 py-1 rounded-full shadow-sm border border-slate-100">
                                       Save ₹{p.originalPrice - p.price}
                                    </div>
                                 </div>
                                 <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-black text-lg text-slate-900 line-clamp-1">{p.name}</h3>
                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                       {p.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                 </div>
                                 <div className="flex items-baseline gap-2 mb-4">
                                    <p className="font-black text-2xl text-slate-900">₹{p.price}</p>
                                    <p className="text-sm text-slate-400 font-bold line-through">₹{p.originalPrice}</p>
                                 </div>
                                 
                                 <div className="mb-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                       Contains {(() => {
                                          try {
                                             const items = typeof p.items === 'string' ? JSON.parse(p.items) : (p.items || []);
                                             return items.length;
                                          } catch(e) { return 0; }
                                       })()} Items
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                       {(() => {
                                          try {
                                             const items = typeof p.items === 'string' ? JSON.parse(p.items) : (p.items || []);
                                             return items.slice(0, 3).map((item, idx) => (
                                                <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-100">{item.name} x{item.quantity}</span>
                                             ));
                                          } catch(e) { return null; }
                                       })()}
                                       {(() => {
                                          try {
                                             const items = typeof p.items === 'string' ? JSON.parse(p.items) : (p.items || []);
                                             return items.length > 3 ? <span className="bg-slate-50 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-100">+{items.length - 3} more</span> : null;
                                          } catch(e) { return null; }
                                       })()}
                                    </div>
                                 </div>

                                 <div className="flex gap-2">
                                    <button 
                                      onClick={() => { 
                                         setEditingValuePack(p); 
                                         try {
                                            const items = typeof p.items === 'string' ? JSON.parse(p.items) : (p.items || []);
                                            setPackItems(items); 
                                         } catch(e) { setPackItems([]); }
                                         setIsValuePackModalOpen(true); 
                                      }} 
                                      className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl text-sm transition"
                                    >Edit</button>
                                    <button onClick={() => handleDeleteValuePack(p.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl text-sm transition">Delete</button>
                                 </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* COUPON MANAGER */}
                  {activeTab === 'coupons' && (
                     <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-8">
                          <div>
                            <h2 className="text-2xl font-black mb-2 text-slate-900">Coupons Manager</h2>
                            <p className="text-gray-500 font-medium">Create discount codes for your customers.</p>
                          </div>
                          <button onClick={() => { setEditingCoupon(null); setIsCouponModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg flex items-center gap-2 hover:bg-blue-700 transition"><Plus size={18} /> New Coupon</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {coupons.map(c => (
                             <div key={c.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 relative shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-center mb-4">
                                   <div className="bg-blue-100 text-blue-800 text-lg font-black px-4 py-1.5 rounded-xl uppercase tracking-wider border border-blue-200 border-dashed">
                                      {c.code}
                                   </div>
                                   <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      {c.isActive ? 'Active' : 'Inactive'}
                                   </span>
                                </div>
                                <div className="mb-4">
                                   <p className="font-black text-3xl text-slate-900">₹{c.discountAmount} <span className="text-sm text-slate-500 font-bold">OFF</span></p>
                                   <p className="text-xs text-slate-500 font-medium mt-1">
                                      Visibility: <span className="font-bold text-slate-800">{c.isPublic ? 'Public ✅' : 'Hidden ❌'}</span>
                                   </p>
                                </div>
                                <div className="flex gap-2">
                                   <button onClick={() => { setEditingCoupon(c); setIsCouponModalOpen(true); }} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2 rounded-xl text-sm transition">Edit</button>
                                   <button onClick={() => handleDeleteCoupon(c.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-xl text-sm transition">Delete</button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* MEDIA MANAGER */}
                  {activeTab === 'media' && (
                     <div className="animate-fade-in">
                       <div className="mb-8">
                         <h2 className="text-2xl font-black mb-2 text-slate-900">Media Manager</h2>
                         <p className="text-gray-500 font-medium">Upload and manage images for the home page carousel, promotional cards, and delivery section.</p>
                       </div>

                       <div className="space-y-8">
                         {/* Hero Carousel */}
                         <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                           <h3 className="font-black text-slate-800 text-lg mb-1 flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> Hero Carousel</h3>
                           <p className="text-xs text-slate-400 font-bold mb-5 uppercase tracking-widest">Full-width auto-scrolling banner at the top of the home page</p>

                           {/* Current slides */}
                           <div className="space-y-3 mb-5">
                             {(() => {
                               let imgs = [];
                               try { imgs = JSON.parse(appSettings.heroImages || '[]'); } catch {}
                               if (imgs.length === 0) return (
                                 <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-300">
                                   <ImageIcon size={32} className="mx-auto mb-2" />
                                   <p className="text-sm font-black uppercase tracking-widest">No slides uploaded yet</p>
                                   <p className="text-xs font-medium mt-1">Upload images below to populate the home page carousel</p>
                                 </div>
                               );
                               return imgs.map((img, idx) => (
                                 <div key={img.id || idx} className="flex items-center gap-4 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                   <div className="w-28 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-200">
                                     <img src={img.url} className="w-full h-full object-cover" alt="" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                     <p className="text-xs font-bold text-slate-800 truncate">{img.url}</p>
                                     <p className="text-[10px] text-slate-400 mt-0.5">Slide {idx + 1}</p>
                                   </div>
                                   <button
                                     type="button"
                                     onClick={async () => {
                                       let curr = [];
                                       try { curr = JSON.parse(appSettings.heroImages || '[]'); } catch {}
                                       const updated = curr.filter((_, i) => i !== idx);
                                       const newSettings = {...appSettings, heroImages: JSON.stringify(updated)};
                                       setAppSettings(newSettings);
                                       await updateSettings(newSettings);
                                     }}
                                     className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                                   >
                                     <Trash size={16} />
                                   </button>
                                 </div>
                               ));
                             })()}
                           </div>

                           {/* Upload */}
                           <label className="flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl cursor-pointer hover:bg-blue-100 transition font-black text-blue-700 text-sm">
                             <ImageIcon size={18} />
                             <span>Click to Upload New Slide</span>
                             <input
                               type="file"
                               accept="image/*"
                               className="hidden"
                               onChange={async (e) => {
                                 const file = e.target.files?.[0];
                                 if (!file) return;
                                 try {
                                   const url = await uploadImage(file);
                                   let curr = [];
                                   try { curr = JSON.parse(appSettings.heroImages || '[]'); } catch {}
                                   const newItem = { id: Date.now().toString(), url };
                                   const newSettings = {...appSettings, heroImages: JSON.stringify([...curr, newItem])};
                                   setAppSettings(newSettings);
                                   await updateSettings(newSettings);
                                   e.target.value = '';
                                   alert('✅ Slide uploaded and saved!');
                                 } catch(err) {
                                   alert('Upload failed: ' + err.message);
                                 }
                               }}
                             />
                           </label>
                         </div>

                         {/* Promo Cards */}
                         <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                           <h3 className="font-black text-slate-800 text-lg mb-1 flex items-center gap-2"><ImageIcon size={20} className="text-purple-500" /> Promo Cards (below Flash Sale)</h3>
                           <p className="text-xs text-slate-400 font-bold mb-5 uppercase tracking-widest">4 promotional image cards shown inside the Flash Sale section</p>

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                             {(() => {
                               let cards = [];
                               try { cards = JSON.parse(appSettings.homePromoCards || '[]'); } catch {}
                               const slots = [...cards];
                               while (slots.length < 4) slots.push(null);
                               return slots.slice(0, 4).map((card, idx) => (
                                 <div key={card?.id || `slot-${idx}`}>
                                   {card ? (
                                     <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 group" style={{ aspectRatio: '3/2' }}>
                                       <img src={card.url} className="w-full h-full object-cover" alt="" />
                                       <button
                                         type="button"
                                         onClick={async () => {
                                           let curr = [];
                                           try { curr = JSON.parse(appSettings.homePromoCards || '[]'); } catch {}
                                           const updated = curr.filter(c => c.id !== card.id);
                                           const newSettings = {...appSettings, homePromoCards: JSON.stringify(updated)};
                                           setAppSettings(newSettings);
                                           await updateSettings(newSettings);
                                         }}
                                         className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                       >
                                         <Trash size={20} className="text-white" />
                                       </button>
                                       <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] font-black px-1.5 py-0.5 rounded">Card {idx+1}</span>
                                     </div>
                                   ) : (
                                     <label className="flex flex-col items-center justify-center gap-1 w-full border-2 border-dashed border-purple-200 bg-purple-50/60 rounded-2xl cursor-pointer hover:bg-purple-100 transition text-purple-400" style={{ aspectRatio: '3/2' }}>
                                       <Plus size={22} />
                                       <span className="text-[10px] font-black uppercase">Card {idx+1}</span>
                                       <input
                                         type="file"
                                         accept="image/*"
                                         className="hidden"
                                         onChange={async (e) => {
                                           const file = e.target.files?.[0];
                                           if (!file) return;
                                           try {
                                             const url = await uploadImage(file);
                                             let curr = [];
                                             try { curr = JSON.parse(appSettings.homePromoCards || '[]'); } catch {}
                                             const newItem = { id: Date.now().toString(), url };
                                             const newSettings = {...appSettings, homePromoCards: JSON.stringify([...curr, newItem])};
                                             setAppSettings(newSettings);
                                             await updateSettings(newSettings);
                                             e.target.value = '';
                                           } catch(err) {
                                             alert('Upload failed: ' + err.message);
                                           }
                                         }}
                                       />
                                     </label>
                                   )}
                                 </div>
                               ));
                             })()}
                           </div>
                           <p className="text-[11px] text-slate-400 font-bold">Click the + slot to upload. Hover image to delete. Saves automatically.</p>
                         </div>

                         {/* Delivery Section Image */}
                         <div className="bg-white p-6 border border-gray-100 rounded-[28px] shadow-sm">
                           <h3 className="font-black text-slate-800 text-lg mb-1 flex items-center gap-2"><Truck size={20} className="text-emerald-500" /> Delivery Trust Section Image</h3>
                           <p className="text-xs text-slate-400 font-bold mb-5 uppercase tracking-widest">Image shown on the right side of the Quality & Trust section</p>
                           <div className="flex gap-4 items-start">
                             <div className="flex-1">
                               <label className="flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed border-emerald-300 bg-emerald-50 rounded-2xl cursor-pointer hover:bg-emerald-100 transition font-black text-emerald-700 text-sm mb-3">
                                 <ImageIcon size={18} />
                                 <span>Upload Delivery Image</span>
                                 <input
                                   type="file"
                                   accept="image/*"
                                   className="hidden"
                                   onChange={async (e) => {
                                     const file = e.target.files?.[0];
                                     if (!file) return;
                                     try {
                                       const url = await uploadImage(file);
                                       const newSettings = {...appSettings, deliverySectionImage: url};
                                       setAppSettings(newSettings);
                                       await updateSettings(newSettings);
                                       alert('✅ Delivery section image uploaded!');
                                       e.target.value = '';
                                     } catch(err) {
                                       alert('Upload failed: ' + err.message);
                                     }
                                   }}
                                 />
                               </label>
                               <p className="text-xs text-slate-400">Or paste a URL directly:</p>
                               <input
                                 type="text"
                                 value={appSettings.deliverySectionImage || ''}
                                 onChange={e => setAppSettings({...appSettings, deliverySectionImage: e.target.value})}
                                 className="w-full mt-1 px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-emerald-400 outline-none font-bold text-sm"
                                 placeholder="https://..."
                               />
                             </div>
                             {appSettings.deliverySectionImage && (
                               <div className="w-32 h-24 rounded-xl overflow-hidden border-2 border-slate-200 flex-shrink-0">
                                 <img src={appSettings.deliverySectionImage} className="w-full h-full object-cover" alt="" />
                               </div>
                             )}
                           </div>
                           {appSettings.deliverySectionImage && (
                             <button
                               type="button"
                               onClick={async () => {
                                 const newSettings = {...appSettings, deliverySectionImage: ''};
                                 setAppSettings(newSettings);
                                 await updateSettings(newSettings);
                               }}
                               className="mt-3 text-xs text-red-500 font-black hover:underline"
                             >
                               Remove image
                             </button>
                           )}
                         </div>

                         {/* Save all */}
                         <button
                           onClick={async () => {
                             try {
                               await updateSettings(appSettings);
                               alert('✅ Media settings saved!');
                             } catch(e) {
                               alert('Failed: ' + e.message);
                             }
                           }}
                           className="w-full bg-[var(--secondary)] text-white py-4 rounded-2xl font-black shadow-lg hover:opacity-90 transition"
                         >
                           Save All Media Settings
                         </button>
                       </div>
                     </div>
                   )}

                 </>
              )}
           </div>
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form 
            key={editingProduct?.id || 'new'} 
            onSubmit={handleSaveProduct} 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-up"
          >
            <div className="p-8 border-b flex justify-between items-center bg-slate-900 text-white rounded-t-3xl">
               <h2 className="text-2xl font-black">{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
               <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-white/60 hover:text-white bg-white/10 p-2 rounded-full">X</button>
            </div>
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Product Name</label>
                   <input required name="name" defaultValue={editingProduct?.name} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900" />
                 </div>
                 <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Product Images (Multiple)</label>
                    <div className="flex flex-col gap-3">
                       <div className="flex flex-wrap gap-2 mb-1">
                          {imagePreviews.length > 0 ? (
                             imagePreviews.map((prev, idx) => (
                                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-100 group">
                                   <img src={prev} className="w-full h-full object-cover" />
                                   <button 
                                      type="button" 
                                      onClick={() => {
                                         setImageFiles(imageFiles.filter((_, i) => i !== idx));
                                         setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
                                      }}
                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                                   >
                                      <Trash size={14} />
                                   </button>
                                </div>
                             ))
                          ) : editingProduct?.images ? (
                             (() => {
                                try {
                                   const imgs = JSON.parse(editingProduct.images);
                                   return imgs.map((img, idx) => (
                                      <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-100">
                                         <img src={img} className="w-full h-full object-cover" alt="product" />
                                      </div>
                                   ));
                                } catch (e) { return null; }
                             })()
                          ) : (
                             <div className="w-full h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                <Plus size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest ml-2">No Images</span>
                             </div>
                          )}
                       </div>
                       <div className="flex gap-2">
                          <input 
                             type="file" 
                             id="productImages"
                             multiple
                             accept="image/*"
                             onChange={(e) => {
                                const files = Array.from(e.target.files);
                                if (files.length > 0) {
                                   setImageFiles([...imageFiles, ...files]);
                                   setImagePreviews([...imagePreviews, ...files.map(f => URL.createObjectURL(f))]);
                                }
                             }}
                             className="hidden" 
                          />
                          <label htmlFor="productImages" className="flex-1 text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] cursor-pointer uppercase tracking-wider">
                             Add Images
                          </label>
                          <input name="image" className="flex-1 px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-[10px]" placeholder="Or URL..." />
                       </div>
                    </div>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Product Description</label>
                  <textarea name="description" defaultValue={editingProduct?.description} rows="3" className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900 resize-none"></textarea>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Category</label>
                    <select required name="categoryId" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold bg-white text-slate-900">
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Sub Category</label>
                    <select 
                      name="subCategoryId" 
                      defaultValue={editingProduct?.subCategoryId || ''}
                      required={categories.find(c => c.id === selectedCategoryId)?.subcategories?.length > 0}
                      className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold bg-white text-slate-900"
                    >
                      {categories.find(c => c.id === selectedCategoryId) ? (
                        categories.find(c => c.id === selectedCategoryId).subcategories?.length > 0 ? (
                          <>
                            <option value="">Select Sub Category</option>
                            {categories.find(c => c.id === selectedCategoryId).subcategories.map(sub => (
                              <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                          </>
                        ) : <option value="">No subcategories</option>
                      ) : <option value="">First select category</option>}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Customer Type</label>
                    <select name="customerType" value={customerType} onChange={(e) => setCustomerType(e.target.value)} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold bg-white text-slate-900">
                       <option value="BOTH">Both</option>
                       <option value="NORMAL">Normal (B2C)</option>
                       <option value="BUSINESS">Business (B2B)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Unit (e.g. 500g, 1L)</label>
                    <input required name="unit" defaultValue={editingProduct?.unit} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Packaging Size</label>
                    <input name="packagingSize" defaultValue={editingProduct?.packagingSize} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-slate-900" placeholder="e.g. Pack of 24" />
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Rate / Unit <span className="text-emerald-600">(Shown prominently on product cards)</span></label>
                 <input name="ratePerUnit" defaultValue={editingProduct?.ratePerUnit} className="w-full px-5 py-4 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-900 bg-emerald-50" placeholder="e.g. Rs25/kg, Rs5/piece, Rs120/litre" />
                 <p className="text-[10px] text-slate-400 mt-1.5 font-bold">Shown big and bold on product cards to attract customers quickly. Unit is retained in the database but not displayed on cards.</p>
               </div>

               {(customerType === 'BOTH' || customerType === 'NORMAL') && (
                  <div className="grid grid-cols-2 gap-6 p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                    <div className="col-span-2"><h4 className="font-black text-emerald-800 text-xs uppercase tracking-widest">B2C Pricing (Retail)</h4></div>
                    <div>
                      <label className="block text-xs font-black text-emerald-600 mb-1 uppercase">Old Price (₹)</label>
                      <input type="number" step="0.01" name="b2cOldPrice" defaultValue={editingProduct?.b2cOldPrice} className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-emerald-600 mb-1 uppercase">New Price (₹)</label>
                      <input type="number" step="0.01" name="b2cNewPrice" defaultValue={editingProduct?.b2cNewPrice} className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl outline-none font-bold" />
                    </div>
                  </div>
               )}

               {(customerType === 'BOTH' || customerType === 'BUSINESS') && (
                  <div className="flex flex-col gap-6 p-6 bg-indigo-50 rounded-2xl border-2 border-indigo-100">
                    <div className="flex justify-between items-center">
                       <h4 className="font-black text-indigo-800 text-xs uppercase tracking-widest">B2B Wholesale Strategy</h4>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-black text-indigo-600 mb-1 uppercase">Base Price (₹)</label>
                        <input type="number" step="0.01" name="b2bNewPrice" defaultValue={editingProduct?.b2bNewPrice} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl outline-none font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-indigo-600 mb-1 uppercase">Retail Reference (₹)</label>
                        <input type="number" step="0.01" name="b2bOldPrice" defaultValue={editingProduct?.b2bOldPrice} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl outline-none font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-indigo-600 mb-1 uppercase">Min Order (MOQ)</label>
                        <input type="number" name="minB2BQty" defaultValue={editingProduct?.minB2BQty || 1} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl outline-none font-bold" />
                      </div>
                    </div>

                    {/* DYNAMIC TIER MANAGER */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-center bg-indigo-900 text-white px-4 py-3 rounded-2xl">
                          <div className="flex items-center gap-2">
                             <LayoutGrid size={16} className="text-indigo-300" />
                             <span className="text-xs font-black uppercase tracking-widest">Volume Pricing Tiers</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setB2bTiers([...b2bTiers, { minQty: '', price: '' }])}
                            className="bg-indigo-700 hover:bg-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Plus size={12} /> Add Pricing Tier
                          </button>
                       </div>
                       
                       <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                          {b2bTiers.length === 0 && (
                             <div className="text-center py-6 border-2 border-dashed border-indigo-200 rounded-2xl">
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">No bulk discounts set</p>
                             </div>
                          )}
                          
                          {b2bTiers.map((tier, idx) => (
                             <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-indigo-100 shadow-sm animate-fade-in">
                                <div className="flex-1">
                                   <label className="text-[9px] font-black text-indigo-400 uppercase ml-1">Purchases {`>`}</label>
                                   <input 
                                      type="number" 
                                      placeholder="Qty" 
                                      value={tier.minQty} 
                                      onChange={(e) => {
                                         const newTiers = [...b2bTiers];
                                         newTiers[idx].minQty = Number(e.target.value);
                                         setB2bTiers(newTiers);
                                      }}
                                      className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg text-sm font-bold focus:border-indigo-500 outline-none transition"
                                   />
                                </div>
                                <div className="flex-1">
                                   <label className="text-[9px] font-black text-indigo-400 uppercase ml-1">Price per unit (₹)</label>
                                   <input 
                                      type="number" 
                                      step="0.01" 
                                      placeholder="Price" 
                                      value={tier.price} 
                                      onChange={(e) => {
                                         const newTiers = [...b2bTiers];
                                         newTiers[idx].price = Number(e.target.value);
                                         setB2bTiers(newTiers);
                                      }}
                                      className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg text-sm font-bold focus:border-indigo-500 outline-none transition"
                                   />
                                </div>
                                <button 
                                   type="button"
                                   onClick={() => setB2bTiers(b2bTiers.filter((_, i) => i !== idx))}
                                   className="mt-4 p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                   <Trash size={16} />
                                </button>
                             </div>
                          ))}
                       </div>
                       
                       <p className="text-[10px] text-indigo-400 font-bold italic px-2">
                          Note: Customers will get the best price based on the highest quantity threshold they cross.
                       </p>
                    </div>
                  </div>
               )}

               {/* MULTI-VARIANT PACKAGING MANAGER */}
               <div className="flex flex-col gap-6 p-6 bg-purple-50/60 rounded-2xl border-2 border-purple-100">
                 <div className="flex justify-between items-center bg-purple-950 text-white px-5 py-4 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2">
                       <LayoutGrid size={18} className="text-purple-300 animate-pulse" />
                       <span className="text-xs font-black uppercase tracking-widest">Multi-Variant Packaging & Sizes</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setProductVariants([...productVariants, { id: 'v_' + Date.now() + Math.random().toString(36).substr(2, 5), size: '', b2cOldPrice: '', b2cNewPrice: '', b2bOldPrice: '', b2bNewPrice: '', stock: 100, minB2BQty: 1 }])}
                      className="bg-purple-700 hover:bg-purple-600 text-white text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <Plus size={14} /> Add Packaging Variant
                    </button>
                 </div>
                 
                 <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {productVariants.length === 0 && (
                       <div className="text-center py-8 border-2 border-dashed border-purple-200 rounded-2xl bg-white/50">
                          <p className="text-xs text-purple-400 font-black uppercase tracking-widest">No packaging variants configured</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-bold">Configure multiple weights, sizes, or bundle quantities under the same product.</p>
                       </div>
                    )}
                    
                    {productVariants.map((v, idx) => (
                       <div key={v.id || idx} className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm relative space-y-4 animate-fade-in text-slate-950">
                          <button 
                             type="button"
                             onClick={() => setProductVariants(productVariants.filter((_, i) => i !== idx))}
                             className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                             <Trash size={16} />
                          </button>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             <div className="col-span-2">
                                <label className="block text-[9px] font-black text-purple-700 uppercase ml-1">Variant Size / Weight (e.g. 500g, 1kg, Pack of 6)</label>
                                <input 
                                   required
                                   type="text" 
                                   placeholder="e.g. 1kg" 
                                   value={v.size || ''} 
                                   onChange={(e) => {
                                      const updated = [...productVariants];
                                      updated[idx].size = e.target.value;
                                      setProductVariants(updated);
                                   }}
                                   className="w-full mt-1 px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg text-sm font-bold focus:border-purple-500 outline-none transition text-slate-900"
                                />
                             </div>
                             <div>
                                <label className="block text-[9px] font-black text-purple-700 uppercase ml-1">Stock</label>
                                <input 
                                   type="number" 
                                   placeholder="100" 
                                   value={v.stock ?? 100} 
                                   onChange={(e) => {
                                      const updated = [...productVariants];
                                      updated[idx].stock = Number(e.target.value);
                                      setProductVariants(updated);
                                   }}
                                   className="w-full mt-1 px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg text-sm font-bold focus:border-purple-500 outline-none transition text-slate-900"
                                />
                             </div>
                             <div>
                                <label className="block text-[9px] font-black text-purple-700 uppercase ml-1">Min B2B Qty</label>
                                <input 
                                   type="number" 
                                   placeholder="1" 
                                   value={v.minB2BQty ?? 1} 
                                   onChange={(e) => {
                                      const updated = [...productVariants];
                                      updated[idx].minB2BQty = Number(e.target.value);
                                      setProductVariants(updated);
                                   }}
                                   className="w-full mt-1 px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg text-sm font-bold focus:border-purple-500 outline-none transition text-slate-900"
                                />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-dashed border-slate-100">
                             <div>
                                <label className="block text-[9px] font-black text-emerald-600 uppercase ml-1">B2C Old Price (₹)</label>
                                <input 
                                   type="number" 
                                   step="0.01"
                                   placeholder="MRP" 
                                   value={v.b2cOldPrice ?? ''} 
                                   onChange={(e) => {
                                      const updated = [...productVariants];
                                      updated[idx].b2cOldPrice = e.target.value === '' ? '' : Number(e.target.value);
                                      setProductVariants(updated);
                                   }}
                                   className="w-full mt-1 px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg text-sm font-bold focus:border-emerald-500 outline-none transition text-slate-900"
                                />
                             </div>
                             <div>
                                <label className="block text-[9px] font-black text-emerald-600 uppercase ml-1">B2C New Price (₹)</label>
                                <input 
                                   type="number" 
                                   step="0.01"
                                   placeholder="Offer Price" 
                                   value={v.b2cNewPrice ?? ''} 
                                   onChange={(e) => {
                                      const updated = [...productVariants];
                                      updated[idx].b2cNewPrice = e.target.value === '' ? '' : Number(e.target.value);
                                      setProductVariants(updated);
                                   }}
                                   className="w-full mt-1 px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg text-sm font-bold focus:border-emerald-500 outline-none transition text-slate-900"
                                />
                             </div>
                             {(customerType === 'BOTH' || customerType === 'BUSINESS') && (
                                <>
                                   <div>
                                      <label className="block text-[9px] font-black text-indigo-600 uppercase ml-1">B2B Reference (₹)</label>
                                      <input 
                                         type="number" 
                                         step="0.01"
                                         placeholder="Retail Price" 
                                         value={v.b2bOldPrice ?? ''} 
                                         onChange={(e) => {
                                            const updated = [...productVariants];
                                            updated[idx].b2bOldPrice = e.target.value === '' ? '' : Number(e.target.value);
                                            setProductVariants(updated);
                                         }}
                                         className="w-full mt-1 px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg text-sm font-bold focus:border-indigo-500 outline-none transition text-slate-900"
                                      />
                                   </div>
                                   <div>
                                      <label className="block text-[9px] font-black text-indigo-600 uppercase ml-1">B2B Wholesale Price (₹)</label>
                                      <input 
                                         type="number" 
                                         step="0.01"
                                         placeholder="Wholesale" 
                                         value={v.b2bNewPrice ?? ''} 
                                         onChange={(e) => {
                                            const updated = [...productVariants];
                                            updated[idx].b2bNewPrice = e.target.value === '' ? '' : Number(e.target.value);
                                            setProductVariants(updated);
                                         }}
                                         className="w-full mt-1 px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-lg text-sm font-bold focus:border-indigo-500 outline-none transition text-slate-900"
                                      />
                                   </div>
                                </>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <p className="text-[10px] text-purple-600 font-bold italic px-2">
                    Note: If variants are configured, the dropdown selector will automatically appear on the storefront.
                 </p>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Assign to Particular Store (Optional)</label>
                   <select name="storeId" defaultValue={editingProduct?.storeId || ''} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold bg-white text-slate-900">
                      <option value="">No - Only show in Category</option>
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

               <div className="flex flex-wrap gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                   <div className="flex items-center gap-3">
                      <input type="checkbox" name="isFlashSale" id="flashSale" defaultChecked={editingProduct?.isFlashSale} className="w-5 h-5 accent-[var(--secondary)]" />
                      <label htmlFor="flashSale" className="font-black cursor-pointer text-sm">Feature in Flash Sale</label>
                   </div>
                   <div className="flex items-center gap-3">
                      <input type="checkbox" name="isBulkOnly" id="isBulkOnly" defaultChecked={editingProduct?.isBulkOnly} className="w-5 h-5 accent-amber-500" />
                      <label htmlFor="isBulkOnly" className="font-black cursor-pointer text-sm text-amber-700">📦 Mark as Bulk Only</label>
                   </div>
                </div>

            </div>
            <div className="p-8 bg-slate-50 border-t rounded-b-3xl flex justify-end gap-4">
               <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-8 py-4 font-black text-slate-600">Cancel</button>
               <button type="submit" className="bg-[var(--secondary)] text-white px-10 py-4 rounded-xl font-black">Save Product</button>
            </div>
          </form>
        </div>
      )}

      {/* Store Modal */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleSaveStore} className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b flex justify-between items-center bg-slate-900 text-white rounded-t-3xl">
               <h2 className="text-2xl font-black">{editingStore ? 'Edit Store' : 'Create Speciality Store'}</h2>
               <button type="button" onClick={() => setIsStoreModalOpen(false)} className="text-white/60 hover:text-white bg-white/10 p-2 rounded-full">X</button>
            </div>
            <div className="p-8 space-y-6">
               <div>
                 <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Store Name</label>
                 <input required name="name" defaultValue={editingStore?.name} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-900" />
               </div>
               <div>
                 <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Subtitle</label>
                 <input required name="subtitle" defaultValue={editingStore?.subtitle} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-900" />
               </div>
               <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Store Image</label>
                  <div className="flex flex-col gap-3">
                    {imagePreview || editingStore?.image ? (
                      <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-slate-100 mb-1">
                        <img src={imagePreview || editingStore.image} className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <div className="flex gap-2">
                       <input type="file" id="storeImage" accept="image/*" onChange={e => {
                         const file = e.target.files[0];
                         if(file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                       }} className="hidden" />
                       <label htmlFor="storeImage" className="flex-1 text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] cursor-pointer uppercase">Upload</label>
                       <input name="image" defaultValue={editingStore?.image || ''} className="flex-[2] px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-xs" placeholder="Or URL..." />
                    </div>
                  </div>
               </div>

               {/* Sections to show inside this store */}
               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                 <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wide">Sections to Show in Store Page</label>
                 <p className="text-[10px] text-slate-400 font-bold mb-4">Select which product sections appear when customers visit this store.</p>
                 {(() => {
                   let currentSections = [];
                   try { currentSections = editingStore?.visibleSections ? JSON.parse(editingStore.visibleSections) : ['trending','latest','mostPurchased']; } catch { currentSections = ['trending','latest','mostPurchased']; }
                   const allSections = [
                     { key: 'trending', label: '🔥 Trending Products' },
                     { key: 'latest', label: '✨ Just Arrived (Latest)' },
                     { key: 'mostPurchased', label: '⭐ Most Purchased' },
                     { key: 'flashSale', label: '⚡ Flash Sale Items' },
                     { key: 'categories', label: '🗂️ Category Browsing' },
                   ];
                   return (
                     <div className="space-y-2">
                       {allSections.map(sec => (
                         <label key={sec.key} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-[var(--secondary)] transition-colors">
                           <input
                             type="checkbox"
                             name={`section_${sec.key}`}
                             defaultChecked={currentSections.includes(sec.key)}
                             className="w-4 h-4 accent-[var(--secondary)]"
                           />
                           <span className="font-bold text-sm text-slate-700">{sec.label}</span>
                         </label>
                       ))}
                     </div>
                   );
                 })()}
               </div>
            </div>
            <div className="p-8 bg-slate-50 border-t rounded-b-3xl flex justify-end gap-4">
               <button type="button" onClick={() => setIsStoreModalOpen(false)} className="px-8 py-4 font-black text-slate-600">Cancel</button>
               <button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black">Save Store</button>
            </div>
          </form>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleSaveCategory} className="bg-white rounded-3xl max-w-sm w-full shadow-2xl animate-fade-up">
            <div className="p-8 border-b bg-emerald-600 text-white rounded-t-3xl">
               <h2 className="text-2xl font-black">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
            </div>
            <div className="p-8 space-y-6">
               <div>
                 <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Name</label>
                 <input required name="name" defaultValue={editingCategory?.name} className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl font-bold" />
               </div>
               <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Category Image</label>
                  <div className="flex flex-col gap-3">
                    {imagePreview || editingCategory?.image ? (
                      <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-slate-100 mb-1">
                        <img src={imagePreview || editingCategory.image} className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <div className="flex gap-2">
                       <input type="file" id="catImage" accept="image/*" onChange={e => {
                         const file = e.target.files[0];
                         if(file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                       }} className="hidden" />
                       <label htmlFor="catImage" className="flex-1 text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] cursor-pointer uppercase">Upload</label>
                       <input name="image" defaultValue={editingCategory?.image || ''} className="flex-[2] px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[var(--secondary)] outline-none font-bold text-xs" placeholder="Or URL..." />
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                 <input type="checkbox" name="isVegetable" id="isVegetableNew" defaultChecked={editingCategory?.isVegetable} className="w-5 h-5 accent-green-600" />
                 <label htmlFor="isVegetableNew" className="cursor-pointer block">
                   <span className="font-black text-green-800 text-sm block">🥦 Mark as Vegetable Category</span>
                   <span className="text-xs text-green-600 font-medium block">Products in this category will have slot-based delivery options</span>
                 </label>
               </div>
            </div>
            <div className="p-8 bg-slate-50 flex justify-end gap-4 rounded-b-3xl">
               <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="font-bold">Cancel</button>
               <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black">{editingCategory ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      {/* SubCategory Modal */}
      {isSubCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleSaveSubCategory} className="bg-white rounded-3xl max-w-sm w-full shadow-2xl animate-fade-up">
            <div className="p-8 border-b bg-emerald-600 text-white rounded-t-3xl">
               <h2 className="text-2xl font-black">New Subcategory</h2>
               <p className="text-xs font-bold opacity-80 mt-1 uppercase tracking-widest text-white/90">Category: {categories.find(c => c.id === currentSubCatCategoryId)?.name}</p>
            </div>
            <div className="p-8 space-y-6">
               <div>
                 <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Name</label>
                 <input required name="name" className="w-full px-5 py-4 border-2 border-slate-100 rounded-xl font-bold" placeholder="e.g. Toned Milk" />
               </div>
            </div>
            <div className="p-8 bg-slate-50 flex justify-end gap-4 rounded-b-3xl">
               <button type="button" onClick={() => setIsSubCategoryModalOpen(false)} className="font-bold">Cancel</button>
               <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black">Add Subcategory</button>
            </div>
          </form>
        </div>
      )}

      {/* Delivery Agent Modal */}
      {isAgentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleCreateAgent} className="bg-white rounded-[32px] max-w-sm w-full shadow-2xl animate-fade-up overflow-hidden">
            <div className="p-8 border-b bg-slate-900 text-white">
               <h2 className="text-2xl font-black">Add Delivery Agent</h2>
               <p className="text-xs font-bold opacity-60 mt-1 uppercase">Create Login Credentials</p>
            </div>
            <div className="p-8 space-y-5">
               <div>
                 <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-wide">Full Name</label>
                 <input required name="name" className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-slate-900 transition" placeholder="John Doe" />
               </div>
               <div>
                 <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-wide">Phone Number (Login ID)</label>
                 <input required name="phone" className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-slate-900 transition" placeholder="9876543210" />
               </div>
               <div>
                 <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-wide">Password</label>
                 <input required type="password" name="password" className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-slate-900 transition" placeholder="••••••••" />
               </div>
            </div>
            <div className="p-8 bg-slate-50 flex justify-end gap-4">
               <button type="button" onClick={() => setIsAgentModalOpen(false)} className="font-bold text-slate-400">Cancel</button>
               <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black shadow-lg">Create Agent</button>
            </div>
          </form>
        </div>
      )}

      {/* Value Pack Modal */}
      {isValuePackModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-2xl shadow-2xl animate-fade-in max-h-[95vh] overflow-y-auto border border-white">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900">{editingValuePack ? 'Edit Value Pack' : 'New Value Pack'}</h3>
                <button onClick={() => setIsValuePackModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><Plus className="rotate-45" size={28} /></button>
             </div>
             
             <form onSubmit={handleSaveValuePack} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div>
                        <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Pack Name</label>
                        <input required name="name" defaultValue={editingValuePack?.name} placeholder="e.g. Monthly Grocery Stack" className="w-full mt-1 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold focus:border-blue-400 transition" />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Description</label>
                        <textarea name="description" defaultValue={editingValuePack?.description} placeholder="What's in this pack?" className="w-full mt-1 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold focus:border-blue-400 transition h-24" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                           <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Bundle Price (₹)</label>
                           <input type="number" value={packItems.reduce((sum, item) => sum + (Number(item.price || 0) * item.quantity), 0)} readOnly className="w-full mt-1 p-4 rounded-2xl bg-slate-100 border-2 border-slate-100 outline-none font-black text-blue-600 cursor-not-allowed" />
                           <p className="text-[9px] text-blue-500 font-bold mt-1 uppercase tracking-widest">Auto-calculated from items</p>
                         </div>
                         <div>
                           <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Original Total (₹)</label>
                           <input type="number" value={packItems.reduce((sum, item) => sum + (Number(item.previousPrice || item.price || 0) * item.quantity), 0)} readOnly className="w-full mt-1 p-4 rounded-2xl bg-slate-100 border-2 border-slate-100 outline-none font-black text-slate-500 cursor-not-allowed" />
                           <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Sum of previous prices</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                           <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Stock</label>
                           <input required type="number" name="stock" defaultValue={editingValuePack?.stock || 100} className="w-full mt-1 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold" />
                         </div>
                         <div>
                           <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Status</label>
                           <select name="isActive" defaultValue={editingValuePack ? (editingValuePack.isActive ? 'true' : 'false') : 'true'} className="w-full mt-1 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold">
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                           </select>
                         </div>
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Pack Image (URL)</label>
                        <div className="flex gap-2">
                           <input id="packImageInput" name="image" defaultValue={editingValuePack?.image} placeholder="https://..." className="flex-1 mt-1 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold focus:border-blue-400 transition" />
                           <div className="relative inline-block mt-1">
                              <button type="button" className="h-full bg-slate-100 px-4 rounded-2xl font-black text-xs text-slate-500 uppercase hover:bg-slate-200 transition">Upload</button>
                              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={async (e) => {
                                   if(!e.target.files[0]) return;
                                   const url = await uploadImage(e.target.files[0]);
                                   document.getElementById('packImageInput').value = url;
                                }}
                              />
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-100 flex flex-col h-full">
                      <h4 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2"><Disc size={16}/> Included Products</h4>
                      
                      <div className="mb-4">
                         <select 
                           className="w-full p-3 rounded-xl bg-white border-2 border-slate-100 outline-none font-bold text-sm"
                           onChange={(e) => {
                              const pId = e.target.value;
                              if (!pId) return;
                              const p = products.find(x => x.id === pId);
                              if (p) {
                                 setPackItems(prev => {
                                    const existing = prev.find(i => i.productId === p.id);
                                    if (existing) return prev;
                                    return [...prev, { 
                                       productId: p.id, 
                                       name: p.name, 
                                       price: p.b2cNewPrice || p.price, 
                                       previousPrice: p.b2cOldPrice || p.b2cNewPrice || p.price,
                                       quantity: 1, 
                                       unit: p.unit 
                                    }];
                                 });
                              }
                              e.target.value = "";
                           }}
                         >
                            <option value="">+ Add Product to Pack</option>
                            {products.filter(p => !p.isBulkOnly).map(p => (
                               <option key={p.id} value={p.id}>{p.name} (₹{p.b2cNewPrice || p.price})</option>
                            ))}
                         </select>
                      </div>

                      <div className="flex-grow space-y-3 overflow-y-auto max-h-[300px] pr-2">
                         {Array.isArray(packItems) && packItems.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 group transition-all hover:border-blue-200">
                               <div className="flex items-center justify-between">
                                  <div className="flex-grow min-w-0 mr-3">
                                     <p className="font-black text-slate-800 text-sm truncate">{item.name}</p>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.unit}</p>
                                  </div>
                                  <button type="button" onClick={() => setPackItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 transition"><Trash size={16}/></button>
                               </div>
                               
                               <div className="grid grid-cols-2 gap-3">
                                  <div>
                                     <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Pack Price (₹)</label>
                                     <input 
                                        type="number" 
                                        value={item.price} 
                                        onChange={(e) => {
                                           const newItems = [...packItems];
                                           newItems[idx].price = Number(e.target.value);
                                           setPackItems(newItems);
                                        }}
                                        className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black focus:border-blue-400 outline-none transition"
                                     />
                                  </div>
                                  <div>
                                     <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Prev Price (₹)</label>
                                     <input 
                                        type="number" 
                                        value={item.previousPrice || item.price} 
                                        onChange={(e) => {
                                           const newItems = [...packItems];
                                           newItems[idx].previousPrice = Number(e.target.value);
                                           setPackItems(newItems);
                                        }}
                                        className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-500 focus:border-slate-300 outline-none transition"
                                     />
                                  </div>
                               </div>

                               <div className="flex items-center justify-between pt-1">
                                  <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                     <button type="button" onClick={() => {
                                        setPackItems(prev => prev.map((it, i) => i === idx ? {...it, quantity: Math.max(1, it.quantity - 1)} : it));
                                     }} className="w-8 h-8 flex items-center justify-center font-black text-slate-400 hover:text-slate-600 transition">-</button>
                                     <span className="w-8 text-center font-black text-slate-700 text-xs">{item.quantity}</span>
                                     <button type="button" onClick={() => {
                                        setPackItems(prev => prev.map((it, i) => i === idx ? {...it, quantity: it.quantity + 1} : it));
                                     }} className="w-8 h-8 flex items-center justify-center font-black text-slate-400 hover:text-slate-600 transition">+</button>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-[9px] font-black text-slate-400 uppercase">Item Total</p>
                                     <p className="text-sm font-black text-slate-900">₹{(item.price * item.quantity).toFixed(0)}</p>
                                  </div>
                               </div>
                            </div>
                         ))}
                         {(!packItems || packItems.length === 0) && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                               <ShoppingBag size={40} className="mb-2 opacity-20" />
                               <p className="text-xs font-bold uppercase tracking-widest">Pack is empty</p>
                            </div>
                         )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-200">
                         <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                            <span>Bundle Savings</span>
                            <span className="text-emerald-500">₹{Math.max(0, packItems.reduce((sum, item) => sum + ((item.previousPrice || item.price) * item.quantity), 0) - packItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                         </div>
                         <div className="flex justify-between items-center text-slate-900 font-black">
                            <span className="text-sm">Total Bundle Value</span>
                            <span className="text-xl">₹{packItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsValuePackModalOpen(false)} className="flex-1 py-4 font-black rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition">Cancel</button>
                   <button type="submit" className="flex-1 py-4 font-black rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Save Value Pack</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto border border-white">
             <h3 className="text-2xl font-black mb-6 text-slate-900">{editingCoupon ? 'Edit Coupon' : 'New Coupon'}</h3>
             <form onSubmit={handleSaveCoupon} className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400">Coupon Code</label>
                  <input required name="code" defaultValue={editingCoupon?.code} placeholder="e.g. WELCOME50" className="w-full mt-1 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none uppercase font-black focus:border-blue-400 transistion text-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400">Discount Amount (₹)</label>
                  <input required type="number" name="discountAmount" defaultValue={editingCoupon?.discountAmount} placeholder="e.g. 50" className="w-full mt-1 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-black focus:border-blue-400 transition" />
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl mt-2 border border-slate-100">
                   <input type="checkbox" name="isPublic" defaultChecked={editingCoupon ? editingCoupon.isPublic : true} className="w-5 h-5 accent-blue-600" />
                   <span className="font-bold text-sm text-slate-700">Public (Visible at checkout)</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl mt-2 border border-slate-100">
                   <input type="checkbox" name="isActive" defaultChecked={editingCoupon ? editingCoupon.isActive : true} className="w-5 h-5 accent-emerald-500" />
                   <span className="font-bold text-sm text-slate-700">Active</span>
                </div>
                <div className="flex gap-3 mt-6">
                   <button type="button" onClick={() => setIsCouponModalOpen(false)} className="flex-1 py-4 font-black rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition">Cancel</button>
                   <button type="submit" className="flex-1 py-4 font-black rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Save Coupon</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* FOOTER PUSH */}
      <div className="h-20"></div>


    </div>
  );
}
export default Admin;

