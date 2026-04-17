import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FEED_ITEMS = ['🥭', '🥦', '🍎', '🥕', '🍇', '🌽', '🥛', '🥚'];

const GlobalLoader = ({ onFinish }) => {
  const [currentItem, setCurrentItem] = useState(0);

  useEffect(() => {
    const itemInterval = setInterval(() => {
      setCurrentItem(prev => (prev + 1) % FEED_ITEMS.length);
    }, 450);

    const timeout = setTimeout(() => {
      onFinish();
    }, 6000); 

    return () => {
      clearInterval(itemInterval);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Soft Background Accents ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60" />
      </div>

      {/* ── Central Branding Container ── */}
      <div className="relative z-[50] flex flex-col items-center">
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="bg-white p-12 md:p-16 rounded-[64px] border-4 border-emerald-50 shadow-[0_40px_100px_rgba(0,0,0,0.04)] flex flex-col items-center max-w-lg"
        >
          {/* Animated Cycling Product Items */}
          <div className="w-32 h-32 md:w-36 md:h-36 bg-white border-2 border-emerald-100 rounded-[40px] shadow-sm flex items-center justify-center mb-10 relative overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentItem}
                initial={{ y: 15, opacity: 1 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ transform: 'translateZ(0)' }}
                className="text-7xl md:text-8xl select-none antialiased font-normal leading-none flex items-center justify-center"
              >
                {FEED_ITEMS[currentItem]}
              </motion.div>
            </AnimatePresence>
          </div>



          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-center flex flex-col items-center leading-none">
            <span className="text-slate-900 drop-shadow-sm flex items-center gap-1">
               Qwik<span className="text-emerald-600">Basket</span>
            </span>
            <div className="mt-4 flex items-center gap-4">
               <div className="h-0.5 w-10 bg-emerald-500/20 rounded-full" />
               <span className="text-xs md:text-sm text-emerald-800 font-black tracking-[0.4em] uppercase">Village Fresh</span>
               <div className="h-0.5 w-10 bg-emerald-500/20 rounded-full" />
            </div>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8 text-slate-400 font-bold tracking-[0.25em] uppercase text-[10px] md:text-xs text-center"
          >
            Directly from Nature's Heart
          </motion.p>
        </motion.div>

        {/* Harvest Progress */}
        <div className="mt-14 w-64 md:w-80 flex flex-col items-center">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50 relative">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5.5, ease: [0.65, 0, 0.35, 1] }}
              className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] relative overflow-hidden"
            >
               <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-white/40 skew-x-[-20deg]" />
            </motion.div>
          </div>
          <motion.span animate={{ opacity: 1 }} className="mt-4 text-[11px] font-black uppercase tracking-[0.5em] text-emerald-800">
            Harvesting Experience...
          </motion.span>
        </div>
      </div>

      {/* ── Soft Nature Touches ── */}
      <div className="absolute inset-x-0 bottom-10 px-12 flex justify-between items-end opacity-100 pointer-events-none">
         <span className="text-5xl">🌿</span>
         <span className="text-6xl pb-4">🐄</span>
         <span className="text-4xl">🌾</span>
         <span className="text-7xl pb-8">🚜</span>
         <span className="text-5xl">🍎</span>
      </div>
    </motion.div>
  );
};

export default GlobalLoader;



