import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchStores } from '../services/api';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const THEMES = {
  store1: { 
     bg: 'bg-slate-900', 
     loaderText: 'Unlocking the ₹99 Vault...', 
     fallingItems: ['99', '₹99', '99%'], 
     overlay: 'bg-black/60',
     titleColor: 'text-white'
  },
  store2: { 
     bg: 'bg-indigo-900', 
     loaderText: 'Preparing Premium Selection...', 
     fallingItems: ['💎', '✨', 'PREMIUM'], 
     overlay: 'bg-indigo-900/60',
     titleColor: 'text-white'
  },
  store3: { 
     bg: 'bg-[url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200")] bg-cover bg-center bg-fixed', 
     loaderText: 'Harvesting grains from the farm...', 
     fallingItems: ['🌾', '🌱', 'GRAIN'], 
     overlay: 'bg-green-900/70',
     titleColor: 'text-green-50'
  },
  store4: { 
     bg: 'bg-[url("https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=1200")] bg-cover bg-center bg-fixed', 
     loaderText: 'Grinding fresh authentic spices...', 
     fallingItems: ['🌶️', '🧄', 'SPICE'], 
     overlay: 'bg-red-900/80',
     titleColor: 'text-orange-100'
  },
  store5: { 
     bg: 'bg-orange-600', 
     loaderText: 'Stocking up the snacks...', 
     fallingItems: ['🍟', '🍿', 'SNACK'], 
     overlay: 'bg-black/40',
     titleColor: 'text-white'
  },
  store6: { 
     bg: 'bg-[url("https://images.unsplash.com/photo-1550583726-22248229a10c?auto=format&fit=crop&q=80&w=1200")] bg-cover bg-center bg-fixed', 
     loaderText: 'Bringing fresh dairy from the barn...', 
     fallingItems: ['🥛', '🧀', 'DAIRY'], 
     overlay: 'bg-blue-900/50 backdrop-blur-sm',
     titleColor: 'text-white'
  },
  store7: { 
     bg: 'bg-[url("https://images.unsplash.com/photo-1582284728022-81ad57adc229?auto=format&fit=crop&q=80&w=1200")] bg-cover bg-center bg-fixed', 
     loaderText: 'Picking fresh vegetables...', 
     fallingItems: ['🥬', '🥕', 'FRESH'], 
     overlay: 'bg-emerald-900/80',
     titleColor: 'text-green-100'
  },
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
  const [isLoading, setIsLoading] = useState(true);

  const theme = THEMES[id] || THEMES['store1'];
  

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [psRaw, ss] = await Promise.all([fetchProducts(), fetchStores()]);
        const currentStore = ss.find(s => s.id === id);
        
        let filteredProds = psRaw || [];
        if (user?.role === 'b2b') {
          filteredProds = filteredProds.filter(p => p.customerType === 'BUSINESS' || p.customerType === 'BOTH');
        } else if (user?.role === 'admin') {
          // Admin
        } else {
          filteredProds = filteredProds.filter(p => p.customerType === 'NORMAL' || p.customerType === 'BOTH');
        }

        setStoreDetails(currentStore);
        setStoreProducts(filteredProds.filter(p => p.storeId === id));
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

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme.bg}`}>
      {/* Dark theme overlay for readability */}
      <div className={`absolute inset-0 z-0 ${theme.overlay}`}></div>

      {/* METALLIC SHUTTER LOADER */}
      <AnimatePresence>
        {!isStoreOpen && (
          <motion.div 
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1.0, ease: [0.8, 0, 0.2, 1] }} // Heavy metal slide up physics
            className="fixed inset-0 z-[60] bg-slate-800 flex flex-col items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
             {/* Realistic Metallic Slats Background */}
             <div className="absolute inset-0 flex flex-col w-full h-full pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                   <div key={i} className="flex-1 w-full border-b-[3px] border-slate-950/80 border-t border-slate-600/30 bg-gradient-to-b from-slate-700 to-slate-900 max-h-[5vh]"></div>
                ))}
             </div>
             
             {/* Dynamic Falling Items Animation */}
             <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden block">
                {Array.from({ length: 40 }).map((_, i) => {
                   const itemContent = theme.fallingItems[i % theme.fallingItems.length];
                   // Using deterministic pseudo-randomness based on index for stable rendering
                   const leftPos = `${((Math.sin(i * 12345) + 1) / 2) * 100}%`;
                   const animDuration = 3 + ((Math.cos(i * 54321) + 1) / 2) * 4;
                   const animDelay = ((Math.sin(i * 98765) + 1) / 2) * 5;
                   const scaleSize = 0.5 + ((Math.cos(i * 67890) + 1) / 2);
                   const isClockwise = Math.sin(i * 13579) > 0;
                   
                   return (
                     <motion.div 
                        key={i}
                        initial={{ y: '-20vh', x: 0, opacity: 0 }}
                        animate={{ 
                           y: ['-20vh', '120vh'],
                           rotate: [0, isClockwise ? 360 : -360],
                           opacity: [0, 0.4, 0.4, 0]
                        }} 
                        transition={{ 
                           repeat: Infinity, 
                           duration: animDuration, 
                           delay: animDelay, 
                           ease: "linear" 
                        }} 
                        className="absolute top-0 text-3xl md:text-5xl font-black drop-shadow-2xl flex items-center justify-center text-white/60"
                        style={{ left: leftPos, scale: scaleSize }}
                     >
                       {itemContent}
                     </motion.div>
                   )
                })}
             </div>
             
             {/* Central Store Signage Plate */}
             <div className="z-20 relative bg-gradient-to-b from-slate-300 to-slate-500 p-2 md:p-3 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] border-2 border-slate-400 min-w-[300px] md:min-w-[500px]">
                 <div className="bg-slate-950 py-10 px-6 md:px-12 md:py-14 rounded-2xl border-[6px] border-slate-800 flex flex-col items-center shadow-inner relative overflow-hidden">
                     {/* Gloss reflection overlay */}
                     <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none skew-y-6 transform origin-top-left"></div>

                     {/* The Lock/Unlock Badge */}
                     <motion.div 
                        animate={isUnlocked ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-6 border-4 shadow-2xl z-10 ${isUnlocked ? 'bg-gradient-to-tr from-green-500 to-green-300 border-green-700 shadow-[0_0_40px_rgba(34,197,94,0.6)]' : 'bg-gradient-to-tr from-yellow-500 to-yellow-300 border-yellow-700 shadow-[0_0_40px_rgba(234,179,8,0.4)]'}`}
                     >
                        {isUnlocked ? <Unlock className="text-slate-900" size={36} strokeWidth={3} /> : <Lock className="text-slate-900" size={36} strokeWidth={3} />}
                     </motion.div>

                     {/* Neon Text */}
                     <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-widest uppercase text-center mb-3 drop-shadow-md z-10">
                         {storeDetails.name}
                     </h2>
                     <p className={`font-black text-sm md:text-lg tracking-widest uppercase z-10 ${isUnlocked ? 'text-green-400' : 'text-yellow-400 animate-pulse'}`}>
                         {isUnlocked ? 'Store Unlocked' : theme.loaderText}
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
           className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 mb-16 shadow-2xl text-center md:text-left flex flex-col md:flex-row items-center gap-8"
         >
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-8 border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.2)] flex-shrink-0">
               <img src={storeDetails.image} alt={storeDetails.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1">
               <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-white/90 text-xs font-black tracking-widest uppercase mb-4 border border-white/10">
                  Exclusive Aisle
               </div>
               <h1 className={`text-4xl md:text-7xl font-black ${theme.titleColor} tracking-tighter mb-4 drop-shadow-lg`}>
                  {storeDetails.name}
               </h1>
               <p className="text-lg md:text-2xl text-white/80 font-bold max-w-2xl">
                 {storeDetails.subtitle}
               </p>
               <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                  <span className="bg-[var(--secondary)] text-white px-6 py-2 rounded-xl font-bold shadow-lg">★ {storeDetails.rating} Rated</span>
                  <span className="bg-white/10 text-white px-6 py-2 rounded-xl font-bold backdrop-blur">{storeDetails.items}+ Products</span>
               </div>
            </div>
         </motion.div>

         {/* Products Shelving */}
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: isStoreOpen ? 1 : 0 }}
           transition={{ duration: 1, delay: 1 }}
         >
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Available in Store</h2>
               <button onClick={() => navigate('/#stores')} className="text-white/80 hover:text-white font-bold bg-white/10 px-6 py-3 rounded-xl transition">Back to Main Map</button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-4">
               {storeProducts.map((product) => (
                 <motion.div 
                   key={product.id}
                   whileHover={{ y: -8, scale: 1.02 }}
                   transition={{ type: 'spring', stiffness: 300 }}
                 >
                    <ProductCard product={product} />
                 </motion.div>
               ))}
            </div>
         </motion.div>
      </div>

    </div>
  );
};

export default StorePage;
