import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Twinkling stars background
const Stars = () => {
  const stars = Array.from({ length: 60 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.5,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
};

const NightShutter = ({ isOpening, onOpeningDone }) => {
  const [showOpenAnim, setShowOpenAnim] = useState(false);

  useEffect(() => {
    if (isOpening) {
      setShowOpenAnim(true);
      const t = setTimeout(() => {
        setShowOpenAnim(false);
        if (onOpeningDone) onOpeningDone();
      }, 3200);
      return () => clearTimeout(t);
    }
  }, [isOpening, onOpeningDone]);

  // ── Morning "Open & Running" animation ──────────────────
  if (showOpenAnim) {
    return (
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2.4, duration: 0.8 }}
      >
        <style>{`
          @keyframes sunRise { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes rays { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
        <div className="relative flex flex-col items-center gap-6">
          {/* Sun */}
          <div style={{ animation: 'sunRise 0.8s cubic-bezier(.2,1,.4,1) forwards' }}>
            <div className="relative w-24 h-24">
              <div
                className="absolute inset-[-16px] rounded-full border-4 border-amber-300/30"
                style={{ animation: 'rays 8s linear infinite' }}
              />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 shadow-2xl shadow-amber-400/50 flex items-center justify-center text-5xl">
                ☀️
              </div>
            </div>
          </div>
          <div style={{ animation: 'fadeUp 0.6s ease 0.6s both' }} className="text-center">
            <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-1">Good Morning!</p>
            <h1 className="text-4xl font-black text-white mb-2">We're Open & Running!</h1>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 font-black text-sm">QwikBasket by Real Farms — Ready to deliver</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Night Mode Shutter ───────────────────────────────────
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{ background: 'linear-gradient(145deg, #020818 0%, #0a1628 40%, #0d1f3c 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <style>{`
        @keyframes twinkle { from { opacity: 0.2; transform: scale(0.8); } to { opacity: 1; transform: scale(1.2); } }
        @keyframes floatMoon { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 40px 10px rgba(148,163,184,0.15); } 50% { box-shadow: 0 0 70px 20px rgba(148,163,184,0.3); } }
        @keyframes shimmer { 0% { opacity: 0.4; } 50% { opacity: 0.9; } 100% { opacity: 0.4; } }
      `}</style>

      <Stars />

      {/* Admin/Partner Login button */}
      <div className="absolute top-6 right-6 z-50 pointer-events-auto">
         <Link to="/login" className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold rounded-xl transition-all shadow-lg backdrop-blur-md flex items-center gap-2">
            <span className="text-sm">🔑</span> Sign In
         </Link>
      </div>

      {/* Soft moonlight glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(148,163,184,0.3) 0%, transparent 70%)',
          animation: 'glow 4s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
        {/* Moon */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-6xl"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #e2e8f0, #94a3b8)',
            boxShadow: '0 0 60px 20px rgba(148,163,184,0.2), inset -8px -8px 20px rgba(0,0,0,0.3)',
            animation: 'floatMoon 4s ease-in-out infinite',
          }}
        >
          🌙
        </div>

        {/* Message */}
        <div>
          <motion.h1
            className="text-5xl font-black text-white mb-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Good Night! 🌙
          </motion.h1>
          <motion.p
            className="text-slate-400 font-semibold text-lg max-w-xs leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            We're resting for the night so we can bring you the freshest produce in the morning.
          </motion.p>
          <motion.div
            className="mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.7 }}
          >
            <span className="text-amber-400 text-lg">☀️</span>
            <span className="text-slate-300 font-bold text-sm">Opens fresh at 6:00 AM</span>
          </motion.div>
        </div>

        {/* Support Button */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1.1, duration: 0.7 }}
        >
           <a 
              href={`https://wa.me/918976040532?text=${encodeURIComponent('Hi, I need emergency support.')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-2 inline-flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold px-6 py-3 rounded-full transition-all pointer-events-auto"
           >
              <span>Emergency Support</span>
              <span className="text-xl">💬</span>
           </a>
        </motion.div>

        {/* Brand footer */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          <div className="w-10 h-0.5 bg-white/10 rounded-full mb-3" />
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Sweet dreams from</p>
          <p className="font-black text-lg">
            <span className="text-emerald-400">Qwik</span>
            <span className="text-slate-200">Basket</span>
            <span className="text-white/40 text-sm font-semibold ml-1.5 uppercase tracking-wider">by Real Farms</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NightShutter;
