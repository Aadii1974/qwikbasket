import React, { useState, useEffect } from 'react';
import { fetchBulkProducts, fetchSettings } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { 
  Package, TrendingDown, ChevronLeft, ShoppingBasket, 
  Sparkles, Info, ArrowRight, Zap, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

const BulkBasket = () => {
  useSEO({
    title: 'Build Your Bulk Basket – Wholesale Grocery Prices',
    description: 'Buy groceries in bulk at wholesale prices on Real Farms. Direct farm sourcing, zero middlemen. Perfect for homes, restaurants, and businesses.',
    canonical: '/bulk',
    keywords: ['bulk grocery India', 'wholesale grocery delivery', 'bulk order online', 'B2B grocery India', 'warehouse prices grocery', 'restaurant grocery supply', 'bulk vegetables', 'bulk dairy delivery'],
  });
  const navigate = useNavigate();
  const { 
    cartItems, bulkSubtotal, bulkSavings, bulkVolumeDiscount, 
    isBulkDiscountEligible, bulkThreshold, bulkPercentage 
  } = useCart();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appSettings, setAppSettings] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [ps, settings] = await Promise.all([fetchBulkProducts(), fetchSettings()]);
        setProducts(ps || []);
        setAppSettings(settings);
      } catch (err) {
        console.error('Bulk products loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const progress = Math.min((bulkSubtotal / bulkThreshold) * 100, 100);
  const remaining = Math.max(bulkThreshold - bulkSubtotal, 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
             <h1 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <ShoppingBasket className="text-blue-600" size={20} /> Build Your Basket
             </h1>
             <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Bulk Savings System</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* Savings HUD */}
        <div className="bg-slate-900 rounded-[24px] md:rounded-[32px] p-5 md:p-8 text-white relative overflow-hidden shadow-2xl mb-8">
           <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
           </div>

           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                 <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/40">Exclusive Bulk Rates</span>
                    {isBulkDiscountEligible && (
                       <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-bounce shadow-lg shadow-emerald-500/40">VIP Discount Applied</span>
                    )}
                 </div>
                 <h2 className="text-3xl md:text-5xl font-black mb-2">Save <span className="text-blue-400">Thousands</span> on Essentials</h2>
                 <p className="text-slate-400 font-medium text-sm md:text-base max-w-md">
                    We've sourced these products directly in massive quantities. Build your basket to unlock warehouse-level pricing.
                 </p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                 <div className="flex justify-between items-end mb-4">
                    <div>
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Current Savings</p>
                       <p className="text-4xl font-black text-emerald-400 mt-1">₹{(bulkSavings + bulkVolumeDiscount).toFixed(0)}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Bulk Subtotal</p>
                       <p className="text-2xl font-black text-white mt-1">₹{bulkSubtotal.toFixed(0)}</p>
                    </div>
                 </div>

                 {/* Progress Bar */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className={isBulkDiscountEligible ? 'text-emerald-400' : 'text-slate-400'}>
                          {isBulkDiscountEligible ? 'Goal Reached!' : `Add ₹${remaining.toFixed(0)} more`}
                       </span>
                       <span className="text-slate-400">Goal: ₹{bulkThreshold}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5 p-0.5">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={`h-full rounded-full ${isBulkDiscountEligible ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                       />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-2">
                       <Zap size={10} className="text-yellow-400" />
                       Unlock extra <span className="text-white">{bulkPercentage}% discount</span> on your entire bulk basket above ₹{bulkThreshold}.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Benefits Scrollable Row */}
        <div className="flex overflow-x-auto gap-4 mb-10 pb-4 snap-x custom-scrollbar">
           {[
              { icon: Zap, title: 'Direct Sourcing', desc: 'Sourced from the heart of production to give you farm-gate prices.', color: 'text-yellow-500', bg: 'bg-yellow-50' },
              { icon: Target, title: 'Zero Middleman', desc: 'No distributors, no extra margins. Just direct value passed to you.', color: 'text-red-500', bg: 'bg-red-50' },
              { icon: Sparkles, title: 'Volume Rewards', desc: 'The more you add, the more we shave off the final bill.', color: 'text-blue-500', bg: 'bg-blue-50' },
           ].map((b, i) => (
              <div key={i} className="min-w-[280px] sm:min-w-[320px] bg-white p-5 rounded-2xl border border-slate-100 flex items-start gap-4 snap-start shadow-sm">
                 <div className={`p-3 rounded-xl ${b.bg} ${b.color} flex-shrink-0`}>
                    <b.icon size={20} />
                 </div>
                 <div>
                    <h4 className="font-black text-slate-900 text-sm mb-0.5">{b.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{b.desc}</p>
                 </div>
              </div>
           ))}
        </div>

        {/* Product Grid */}
        <div className="mb-10">
           <div className="flex items-center justify-between mb-6">
              <div>
                 <h3 className="text-2xl font-black text-slate-900">Available in Bulk</h3>
                 <p className="text-sm font-medium text-slate-500">Add items to build your giant savings basket</p>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                 <span className="text-blue-700 font-black text-xs uppercase tracking-widest">{products.length} Products</span>
              </div>
           </div>

           {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                 {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-slate-200 animate-pulse rounded-2xl" />
                 ))}
              </div>
           ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                 <Package size={48} className="mx-auto text-slate-200 mb-4" />
                 <h3 className="text-xl font-black text-slate-400">No bulk products found</h3>
                 <p className="text-slate-500 font-medium">Our team is restocking the bulk warehouse. Check back soon!</p>
              </div>
           ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                 {products.map(p => (
                    <ProductCard key={p.id} product={p} allProducts={products} />
                 ))}
              </div>
           )}
        </div>
      </div>

      {/* Floating Cart Summary for Bulk Page */}
      <AnimatePresence>
         {bulkSubtotal > 0 && (
            <motion.div 
               initial={{ y: 100 }} 
               animate={{ y: 0 }} 
               exit={{ y: 100 }}
               className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg"
            >
               <div className="bg-slate-900 text-white rounded-[24px] shadow-2xl p-3 md:p-4 flex items-center justify-between border border-white/10 backdrop-blur-lg">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/40">
                        <ShoppingBasket size={20} className="md:w-6 md:h-6" />
                     </div>
                     <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Basket Total</p>
                        <p className="text-lg md:text-xl font-black text-white leading-tight">₹{bulkSubtotal.toFixed(0)}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <button 
                        onClick={() => navigate('/cart')}
                        className="bg-emerald-500 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/30"
                     >
                        View Basket <ArrowRight size={14} className="md:w-4 md:h-4" />
                     </button>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default BulkBasket;
