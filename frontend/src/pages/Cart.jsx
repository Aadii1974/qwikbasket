import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Trash2, ShoppingBag, Plus, Minus, ChevronRight, Truck, CheckCircle2,
  FileText, Package, PartyPopper, Clock, Zap, Shield, Star,
  MapPin, Phone, User, Tag, Home, Navigation, ArrowRight,
  Gift, Sparkles, AlertCircle, Info, Rocket, ChevronUp, X, Lock, Disc, ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  checkServiceability, createOrder, createRazorpayOrder,
  fetchSettings, fetchRecommendations,
  fetchAddresses, createAddress,
  validateCoupon, getUserProfile, fetchPublicCoupons, fetchProducts, validateCartStock
} from '../services/api';

// ─── Helpers ────────────────────────────────────────────────────

const CARE_FEE = 10; // Always-on Care & Packaging fee

/** Safely parse images field (stored as JSON string in DB) */
const parseImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try { return JSON.parse(images); } catch { return []; }
};

/** Safely get display price from a product */
const getDisplayPrice = (product) => {
  return Number(product.b2cNewPrice || product.b2cOldPrice || 0);
};

/** Compute tiered delivery fees client-side */
const computeFees = (subtotal, deliveryType = 'Smart', settings = {}) => {
  const FREE_THRESHOLD = settings.freeDeliveryThreshold ?? 200;
  const STD_FEE        = settings.standardDeliveryFee    ?? 25;
  const SMALL_THRESH   = settings.smallCartFeeThreshold  ?? 100;
  const SMALL_FEE      = settings.smallCartFeeAmount      ?? 10;
  const LOW_THRESH     = settings.lowOrderFeeThreshold    ?? 50;
  const LOW_FEE        = settings.lowOrderFeeAmount        ?? 15;
  const PKG_FEE        = settings.packagingFee            ?? CARE_FEE;
  const QWIK_FEE       = settings.qwikDeliveryFee         ?? 30;

  const isQwik = deliveryType === 'Qwik';

  if (isQwik) {
    // Qwik: ONLY Qwik priority fee + packaging. No standard delivery fee, no small cart fee.
    const total = subtotal + QWIK_FEE + PKG_FEE;
    return {
      isFree: false,
      deliveryFee: 0,
      packagingFee: PKG_FEE,
      smallCartFee: 0,
      smallCartReason: '',
      qwikSurcharge: QWIK_FEE,
      total,
      amountToFree: 0,
      FREE_THRESHOLD,
    };
  }

  // Smart Delivery
  const isFree = subtotal >= FREE_THRESHOLD;
  const deliveryFee = isFree ? 0 : STD_FEE;
  const amountToFree = isFree ? 0 : Math.ceil(FREE_THRESHOLD - subtotal);

  // Small cart surcharge (only for Smart delivery)
  let smallCartFee = 0;
  let smallCartReason = '';
  if (subtotal < LOW_THRESH) {
    smallCartFee   = LOW_FEE;
    smallCartReason = 'Low-order handling fee';
  } else if (subtotal < SMALL_THRESH) {
    smallCartFee   = SMALL_FEE;
    smallCartReason = 'Small batch service fee';
  }

  const total = subtotal + deliveryFee + PKG_FEE + smallCartFee;

  return { isFree, deliveryFee, packagingFee: PKG_FEE, smallCartFee, smallCartReason, qwikSurcharge: 0, total, amountToFree, FREE_THRESHOLD };
};

/** Generate available delivery slots dynamically */
const getAvailableSlots = (settings = {}) => {
  let slots = [];
  try { slots = JSON.parse(settings.deliverySlots || '[]'); } catch {}
  if (!slots || slots.length === 0) {
    slots = [
      { id: 's1', label: '8 AM – 10 AM',  cutoffHour: 7 },
      { id: 's2', label: '12 PM – 2 PM',  cutoffHour: 11 },
      { id: 's3', label: '4 PM – 6 PM',   cutoffHour: 15 },
      { id: 's4', label: '7 PM – 9 PM',   cutoffHour: 18 },
    ];
  }
  const currentHour = new Date().getHours();
  const availableSlots = [];
  slots.forEach(s => {
    if (currentHour < s.cutoffHour) {
      availableSlots.push({ ...s, display: `Today, ${s.label}` });
    }
  });
  slots.forEach(s => {
    availableSlots.push({ ...s, display: `Tomorrow, ${s.label}` });
  });
  return availableSlots;
};

const isQwikAvailable = (settings = {}) => {
  const currentHour = new Date().getHours();
  const cutoff = settings.qwikDeliveryCutoffHour ?? 20;
  return currentHour >= 7 && currentHour < cutoff;
};

// ─── Confetti ────────────────────────────────────────────────────
const Confetti = () => {
  const colors = ['#1FB33B', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{ top: -20, opacity: 1, rotate: 0 }}
          animate={{ top: `${80 + Math.random() * 40}%`, opacity: [1, 1, 0], rotate: Math.random() * 720 - 360, x: Math.random() * 200 - 100 }}
          transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

// Load Razorpay
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ─── Cart Item Row ───────────────────────────────────────────────
const CartItemRow = ({ item, updateQuantity, removeFromCart, getTieredPrice, isB2B }) => {
  const price = getTieredPrice ? getTieredPrice(item, item.quantity) : (item.b2cNewPrice || item.price || 0);
  const imgs = parseImages(item.images);
  const displayImg = item.isValuePack ? item.image : imgs[0];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex items-center gap-3 py-3 sm:py-4 border-b border-gray-50 last:border-0"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
        {displayImg
          ? <img src={displayImg} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl">🌿</div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
           <p className="font-black text-slate-900 text-[13px] sm:text-sm truncate">{item.name}</p>
           {item.isValuePack && <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Value Pack</span>}
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
          {item.unit}
          {item.packagingSize ? ` · ${item.packagingSize}` : ''}
        </p>
        {item.isValuePack && item.items && (
          <div className="mt-2 space-y-1 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50">
            {(() => {
              const packItems = typeof item.items === 'string' ? JSON.parse(item.items) : item.items;
              return Array.isArray(packItems) && packItems.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-[9px] font-bold text-emerald-700/70 uppercase tracking-tight">
                  <span className="truncate mr-2 flex items-center gap-1">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                    {p.name} x{p.quantity}
                  </span>
                  <span>₹{p.price * p.quantity}</span>
                </div>
              ));
            })()}
          </div>
        )}
        <p className="font-black text-slate-900 text-[13px] sm:text-sm mt-0.5">
          {String(item.id).startsWith('gift_') ? (
            <span className="text-emerald-600 font-black">FREE GIFT</span>
          ) : (
            `₹${(price * item.quantity).toFixed(0)}`
          )}
        </p>
        {isB2B && item.b2bPrice && !String(item.id).startsWith('gift_') && (
          <span className="inline-block mt-0.5 text-[10px] bg-blue-100 text-blue-700 font-black px-1.5 py-0.5 rounded-full">B2B</span>
        )}
      </div>
      <div className="flex items-center flex-shrink-0">
        <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-0.5">
          <button
            onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}
            className="touch-target w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-red-50 hover:text-red-500 transition active:scale-90"
          >
            {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
          </button>
          <span className="font-black text-slate-900 w-6 sm:w-7 text-center text-sm">{item.quantity}</span>
          <button
            onClick={() => {
              if (String(item.id).startsWith('c_') || String(item.id).startsWith('gift_')) {
                alert("You can only have 1 of this promotional item per order.");
                return;
              }
              updateQuantity(item.id, item.quantity + 1);
            }}
            className="touch-target w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-[var(--secondary)] shadow-sm flex items-center justify-center text-white hover:bg-[var(--secondary-dark)] transition active:scale-90"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Fee Line ────────────────────────────────────────────────────
const FeeLine = ({ icon, label, sublabel, amount, highlight, free, saved, strikethrough, color = 'text-slate-600' }) => (
  <div className={`flex items-start justify-between py-2.5 ${highlight ? 'bg-emerald-50 -mx-4 px-4 rounded-xl my-1' : ''}`}>
    <div className="flex items-start gap-3 flex-1 min-w-0">
      {icon && <span className="mt-0.5 flex-shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${color} truncate`}>{label}</p>
        {sublabel && <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5 break-words pr-2">{sublabel}</p>}
      </div>
    </div>
    <div className="text-right ml-4 flex-shrink-0">
      {saved 
        ? <span className="text-sm font-black text-emerald-600">SAVED ₹{amount}</span>
        : free
        ? <span className="text-sm font-black text-emerald-600">FREE</span>
        : <span className={`text-sm font-black ${strikethrough ? 'line-through text-slate-300' : 'text-slate-900'}`}>₹{amount}</span>
      }
    </div>
  </div>
);

// ─── Spin Wheel Modal ───────────────────────────────────────────
const SpinWheelModal = ({ isOpen, onClose, items, onWin }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  const spin = () => {
    if (isSpinning || !items || items.length < 1) return;
    setIsSpinning(true);
    // Add multiple rotations (5-8 full spins) + random target
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const randomDegrees = Math.floor(Math.random() * 360);
    const newRotation = rotation + (extraSpins * 360) + randomDegrees;
    setRotation(newRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      const actualRotation = newRotation % 360;
      const segmentSize = items.length > 0 ? 360 / items.length : 360;
      // Pointer is at top (0 degrees). Wheel rotates clockwise.
      // So the winner is the item that lands under 0 deg.
      const winningIndex = Math.floor((360 - actualRotation) / segmentSize) % (items.length || 1);
      onWin(items[winningIndex]);
    }, 4100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-md p-8 relative overflow-hidden shadow-2xl">
        <button onClick={onClose} disabled={isSpinning} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-0"><X size={20}/></button>
        
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Gift size={32} />
           </div>
           <h2 className="text-3xl font-black text-slate-900 leading-tight">Your Lucky Airdrop!</h2>
           <p className="text-slate-500 font-medium">Spin to unlock your free premium gift</p>
        </div>

        <div className="relative aspect-square max-w-[280px] mx-auto mb-8">
           {items.length === 0 ? (
             <div className="w-full h-full rounded-full border-[12px] border-slate-100 flex flex-col items-center justify-center text-center p-6 bg-slate-50">
                <AlertCircle size={40} className="text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Admin has not added any gifts to the wheel yet!</p>
             </div>
           ) : (
             <>
                {/* Pointer */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 text-[var(--secondary)] drop-shadow-lg">
                   <ChevronDown size={44} strokeWidth={4} />
                </div>
                
                <motion.div 
                  animate={{ rotate: rotation }}
                  transition={{ duration: 4, ease: [0.12, 0, 0.39, 0] }}
                  className="w-full h-full rounded-full border-[12px] border-slate-100 relative overflow-hidden shadow-2xl bg-white"
                >
                   {items.map((item, idx) => {
                     const angle = 360 / items.length;
                     return (
                       <div 
                         key={idx}
                         className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 origin-bottom flex flex-col items-center pt-2"
                         style={{ 
                           transform: `translateX(-50%) rotate(${idx * angle + angle / 2}deg)`,
                           width: `${Math.tan((angle / 2) * (Math.PI / 180)) * 100}%`
                         }}
                       >
                          <div className="flex flex-col items-center gap-1">
                             <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-50">
                                {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center bg-purple-50 text-purple-300 font-bold">?</div>}
                             </div>
                             <p className="text-[9px] font-black uppercase text-slate-700 tracking-tighter text-center line-clamp-1 max-w-[60px]">{item.name}</p>
                          </div>
                       </div>
                     );
                   })}
                   
                   {/* Divider lines */}
                   {items.map((_, idx) => (
                     <div 
                       key={`line-${idx}`}
                       className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-[2px] bg-slate-100/50 origin-bottom"
                       style={{ transform: `translateX(-50%) rotate(${idx * (360 / items.length)}deg)` }}
                     />
                   ))}
                </motion.div>
             </>
           )}
        </div>

        <button 
          onClick={spin}
          disabled={isSpinning || items.length === 0}
          className="w-full bg-[var(--secondary)] text-white py-5 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 text-xl tracking-wide uppercase"
        >
          {isSpinning ? 'Good Luck...' : 'TAP TO SPIN!'}
        </button>
      </div>
    </div>
  );
};

// ─── Air Drop Component ──────────────────────────────────────────
const AirDrop = ({ onClick }) => {
  return (
    <div className="fixed bottom-32 right-8 z-50 cursor-pointer group" onClick={onClick}>
       <motion.div 
         initial={{ y: -600, opacity: 0, rotate: -15 }}
         animate={{ y: 0, opacity: 1, rotate: 0 }}
         transition={{ type: "spring", damping: 20, stiffness: 80, duration: 1.5 }}
         className="relative"
       >
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          >
            {/* Ultra-Glow Effect */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/30 rounded-full blur-[60px] group-hover:bg-purple-500/50 transition-all duration-700 animate-pulse"></div>
            
            {/* Parachute Canopy (Segmented & Striped) */}
            <div className="relative w-32 h-16 bg-white rounded-t-full shadow-[0_25px_50px_rgba(139,92,246,0.4)] overflow-hidden border-b-4 border-slate-100 group-hover:scale-110 transition-transform duration-700">
               <div className="absolute inset-0 flex">
                  <div className="flex-1 bg-gradient-to-b from-purple-600 to-indigo-800 border-r border-white/20"></div>
                  <div className="flex-1 bg-gradient-to-b from-white to-slate-200 border-r border-white/20"></div>
                  <div className="flex-1 bg-gradient-to-b from-purple-600 to-indigo-800 border-r border-white/20"></div>
                  <div className="flex-1 bg-gradient-to-b from-white to-slate-200 border-r border-white/20"></div>
                  <div className="flex-1 bg-gradient-to-b from-purple-600 to-indigo-800"></div>
               </div>
               {/* Depth Shading */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/20"></div>
            </div>

            {/* Detailed SVG Strings */}
            <svg className="absolute top-[60px] left-1/2 -translate-x-1/2 w-32 h-24 overflow-visible pointer-events-none drop-shadow-sm">
               <path d="M4,0 L64,80" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" />
               <path d="M32,0 L64,80" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" />
               <path d="M64,0 L64,80" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" />
               <path d="M96,0 L64,80" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" />
               <path d="M124,0 L64,80" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" />
            </svg>

            {/* Wooden Reward Crate */}
            <div className="relative mt-24 mx-auto w-20 h-20 bg-[#92400e] rounded-2xl border-[5px] border-[#451a03] shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 transform group-hover:rotate-12">
               {/* Reinforced Crossbars */}
               <div className="absolute inset-3 border-[3px] border-[#451a03]/40 flex items-center justify-center">
                  <div className="w-full h-[4px] bg-[#451a03]/30 rotate-45"></div>
                  <div className="w-full h-[4px] bg-[#451a03]/30 -rotate-45 absolute"></div>
               </div>
               {/* Steel Rivets */}
               <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-slate-400 rounded-full shadow-inner border border-slate-500"></div>
               <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-slate-400 rounded-full shadow-inner border border-slate-500"></div>
               <div className="absolute bottom-1.5 left-1.5 w-2 h-2 bg-slate-400 rounded-full shadow-inner border border-slate-500"></div>
               <div className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-slate-400 rounded-full shadow-inner border border-slate-500"></div>
               
               <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm border border-white/20 animate-pulse">
                  <Gift size={32} className="text-white drop-shadow-2xl" />
               </div>
            </div>
          </motion.div>

          {/* Luxury Badge */}
          <div className="absolute -top-20 -right-8 whitespace-nowrap">
             <motion.div 
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-black px-5 py-2 rounded-full shadow-[0_15px_30px_rgba(239,68,68,0.4)] ring-4 ring-white flex items-center gap-2 border border-white/20"
             >
               <Sparkles size={14} className="animate-pulse" />
               FREE GIFT UNLOCKED
             </motion.div>
          </div>

          {/* Interaction HUD */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 scale-90 group-hover:scale-100">
             <span className="bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-black px-7 py-3 rounded-[24px] shadow-2xl uppercase tracking-[0.3em] border border-white/20 whitespace-nowrap flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
               Tap to Claim 🎁
             </span>
          </div>
       </motion.div>
    </div>
  );
};

// ─── SwipeToPlaceOrder ───────────────────────────────────────────
const SwipeToPlaceOrder = ({ onSwipeComplete, isProcessing, paymentMethod, deliveryType }) => {
  const [swiped, setSwiped] = useState(false);
  const trackRef = React.useRef(null);
  const [maxDrag, setMaxDrag] = useState(240);

  const triggerRef = React.useRef(false);

  useEffect(() => {
    if (trackRef.current) {
      const trackW = trackRef.current.clientWidth;
      setMaxDrag(trackW - 64); // Subtract padding (2 * 6px = 12px) and handle width (52px)
    }
    
    // Add window resize listener to recalculate width dynamically
    const handleResize = () => {
      if (trackRef.current) {
        setMaxDrag(trackRef.current.clientWidth - 64);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={trackRef}
      className="relative w-full h-16 bg-gradient-to-r from-[var(--secondary)] to-emerald-500 rounded-full p-1.5 flex items-center justify-center overflow-hidden border border-emerald-400 shadow-inner group select-none z-10"
    >
      {/* Subtle shining overlay inside the container track */}
      <div 
        className="absolute inset-0 bg-white/5 opacity-10 rounded-full pointer-events-none" 
      />

      {/* Slide track guide text — high-contrast premium white text */}
      <motion.p 
        animate={{ opacity: isProcessing ? 0.4 : [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-xs sm:text-sm font-[900] text-white/95 drop-shadow-sm z-10 pointer-events-none uppercase tracking-widest select-none"
      >
        {isProcessing 
          ? 'Placing Order...' 
          : paymentMethod === 'online' 
            ? '⚡ Swipe to Pay & Order ⚡' 
            : '🛒 Swipe to Place Order 🛒'}
      </motion.p>

      {/* Sliding block (Circle white handle with green arrow) */}
      {!isProcessing && !swiped && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: maxDrag }}
          dragElastic={0.05}
          dragMomentum={false}
          onDrag={(event, info) => {
            if (info.offset.x >= maxDrag - 8 && !triggerRef.current) {
              triggerRef.current = true;
              setSwiped(true);
              onSwipeComplete();
            }
          }}
          className="absolute left-1.5 top-1.5 bottom-1.5 w-[52px] h-[52px] rounded-full bg-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing text-[var(--secondary)] z-20 group-hover:scale-105 transition-transform"
        >
          <ChevronRight size={26} strokeWidth={3} className="text-[var(--secondary)] animate-pulse" />
        </motion.div>
      )}

      {swiped && (
        <div className="absolute inset-1.5 rounded-full bg-gradient-to-r from-[var(--secondary)] to-emerald-500 flex items-center justify-center text-white font-[900] uppercase text-xs sm:text-sm animate-pulse z-20">
          Order Triggered! 🚀
        </div>
      )}
    </div>
  );
};

// ─── TruckLoadingAnimation ───────────────────────────────────────
const TruckLoadingAnimation = ({ onFinish }) => {
  const [step, setStep] = useState(0); // 0: loading, 1: rumbling, 2: zoom off

  useEffect(() => {
    // Stage 1: Loading boxes (0s - 2s)
    const t1 = setTimeout(() => setStep(1), 2200);
    // Stage 2: Rumbling engine (2.2s - 3.2s)
    const t2 = setTimeout(() => setStep(2), 3400);
    // Stage 3: Drive away & finish (4.5s)
    const t3 = setTimeout(() => {
      onFinish();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  // Box falling positions
  const boxes = [
    { id: 1, delay: 0.2, x: -12, color: 'bg-orange-500' },
    { id: 2, delay: 0.7, x: 12, color: 'bg-emerald-500' },
    { id: 3, delay: 1.2, x: 0, color: 'bg-amber-400' },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden">
      <div className="text-center mb-12 max-w-sm px-6">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-[900] text-white mb-3"
        >
          {step === 0 && "Harvesting freshness... 🧺"}
          {step === 1 && "Stowing your crates... 📦"}
          {step === 2 && "Speeding to your door! 🚚💨"}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="text-emerald-400 text-xs sm:text-sm font-black uppercase tracking-[0.25em]"
        >
          {step === 0 && "Real Farms Direct Sourcing"}
          {step === 1 && "Preparing priority delivery"}
          {step === 2 && "Smart Logistics Active"}
        </motion.p>
      </div>

      {/* Animation Area */}
      <div className="relative w-full max-w-md h-64 flex items-end justify-center px-4">
        {/* Ground Line */}
        <div className="absolute bottom-6 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent rounded-full" />

        {/* Floating Clouds Background */}
        <div className="absolute top-0 inset-x-0 overflow-hidden pointer-events-none opacity-20">
          <motion.div 
            animate={{ x: [-100, 400] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-4 left-10 w-20 h-6 bg-white rounded-full blur-[1px]"
          />
          <motion.div 
            animate={{ x: [400, -100] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute top-12 right-12 w-28 h-8 bg-white rounded-full blur-[2px]"
          />
        </div>

        {/* Falling Boxes */}
        {step === 0 && boxes.map(b => (
          <motion.div
            key={b.id}
            initial={{ y: -200, opacity: 0, scale: 0.5, rotate: -30 }}
            animate={{ y: -64, opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: b.delay, type: 'spring', damping: 12 }}
            className={`absolute left-1/2 -ml-4 w-8 h-8 rounded-lg shadow-md flex items-center justify-center text-[10px] text-white font-black border-2 border-white/20 ${b.color}`}
            style={{ x: b.x }}
          >
            {b.id === 1 && "🥦"}
            {b.id === 2 && "🍎"}
            {b.id === 3 && "📦"}
          </motion.div>
        ))}

        {/* The Truck Container */}
        <motion.div
          animate={
            step === 1
              ? { y: [0, -3, 0, -2, 0], rotate: [0, 0.5, -0.5, 0] }
              : step === 2
              ? { x: [0, -20, 600], scaleX: [1, 1.05, 0.95], skewX: [0, 5, -5] }
              : {}
          }
          transition={
            step === 1
              ? { repeat: Infinity, duration: 0.15 }
              : step === 2
              ? { duration: 1.2, ease: [0.42, 0, 0.58, 1] }
              : {}
          }
          className="relative w-56 h-32 flex items-end justify-center z-10 select-none"
        >
          {/* Truck Body SVG */}
          <svg className="w-full h-full drop-shadow-[0_15px_30px_rgba(4,79,29,0.35)]" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M140 40H170L185 60V85H140V40Z" fill="#ffdc4e" />
            <path d="M165 44H173L181 56V58H165V44Z" fill="#1e293b" />
            <rect x="182" y="68" width="5" height="10" rx="2" fill="#02520a" />

            <rect x="30" y="20" width="112" height="65" rx="8" fill="#044f1d" />
            
            <text x="45" y="48" fill="#ffdc4e" fontSize="11" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">QWIKBASKET</text>
            <text x="45" y="60" fill="#c8ffd6" fontSize="7" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.5">🌿 Farm Fresh Direct</text>
            <path d="M30 45H142" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
            <path d="M30 65H142" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

            <rect x="25" y="82" width="160" height="6" rx="3" fill="#64748b" />

            <circle cx="60" cy="88" r="14" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
            <circle cx="60" cy="88" r="6" fill="#cbd5e1" />
            
            <circle cx="150" cy="88" r="14" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
            <circle cx="150" cy="88" r="6" fill="#cbd5e1" />
          </svg>

          {/* Exhaust Smoke particle effect */}
          {step === 2 && (
            <div className="absolute left-[-20px] bottom-[15px] flex flex-col gap-1.5 pointer-events-none">
              <motion.div 
                initial={{ scale: 0.2, opacity: 0.8, x: 0, y: 0 }}
                animate={{ scale: 2, opacity: 0, x: -80, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-4 h-4 bg-slate-500 rounded-full blur-[2px]"
              />
              <motion.div 
                initial={{ scale: 0.2, opacity: 0.8, x: 0, y: 10 }}
                animate={{ scale: 1.8, opacity: 0, x: -100, y: -10 }}
                transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
                className="w-5 h-5 bg-slate-600 rounded-full blur-[3px]"
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Progress HUD indicator */}
      <div className="mt-8 w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 4.4, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-yellow-400 to-emerald-500 rounded-full"
        />
      </div>
    </div>
  );
};

// ─── Steps ──────────────────────────────────────────────────────
const STEPS = ['Cart', 'Address', 'Delivery & Pay'];

// ════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
const Cart = () => {
  const { user, refreshUser } = useAuth();
  const { 
    cartItems, removeFromCart, updateQuantity, subtotal, clearCart, 
    getTieredPrice, addToCart, bulkVolumeDiscount, isBulkDiscountEligible, bulkPercentage 
  } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placedOrder, setPlacedOrder] = useState(null);
  const navigate = useNavigate();

  // Premium state definitions for Swipe To Order and animated delivery truck
  const [showTruckAnimation, setShowTruckAnimation] = useState(false);
  const [pendingPlacedOrder, setPendingPlacedOrder] = useState(null);
  const [animationFinished, setAnimationFinished] = useState(false);

  // Synchronized callback that runs once the truck finishes zooming off and API completes
  useEffect(() => {
    if (animationFinished && pendingPlacedOrder) {
      setPlacedOrder(pendingPlacedOrder);
      setShowConfetti(true);
      setCheckoutStep(4);
      clearCart();
      refreshUser();
      setAnimationFinished(false);
      setShowTruckAnimation(false);
      setPendingPlacedOrder(null);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [animationFinished, pendingPlacedOrder, clearCart, refreshUser]);

  const handleAnimationFinish = () => {
    setAnimationFinished(true);
  };

  // Standard subtotal excludes any "Deal" items (ids starting with 'c_')
  const standardSubtotal = cartItems.filter(i => !String(i.id).startsWith('c_')).reduce((sum, i) => {
    const price = getTieredPrice ? getTieredPrice(i, i.quantity) : (i.b2cNewPrice || i.price || 0);
    return sum + (price * i.quantity);
  }, 0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [appSettings, setAppSettings] = useState(null);
  const [products, setProducts] = useState([]);

  // Spin Wheel logic
  const [isSpinWheelOpen, setIsSpinWheelOpen] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const hasGift = cartItems.some(i => String(i.id).startsWith('gift_'));
  const hasDeal = cartItems.some(i => String(i.id).startsWith('c_'));
  
  const spinWheelThreshold = appSettings?.spinWheelMinCartValue || 500;
  const isSpinWheelEligible = appSettings?.spinWheelEnabled && standardSubtotal >= spinWheelThreshold && !hasGift && !hasSpun && !hasDeal;

  const handleWinGift = (gift) => {
    setHasSpun(true);
    setIsSpinWheelOpen(false);
    setShowConfetti(true);
    
    // Auto-remove any existing "Quick Add" deals
    cartItems.forEach(i => {
      if (String(i.id).startsWith('c_')) {
        removeFromCart(i.id);
      }
    });
    
    // Add to cart with price 0
    addToCart({
       id: `gift_${gift.id}`,
       name: `FREE GIFT: ${gift.name}`,
       b2cNewPrice: 0,
       b2bNewPrice: 0,
       price: 0,
       images: JSON.stringify([gift.image]),
       isGift: true,
       unit: 'Gift'
    }, 1);
    
    setTimeout(() => setShowConfetti(false), 5000);
  };

  // Load settings and products
  useEffect(() => {
    fetchSettings().then(setAppSettings);
    fetchProducts().then(setProducts);
  }, []);

  // Auto-remove deals if cart drops below threshold
  useEffect(() => {
    let sections = [];
    try { sections = JSON.parse(appSettings?.checkoutSections || '[]'); } catch {}
    
    const dealItems = cartItems.filter(i => String(i.id).startsWith('c_'));
    dealItems.forEach(dealItem => {
      const section = sections.find(sec => sec.customItems?.some(p => p.id === dealItem.id));
      if (hasGift || (section && section.minCartValue > 0 && standardSubtotal < section.minCartValue)) {
        removeFromCart(dealItem.id);
      }
    });
  }, [cartItems, standardSubtotal, appSettings, removeFromCart, hasGift]);

  // Coins & Coupons
  const [farmerCoins, setFarmerCoins] = useState(0);
  const [useFarmerCoins, setUseFarmerCoins] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState([]);

  // Load public coupons
  useEffect(() => {
    fetchPublicCoupons().then(res => setPublicCoupons(res || []));
  }, []);

  // Address state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ fullName: '', phone: '', addressLine: '', landmark: '', pincode: '' });
  const [addrError, setAddrError] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // null | 'checking' | 'ok' | 'error'

  // Mobile summary sheet state
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Delivery type state
  const [deliveryType, setDeliveryType] = useState('Smart');
  const availableSlots = getAvailableSlots(appSettings || {});
  const [selectedSlot, setSelectedSlot] = useState('');
  
  useEffect(() => {
    if (!selectedSlot && availableSlots.length > 0) {
      setSelectedSlot(availableSlots[0].display);
    }
  }, [availableSlots, selectedSlot]);
  
  const isB2BUserPending = user?.role === 'b2b' && !user?.isApproved;

  // Quick-add recommendations
  const [recommended, setRecommended] = useState([]);

  // Load User Profile for Coins
  useEffect(() => {
    if (user) {
      getUserProfile().then(res => {
        if (res?.success) setFarmerCoins(res.data.farmerCoins || 0);
      });
    }
  }, [user]);

  // Load recommendations (dedicated endpoint, excludes cart items)
  useEffect(() => {
    const cartIds = cartItems.map(i => i.id);
    fetchRecommendations(cartIds).then(recs => {
      setRecommended((recs || []).slice(0, 6));
    });
  }, [cartItems]);

  // Load addresses — from backend if logged in, else localStorage
  useEffect(() => {
    setSelectedAddressId(null);
    setSavedAddresses([]);

    const loadAddresses = async () => {
      if (user) {
        try {
          const backendAddresses = await fetchAddresses();
          if (backendAddresses) {
            setSavedAddresses(backendAddresses);
            if (backendAddresses.length > 0) {
              const defaultAddr = backendAddresses.find(a => a.isDefault) || backendAddresses[0];
              setSelectedAddressId(defaultAddr.id);
              localStorage.setItem('qb_addresses', JSON.stringify(backendAddresses));
            } else {
              localStorage.setItem('qb_addresses', '[]');
            }
            return;
          }
        } catch (e) {
          console.error("Error loading backend addresses:", e);
        }
      }
      // Fallback: localStorage (guest or backend offline/error)
      try {
        const stored = JSON.parse(localStorage.getItem('qb_addresses') || '[]') || [];
        setSavedAddresses(stored);
        if (stored.length > 0) {
          setSelectedAddressId(stored[0].id);
        }
      } catch (err) {
        console.error("Error loading cached addresses:", err);
      }
    };
    loadAddresses();
  }, [user]);

  // Save address — to backend if logged in, else localStorage
  const saveAddressToBackend = async (addr) => {
    if (user) {
      try {
        const res = await createAddress(addr);
        if (res.success && res.data) {
          const newAddr = res.data;
          const updated = [...savedAddresses, newAddr];
          setSavedAddresses(updated);
          localStorage.setItem('qb_addresses', JSON.stringify(updated));
          setSelectedAddressId(newAddr.id);
          return newAddr;
        }
      } catch (e) { /* fall through */ }
    }
    // Fallback for guests
    const newAddr = { ...addr, id: Date.now().toString() };
    const updated = [...savedAddresses, newAddr];
    setSavedAddresses(updated);
    localStorage.setItem('qb_addresses', JSON.stringify(updated));
    setSelectedAddressId(newAddr.id);
    return newAddr;
  };

  // Value Pack Savings
  const valuePackSavings = cartItems
    .filter(item => item.isValuePack)
    .reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);

  // Fee calculation
  const fees = computeFees(subtotal, deliveryType, appSettings || {});
  const qwikOk = isQwikAvailable(appSettings || {});
  const isB2B = user?.role === 'b2b' && user?.isApproved;

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const afterCoupon = Math.max(0, fees.total - discountAmount);
  const redemptionRate = appSettings?.farmerCoinRedemptionRate || 1;
  const coinsRedeemed = useFarmerCoins ? Math.min(farmerCoins, Math.floor(afterCoupon / redemptionRate)) : 0;
  const finalTotal = afterCoupon - (coinsRedeemed * redemptionRate) - bulkVolumeDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    const res = await validateCoupon(couponCode);
    setIsApplyingCoupon(false);
    if (res.success && res.data) {
      setAppliedCoupon(res.data);
      setCouponCode('');
    } else {
      setCouponError(res.error || 'Invalid coupon');
    }
  };

  // ── Address form handlers ─────────────────────────────────
  const handleAddrChange = (e) => setAddrForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePincodeBlur = async () => {
    if (addrForm.pincode.length !== 6) return;
    setPincodeStatus('checking');
    const result = await checkServiceability(addrForm.pincode);
    setPincodeStatus(result.serviceable ? 'ok' : 'error');
    if (!result.serviceable) setAddrError(result.message || 'We don\'t deliver to this pincode yet.');
    else setAddrError('');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddrError('');
    const { fullName, phone, addressLine, pincode } = addrForm;
    if (fullName.length < 3) return setAddrError('Full name must be at least 3 characters.');
    if (!/^[6-9]\d{9}$/.test(phone)) return setAddrError('Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.');
    if (addressLine.length < 5) return setAddrError('Please enter your complete address.');
    if (!/^\d{6}$/.test(pincode)) return setAddrError('Pincode must be exactly 6 digits.');
    if (pincodeStatus === 'error') return setAddrError('We don\'t deliver to this pincode yet. Try another.');

    setIsProcessing(true);
    const check = await checkServiceability(pincode);
    if (!check.serviceable) {
      setAddrError(check.message || "We don't deliver to this pincode yet.");
      setIsProcessing(false);
      return;
    }
    await saveAddressToBackend({ ...addrForm, isDefault: savedAddresses.length === 0 });
    setShowAddressForm(false);
    setAddrForm({ fullName: '', phone: '', addressLine: '', landmark: '', pincode: '' });
    setPincodeStatus(null);
    setIsProcessing(false);
  };

  // ── Razorpay flow ─────────────────────────────────────────
  const startRazorpay = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) { alert('Razorpay failed to load.'); return false; }
    const rzpRes = await createRazorpayOrder(finalTotal);
    if (!rzpRes.success) { alert('Payment setup failed: ' + (rzpRes.error || 'Unknown error')); return false; }
    const settings = appSettings || {};
    return new Promise((resolve) => {
      const options = {
        key: settings.razorpayKeyId || '',
        amount: rzpRes.data.amount,
        currency: 'INR',
        name: 'QwikBasket by Real Farms',
        description: `${deliveryType} Delivery Order`,
        order_id: rzpRes.data.id,
        prefill: { name: user?.name || '', contact: user?.phone || '' },
        theme: { color: '#1FB33B' },
        handler: (r) => resolve({ success: true, paymentId: r.razorpay_payment_id }),
        modal: { ondismiss: () => resolve({ success: false }) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  // ── Build delivery slot string ────────────────────────────
  const buildDeliverySlot = () => {
    if (deliveryType === 'Qwik') return 'Qwik Delivery – Within 45–60 mins 🚀';
    return `Smart Delivery – ${selectedSlot}`;
  };

  // ── Place order ───────────────────────────────────────────
  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    if (isProcessing) return; // Guard: never re-enter while processing

    if (checkoutStep === 1) { setCheckoutStep(2); return; }

    if (checkoutStep === 2) {
      if (!selectedAddressId && (!savedAddresses || savedAddresses.length === 0)) {
        return alert('Please add a delivery address to continue.');
      }
      if (!selectedAddressId) return alert('Please select a delivery address.');
      setCheckoutStep(3);
      return;
    }

    if (checkoutStep === 3) {
      if (deliveryType === 'Qwik' && !qwikOk) {
        return alert('Stores closed, will open tomorrow fresh and Qwik Delivery will start from 7 AM in morning.');
      }

      setIsProcessing(true);
      
      // Stock Validation Check
      try {
         const stockCheck = await validateCartStock(cartItems);
         if (stockCheck && stockCheck.success && stockCheck.data && stockCheck.data.length > 0) {
            let msg = "Some items in your cart exceeded available stock and have been adjusted:\n\n";
            stockCheck.data.forEach(invalidItem => {
               msg += `- ${invalidItem.name} (Available: ${invalidItem.availableStock})\n`;
               if (invalidItem.availableStock <= 0) {
                  removeFromCart(invalidItem.id);
               } else {
                  updateQuantity(invalidItem.id, invalidItem.availableStock);
               }
            });
            alert(msg);
            setIsProcessing(false);
            setCheckoutStep(1); // Go back to cart view to review changes
            return;
         }
      } catch (e) {
         console.error("Stock validation error", e);
      }

      try {
        let paymentId = null;
        if (paymentMethod === 'online') {
          const result = await startRazorpay();
          if (!result || !result.success) { setIsProcessing(false); return; }
          paymentId = result.paymentId;
        }

        // Trigger the truck loading animation IMMEDIATELY on confirmation
        setShowTruckAnimation(true);

        const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);
        const orderData = {
          items: cartItems.map(i => ({
            productId: i.id, name: i.name,
            price: getTieredPrice ? getTieredPrice(i, i.quantity) : i.price,
            quantity: i.quantity, unit: i.unit || 'Pack',
            image: i.isValuePack ? i.image : (i.images?.[0] || ''),
            isValuePack: i.isValuePack || false,
            packItems: i.isValuePack ? i.items : null
          })),
          subtotal,
          deliveryFee: fees.deliveryFee,
          packagingFee: fees.packagingFee,
          smallCartFee: fees.smallCartFee + fees.qwikSurcharge,
          totalAmount: finalTotal,
          paymentMethod,
          deliveryAddress: selectedAddr,
          deliverySlot: buildDeliverySlot(),
          deliveryType,
          paymentId,
          coinsRedeemed,
          discountAmount,
          bulkVolumeDiscount,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
        };
        const result = await createOrder(orderData);
        if (!result || result.success === false) {
          throw new Error(result?.error || 'Failed to place order');
        }
        setPendingPlacedOrder(result.data || result);
      } catch (err) {
        setShowTruckAnimation(false);
        alert('Order failed: ' + (err.message || 'Unknown error'));
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // ── Invoice download ──────────────────────────────────────
  const downloadInvoice = () => {
    if (!placedOrder) return;
    const o = placedOrder;
    const html = `<html><head><title>Invoice - ${o.orderNumber}</title>
    <style>* { box-sizing:border-box; margin:0; padding:0; }
    body { font-family: system-ui; padding:48px; color:#1e293b; }
      <div><div class="brand">Qwik<span>Basket</span></div><div style="color:#64748b;font-size:13px;font-weight:600;margin-top:4px">by Real Farms — Delivering Quality over Time</div></div>
      <div style="text-align:right"><div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#94a3b8;margin-bottom:4px">Invoice</div>
      <div style="font-size:20px;font-weight:900">#${o.orderNumber}</div>
      <div style="color:#64748b;font-size:12px;margin-top:4px">${new Date(o.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div>
      </div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px">
      <div><div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:4px">Deliver To</div>
      <div style="font-size:15px;font-weight:800;margin-bottom:4px">${o.deliveryAddress?.fullName || ''}</div>
      <div style="color:#64748b;font-size:13px;line-height:1.8">${o.deliveryAddress?.addressLine || ''}<br/>${o.deliveryAddress?.landmark ? o.deliveryAddress.landmark + '<br/>' : ''}Pincode: ${o.deliveryAddress?.pincode || ''}<br/>📞 ${o.deliveryAddress?.phone || ''}</div></div>
      <div style="text-align:right">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:4px">Delivery</div>
      <div style="font-weight:800">${o.deliveryType || 'Smart'} Delivery</div>
      <div style="color:#64748b;font-size:13px;margin-top:2px">${o.deliverySlot || ''}</div>
      <div style="margin-top:16px"><div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:4px">Payment</div>
      <div style="font-weight:800;text-transform:uppercase">${o.paymentMethod}</div></div></div></div>
    <table><thead><tr><th>Item</th><th>Unit</th><th>Qty</th><th>Rate</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${(o.items||[]).map(item=>`<tr><td style="font-weight:800">${item.name}</td><td>${item.unit}</td><td>${item.quantity}</td><td>₹${Number(item.price||0).toFixed(2)}</td><td style="text-align:right;font-weight:800">₹${Number((item.price||0)*(item.quantity||1)).toFixed(2)}</td></tr>`).join('')}</tbody></table>
    <div class="total">
    <div style="color:#64748b;font-weight:700;margin-bottom:6px">Items Total: ₹${Number(o.subtotal||0).toFixed(2)}</div>
    <div style="color:#64748b;font-weight:700;margin-bottom:6px">Delivery: ${(o.deliveryFee||0)===0?'<span style="color:#1FB33B;font-weight:800">FREE</span>':'₹'+Number(o.deliveryFee||0).toFixed(2)}</div>
    ${o.packagingFee ? `<div style="color:#64748b;font-weight:700;margin-bottom:6px">Care & Packaging: ₹${Number(o.packagingFee).toFixed(2)}</div>` : ''}
    ${o.smallCartFee ? `<div style="color:#64748b;font-weight:700;margin-bottom:6px">Service Fee: ₹${Number(o.smallCartFee).toFixed(2)}</div>` : ''}
    <div style="font-size:22px;font-weight:900;color:#1e293b;margin-top:12px;border-top:2px solid #e2e8f0;padding-top:12px">Grand Total: ₹${Number(o.totalAmount||0).toFixed(2)}</div>
    </div>
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:12px;font-weight:600">Thank you for choosing QwikBasket by Real Farms! For support contact us at support@qwikbasket.com</div>
    </body></html>`;
    const win = window.open('', '', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  // ─── Empty cart ───────────────────────────────────────────
  if (cartItems.length === 0 && checkoutStep !== 4) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center bg-gray-50 px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag size={48} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-black mb-4 text-slate-900">Your cart is empty</h2>
          <p className="text-gray-500 font-medium mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/" className="bg-[var(--secondary)] text-white px-10 py-4 rounded-full font-black text-lg shadow-lg hover:bg-[var(--secondary-dark)] active:scale-95 transition">Start Shopping</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-100px)] pt-12 pb-28">
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">

        {/* ── Step 4: Success ─────────────────────────────── */}
        <AnimatePresence mode="wait">
          {checkoutStep === 4 ? (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl mx-auto">
              <motion.div className="bg-white rounded-[32px] overflow-hidden shadow-2xl" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', duration: 0.8, bounce: 0.3 }}>
                <div className="bg-gradient-to-br from-[var(--secondary)] to-emerald-400 p-10 text-center">
                  <motion.div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ type: 'spring', delay: 0.3, duration: 0.8 }}>
                    <CheckCircle2 size={60} className="text-white" />
                  </motion.div>
                  <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-4xl font-black text-white mb-2">Order Placed! 🎉</motion.h2>
                  <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="text-white/80 font-semibold text-sm">
                    {placedOrder?.deliveryType === 'Qwik'
                      ? '🚀 Your Qwik order is on its way — expect delivery in 45–60 mins!'
                      : '✅ Your order is confirmed and headed your way!'}
                  </motion.p>
                  {placedOrder?.coinsEarned > 0 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring' }} className="mt-4 p-4 bg-yellow-500/20 border border-yellow-400 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                       <style>{`
                          @keyframes spinCoin { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
                       `}</style>
                       <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full border-4 border-yellow-200 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.6)] mb-2" style={{ animation: 'spinCoin 3s linear infinite' }}>
                          <span className="text-4xl text-white drop-shadow-md">👳🏽‍♂️</span>
                       </div>
                       <p className="font-black text-2xl text-yellow-300 drop-shadow-md">+{placedOrder.coinsEarned} Farmer Coins</p>
                       <p className="text-yellow-100 text-xs font-bold uppercase tracking-widest mt-1">Earned on this order!</p>
                    </motion.div>
                  )}
                </div>
                <motion.div className="p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                  {placedOrder && (
                    <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-sm space-y-2">
                      <div className="flex justify-between"><span className="text-slate-500 font-bold">Order #</span><span className="font-black text-slate-900">{placedOrder.orderNumber}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500 font-bold">Total Paid</span><span className="font-black text-slate-900">₹{Number(placedOrder.totalAmount || 0).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500 font-bold">Delivery</span><span className="font-black text-slate-900 text-right max-w-[200px]">{placedOrder.deliverySlot}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500 font-bold">Payment</span><span className="font-black text-slate-900 uppercase">{placedOrder.paymentMethod}</span></div>
                    </div>
                  )}
                  {/* Order tracker */}
                  <div className="relative flex justify-between items-center mb-8 px-2">
                    <div className="absolute left-2 right-2 top-4 h-0.5 bg-emerald-100 z-0" />
                    {['Placed', 'Packed', 'Shipped', 'Delivered'].map((s, i) => (
                      <div key={s} className="relative z-10 flex flex-col items-center gap-1.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${i === 0 ? 'bg-[var(--secondary)] border-[var(--secondary)] text-white shadow-lg shadow-green-200' : 'bg-white border-gray-200 text-gray-300'}`}>
                          {i === 0 ? '✓' : i + 1}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-tight ${i === 0 ? 'text-[var(--secondary)]' : 'text-gray-300'}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={downloadInvoice} className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-black hover:border-slate-300 hover:bg-slate-50 transition"><FileText size={18} /> Invoice</button>
                    <button onClick={() => navigate('/profile')} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition flex items-center justify-center gap-2"><Package size={18} /> Track Order</button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Stepper — fluid on mobile */}
              <div className="flex items-center justify-between w-full max-w-md mx-auto mb-10 px-2 sm:px-0">
                {STEPS.map((step, i) => {
                  const stepNum = i + 1;
                  const isActive = checkoutStep === stepNum;
                  const isDone = checkoutStep > stepNum;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center relative z-10 flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 shadow-sm ${isDone ? 'bg-[var(--secondary)] text-white' : isActive ? 'bg-slate-900 text-white ring-4 ring-slate-200' : 'bg-white text-gray-300 border-2 border-gray-200'}`}>
                          {isDone ? <CheckCircle2 size={16} /> : stepNum}
                        </div>
                        <span className={`absolute top-full mt-2 text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap ${isActive ? 'text-slate-900' : isDone ? 'text-[var(--secondary)]' : 'text-gray-400'}`}>{step}</span>
                      </div>
                      {i < STEPS.length - 1 && <div className={`h-1 flex-1 mx-3 rounded-full transition-all duration-500 ${checkoutStep > stepNum ? 'bg-[var(--secondary)]' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* ── Left Column ──────────────────────────── */}
                <div className="lg:col-span-2 min-w-0">
                  <AnimatePresence mode="wait">

                    {/* ── STEP 1: CART ─────────────────────── */}
                    {checkoutStep === 1 && (
                      <motion.div key="step1" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                          <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-black text-slate-900">Your Cart ({cartItems.length})</h1>
                            <button onClick={clearCart} className="text-sm font-bold text-red-400 hover:text-red-600 transition">Clear all</button>
                          </div>

                          {/* Free delivery progress bar */}
                          {fees.amountToFree > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Gift size={16} className="text-emerald-600" />
                                  <p className="text-sm font-black text-emerald-800">Add ₹{fees.amountToFree} more for <span className="text-emerald-600">FREE delivery!</span></p>
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">₹{fees.FREE_THRESHOLD} threshold</span>
                              </div>
                              <div className="h-2 bg-white rounded-full overflow-hidden border border-emerald-100">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((subtotal / fees.FREE_THRESHOLD) * 100, 100)}%` }}
                                  transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                              </div>
                            </motion.div>
                          )}
                          {fees.isFree && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-emerald-500 rounded-2xl flex items-center gap-3">
                              <span className="text-2xl">🎉</span>
                              <div>
                                <p className="font-black text-white text-sm">You've unlocked FREE delivery!</p>
                                <p className="text-white/70 text-xs font-medium">Your order qualifies for free home delivery</p>
                              </div>
                            </motion.div>
                          )}

                          {/* Cart items */}
                          <div>
                            <AnimatePresence>
                              {cartItems.map(item => (
                                <CartItemRow
                                  key={item.id}
                                  item={item}
                                  updateQuantity={updateQuantity}
                                  removeFromCart={removeFromCart}
                                  getTieredPrice={getTieredPrice}
                                  isB2B={isB2B}
                                />
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Recommended items */}
                        {recommended.length > 0 && (
                          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                              <Sparkles size={18} className="text-amber-500" />
                              <h3 className="font-black text-slate-900">Add to your order</h3>
                              <span className="text-[10px] bg-amber-100 text-amber-700 font-black px-2 py-0.5 rounded-full uppercase ml-auto">Quick Add</span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
                              {recommended.map(p => {
                                const recImgs = parseImages(p.images);
                                const recPrice = getDisplayPrice(p);
                                return (
                                  <div
                                    key={p.id}
                                    className="flex-shrink-0 w-32 bg-slate-50 rounded-2xl p-3 border border-slate-100 transition-all group flex flex-col"
                                  >
                                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-white mb-2 border border-slate-100">
                                      {recImgs[0]
                                        ? <img src={recImgs[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>}
                                    </div>
                                    <p className="text-xs font-black text-slate-800 line-clamp-2 leading-tight mb-1 flex-1">{p.name}</p>
                                    <div className="flex items-center justify-between mt-auto pt-2">
                                      <p className="text-xs font-black text-[var(--secondary)]">{recPrice > 0 ? `₹${recPrice}` : ''}</p>
                                      <button 
                                        onClick={(e) => { e.preventDefault(); addToCart(p, 1); }}
                                        className="bg-[var(--secondary)] text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition"
                                      >
                                        ADD
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Dynamic Checkout Sections (Quick Add) */}
                        {(() => {
                          let sections = [];
                          try { sections = JSON.parse(appSettings?.checkoutSections || '[]'); } catch {}
                          
                          
                          return sections.map(sec => {
                             if (!sec.isVisible || !sec.customItems || sec.customItems.length === 0) return null;
                             const secProducts = sec.customItems;
                             if (secProducts.length === 0) return null;
                             
                             const isLocked = (sec.minCartValue > 0 && standardSubtotal < sec.minCartValue) || hasGift;
                             const amountNeeded = sec.minCartValue - standardSubtotal;
                             
                             return (
                                <div key={sec.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-6 relative">
                                  {/* Unlock Heading Logic */}
                                  <div className="flex items-center gap-2 mb-4">
                                    {isLocked ? (
                                      <>
                                        <div className="bg-orange-100 text-orange-500 p-1 rounded-full"><Lock size={16} /></div>
                                        <h3 className="font-black text-slate-800 text-sm">
                                          {hasGift ? `Offer Applied: Free Gift` : `Add ₹${amountNeeded.toFixed(2)} more to unlock ${sec.title}!`}
                                        </h3>
                                      </>
                                    ) : (
                                      <>
                                        <Tag size={18} className="text-purple-500" />
                                        <h3 className="font-black text-slate-900">{sec.title}</h3>
                                      </>
                                    )}
                                  </div>
                                  
                                  <div className={`flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 transition-all duration-300 ${isLocked ? 'opacity-50 grayscale-[50%]' : ''}`} style={{ scrollbarWidth: 'none' }}>
                                    {secProducts.map(p => {
                                      const recImgs = p.image ? [p.image] : [];
                                      const recPrice = p.price;
                                      return (
                                        <div
                                          key={p.id}
                                          className="flex-shrink-0 w-32 bg-slate-50 rounded-2xl p-3 border border-slate-100 transition-all group flex flex-col relative"
                                        >
                                          {isLocked && <div className="absolute inset-0 z-10 rounded-2xl" />}
                                          <div className="w-full aspect-square rounded-xl overflow-hidden bg-white mb-2 border border-slate-100">
                                            {recImgs[0]
                                              ? <img src={recImgs[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                              : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>}
                                          </div>
                                          <p className="text-xs font-black text-slate-800 line-clamp-2 leading-tight mb-1 flex-1">{p.name}</p>
                                          <div className="flex items-center justify-between mt-auto pt-2">
                                            <div className="flex flex-col">
                                              <p className="text-xs font-black text-[var(--secondary)]">{recPrice > 0 ? `₹${recPrice}` : ''}</p>
                                              {p.oldPrice > 0 && <p className="text-[10px] font-bold text-slate-400 line-through">₹{p.oldPrice}</p>}
                                            </div>
                                            <button 
                                              disabled={isLocked}
                                              onClick={(e) => { 
                                                if (isLocked) return;
                                                e.preventDefault(); 
                                                
                                                if (hasGift) {
                                                  alert("You already have a free gift from the spin wheel! You cannot use both offers.");
                                                  return;
                                                }

                                                const existingDeal = cartItems.find(i => String(i.id).startsWith('c_'));
                                                if (existingDeal) {
                                                  if (existingDeal.id === p.id) {
                                                    alert("You already have this deal in your cart.");
                                                  } else {
                                                    alert("You can only add one deal per order. Please remove the current deal to add another.");
                                                  }
                                                  return;
                                                }

                                                addToCart({ 
                                                  id: p.id, 
                                                  name: p.name, 
                                                  b2cNewPrice: Number(p.price) || 0, 
                                                  b2bNewPrice: Number(p.price) || 0,
                                                  images: JSON.stringify(recImgs) 
                                                }, 1); 
                                              }}
                                              className={`text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm transition ${isLocked ? 'bg-slate-400 cursor-not-allowed' : 'bg-purple-500 hover:opacity-90 active:scale-95'}`}
                                            >
                                              {isLocked ? <Lock size={12}/> : 'ADD'}
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                             );
                          });
                        })()}
                      </motion.div>
                    )}

                    {/* ── STEP 2: ADDRESS ───────────────────── */}
                    {checkoutStep === 2 && (
                      <motion.div key="step2" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                          <button onClick={() => setCheckoutStep(1)} className="text-sm font-bold text-[var(--secondary)] mb-6 flex items-center gap-1 hover:underline">← Back to Cart</button>
                          <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-black text-slate-900">Delivery Address</h1>
                            <button
                              onClick={() => { setShowAddressForm(!showAddressForm); setAddrError(''); }}
                              className="text-[var(--secondary)] font-bold text-sm bg-green-50 px-4 py-2 rounded-xl hover:bg-green-100 transition flex items-center gap-1.5"
                            >
                              <Plus size={16} />Add New
                            </button>
                          </div>

                          {/* New address form */}
                          <AnimatePresence>
                            {showAddressForm && (
                              <motion.form
                                key="form"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                onSubmit={handleSaveAddress}
                                className="mb-6 overflow-hidden"
                              >
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                                  <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2"><MapPin size={16} className="text-[var(--secondary)]" /> New Delivery Address</h3>

                                  {addrError && <div className="text-red-600 font-bold mb-4 bg-red-50 border border-red-100 p-3 rounded-xl text-sm flex gap-2"><AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{addrError}</div>}

                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      {/* Full Name */}
                                      <div className="relative">
                                        <User size={14} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                          required name="fullName" value={addrForm.fullName} onChange={handleAddrChange}
                                          placeholder="Full Name *"
                                          className="w-full pl-9 pr-3 py-3 rounded-xl border-2 border-slate-100 font-medium text-sm outline-none focus:border-[var(--secondary)] transition bg-white"
                                        />
                                      </div>
                                      {/* Phone */}
                                      <div className="relative">
                                        <Phone size={14} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                          required name="phone" value={addrForm.phone} onChange={e => setAddrForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                                          placeholder="Phone (10 digits) *" maxLength={10} type="tel"
                                          className="w-full pl-9 pr-3 py-3 rounded-xl border-2 border-slate-100 font-medium text-sm outline-none focus:border-[var(--secondary)] transition bg-white"
                                        />
                                      </div>
                                    </div>
                                    {/* Address */}
                                    <div className="relative">
                                      <Home size={14} className="absolute left-3 top-3.5 text-slate-400" />
                                      <textarea
                                        required name="addressLine" value={addrForm.addressLine} onChange={handleAddrChange}
                                        placeholder="House No., Street, Area, City *"
                                        rows={2}
                                        className="w-full pl-9 pr-3 py-3 rounded-xl border-2 border-slate-100 font-medium text-sm outline-none focus:border-[var(--secondary)] transition bg-white resize-none"
                                      />
                                    </div>
                                    {/* Landmark + Pincode */}
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="relative">
                                        <Tag size={14} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                          name="landmark" value={addrForm.landmark} onChange={handleAddrChange}
                                          placeholder="Landmark (optional)"
                                          className="w-full pl-9 pr-3 py-3 rounded-xl border-2 border-slate-100 font-medium text-sm outline-none focus:border-[var(--secondary)] transition bg-white"
                                        />
                                      </div>
                                      <div className="relative">
                                        <Navigation size={14} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                          required name="pincode" value={addrForm.pincode} onChange={handleAddrChange}
                                          onBlur={handlePincodeBlur}
                                          placeholder="Pincode *" maxLength={6}
                                          className={`w-full pl-9 pr-3 py-3 rounded-xl border-2 font-medium text-sm outline-none transition bg-white ${pincodeStatus === 'ok' ? 'border-emerald-400' : pincodeStatus === 'error' ? 'border-red-400' : 'border-slate-100 focus:border-[var(--secondary)]'}`}
                                        />
                                        {pincodeStatus === 'checking' && <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-slate-300 border-t-[var(--secondary)] rounded-full animate-spin" />}
                                        {pincodeStatus === 'ok' && <CheckCircle2 size={14} className="absolute right-3 top-3.5 text-emerald-500" />}
                                      </div>
                                    </div>
                                    {pincodeStatus === 'ok' && (
                                      <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={11} /> Pincode verified — we deliver here!</p>
                                    )}
                                  </div>
                                  <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={() => { setShowAddressForm(false); setAddrError(''); }} className="flex-1 p-3 font-bold text-slate-500 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm">Cancel</button>
                                    <button type="submit" disabled={isProcessing} className="flex-1 bg-[var(--secondary)] text-white font-black rounded-xl disabled:opacity-50 p-3 hover:bg-[var(--secondary-dark)] transition text-sm">
                                      {isProcessing ? 'Verifying...' : 'Save Address'}
                                    </button>
                                  </div>
                                </div>
                              </motion.form>
                            )}
                          </AnimatePresence>

                          {/* Saved addresses */}
                          {!showAddressForm && (!savedAddresses || savedAddresses.length === 0) && (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                              <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
                              <p className="font-bold text-gray-500">No addresses yet.</p>
                              <p className="text-sm text-gray-400 mt-1">Add your first delivery address above.</p>
                            </div>
                          )}

                          <div className="grid gap-3 mt-2">
                            {(savedAddresses || []).map(addr => (
                              <motion.div
                                key={addr.id}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => setSelectedAddressId(addr.id)}
                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-[var(--secondary)] bg-emerald-50 shadow-md shadow-green-100' : 'border-gray-100 hover:border-green-200 bg-white'}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all ${selectedAddressId === addr.id ? 'border-[var(--secondary)] bg-[var(--secondary)]' : 'border-gray-300'}`}>
                                    {selectedAddressId === addr.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className="font-black text-slate-900 truncate">{addr.fullName}</span>
                                      <span className="text-sm font-bold text-gray-400 whitespace-nowrap">· {addr.phone}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed break-words">{addr.addressLine}</p>
                                    {addr.landmark && <p className="text-xs text-gray-400 font-medium mt-0.5 break-words">Near: {addr.landmark}</p>}
                                    <p className="text-xs font-bold text-gray-400 mt-1">Pincode: {addr.pincode}</p>
                                  </div>
                                  {selectedAddressId === addr.id && (
                                    <div className="bg-[var(--secondary)] text-white rounded-lg px-2 py-1 text-[10px] font-black flex-shrink-0">Selected</div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 3: DELIVERY TYPE & PAYMENT ───── */}
                    {checkoutStep === 3 && (
                      <motion.div key="step3" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                          <button onClick={() => setCheckoutStep(2)} className="text-sm font-bold text-[var(--secondary)] mb-6 flex items-center gap-1 hover:underline">← Back to Address</button>
                          <h1 className="text-2xl font-black text-slate-900 mb-6">Choose Your Delivery</h1>

                          {/* Smart Delivery */}
                          <label
                            onClick={() => setDeliveryType('Smart')}
                            className={`block p-5 rounded-2xl border-2 cursor-pointer transition-all mb-4 ${deliveryType === 'Smart' ? 'border-[var(--secondary)] bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${deliveryType === 'Smart' ? 'border-[var(--secondary)] bg-[var(--secondary)]' : 'border-gray-300'}`}>
                                {deliveryType === 'Smart' && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock size={18} className="text-emerald-600" />
                                  <p className="font-black text-slate-900">Smart Delivery</p>
                                  <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full">SCHEDULED</span>
                                </div>
                                <div className="bg-white/70 rounded-xl p-3 mt-2 border border-emerald-100">
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Select Delivery Slot</p>
                                  <select
                                    value={selectedSlot}
                                    onChange={(e) => setSelectedSlot(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-3 py-2 border-2 border-emerald-100 rounded-lg font-black text-slate-900 text-sm outline-none focus:border-emerald-400"
                                  >
                                    {availableSlots.map(s => (
                                      <option key={s.display} value={s.display}>{s.display}</option>
                                    ))}
                                  </select>
                                  <p className="text-[11px] text-slate-400 font-medium mt-1">Select your preferred delivery time</p>
                                </div>
                                {fees.deliveryFee === 0
                                  ? <p className="text-xs font-black text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 size={12} /> Delivery: FREE on your order!</p>
                                  : <p className="text-xs font-medium text-slate-500 mt-2">Delivery: <span className="font-black text-slate-800">₹{fees.deliveryFee}</span></p>
                                }
                              </div>
                            </div>
                          </label>

                          {/* Qwik Delivery */}
                          <div
                            onClick={() => {
                              if (!qwikOk) {
                                alert("Stores closed, will open tomorrow fresh and Qwik Delivery will start from 7 AM in morning.");
                                return;
                              }
                              setDeliveryType('Qwik');
                            }}
                            className={`block p-5 rounded-2xl border-2 transition-all mb-6 ${!qwikOk ? 'opacity-85 cursor-not-allowed border-slate-100 bg-slate-50' : `cursor-pointer ${deliveryType === 'Qwik' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-amber-200 bg-white'}`}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${deliveryType === 'Qwik' && qwikOk ? 'border-amber-500 bg-amber-500' : 'border-gray-300'}`}>
                                {deliveryType === 'Qwik' && qwikOk && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Zap size={18} className={`fill-current ${qwikOk ? 'text-amber-500' : 'text-slate-400'}`} />
                                  <p className="font-black text-slate-900">Qwik Delivery</p>
                                  {!qwikOk
                                    ? <span className="ml-auto text-[10px] bg-red-100 text-red-600 font-black px-2 py-0.5 rounded-full">Stores Closed</span>
                                    : <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 font-black px-2 py-0.5 rounded-full">FAST-TRACK ⚡</span>
                                  }
                                </div>
                                <div className="text-sm font-medium mb-2">
                                  {qwikOk ? (
                                    <span className="text-slate-600">Priority instant delivery — your order jumps to the front of the queue!</span>
                                  ) : (
                                    <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-red-600 font-black text-xs leading-relaxed mt-1 flex items-start gap-2">
                                       <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                       <span>Stores closed, will open tomorrow fresh and Qwik Delivery will start from 7 AM in morning.</span>
                                    </div>
                                  )}
                                </div>
                                {qwikOk && (
                                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1"><Zap size={11} className="text-amber-500" /> Within 45–60 mins</span>
                                    <span className="flex items-center gap-1"><Star size={11} className="text-amber-500" /> Priority handling</span>
                                  </div>
                                )}
                                <div className="mt-2">
                                  {fees.deliveryFee === 0
                                    ? <p className="text-xs font-medium text-slate-500">Delivery: <span className="font-black text-slate-800 line-through">FREE</span> + <span className="font-black text-amber-600">₹{(appSettings?.qwikDeliveryFee ?? 30)} Qwik priority fee</span></p>
                                    : <p className="text-xs font-medium text-slate-500">Delivery: <span className="font-black text-slate-800">₹{fees.deliveryFee}</span> + <span className="font-black text-amber-600">₹{(appSettings?.qwikDeliveryFee ?? 30)} Qwik priority fee</span></p>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payment method */}
                          <h2 className="font-black text-slate-900 mb-4">Payment Method</h2>
                          <div className="grid grid-cols-2 gap-3">
                            <label
                              onClick={() => setPaymentMethod('cod')}
                              className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'cod' ? 'border-[var(--secondary)] bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[var(--secondary)] bg-[var(--secondary)]' : 'border-gray-300'}`}>
                                {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-sm">Cash on Delivery</p>
                                <p className="text-[11px] text-slate-400 font-medium">Pay when it arrives</p>
                              </div>
                            </label>
                            <label
                              onClick={() => setPaymentMethod('online')}
                              className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'online' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${paymentMethod === 'online' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                {paymentMethod === 'online' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-sm">Pay Online</p>
                                <p className="text-[11px] text-slate-400 font-medium">UPI / Cards / Netbanking</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {/* ── Right Column: Order Summary ───────────── */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-4">
                    <h2 className="font-black text-slate-900 mb-5 text-lg">Order Summary</h2>

                    {/* Line items */}
                    <div className="space-y-0.5 divide-y divide-slate-50 mb-4">
                      <FeeLine
                        label={`${cartItems.length} item${cartItems.length > 1 ? 's' : ''}`}
                        sublabel="Items subtotal"
                        amount={subtotal.toFixed(0)}
                      />
                      {/* For Smart Delivery: show delivery fee line */}
                      {deliveryType === 'Smart' && (
                        <FeeLine
                          icon={<Truck size={13} className={fees.isFree ? 'text-emerald-500' : 'text-slate-400'} />}
                          label="Delivery"
                          sublabel={fees.isFree ? 'On orders above ₹200 — great choice!' : `Add ₹${fees.amountToFree} more for FREE delivery`}
                          amount={fees.deliveryFee}
                          free={fees.isFree}
                          color={fees.isFree ? 'text-emerald-700' : 'text-slate-600'}
                          highlight={fees.isFree}
                        />
                      )}
                      <FeeLine
                        icon={<Shield size={13} className="text-blue-400" />}
                        label="Care & Packaging"
                        sublabel="Safe, hygienic handling of your fresh produce 🌿"
                        amount={fees.packagingFee.toFixed(0)}
                      />
                      {fees.smallCartFee > 0 && (
                        <FeeLine
                          icon={<Info size={13} className="text-orange-400" />}
                          label={fees.smallCartReason}
                          sublabel="This helps us serve small orders efficiently for you"
                          amount={fees.smallCartFee}
                        />
                      )}
                      {fees.qwikSurcharge > 0 && (
                        <FeeLine
                          icon={<Zap size={13} className="text-amber-500" />}
                          label="Qwik Priority Fee"
                          sublabel="Express delivery — your order jumps to the front 🚀"
                          amount={fees.qwikSurcharge}
                          color="text-amber-700"
                        />
                      )}
                      {appliedCoupon && (
                        <FeeLine
                          icon={<Tag size={13} className="text-[var(--secondary)]" />}
                          label={`Coupon: ${appliedCoupon.code}`}
                          sublabel="Special discount applied"
                          amount={`-${appliedCoupon.discountAmount}`}
                          color="text-[var(--secondary)]"
                        />
                      )}
                      {useFarmerCoins && coinsRedeemed > 0 && (
                        <FeeLine
                          icon={<span className="text-yellow-500 text-xs">👳🏽‍♂️</span>}
                          label="Farmer Coins Redeemed"
                          sublabel="Used your loyalty coins"
                          amount={`-${coinsRedeemed}`}
                          color="text-yellow-600"
                        />
                      )}
                      {valuePackSavings > 0 && (
                        <FeeLine
                          icon={<Gift size={13} className="text-emerald-500" />}
                          label="Value Pack Bundle Discount"
                          sublabel="Exclusive savings on curated hampers"
                          amount={valuePackSavings.toFixed(0)}
                          strikethrough={false}
                          color="text-emerald-700"
                          highlight={true}
                          saved={true}
                        />
                      )}
                    </div>
                    
                    {/* Coupons & Coins Inputs (Only show in Step 1 or 2) */}
                    {checkoutStep < 3 && (
                      <div className="space-y-4 mb-6">
                        {/* Coupon Input */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <p className="text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Apply Coupon</p>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={couponCode} 
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="Enter Code" 
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-[var(--secondary)] transition"
                            />
                            <button onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-800 disabled:opacity-50 transition">Apply</button>
                          </div>
                          {couponError && <p className="text-[10px] text-red-500 font-bold mt-1">{couponError}</p>}

                          {(publicCoupons || []).length > 0 && !appliedCoupon && (
                            <div className="mt-3 space-y-2">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Coupons</p>
                               {(publicCoupons || []).map(c => (
                                 <div key={c.id} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                                    <div>
                                       <p className="font-black text-xs text-slate-800">{c.code}</p>
                                       <p className="text-[10px] font-bold text-slate-500">Save ₹{c.discountAmount}</p>
                                    </div>
                                    <button onClick={() => setCouponCode(c.code)} className="text-[10px] bg-slate-100 font-bold px-2 py-1 rounded hover:bg-slate-200 transition">USE</button>
                                 </div>
                               ))}
                            </div>
                          )}
                        </div>

                        {/* Farmer Coins */}
                        {farmerCoins > 0 && (
                          <div className="bg-yellow-50 p-3 rounded-2xl border border-yellow-100 flex items-center justify-between cursor-pointer" onClick={() => setUseFarmerCoins(!useFarmerCoins)}>
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-sm text-lg">
                                   👳🏽‍♂️
                                </div>
                                <div>
                                   <p className="font-black text-yellow-800 text-sm">Farmer Coins</p>
                                    <p className="text-[10px] font-bold text-yellow-600">Balance: {farmerCoins} (₹{Number(farmerCoins * (appSettings?.farmerCoinRedemptionRate || 1)).toFixed(2)})</p>
                                </div>
                             </div>
                             <div className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors ${useFarmerCoins ? 'bg-yellow-500' : 'bg-slate-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${useFarmerCoins ? 'translate-x-4' : 'translate-x-0'}`} />
                             </div>
                          </div>
                        )}
                      </div>
                    )}

                      {isBulkDiscountEligible && (
                        <div className="flex justify-between items-center mb-2 animate-bounce">
                          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                            <Sparkles size={12}/> {bulkPercentage}% Bulk Bonus
                          </span>
                          <span className="font-black text-emerald-600">-₹{bulkVolumeDiscount.toFixed(0)}</span>
                        </div>
                      )}

                    {/* Grand Total */}
                    <div className="border-t-2 border-slate-100 pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-slate-900 text-lg">Total</span>
                        <span className="font-black text-slate-900 text-2xl">₹{finalTotal.toFixed(0)}</span>
                      </div>
                      {deliveryType === 'Smart' && fees.isFree && (
                        <p className="text-[11px] text-emerald-600 font-bold mt-1 text-right">You saved ₹{(appSettings?.standardDeliveryFee ?? 25)} on delivery!</p>
                      )}
                    </div>

                    {/* Launch / Marketing Mode gate */}
                    {appSettings?.isLaunchMode && (
                       <div className="mb-6 p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-[24px] shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
                              <Rocket size={20} />
                            </div>
                            <div>
                              <p className="font-black text-orange-800 text-base">Wait! We're almost there! 🚀</p>
                              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Pre-Launch Marketing Phase</p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 font-bold leading-relaxed mb-4">{appSettings?.launchMessage || "We are currently setting up our farm-fresh supply chain. Ordering will be enabled very soon!"}</p>
                          {appSettings?.launchDate && (
                            <div className="flex items-center gap-2 bg-white/60 p-3 rounded-xl border border-orange-100">
                              <Clock size={16} className="text-orange-600" />
                              <p className="text-xs font-black text-orange-800">Orders Opening On: <span className="text-orange-600 ml-1">{new Date(appSettings.launchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                            </div>
                          )}
                       </div>
                    )}
                    
                    {/* B2B Gate */}
                    {isB2BUserPending && (
                       <div className="mb-4 bg-blue-50 border border-blue-200 p-4 rounded-xl">
                          <p className="font-black text-blue-700 text-sm flex items-center gap-2 mb-1"><Shield size={16} /> Verification Pending</p>
                          <p className="text-xs text-blue-600 font-medium leading-relaxed">Your business account is being reviewed. You can place orders once approved.</p>
                       </div>
                    )}

                    {/* CTA */}
                    {checkoutStep === 3 ? (
                      <SwipeToPlaceOrder
                        onSwipeComplete={handleCheckout}
                        isProcessing={isProcessing}
                        paymentMethod={paymentMethod}
                        deliveryType={deliveryType}
                      />
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCheckout}
                        disabled={isProcessing || appSettings?.isLaunchMode || isB2BUserPending}
                        className={`w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60 ${
                          deliveryType === 'Qwik'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-200 hover:from-amber-600 hover:to-orange-600'
                            : 'bg-gradient-to-r from-[var(--secondary)] to-emerald-500 shadow-green-200 hover:opacity-90'
                        }`}
                      >
                        {isProcessing ? (
                          <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing...</>
                        ) : appSettings?.isLaunchMode ? (
                          <><Rocket size={18} /> Ordering Disabled</>
                        ) : checkoutStep === 1 ? (
                          <><ArrowRight size={18} /> Proceed to Address</>
                        ) : (
                          <><Truck size={18} /> Choose Delivery</>
                        )}
                      </motion.button>
                    )}

                    {/* Trust signals */}
                    <div className="mt-4 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                        <Shield size={11} className="text-emerald-500" /> Secure checkout — your data is always safe
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                        <Star size={11} className="text-amber-400" /> Fresh produce sourced directly from RealFarms
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile Summary Sheet ────────────────────────── */}
      <AnimatePresence>
        {showMobileSummary && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSummary(false)}
              className="summary-sheet-backdrop lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="summary-sheet lg:hidden"
            >
              <div className="summary-sheet-handle" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 text-lg">Order Summary</h3>
                <button onClick={() => setShowMobileSummary(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-0.5 divide-y divide-slate-50 mb-4 pb-16">
                <FeeLine
                  label={`${cartItems.length} item${cartItems.length > 1 ? 's' : ''}`}
                  sublabel="Items subtotal"
                  amount={subtotal.toFixed(0)}
                />
                {deliveryType === 'Smart' && (
                  <FeeLine
                    icon={<Truck size={13} className={fees.isFree ? 'text-emerald-500' : 'text-slate-400'} />}
                    label="Delivery"
                    sublabel={fees.isFree ? 'On orders above ₹200' : `Add ₹${fees.amountToFree} more for FREE delivery`}
                    amount={fees.deliveryFee}
                    free={fees.isFree}
                    color={fees.isFree ? 'text-emerald-700' : 'text-slate-600'}
                    highlight={fees.isFree}
                  />
                )}
                <FeeLine
                  icon={<Shield size={13} className="text-blue-400" />}
                  label="Care & Packaging"
                  amount={fees.packagingFee.toFixed(0)}
                />
                {fees.smallCartFee > 0 && (
                  <FeeLine
                    icon={<Info size={13} className="text-orange-400" />}
                    label={fees.smallCartReason}
                    amount={fees.smallCartFee}
                  />
                )}
                {fees.qwikSurcharge > 0 && (
                  <FeeLine
                    icon={<Zap size={13} className="text-amber-500" />}
                    label="Qwik Priority"
                    amount={fees.qwikSurcharge}
                    color="text-amber-700"
                  />
                )}
                {appliedCoupon && (
                  <FeeLine
                    icon={<Tag size={13} className="text-[var(--secondary)]" />}
                    label={`Coupon: ${appliedCoupon.code}`}
                    amount={`-${appliedCoupon.discountAmount}`}
                    color="text-[var(--secondary)]"
                  />
                )}
                {useFarmerCoins && coinsRedeemed > 0 && (
                  <FeeLine
                    icon={<span className="text-yellow-500 text-xs">👳🏽‍♂️</span>}
                    label="Farmer Coins"
                    amount={`-${coinsRedeemed}`}
                    color="text-yellow-600"
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile Sticky Bottom Bar ────────────────────── */}
      {checkoutStep !== 4 && cartItems.length > 0 && (
        <div className="checkout-sticky-bar lg:hidden pb-safe border-t border-gray-200 bg-white/95 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex-1 min-w-0 pl-1">
              <button
                onClick={() => setShowMobileSummary(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5 active:opacity-70 transition-opacity touch-target"
              >
                {cartItems.length} item{cartItems.length > 1 ? 's' : ''} <ChevronUp size={14} className="text-slate-400" />
              </button>
              <div className="flex flex-col">
                <span className="font-black text-slate-900 text-xl tracking-tight">₹{finalTotal.toFixed(0)}</span>
                {deliveryType === 'Smart' && fees.isFree && (
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">Free Delivery</span>
                )}
              </div>
            </div>
            {checkoutStep === 3 ? (
              <div className="flex-1 min-w-[180px]">
                <SwipeToPlaceOrder
                  onSwipeComplete={handleCheckout}
                  isProcessing={isProcessing}
                  paymentMethod={paymentMethod}
                  deliveryType={deliveryType}
                />
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCheckout}
                disabled={isProcessing || appSettings?.isLaunchMode || isB2BUserPending}
                className={`px-8 py-3.5 rounded-full font-black text-white text-[15px] flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60 flex-shrink-0 touch-target ${
                  deliveryType === 'Qwik'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-200/50'
                    : 'bg-gradient-to-r from-[var(--secondary)] to-emerald-500 shadow-green-200/50'
                }`}
              >
                {isProcessing ? (
                  <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Wait...</>
                ) : checkoutStep === 1 ? (
                  <>Next <ArrowRight size={18} /></>
                ) : (
                  <>Next <ArrowRight size={18} /></>
                )}
              </motion.button>
            )}
          </div>
        </div>
      )}
      {isSpinWheelEligible && <AirDrop onClick={() => setIsSpinWheelOpen(true)} />}
      
      <SpinWheelModal 
        isOpen={isSpinWheelOpen} 
        onClose={() => setIsSpinWheelOpen(false)} 
        items={JSON.parse(appSettings?.spinWheelItems || '[]')}
        onWin={handleWinGift}
      />

      {/* Premium Truck Loading Animation Overlay */}
      <AnimatePresence>
        {showTruckAnimation && (
          <TruckLoadingAnimation onFinish={handleAnimationFinish} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
