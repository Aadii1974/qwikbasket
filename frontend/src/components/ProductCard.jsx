import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOW_STOCK_THRESHOLD = 10;

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { cartItems, addToCart, updateQuantity, removeFromCart, getTieredPrice } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Role Checks
  const isActualB2B = user?.role === 'b2b';
  const isActualAdmin = user?.role === 'admin';
  const isApproved = user?.isApproved || isActualAdmin;
  const showWholesaleTheme = isActualB2B || (isActualAdmin && window.location.hash === '#b2b-view');
  const showWholesaleData = isActualB2B || isActualAdmin;

  // Stock State
  const stock = Number(product.stock) || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;

  // Cart State
  const cartItem = cartItems.find(item => item.id === product.id);
  const currentQty = cartItem ? cartItem.quantity : 0;
  const minQty = (showWholesaleData && isApproved) ? (product.minB2BQty || 1) : 1;

  // Price Calculation
  const priceQty = currentQty > 0 ? currentQty : minQty;
  const rawCurrentPrice = getTieredPrice ? getTieredPrice(product, priceQty) : (showWholesaleData ? product.b2bNewPrice : product.b2cNewPrice);
  const rawOldPrice = showWholesaleData ? product.b2bOldPrice : product.b2cOldPrice;
  const currentPrice = Number(rawCurrentPrice || 0);
  const oldPrice = Number(rawOldPrice || 0);
  const discountPercent = oldPrice > currentPrice && oldPrice > 0 ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;

  // Image Processing
  let images = [];
  try {
    images = typeof product.images === 'string' ? JSON.parse(product.images) : (Array.isArray(product.images) ? product.images : []);
  } catch (e) { images = []; }

  // Auto-scroll images
  useEffect(() => {
    if (images.length > 1 && !isOutOfStock) {
      const interval = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % images.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [images.length, isOutOfStock]);

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    addToCart(product, minQty);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleMinus = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (cartItem.quantity - 1 < minQty) removeFromCart(product.id);
    else updateQuantity(product.id, cartItem.quantity - 1);
  };

  const handlePlus = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (cartItem.quantity >= stock) return; // Can't exceed stock
    updateQuantity(product.id, cartItem.quantity + 1);
  };

  const accentColor = showWholesaleTheme
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-[var(--secondary)] hover:bg-[var(--secondary-dark)]';

  return (
    <div
      onClick={() => !isOutOfStock && window.location.assign(`/product/${product.id}`)}
      className={`card-premium group relative flex flex-col w-full overflow-hidden select-none
        ${showWholesaleTheme ? 'border-red-100' : ''}
        ${isOutOfStock ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ minHeight: '200px' }}
    >
      {/* ── Image Area ─────────────────────────────── */}
      <div className={`relative w-full flex items-center justify-center rounded-t-[18px] overflow-hidden
        ${showWholesaleTheme ? 'bg-red-50/40' : 'bg-slate-50 group-hover:bg-slate-100/60'}
        ${isOutOfStock ? 'bg-slate-100' : ''}
        transition-colors duration-300`}
      >
        <div style={{ height: '130px', width: '100%', display: 'flex', alignItems: 'center', justifyCenter: 'center' }} className="relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImage}
              initial={{ opacity: 1, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0.5, x: -10 }}
              transition={{ duration: 0.5 }}
              src={images[activeImage] || 'https://placehold.co/200'}
              alt={product.name}
              className={`w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-[1.07] transition-transform duration-500 ease-out
                ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
              loading="lazy"
            />
          </AnimatePresence>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <div className="bg-slate-800 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
              Out of Stock
            </div>
          </div>
        )}

        {/* Low Stock Badge */}
        {isLowStock && !isOutOfStock && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md z-10"
          >
            <AlertTriangle size={9} fill="white" />
            Only {stock} left!
          </motion.div>
        )}

        {/* Discount Badge */}
        {discountPercent > 0 && !isOutOfStock && (
          <div className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full leading-none shadow-sm animate-slide-up z-10
            ${showWholesaleTheme ? 'bg-red-600 text-white' : 'bg-[var(--secondary)] text-white'}`}>
            {discountPercent}% OFF
          </div>
        )}

        {/* Image Dots */}
        {images.length > 1 && !isOutOfStock && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {images.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${activeImage === i ? 'w-3 bg-slate-900' : 'w-1 bg-slate-300'}`} />
            ))}
          </div>
        )}
      </div>

      {/* ── Content Area ───────────────────────────── */}
      <div className="flex flex-col flex-grow p-2.5 md:p-3">
        <h3 className="text-[12px] md:text-[13px] font-extrabold line-clamp-2 leading-[1.35] text-slate-800
          group-hover:text-[var(--secondary)] transition-colors duration-200 mb-1.5"
          style={{ minHeight: '2.3rem' }}>
          {product.name}
        </h3>

        <div className="flex flex-wrap items-center gap-1 mb-2.5">
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md leading-none uppercase tracking-tighter">{product.unit}</span>
          {product.packagingSize && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-md leading-none uppercase tracking-tighter">{product.packagingSize}</span>
          )}
          {showWholesaleData && isApproved && product.minB2BQty && (
            <span className={`text-[8px] font-black px-1 py-0.5 rounded-md border leading-none uppercase
              ${showWholesaleTheme ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
              MOQ: {product.minB2BQty}
            </span>
          )}
        </div>

        {/* ── Pricing Row ──────────────────────────── */}
        <div className="mt-auto flex items-center justify-between gap-1 pt-2 border-t border-slate-100">
          <div className="flex flex-col leading-none min-w-0">
            {isOutOfStock ? (
              <span className="text-[11px] font-black text-slate-400 leading-none">Sold Out</span>
            ) : (
              <>
                <span className="text-[14px] md:text-[15px] font-black text-slate-900 leading-none tracking-tighter">
                  ₹{Number(currentPrice || 0).toFixed(2)}
                </span>
                {oldPrice > currentPrice && (
                  <span className="text-[10px] text-slate-400 font-bold line-through mt-0.5 tracking-tighter">
                    ₹{Number(oldPrice || 0).toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex-shrink-0">
            {!isOutOfStock && !cartItem ? (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleAdd}
                className={`h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0 ${accentColor} transition-all`}
              >
                <Plus size={16} strokeWidth={3} />
              </motion.button>
            ) : cartItem && !isOutOfStock ? (
              <div className={`h-8 rounded-xl flex items-center gap-2 px-1.5 shadow-md text-white flex-shrink-0 ${accentColor}`}>
                <button onClick={handleMinus} className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"><Minus size={12} strokeWidth={3} /></button>
                <span className="text-xs font-black min-w-[14px] text-center">{currentQty}</span>
                <button onClick={handlePlus} disabled={currentQty >= stock} className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors disabled:opacity-40"><Plus size={12} strokeWidth={3} /></button>
              </div>
            ) : (
              <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                 <Check size={14} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
