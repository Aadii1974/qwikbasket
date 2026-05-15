import React, { useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchStores, fetchCategories, fetchHomeSections, fetchSettings, fetchValuePacks } from '../services/api';
import useSEO from '../hooks/useSEO';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ChevronRight, ChevronLeft, Star, TrendingUp, Package, Truck, ShieldCheck,
  Leaf, Clock, Award, Zap, Image as ImageIcon, Rocket, Timer,
  Sparkles, ArrowRight, ShoppingBasket, TrendingDown, Gift, X, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

// ── Section Row ────────────────────────────────────────────────────────────
const SectionRow = ({ title, subtitle, icon: Icon, products, allProducts = [], accentColor = 'text-[var(--secondary)]' }) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10 md:mb-14">
      <div className="section-header px-1 mb-3 md:mb-5">
        <div>
          <span className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 block ${accentColor}`}>{subtitle}</span>
          <h2 className="text-2xl md:text-3xl font-[900] text-slate-900 heading-tight flex items-center gap-2">
            {Icon && <Icon size={22} className={accentColor} />}
            {title}
          </h2>
        </div>
      </div>
      <div className="scroll-row">
        {products.filter(p => p && p.id).map((product) => (
          <div key={product.id} className="w-[160px] md:w-auto">
            <ProductCard product={product} allProducts={allProducts} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Value Packs Section ──────────────────────────────────────────────────
// ── Value Packs Section ──────────────────────────────────────────────────
const ValuePackCard = ({ pack, onViewDetails }) => {
  const { addValuePackToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addValuePackToCart(pack);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const originalPrice = Number(pack.originalPrice || 0);
  const price = Number(pack.price || 0);
  const discountPercent = originalPrice > price && originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const savingsAmount = originalPrice - price;

  return (
    <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full w-[250px] md:w-auto flex-shrink-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <img src={pack.image || 'https://placehold.co/400x300?text=Value+Pack'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={pack.name} />
        
        {/* Dynamic Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white font-black text-[10px] md:text-[11px] px-3 py-1 rounded-xl shadow-lg uppercase tracking-wider animate-pulse">
            -{discountPercent}% OFF
          </div>
        )}

        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-white/40">
           <p className="text-[10px] font-black text-[var(--secondary)] uppercase tracking-widest leading-none">SAVE ₹{savingsAmount}</p>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-black text-slate-900 text-base md:text-lg mb-1.5 leading-tight line-clamp-1 group-hover:text-[var(--secondary)] transition-colors duration-200">{pack.name}</h3>
        
        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Contains {(() => {
            const items = typeof pack.items === 'string' ? JSON.parse(pack.items) : (pack.items || []);
            return items.length;
          })()} curated items
        </p>
        
        <div className="flex items-baseline gap-2 mb-4">
           <span className="text-xl md:text-2xl font-black text-emerald-600 tracking-tight">₹{pack.price}</span>
           {originalPrice > price && (
             <span className="text-xs md:text-sm text-red-400 line-through font-bold">₹{pack.originalPrice}</span>
           )}
        </div>
        
        <div className="space-y-2 mb-5 hidden md:block">
           {(() => {
              const items = typeof pack.items === 'string' ? JSON.parse(pack.items) : (pack.items || []);
               return items.slice(0, 3).map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-extrabold text-slate-600">
                    <div className="flex items-center gap-2 truncate mr-2">
                       <span className="text-emerald-500">{item.quantity || 1}x</span>
                       <span className="truncate">{item.name}</span>
                    </div>
                    <span className="flex-shrink-0 text-slate-400">₹{item.price}</span>
                 </div>
               ));
           })()}
        </div>

        <div className="flex gap-2 mt-auto">
          <button 
            onClick={() => onViewDetails(pack)}
            className="flex-1 py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest border-2 border-[var(--secondary)]/20 text-[var(--secondary)] hover:bg-[var(--secondary)]/5 transition-all"
          >
            View Items
          </button>
          <button 
            onClick={handleAdd}
            className={`flex-1 py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 ${added ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-900 text-white hover:bg-black'}`}
          >
            {added ? 'Added!' : 'Add Pack'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Value Pack Details Modal Component ───────────────────────────────────
const ValuePackDetailsModal = ({ pack, onClose }) => {
  const { addValuePackToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addValuePackToCart(pack);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1500);
  };

  const originalPrice = Number(pack.originalPrice || 0);
  const price = Number(pack.price || 0);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-white flex flex-col max-h-[90vh] z-50"
      >
        {/* Modal Header */}
        <div className="relative h-32 sm:h-48 flex-shrink-0">
          <img src={pack.image || 'https://placehold.co/400x300?text=Value+Pack'} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition z-10"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-3 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-6">
            <span className="bg-emerald-500 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest mb-1 sm:mb-2 inline-block">Special Value Pack</span>
            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight truncate">{pack.name}</h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-end mb-4 sm:mb-6">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Bundle Total</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">₹{pack.price}</span>
                {originalPrice > price && (
                  <span className="text-xs sm:text-sm text-slate-400 line-through font-bold">₹{pack.originalPrice}</span>
                )}
              </div>
            </div>
            {originalPrice > price && (
              <div className="text-right">
                 <span className="bg-emerald-100 text-emerald-600 text-[10px] sm:text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-extrabold">SAVE ₹{originalPrice - price}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4">What's inside this pack</h4>
            {(() => {
              const items = typeof pack.items === 'string' ? JSON.parse(pack.items) : (pack.items || []);
              return items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 group hover:border-emerald-200 transition">
                   <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center font-black text-emerald-500 shadow-sm border border-slate-100 text-xs sm:text-sm">
                         {item.quantity}x
                      </div>
                      <div className="min-w-0">
                         <p className="font-black text-slate-800 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{item.name}</p>
                         <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">{item.unit}</p>
                      </div>
                   </div>
                   <div className="text-right flex-shrink-0">
                      <p className="font-black text-slate-900 text-xs sm:text-sm">₹{item.price * item.quantity}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 line-through font-bold">₹{(item.previousPrice || item.price) * item.quantity}</p>
                   </div>
                </div>
              ));
            })()}
          </div>

          <div className="mt-6 sm:mt-8">
            <button 
              onClick={handleAdd}
              className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ShoppingBasket size={18} />
              {added ? 'Added to Cart!' : 'Add Bundle to Cart'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ValuePacksSection = ({ packs }) => {
  const [selectedPack, setSelectedPack] = useState(null);
  const [textIndex, setTextIndex] = useState(0);
  const rotatingTexts = [
    "🔥 Save up to 40% on Daily Farm-Fresh Essentials!",
    "📦 Curated by culinary experts for perfect recipe bundles!",
    "⚡ Quick 1-Click checkout & lightning-fast home delivery!",
    "🍒 No middlemen, no cold storage — 100% organic farm sourcing!",
    "💎 Supercharge your monthly budget with stacked discounts!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [rotatingTexts.length]);

  if (!packs || packs.length === 0) return null;

  return (
    <section className="w-full mb-10 md:mb-14 relative overflow-hidden bg-slate-950 rounded-[32px] md:rounded-[48px] max-w-[1440px] mx-auto">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop" 
          alt="Lush green farm" 
          className="w-full h-full object-cover opacity-35 scale-105 hover:scale-100 transition-transform duration-[10s]" 
        />
        {/* Rich emerald gradient overlay for brand consistency and legibility */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/95 via-teal-900/80 to-slate-950/95 mix-blend-multiply"></div>
        
        {/* Decorative lighting elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.3, 0.15],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, -40, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-400/20 rounded-full blur-[100px]" 
          />
        </div>
      </div>

      <div className="relative z-10 py-12 md:py-16 px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-1">
          <div>
            <span className="text-[10px] md:text-xs font-black text-emerald-300 uppercase tracking-[0.3em] mb-2 block">Monthly Stacks</span>
            <h2 className="text-3xl md:text-5xl font-[900] text-white heading-tight flex items-center gap-3">
              <Gift size={32} className="text-yellow-400 fill-yellow-400 animate-pulse" />
              Value Packs
            </h2>
            
            {/* Continuously changing dynamic text */}
            <div className="h-10 flex items-center overflow-hidden mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={textIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="text-yellow-300 text-xs md:text-sm font-extrabold flex items-center gap-2 bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/20 shadow-sm"
                >
                  <Sparkles size={14} className="text-yellow-400 animate-spin-slow flex-shrink-0" />
                  <span>{rotatingTexts[textIndex]}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-5 md:gap-7 snap-x custom-scrollbar pb-6 -mx-4 px-4 lg:-mx-12 lg:px-12">
          {packs.map(pack => (
            <div key={pack.id} className="snap-start flex-shrink-0 w-[270px] md:w-[330px]">
              <ValuePackCard pack={pack} onViewDetails={setSelectedPack} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Details Modal rendered at parent level to avoid clipping ── */}
      <AnimatePresence>
        {selectedPack && (
          <ValuePackDetailsModal pack={selectedPack} onClose={() => setSelectedPack(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

// ── Full-Width Hero Carousel ────────────────────────────────────────────────
const HeroCarousel = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % images.length);
  }, [images.length]);

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, images.length]);

  // Placeholder when no images are uploaded
  if (!images || images.length === 0) {
    return (
      <section className="w-full mt-6 mb-6 md:mb-10">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div
            className="w-full bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center rounded-[32px] overflow-hidden"
            style={{ height: 'clamp(250px, 35vw, 500px)' }}
          >
            <div className="flex flex-col items-center gap-3 text-slate-300 text-center px-6">
              <div className="w-20 h-20 rounded-3xl bg-slate-200 flex items-center justify-center">
                <ImageIcon size={36} className="text-slate-300" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest">Hero Carousel</p>
              <p className="text-xs font-medium">Upload images from Admin Panel → Global Settings → Hero Carousel</p>
            </div>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section className="w-full mt-6 mb-6 md:mb-10 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
        <div className="relative w-full rounded-[32px] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm" style={{ height: 'clamp(240px, 35vw, 480px)' }}>
          {/* Slides */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img
                src={images[current].url}
                alt={`Hero banner ${current + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-slate-800' : 'w-2 h-2 bg-slate-800/20'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ── Promo Cards below Flash Sale (admin-managed) ───────────────────────────
const PromoCardsRow = ({ cards }) => {
  // Always show 4 card slots
  const slots = [...(cards || [])];
  while (slots.length < 4) slots.push(null);

  return (
    <div className="flex overflow-x-auto snap-x custom-scrollbar pb-4 gap-3 md:gap-4 mb-0 -mx-4 px-4 lg:-mx-10 lg:px-10">
      {slots.slice(0, 4).map((card, idx) => (
        card ? (
          <div key={card.id || idx} className="snap-start flex-shrink-0 w-[240px] md:w-[280px] lg:w-[calc(25%-1rem)] rounded-2xl overflow-hidden shadow-sm bg-white border border-slate-100 p-1" style={{ aspectRatio: '3/2' }}>
            <img src={card.url} alt={`Promo ${idx + 1}`} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div
            key={`placeholder-${idx}`}
            className="snap-start flex-shrink-0 w-[240px] md:w-[280px] lg:w-[calc(25%-1rem)] rounded-2xl bg-slate-800/60 border border-white/10 border-dashed flex flex-col items-center justify-center text-white/30 gap-2"
            style={{ aspectRatio: '3/2' }}
          >
            <ImageIcon size={20} />
            <p className="text-[9px] font-black uppercase tracking-widest">Card {idx + 1}</p>
          </div>
        )
      ))}
    </div>
  );
};

// ── Flash Sale Timer ────────────────────────────────────────────────────────
const FlashTimer = () => {
  const [time, setTime] = useState({ h: 4, m: 22, s: 19 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-2">
      {[pad(time.h), pad(time.m), pad(time.s)].map((val, i) => (
        <React.Fragment key={i}>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 min-w-[48px] text-center border border-white/10">
            <span className="text-2xl md:text-3xl font-[900] text-white leading-none">{val}</span>
            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mt-0.5">{['HRS', 'MIN', 'SEC'][i]}</p>
          </div>
          {i < 2 && <span className="text-2xl font-black text-white/40">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Delivery / Trust Section ────────────────────────────────────────────────
const DeliverySection = ({ deliveryImage }) => {
  const trustPoints = [
    { icon: Truck, title: 'Lightning Fast Delivery', desc: 'Fresh groceries delivered in under 10 minutes, straight from our farm partners to your doorstep.', color: 'text-[var(--secondary)]', bg: 'bg-emerald-50' },
    { icon: Leaf, title: '100% Farm Fresh', desc: 'Sourced directly from certified farmers. No middlemen, no cold storage. Freshness guaranteed.', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: ShieldCheck, title: 'Quality Assured', desc: 'Every product passes our strict quality check before it reaches you. We stand by what we sell.', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Award, title: 'Best Price Promise', desc: 'We match or beat market prices. Smart savings on your daily essentials, every single day.', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10 md:mb-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left — Text & Trust Points */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--secondary)] mb-2 block">Why Real Farms</span>
          <h2 className="text-2xl md:text-4xl font-[900] text-slate-900 heading-tight mb-6 leading-tight">
            Delivering Quality &<br />
            <span className="text-[var(--secondary)]">Building Trust</span>
          </h2>
          <p className="text-slate-500 font-medium text-sm md:text-base mb-8 leading-relaxed max-w-md">
            We're not just a grocery app — we're a promise of quality, speed, and value. Every delivery reflects our commitment to you and the farmers who grow your food.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trustPoints.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${point.bg}`}>
                  <point.icon size={18} className={point.color} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm leading-tight mb-1">{point.title}</h4>
                  <p className="text-slate-500 text-[11px] font-medium leading-snug">{point.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right — Admin-uploaded image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {deliveryImage ? (
            <div className="w-full rounded-[32px] overflow-hidden shadow-xl bg-white border border-slate-100 p-2" style={{ height: 'clamp(280px, 40vw, 480px)' }}>
              <img src={deliveryImage} alt="Delivery quality" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div
              className="w-full rounded-[24px] bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center"
              style={{ height: 'clamp(280px, 40vw, 480px)' }}
            >
              <div className="flex flex-col items-center gap-4 text-slate-400 px-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-200 flex items-center justify-center">
                  <Truck size={32} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest mb-1">Delivery Section Image</p>
                  <p className="text-xs font-medium">Upload from Admin Panel → Global Settings</p>
                </div>
              </div>
            </div>
          )}
          <div className="absolute -bottom-4 -left-4 bg-[var(--secondary)] text-white rounded-2xl px-4 py-3 shadow-xl">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Avg Delivery</p>
                <p className="text-lg font-[900] leading-none">8 Mins</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 bg-white text-slate-900 rounded-2xl px-4 py-3 shadow-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-500 fill-amber-500" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rated</p>
                <p className="text-lg font-[900] leading-none">4.9/5</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ── Main Home ───────────────────────────────────────────────────────────────
const Home = () => {
  const { user } = useAuth();
  useSEO({
    title: 'Fresh Organic Grocery & Farm Delivery – Order Online',
    description: 'Real Farms delivers fresh organic groceries, dairy, fruits & vegetables straight from the farm to your doorstep in 45–60 mins. Same-day & scheduled delivery. Best farm-direct prices. Order now!',
    canonical: '/',
    keywords: ['grocery delivery India', 'organic farm fresh delivery', 'online grocery', 'same day grocery delivery', 'fresh vegetables online', 'dairy delivery India', 'farm to doorstep', 'organic food India', 'buy groceries online', 'fresh milk delivery'],
  });
  const isB2B = user?.role === 'b2b';
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [homeSections, setHomeSections] = useState({ latest: [], trending: [], mostPurchased: [] });
  const [valuePacks, setValuePacks] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      try {
        const [psRaw, ss, cs, sections, settingsData, packData] = await Promise.all([
          fetchProducts(), fetchStores(), fetchCategories(), fetchHomeSections(), fetchSettings(), fetchValuePacks()
        ]);
        const allProds = psRaw || [];
        let filteredProds = allProds;
        if (user?.role === 'b2b') {
          filteredProds = allProds.filter(p => p.customerType === 'BUSINESS' || p.customerType === 'BOTH');
        } else if (user?.role !== 'admin') {
          filteredProds = allProds.filter(p => p.customerType === 'NORMAL' || p.customerType === 'BOTH');
        }
        setProducts(filteredProds);
        setStores(ss || []);
        setCategories(cs || []);
        setValuePacks(packData || []);
        
        // Filter homeSections based on user role
        let safeSections = sections || { latest: [], trending: [], mostPurchased: [] };
        const allowedIds = new Set(filteredProds.map(p => p.id));
        
        setHomeSections({
          latest: (safeSections.latest || []).filter(p => allowedIds.has(p.id)),
          trending: (safeSections.trending || []).filter(p => allowedIds.has(p.id)),
          mostPurchased: (safeSections.mostPurchased || []).filter(p => allowedIds.has(p.id))
        });
        
        setSiteSettings(settingsData);
      } catch (err) {
        console.error('Home loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, [user?.role]);

  useEffect(() => {
    if (window.location.hash === '#stores') {
      const el = document.getElementById('stores');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const flashProducts = products.filter(p => p && p.isFlashSale);

  // Parse hero images JSON from settings
  let heroImages = [];
  try { heroImages = siteSettings?.heroImages ? JSON.parse(siteSettings.heroImages) : []; } catch { heroImages = []; }

  // Parse promo cards JSON from settings
  let promoCards = [];
  try { promoCards = siteSettings?.homePromoCards ? JSON.parse(siteSettings.homePromoCards) : []; } catch { promoCards = []; }

  const deliveryImage = siteSettings?.deliverySectionImage || '';

  return (
    <div className="bg-white overflow-hidden pb-6">

      {/* ── Full-Width Hero Carousel ────────────────────── */}
      <HeroCarousel images={heroImages} />

      {/* ── Mobile Search Bar ──────────────────────────── */}
      <section className="lg:hidden max-w-[1440px] mx-auto px-4 mb-6 md:mb-8">
        <form onSubmit={(e) => { e.preventDefault(); const q = e.target.elements.q.value; if(q) window.location.href = '/search?q=' + encodeURIComponent(q); }} className="relative w-full group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--secondary)] transition-colors pointer-events-none">
            <Search size={18} strokeWidth={2.5} />
          </span>
          <input
            name="q"
            type="text"
            placeholder={isB2B ? 'Search bulk inventory...' : 'Search groceries, dairy, produce...'}
            className="w-full py-4 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-[var(--secondary)]/40 focus:ring-4 focus:ring-[var(--secondary)]/10 shadow-sm"
          />
        </form>
      </section>

      {/* ── Same Day Delivery Banner ─────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-8 md:mb-10">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#2B3E14] via-[#3B541C] to-[#1E2C0E] shadow-[0_16px_36px_rgba(43,62,20,0.4),_0_6px_16px_rgba(0,0,0,0.15),_inset_0_1px_0_rgba(255,255,255,0.1)] border border-[#3B541C]/30">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10 flex items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5">
            <div className="flex items-center gap-3 md:gap-5">
              <div className="flex-shrink-0 w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-[#FFE353]/10 backdrop-blur-sm flex items-center justify-center border border-[#FFE353]/20 shadow-inner">
                <Truck size={22} className="text-[#FFE353] md:hidden" />
                <Truck size={28} className="text-[#FFE353] hidden md:block" />
              </div>
              <div>
                <h3 className="text-[#FFE353] font-[900] text-sm md:text-lg lg:text-xl leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Same Day Delivery</h3>
                <p className="text-[#FFF7A3]/90 text-[10px] md:text-xs font-bold mt-0.5">Order now & get it delivered today — fresh & fast!</p>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 bg-[#FFF275]/15 backdrop-blur-sm rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-3 border border-[#FFF275]/25 shadow-md">
              <Timer size={16} className="text-[#FFF275] md:hidden" />
              <Timer size={20} className="text-[#FFF275] hidden md:block" />
              <div>
                <p className="text-[8px] md:text-[9px] font-black text-[#FFF275]/70 uppercase tracking-widest">Today</p>
                <p className="text-[#FFF275] font-black text-xs md:text-sm leading-none">Free Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10 md:mb-14">
        <div className="section-header mb-4 md:mb-6">
          <div>
            <span className="text-[var(--secondary)] text-[10px] font-black uppercase tracking-[0.25em] mb-1 block">Departments</span>
            <h2 className="text-2xl md:text-3xl font-[900] text-slate-900 heading-tight">
              {isB2B ? 'Inventory Segments' : 'Curated Aisles'}
            </h2>
          </div>
          <Link to="/categories" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[var(--secondary)] transition-colors px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100">
            All <ChevronRight size={13} strokeWidth={3} />
          </Link>
        </div>
        <div className="cat-scroll">
          {categories.map(cat => (
            <Link to={`/category/${cat.id}`} key={cat.id} className="group flex-shrink-0">
              <div className="flex flex-col items-center gap-2.5 w-[78px] md:w-[100px]">
                <div className="w-[72px] h-[72px] md:w-[92px] md:h-[92px] rounded-[22px] md:rounded-[26px] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden
                  group-hover:bg-white group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                  <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={cat.name} />
                </div>
                <span className="text-[11px] font-[800] text-center text-slate-700 leading-tight group-hover:text-[var(--secondary)] transition-colors">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Build Your Own Basket System ───────────────── */}
      <section className="max-w-[850px] mx-auto px-4 mb-8 md:mb-10">
        <Link to="/bulk-basket" className="group block relative overflow-hidden rounded-[24px] md:rounded-[28px] bg-slate-900 shadow-xl border border-slate-800">
           {/* Decorative blurs */}
           <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]" />
           </div>

           <div className="relative z-10 px-5 py-5 md:px-8 md:py-6 flex flex-row items-center justify-between gap-4">
              <div className="text-left flex-1">
                 <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest mb-1.5 border border-blue-500/20">
                    <Sparkles size={10} /> Volume System
                 </div>
                 <h2 className="text-base md:text-xl lg:text-2xl font-black text-white leading-tight mb-1">
                    Build Your Own<br className="hidden md:block" />
                    <span className="text-blue-400 text-sm md:text-lg lg:text-xl"> Basket & Save Big</span>
                 </h2>
                 <p className="text-slate-400 font-medium text-[9px] md:text-xs max-w-[180px] md:max-w-sm mb-3 md:mb-4 leading-relaxed">
                    Extra <span className="text-white">{siteSettings?.bulkDiscountPercentage || 5}% discount</span> on bulk orders over ₹{siteSettings?.bulkDiscountThreshold || 2000}.
                 </p>
                 
                 <div className="flex flex-wrap justify-start gap-2 md:gap-3">
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 md:px-4 py-1.5 md:py-2 rounded-lg">
                       <TrendingDown className="text-emerald-400" size={14} />
                       <p className="text-white font-black text-[9px] md:text-xs">₹500+ Savings</p>
                    </div>
                 </div>
              </div>

              <div className="flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                 <div className="w-20 h-20 md:w-36 md:h-36 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[18px] md:rounded-[28px] flex items-center justify-center shadow-lg relative">
                    <ShoppingBasket className="text-white w-10 h-10 md:w-20 md:h-20" />
                    <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-lg px-2 py-1 shadow-lg border border-slate-900">
                       <p className="text-[10px] md:text-base font-black leading-none">{siteSettings?.bulkDiscountPercentage || 5}%</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white/5 border-t border-white/10 px-5 py-2.5 flex items-center justify-between">
              <p className="text-[9px] font-bold text-slate-400">Warehouse factory rates.</p>
              <div className="flex items-center gap-1 text-blue-400 font-black text-[10px] group-hover:translate-x-1 transition-transform">
                 Go to Bulk Store <ArrowRight size={12} />
              </div>
           </div>
        </Link>
      </section>

      {/* ── Trending ─────────────────────────────────────── */}
      <SectionRow title="Trending" subtitle="Hot Right Now" icon={TrendingUp} products={homeSections.trending} allProducts={products} accentColor="text-orange-500" />

      {/* ── Flash Sale (moved below Trending) ────────────── */}
      <section className="w-full mb-6 md:mb-10 relative overflow-hidden">
        {/* Full-width premium background */}
        <div className="absolute inset-0"
          style={{ background: isB2B ? '#0f172a' : 'linear-gradient(135deg, #0f172a 0%, #1e0a3c 50%, #0f172a 100%)' }}>
          <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--secondary)]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 lg:px-10 py-10 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="animate-pulse w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_3px_rgba(239,68,68,0.6)]" />
              <span className="text-white/60 text-[11px] font-black uppercase tracking-[0.35em]">Live Deals</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-[900] text-white heading-tight flex items-center gap-4">
              <Zap size={36} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
              {isB2B ? 'Bulk Deals' : 'Flash Store'}
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1.5 bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
            <span className="text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-1">Ends In</span>
            <FlashTimer />
          </div>
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 lg:px-10 pb-12 pt-8">
          {flashProducts.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 md:gap-6 snap-x custom-scrollbar pb-6">
              {flashProducts.map(product => (
                <div key={`sale-${product.id}`} className="snap-start flex-shrink-0 w-[180px] md:w-[220px] lg:w-[250px] bg-white/10 backdrop-blur-xl rounded-[24px] p-2 border border-white/20 shadow-2xl">
                  <ProductCard product={product} allProducts={products} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-white/30 text-xl font-black uppercase tracking-[0.3em] mb-8">Restocking Pulse deals...</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Latest ──────────────────────────────────────── */}
      <SectionRow title="Just Arrived" subtitle="New Products" icon={Package} products={homeSections.latest} allProducts={products} accentColor="text-indigo-500" />

      {/* ── Value Packs ──────────────────────────────────── */}
      <ValuePacksSection packs={valuePacks} />

      {/* Admin-managed promo image cards */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10">
        <PromoCardsRow cards={promoCards} />
      </section>


      {/* ── Most Purchased ───────────────────────────────── */}
      <SectionRow title="Crowd Favorites" subtitle="Most Purchased" icon={Star} products={homeSections.mostPurchased} allProducts={products} accentColor="text-[var(--secondary)]" />

      {/* ── Specialty Stores ─────────────────────────────── */}
      {stores.length > 0 && (
        <section id="stores" className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10 md:mb-14">
          <div className="section-header mb-5 md:mb-8">
            <div>
              <span className="text-[var(--secondary)] text-[10px] font-black uppercase tracking-[0.25em] mb-1 block">Direct Access</span>
              <h2 className="text-2xl md:text-3xl font-[900] text-slate-900 heading-tight">
                {isB2B ? 'Fulfillment Centers' : 'Artisanal Avenues'}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {stores.map(store => (
              <Link to={`/store/${store.id}`} key={store.id} className="group block overflow-hidden rounded-[18px] shadow-sm hover:shadow-lg transition-all duration-300">
                {store.image ? (
                  <div className="w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="w-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                    <div className="text-center text-slate-300 px-4">
                      <Package size={24} className="mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Store Image</p>
                    </div>
                  </div>
                )}
                <div className="pt-2.5 pb-1 px-1">
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[var(--secondary)] transition-colors leading-tight">{store.name}</h3>
                  {store.subtitle && <p className="text-[10px] text-slate-400 font-bold mt-0.5">{store.subtitle}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Delivery / Trust Section (below stores) ────────── */}
      <DeliverySection deliveryImage={deliveryImage} />

    </div>
  );
};

export default Home;
