import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['🍎', '🥦', '🥕', '🍇', '🍉', '🍞', '🧀', '🍗', '🥩', '🥛', '🥑', '🥭', '🍋', '🥬'];

const GlobalLoader = ({ onFinish }) => {
  const [currentEmoji, setCurrentEmoji] = useState(0);

  useEffect(() => {
    // Rapidly switch emojis every 150ms
    const interval = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % EMOJIS.length);
    }, 150);

    // Call onFinish after 2.5 seconds
    const timeout = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-4 overflow-hidden"
    >
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.3 }}
          className="text-8xl drop-shadow-2xl"
        >
          {EMOJIS[currentEmoji]}
        </motion.div>
        
        <div className="mt-12 flex flex-col items-center">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                Unified<span className="text-[var(--secondary)]">Commerce</span>
            </h1>
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs mt-2 animate-pulse">
               Fetching Fresh Groceries...
            </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="absolute bottom-20 w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
             <motion.div 
               initial={{ x: '-100%' }}
               animate={{ x: '0%' }}
               transition={{ duration: 2.5, ease: 'linear' }}
               className="w-full h-full bg-[var(--secondary)]"
             />
        </div>
    </motion.div>
  );
};

export default GlobalLoader;
