import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchStores, fetchHomeSections } from '../services/api';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Package, TrendingUp, Star, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useSEO from '../hooks/useSEO';

const THEMES = {
  default: { 
     bg: 'bg-slate-900', 
     loaderText: 'Opening Store...', 
     fallingItems: ['🛒', '✨', '🌿'], 
     overlay: 'bg-black/60',
     titleColor: 'text-white'
  },
};

// ── Section Row Component for Store ───────────────────────────────────────
const StoreSectionRow = ({ title, subtitle, icon: Icon, products, allProducts = [], accentColor = 'text-emerald-400' }) => {
  if (!products || products.length === 0) return null;
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${accentColor}`}>{subtitle}</span>
        <h3 className="text-xl md:text-2xl font-[900] text-white flex items-center gap-2">
          {Icon && <Icon size={18} className={accentColor} />}
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <ProductCard product={product} allProducts={allProducts} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const StorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  // Real data state
  const [storeDetails, setStoreDetails] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [homeSections, setHomeSections] = useState({ latest: [], trending: [], mostPurchased: [] });
  const [isLoading, setIsLoading] = useState(true);

  useSEO({
    title: storeDetails ? `${storeDetails.name} – Local Fresh Organic Grocery Store` : 'Local Real Farms Store',
    description: storeDetails 
      ? `Visit our local ${storeDetails.name} branch on Real Farms. Get lightning-fast, 45-60 min delivery of fresh organic groceries, dairy, and farm produce from this store.`
      : 'Explore your nearest Real Farms local organic grocery store for direct-to-farm deliveries.',
    canonical: `/store/${id}`,
    keywords: storeDetails ? [`Real Farms ${storeDetails.name}`, `organic grocery store near me`, `organic delivery ${storeDetails.name}`] : [],
  });

  // Parse visible sections from store
  const getVisibleSections = (store) => {
    if (!store) return ['trending', 'latest', 'mostPurchased'];
    try {
      return store.visibleSections ? JSON.parse(store.visibleSections) : ['trending', 'latest', 'mostPurchased'];
    } catch {
      return ['trending', 'latest', 'mostPurchased'];
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [psRaw, ss, sections] = await Promise.all([fetchProducts(), fetchStores(), fetchHomeSections()]);
        const currentStore = ss.find(s => s.id === id);
        
        let filteredProds = psRaw || [];
        if (user?.role === 'b2b') {
          filteredProds = filteredProds.filter(p => p.customerType === 'BUSINESS' || p.customerType === 'BOTH');
        } else if (user?.role === 'admin') {
          // Admin sees all
        } else {
          filteredProds = filteredProds.filter(p => p.customerType === 'NORMAL' || p.customerType === 'BOTH');
        }

        setStoreDetails(currentStore);
        setAllProducts(filteredProds);
        setStoreProducts(filteredProds.filter(p => p.storeId === id));
        
        // Filter sections to only show products from this store if they exist in store
        const storeProdsInSection = (sectionProds) =>
          sectionProds.filter(p => p.storeId === id).length > 0
            ? sectionProds.filter(p => p.storeId === id)
            : sectionProds.slice(0, 6); // Fallback: show top 6 global products
        
        setHomeSections({
          latest: storeProdsInSection(sections?.latest || []),
          trending: storeProdsInSection(sections?.trending || []),
          mostPurchased: storeProdsInSection(sections?.mostPurchased || []),
        });

      } catch (err) {
        console.error("Store loading error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();

    // 1. Trigger the physical unlock mechanism
    const unlockTimer = setTimeout(() => {
       setIsUnlocked(true);
    }, 1200);

    // 2. Open the physical shutter violently upwards
    const openTimer = setTimeout(() => {
      setIsStoreOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
    
    return () => { clearTimeout(unlockTimer); clearTimeout(openTimer); }
  }, [id]);

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse">Initializing Store...</div>;
  if (!storeDetails) return <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center text-slate-800 p-8 text-center"><h2 className="text-3xl font-black mb-4">Store Not Found</h2><button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Back to Home</button></div>;

  const visibleSections = getVisibleSections(storeDetails);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Dark overlay */}
      <div className="absolute inset-0 z-0 bg-black/60" />

      {/* METALLIC SHUTTER LOADER */}
      <AnimatePresence>
        {!isStoreOpen && (
          <motion.div 
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1.0, ease: [0.8, 0, 0.2, 1] }}
            className="fixed inset-0 z-[60] bg-slate-800 flex flex-col items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
             {/* Realistic Metallic Slats Background */}
             <div className="absolute inset-0 flex flex-col w-full h-full pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                   <div key={i} className="flex-1 w-full border-b-[3px] border-slate-950/80 border-t border-slate-600/30 bg-gradient-to-b from-slate-700 to-slate-900 max-h-[5vh]"></div>
                ))}
             </div>
             
             {/* Central Store Signage Plate */}
             <div className="z-20 relative bg-gradient-to-b from-slate-300 to-slate-500 p-2 md:p-3 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] border-2 border-slate-400 min-w-[300px] md:min-w-[500px]">
                 <div className="bg-slate-950 py-10 px-6 md:px-12 md:py-14 rounded-2xl border-[6px] border-slate-800 flex flex-col items-center shadow-inner relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none skew-y-6 transform origin-top-left"></div>

                     <motion.div 
                        animate={isUnlocked ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-6 border-4 shadow-2xl z-10 ${isUnlocked ? 'bg-gradient-to-tr from-green-500 to-green-300 border-green-700 shadow-[0_0_40px_rgba(34,197,94,0.6)]' : 'bg-gradient-to-tr from-yellow-500 to-yellow-300 border-yellow-700 shadow-[0_0_40px_rgba(234,179,8,0.4)]'}`}
                     >
                        {isUnlocked ? <Unlock className="text-slate-900" size={36} strokeWidth={3} /> : <Lock className="text-slate-900" size={36} strokeWidth={3} />}
                     </motion.div>

                     <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-widest uppercase text-center mb-3 drop-shadow-md z-10">
                         {storeDetails.name}
                     </h2>
                     <p className={`font-black text-sm md:text-lg tracking-widest uppercase z-10 ${isUnlocked ? 'text-green-400' : 'text-yellow-400 animate-pulse'}`}>
                         {isUnlocked ? 'Store Unlocked' : 'Loading Store...'}
                     </p>
                 </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STOREFRONT UI */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
         {/* Store Signage */}
         <motion.div 
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: isStoreOpen ? 1 : 0, y: isStoreOpen ? 0 : 50 }}
           transition={{ duration: 0.8, delay: 0.5 }}
           className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] mb-10 shadow-2xl overflow-hidden"
         >
           {/* Store image — plain, full width, no overlay text */}
           {storeDetails.image ? (
             <div className="w-full relative" style={{ height: 'clamp(180px, 35vw, 400px)' }}>
               <img
                 src={storeDetails.image}
                 alt={storeDetails.name}
                 className="w-full h-full object-cover"
               />
               {/* Very subtle gradient for text legibility */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
               <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                 <h1 className="text-3xl md:text-6xl font-[900] text-white tracking-tighter mb-2 drop-shadow-lg">
                   {storeDetails.name}
                 </h1>
                 {storeDetails.subtitle && (
                   <p className="text-white/80 text-base md:text-xl font-semibold">{storeDetails.subtitle}</p>
                 )}
               </div>
             </div>
           ) : (
             <div className="p-8 md:p-12">
               <h1 className="text-3xl md:text-6xl font-[900] text-white tracking-tighter mb-2">{storeDetails.name}</h1>
               {storeDetails.subtitle && <p className="text-white/80 text-lg">{storeDetails.subtitle}</p>}
             </div>
           )}
         </motion.div>

         {/* Product Sections */}
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: isStoreOpen ? 1 : 0 }}
           transition={{ duration: 1, delay: 1 }}
         >
           {/* Back button */}
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-black text-white tracking-tight">Available in Store</h2>
             <button onClick={() => navigate('/#stores')} className="text-white/80 hover:text-white font-bold bg-white/10 px-6 py-3 rounded-xl transition">← Back</button>
           </div>

           {/* Direct store products (storeId matches) */}
           {storeProducts.length > 0 && (
             <StoreSectionRow
               title="All Products"
               subtitle="In This Store"
               icon={Package}
               products={storeProducts}
               allProducts={allProducts}
               accentColor="text-emerald-400"
             />
           )}

           {/* Conditional sections based on admin's visibleSections config */}
           {visibleSections.includes('trending') && homeSections.trending.length > 0 && (
             <StoreSectionRow
               title="Trending"
               subtitle="Hot Right Now"
               icon={TrendingUp}
               products={homeSections.trending}
               allProducts={allProducts}
               accentColor="text-orange-400"
             />
           )}

           {visibleSections.includes('latest') && homeSections.latest.length > 0 && (
             <StoreSectionRow
               title="Just Arrived"
               subtitle="Latest Products"
               icon={Package}
               products={homeSections.latest}
               allProducts={allProducts}
               accentColor="text-indigo-400"
             />
           )}

           {visibleSections.includes('mostPurchased') && homeSections.mostPurchased.length > 0 && (
             <StoreSectionRow
               title="Crowd Favorites"
               subtitle="Most Purchased"
               icon={Star}
               products={homeSections.mostPurchased}
               allProducts={allProducts}
               accentColor="text-amber-400"
             />
           )}

           {/* Empty state */}
           {storeProducts.length === 0 && !visibleSections.some(s => homeSections[s]?.length > 0) && (
             <div className="py-24 text-center">
               <Package size={48} className="text-white/20 mx-auto mb-4" />
               <p className="text-white/30 text-lg font-black uppercase tracking-[0.3em]">No Products Yet</p>
               <p className="text-white/20 text-sm font-medium mt-2">Products assigned to this store will appear here</p>
             </div>
           )}
         </motion.div>
      </div>

    </div>
  );
};

export default StorePage;
