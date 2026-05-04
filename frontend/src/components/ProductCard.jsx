import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Check, AlertTriangle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LOW_STOCK_THRESHOLD = 10;

const ProductCard = ({ product, allProducts = [] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity, removeFromCart, getTieredPrice } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(product?.id);

  // Role Checks
  const isActualB2B = user?.role === 'b2b';
  const isActualAdmin = user?.role === 'admin';
  const isApproved = user?.isApproved || isActualAdmin;
  const isWholesaleActive = (isActualB2B && isApproved) || (isActualAdmin && window.location.hash === '#b2b-view');
  const showWholesaleTheme = isWholesaleActive;
  const showWholesaleData = isWholesaleActive;

  // Build variants list — group products that share the same base name
  const getBaseName = (name) => {
    if (!name) return '';
    return name.replace(/\s*[-–]\s*\d+(\.\d+)?\s*(kg|g|l|ml|ltr|litre|piece|pcs|pack)\s*/gi, '').trim().toLowerCase();
  };

  const variants = allProducts.length > 0
    ? allProducts.filter(p => p && p.name && getBaseName(p.name) === getBaseName(product.name) && p.packagingSize)
    : [];
  const hasVariants = variants.length > 1;

  // Active product (might change if variant selected)
  const activeProduct = (hasVariants && selectedVariantId !== product.id)
    ? variants.find(v => v.id === selectedVariantId) || product
    : product;

  // Stock State
  const stock = Number(activeProduct.stock) || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;

  // Cart State
  const cartItem = cartItems.find(item => item.id === activeProduct.id);
  const currentQty = cartItem ? cartItem.quantity : 0;
  const minQty = (showWholesaleData && isApproved) ? (activeProduct.minB2BQty || 1) : 1;

  // Price Calculation
  const priceQty = currentQty > 0 ? currentQty : minQty;
  const rawCurrentPrice = getTieredPrice ? getTieredPrice(activeProduct, priceQty) : (showWholesaleData ? activeProduct.b2bNewPrice : activeProduct.b2cNewPrice);
  const rawOldPrice = showWholesaleData ? (activeProduct.b2bOldPrice || activeProduct.b2cNewPrice) : activeProduct.b2cOldPrice;
  const currentPrice = Number(rawCurrentPrice || 0);
  const oldPrice = Number(rawOldPrice || 0);
  const discountPercent = oldPrice > currentPrice && oldPrice > 0 ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;

  // Image Processing
  let images = [];
  try {
    images = typeof activeProduct.images === 'string' ? JSON.parse(activeProduct.images) : (Array.isArray(activeProduct.images) ? activeProduct.images : []);
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
    addToCart(activeProduct, minQty);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleMinus = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (cartItem.quantity - 1 < minQty) removeFromCart(activeProduct.id);
    else updateQuantity(activeProduct.id, cartItem.quantity - 1);
  };

  const handlePlus = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (cartItem.quantity >= stock) return; // Can't exceed stock
    updateQuantity(activeProduct.id, cartItem.quantity + 1);
  };

  const handleVariantChange = (e) => {
    e.preventDefault(); e.stopPropagation();
    setSelectedVariantId(e.target.value);
    setActiveImage(0);
  };

  const accentColor = showWholesaleTheme
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-[var(--secondary)] hover:bg-[var(--secondary-dark)]';

  return (
    <div
      onClick={() => !isOutOfStock && navigate(`/product/${activeProduct.id}`)}
      className={`card-premium group relative flex flex-col w-full h-full overflow-hidden select-none
        ${showWholesaleTheme ? 'border-red-100' : ''}
        ${isOutOfStock ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* ── Image Area ─────────────────────────────── */}
      <div className={`relative w-full flex items-center justify-center rounded-t-[18px] overflow-hidden
        ${showWholesaleTheme ? 'bg-red-50/40' : 'bg-slate-50 group-hover:bg-slate-100/60'}
        ${isOutOfStock ? 'bg-slate-100' : ''}
        transition-colors duration-300`}
      >
        <div style={{ height: '130px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImage}
              initial={{ opacity: 1, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0.5, x: -10 }}
              transition={{ duration: 0.5 }}
              src={images[activeImage] || 'https://placehold.co/200'}
              alt={activeProduct.name}
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

        {/* Discount Badge — Large & Prominent */}
        {discountPercent > 0 && !isOutOfStock && (
          <div className={`absolute top-2 left-2 text-[11px] md:text-[12px] font-black px-2.5 py-1 rounded-lg leading-none shadow-lg z-10
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
          {activeProduct.name}
        </h3>

        <div className="flex flex-wrap items-center gap-1 mb-2">
          {activeProduct.ratePerUnit ? (
            <span className="text-[11px] md:text-[12px] font-black px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md leading-none tracking-tight">
              {activeProduct.ratePerUnit}
            </span>
          ) : null}
          {activeProduct.packagingSize && !hasVariants && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-md leading-none uppercase tracking-tighter">{activeProduct.packagingSize}</span>
          )}
          {showWholesaleData && isApproved && activeProduct.minB2BQty && (
            <span className={`text-[8px] font-black px-1 py-0.5 rounded-md border leading-none uppercase
              ${showWholesaleTheme ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
              MOQ: {activeProduct.minB2BQty}
            </span>
          )}
        </div>

        {/* Variant Dropdown */}
        {hasVariants && (
          <div className="mb-2" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <select
                value={selectedVariantId}
                onChange={handleVariantChange}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-[var(--secondary)] transition cursor-pointer pr-7"
              >
                {variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.packagingSize}{v.ratePerUnit ? ` · ${v.ratePerUnit}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* ── Pricing Row ──────────────────────────── */}
        <div className="mt-auto flex items-center justify-between gap-1 pt-2 border-t border-slate-100">
          <div className="flex flex-col leading-none min-w-0">
            {isOutOfStock ? (
              <span className="text-[11px] font-black text-slate-400 leading-none">Sold Out</span>
            ) : (
              <>
                <span className="text-[15px] md:text-[16px] font-black text-emerald-600 leading-none tracking-tighter">
                  ₹{Number(currentPrice || 0).toFixed(2)}
                </span>
                {oldPrice > currentPrice && (
                  <span className="text-[10px] text-red-400 font-bold line-through mt-0.5 tracking-tighter">
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
