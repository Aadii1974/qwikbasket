import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  
  const isB2B = user?.role === 'b2b';
  const isApproved = user?.isApproved;
  const currentPrice = (isB2B && isApproved) ? product.b2bPrice : product.b2cPrice;
  const oldPrice = product.originalPrice || product.b2cPrice + 10;
  const discountPercent = oldPrice > currentPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;
  const savings = product.b2cPrice - product.b2bPrice;
  
  const cartItem = cartItems.find(item => item.id === product.id);
  const minQty = (isB2B && isApproved) ? product.minB2BQty : 1;
  const [isAdding, setIsAdding] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleAdd = () => {
     setIsAdding(true);
     addToCart(product, minQty);
     setTimeout(() => setIsAdding(false), 800);
  };

  const handleMinus = () => {
     if (cartItem.quantity - 1 < minQty) {
        removeFromCart(product.id);
     } else {
        updateQuantity(product.id, cartItem.quantity - 1);
     }
  };

  return (
    <div className="group relative bg-white rounded-2xl p-3 border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 flex flex-col h-[280px]">
      
      {/* Nice Image Container */}
      <div className="relative h-28 mb-3 w-full flex items-center justify-center p-2 rounded-xl bg-gray-50/50">
        <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
      </div>

      <div className="flex flex-col flex-1 pb-1">
        {/* Discount Badge */}
        {discountPercent > 0 && (
           <div className="absolute top-3 left-3 bg-[#5c5cff] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center">
              {discountPercent}% OFF
           </div>
        )}

        {/* Product Name & Qty */}
        <h3 className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-snug">{product.name}</h3>
        <p className="text-[11px] font-semibold text-gray-400 mt-1">{product.unit}</p>
        
        {/* Pricing & Add Button row */}
        <div className="mt-auto pt-2 flex items-center justify-between">
           
           <div className="flex flex-col min-w-0 pr-2">
              <div className="flex flex-wrap items-baseline gap-1.5">
                 <span className="text-[14px] font-black text-gray-900 leading-none">₹{currentPrice}</span>
                 {oldPrice > currentPrice && (
                    <span className="text-[11px] text-gray-400 font-semibold line-through leading-none">₹{oldPrice}</span>
                 )}
              </div>
              {isB2B && isApproved && savings > 0 && (
                <span className="text-[9px] font-bold text-[var(--secondary)] uppercase tracking-wider mt-1 leading-none truncate">Wholesale</span>
              )}
           </div>

           <div className="flex-shrink-0">
             {!cartItem ? (
               <motion.button 
                 whileTap={shouldReduceMotion ? {} : { scale: 0.88 }}
                 onClick={handleAdd} 
                 className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-[var(--secondary)] hover:text-white transition-colors duration-300 shadow-sm"
               >
                 <AnimatePresence mode="wait">
                    {isAdding ? (
                       <motion.div key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                          <Check size={18} strokeWidth={3} className="text-green-400" />
                       </motion.div>
                    ) : (
                       <motion.div key="plus" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                          <Plus size={18} strokeWidth={3} />
                       </motion.div>
                    )}
                 </AnimatePresence>
               </motion.button>
             ) : (
               <div className="h-9 bg-[var(--secondary)] text-white rounded-xl flex items-center px-1.5 gap-2 shadow-sm">
                  <button onClick={handleMinus} className="hover:bg-black/20 rounded-md p-1 transition"><Minus size={14} strokeWidth={3} /></button>
                  <span className="text-[13px] font-bold min-w-[14px] text-center">{cartItem.quantity}</span>
                  <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} className="hover:bg-black/20 rounded-md p-1 transition"><Plus size={14} strokeWidth={3} /></button>
               </div>
             )}
           </div>

        </div>
      </div>
    </div>
  );
};

export default ProductCard;
