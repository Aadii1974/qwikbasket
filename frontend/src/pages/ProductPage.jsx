import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Plus, Minus, Star, ShieldCheck, Truck, Clock, BarChart3, Heart, Share2, Info, CheckCircle2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity, removeFromCart, getTieredPrice } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  
  const autoScrollRef = useRef(null);

  // Status & Role Checks
  const isActualB2B = user?.role === 'b2b';
  const isActualAdmin = user?.role === 'admin';
  const isApproved = user?.isApproved || isActualAdmin;
  const showWholesaleTheme = isActualB2B || (isActualAdmin && window.location.hash === '#b2b-view'); 
  const showWholesaleData = isActualB2B || isActualAdmin;

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const allProds = await fetchProducts();
        const p = allProds.find(item => item.id.toString() === id);
        setProduct(p || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  // Image Processing
  let images = [];
  try {
    images = product ? (typeof product.images === 'string' ? JSON.parse(product.images) : (Array.isArray(product.images) ? product.images : [])) : [];
  } catch (e) {
    images = [];
  }

  // Auto-scrolling logic
  useEffect(() => {
    if (images.length > 1) {
      autoScrollRef.current = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % images.length);
      }, 3000);
    }
    return () => clearInterval(autoScrollRef.current);
  }, [images.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="w-12 h-12 border-[3px] border-slate-100 border-t-[var(--secondary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
           <BarChart3 size={40} />
        </div>
        <h2 className="text-2xl font-black mb-4 text-slate-900">Product Not Found</h2>
        <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm transition-transform active:scale-95">Return to Shop</button>
      </div>
    );
  }

  // Cart State
  const cartItem = cartItems.find(item => item.id === product.id);
  const currentQty = cartItem ? cartItem.quantity : 0;
  const minQty = (showWholesaleData && isApproved) ? (product.minB2BQty || 1) : 1;
  const stock = Number(product.stock) || 0;
  const isOutOfStock = stock <= 0;

  // Price Calculation
  const priceQty = currentQty > 0 ? currentQty : minQty;
  const currentPrice = getTieredPrice ? getTieredPrice(product, priceQty) : (showWholesaleData ? product.b2bNewPrice : product.b2cNewPrice);
  const oldPrice = showWholesaleData ? product.b2bOldPrice : product.b2cOldPrice;
  const discountPercent = oldPrice > currentPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;

  // Tier Analysis
  let tiers = [];
  try {
    if (product.b2bTiers) tiers = JSON.parse(product.b2bTiers);
  } catch (e) {}
  const sortedTiers = [...tiers].sort((a, b) => a.minQty - b.minQty);

  const handleAdd = () => {
     if (isOutOfStock) return;
     addToCart(product, minQty);
  };

  const handleMinus = () => {
     if (cartItem.quantity - 1 < minQty) {
        removeFromCart(product.id);
     } else {
        updateQuantity(product.id, cartItem.quantity - 1);
     }
  };

  const handlePlus = () => {
    if (currentQty >= stock) return;
    updateQuantity(product.id, currentQty + 1);
  };

  const themeBg = showWholesaleTheme ? 'bg-red-600' : 'bg-[var(--secondary)]';

  return (
    <div className="bg-white min-h-screen">
      {/* ── Mobile Navigation Bar ──────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 md:hidden bg-white/70 backdrop-blur-md border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft size={20} className="text-slate-900" strokeWidth={3} />
        </button>
        <div className="flex gap-2">
          <button onClick={() => setIsLiked(!isLiked)} className={`p-2 bg-white rounded-full shadow-sm border border-slate-100 transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400'}`}>
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button className="p-2 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto md:px-6 lg:px-8 md:pt-16 pb-32 md:pb-16">
        <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-16">
          
          {/* 🖼️ Left: Image Gallery (Mobile App Carousel Style) */}
          <div className="w-full md:w-[48%] lg:w-[45%] md:sticky md:top-28">
            <div className={`relative w-full aspect-square md:aspect-[4/5] bg-slate-50 md:rounded-[48px] overflow-hidden group 
              ${isOutOfStock ? 'grayscale' : ''}`}>
              
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  src={images[activeImage] || 'https://placehold.co/600'} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-8 md:p-12 mix-blend-multiply" 
                />
              </AnimatePresence>

              {/* Status Tags */}
              <div className="absolute top-6 left-6 md:top-10 md:left-10 flex flex-col gap-2 z-10">
                {discountPercent > 0 && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className={`${themeBg} text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-black/5 uppercase tracking-wider`}>
                    -{discountPercent}% OFF
                  </motion.div>
                )}
                {isOutOfStock && (
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-black/10 uppercase tracking-wider">
                    Sold Out
                  </div>
                )}
                {!isOutOfStock && stock <= 10 && (
                  <div className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-black/10 uppercase tracking-wider animate-pulse">
                    Only {stock} Left!
                  </div>
                )}
              </div>

              {/* Image Indicators (Dots) */}
              {images.length > 1 && (
                <div className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {images.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => { setActiveImage(idx); clearInterval(autoScrollRef.current); }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === idx ? 'w-6 ' + themeBg : 'w-1.5 bg-slate-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Thumbnails */}
            {images.length > 1 && (
              <div className="hidden md:flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => { setActiveImage(idx); clearInterval(autoScrollRef.current); }}
                    className={`w-20 h-20 rounded-3xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 p-2 bg-slate-50 
                      ${activeImage === idx ? 'border-slate-900 scale-105 bg-white shadow-xl shadow-slate-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt="thumb" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 📝 Right: Balanced Details Section */}
          <div className="w-full md:w-[52%] lg:w-[55%] px-4 md:px-0">
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[var(--secondary)] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-[var(--secondary)]/10 rounded-full border border-[var(--secondary)]/5">
                {product.categoryId || 'General Inventory'}
              </span>
              <span className="text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-full flex items-center gap-2">
                <Package size={12} className="text-slate-400" /> {product.unit} {product.packagingSize ? ` \u00b7 \u26a1 ${product.packagingSize}` : ''}
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-[900] text-slate-900 tracking-tight leading-tight mb-6">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= 4 ? "#F4D03F" : "none"} className={s <= 4 ? "text-[#F4D03F]" : "text-slate-200"} />)}
                <span className="text-xs font-black text-slate-400 ml-2">4.8 (2.4k)</span>
              </div>
              <div className="h-4 w-[1px] bg-slate-100" />
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 size={14} /> Guaranteed Fresh
              </div>
            </div>

            {/* 💰 Price Display */}
            <div className="flex flex-col gap-2 mb-10">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">₹{Number(currentPrice || 0).toFixed(2)}</span>
                {oldPrice > currentPrice && (
                  <span className="text-xl text-slate-300 font-bold line-through">₹{Number(oldPrice || 0).toFixed(2)}</span>
                )}
              </div>
              {showWholesaleData && isApproved && (
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full w-fit border border-indigo-100">
                  <BarChart3 size={12} /> Bulk Pricing Active
                </div>
              )}
            </div>

            {/* 📦 B2B Tier Cards */}
            {showWholesaleData && isApproved && sortedTiers.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
                {sortedTiers.map((t, idx) => (
                  <div key={idx} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Buy {t.minQty}+</p>
                    <p className="text-lg font-black text-slate-900">₹{Number(t.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ⚡ Desktop Actions */}
            <div className="hidden md:flex flex-col gap-6 mb-12">
               {!cartItem ? (
                 <button 
                   onClick={handleAdd}
                   disabled={isOutOfStock}
                   className={`${themeBg} h-16 w-64 rounded-3xl text-white font-black text-base transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 disabled:bg-slate-300 disabled:scale-100 flex items-center justify-center gap-3`}
                 >
                   {isOutOfStock ? 'Temporarily Unavailable' : <><Plus size={20} /> Add to Order</>}
                 </button>
               ) : (
                 <div className="flex items-center gap-4">
                    <div className={`${themeBg} h-16 w-52 rounded-3xl flex items-center justify-between px-6 text-white shadow-xl shadow-slate-200`}>
                      <button onClick={handleMinus} className="p-2 hover:bg-black/10 rounded-xl transition"><Minus size={20} strokeWidth={3} /></button>
                      <span className="text-2xl font-black">{currentQty}</span>
                      <button onClick={handlePlus} disabled={currentQty >= stock} className="p-2 hover:bg-black/10 rounded-xl transition disabled:opacity-30"><Plus size={20} strokeWidth={3} /></button>
                    </div>
                    <div className="text-xs font-bold text-slate-400">
                      In your basket
                    </div>
                 </div>
               )}
            </div>

            {/* 📖 Information Tags */}
            <div className="grid grid-cols-2 gap-4 mb-12">
               <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500"><Truck size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery</p>
                    <p className="text-sm font-black text-slate-900">10-15 Mins</p>
                  </div>
               </div>
               <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500"><ShieldCheck size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safe & Fresh</p>
                    <p className="text-sm font-black text-slate-900">Secure Audit</p>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-2 border-b border-slate-100">
                <button className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-2">Description</button>
                <button className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-slate-500 transition-colors pb-2">Logistics</button>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed text-sm lg:text-base">
                {product.description || "Premium quality inventory addition curated for instant delivery. Optimized for freshness and rapid logistics transit, ensuring the highest standards of culinary or industrial utility."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-[100] animate-slide-up">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 p-4 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-center gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Price</p>
            <p className="text-xl font-black text-slate-900">₹{Number(currentPrice).toFixed(2)}</p>
          </div>
          
          {!cartItem ? (
            <button 
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`${themeBg} h-14 px-8 rounded-2xl text-white font-black text-sm transition-all active:scale-95 disabled:bg-slate-300 shadow-lg`}
            >
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          ) : (
            <div className={`${themeBg} h-14 px-6 rounded-2xl text-white flex items-center gap-8 shadow-lg transition-all`}>
              <button onClick={handleMinus} className="p-1"><Minus size={18} strokeWidth={4} /></button>
              <span className="text-lg font-black">{currentQty}</span>
              <button onClick={handlePlus} disabled={currentQty >= stock} className="p-1 disabled:opacity-30"><Plus size={18} strokeWidth={4} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
