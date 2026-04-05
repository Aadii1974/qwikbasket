import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus, ChevronRight, CreditCard, Wallet, Truck, Info, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const navigate = useNavigate();

  const isB2B = user?.role === 'b2b' && user?.isApproved;
  const deliveryFee = subtotal > 500 ? 0 : 25;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (checkoutStep === 1) setCheckoutStep(2);
    else if (checkoutStep === 2) {
      setCheckoutStep(3);
      setTimeout(() => {
        clearCart();
        navigate('/');
      }, 4000);
    }
  };

  if (cartItems.length === 0 && checkoutStep !== 3) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center bg-gray-50 px-6 fade-in">
         <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
            <ShoppingBag size={48} className="text-gray-300" />
         </div>
         <h2 className="text-2xl font-extrabold mb-4">Your cart is empty</h2>
         <Link to="/" className="bg-[var(--secondary)] text-white px-10 py-4 rounded-full font-black text-lg shadow-lg hover:bg-[var(--secondary-dark)] active:scale-95 transition">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-100px)] pt-12 pb-24">
      <div className="container max-w-5xl">
        {checkoutStep === 3 ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[var(--radius-lg)] shadow-xl text-center max-w-lg mx-auto">
             <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-50">
                <CheckCircle2 size={48} className="text-[var(--secondary)]" />
             </div>
             <h2 className="text-3xl font-black mb-4">Order Placed!</h2>
             <p className="text-[var(--text-muted)] font-medium mb-10 leading-relaxed">Your order has been received. <br /> Ref: BLNK-{Math.floor(Math.random()*1000000)}</p>
             <div className="p-6 bg-slate-900 rounded-[var(--radius-md)] text-white flex items-center justify-between mb-8">
                <div className="text-left"><p className="text-xs font-bold text-slate-400 uppercase">Delivery Time</p><p className="text-xl font-black">Within 10 Minutes</p></div>
                <div className="text-right"><Truck size={32} className="text-[var(--primary)]" /></div>
             </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="popLayout">
              {checkoutStep === 1 ? (
                <motion.div key="cart-step" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="bg-white rounded-[var(--radius-lg)] p-8 shadow-sm border border-[var(--border)] overflow-hidden">
                   <div className="flex items-center justify-between mb-8">
                      <h1 className="text-2xl font-black">Shopping Cart ({cartItems.length})</h1>
                      <button onClick={clearCart} className="text-sm font-bold text-red-500 hover:underline">Clear all</button>
                   </div>
                   <div className="space-y-8">
                      {cartItems.map((item) => {
                        const price = isB2B ? item.b2bPrice : item.b2cPrice;
                        const minQty = isB2B ? item.minB2BQty : 1;
                        return (
                          <motion.div key={item.id} layout className="flex items-center gap-6">
                             <div className="w-24 h-24 bg-gray-50 rounded-[var(--radius-md)] overflow-hidden border">
                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h3 className="font-extrabold text-lg text-[var(--text-main)] truncate">{item.name}</h3>
                                <p className="text-sm font-medium text-[var(--text-muted)]">{item.unit}</p>
                                <div className="mt-3 flex items-center gap-4">
                                   <div className="flex items-center bg-[var(--background)] rounded-full px-3 py-1.5 gap-4 border">
                                      <button onClick={() => updateQuantity(item.id, Math.max(minQty, item.quantity - 1))}><Minus size={16}/></button>
                                      <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={16}/></button>
                                   </div>
                                   <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                             </div>
                             <div className="text-right"><p className="text-xl font-black">₹{price * item.quantity}</p></div>
                          </motion.div>
                        );
                      })}
                   </div>
                </motion.div>
              ) : (
                <motion.div key="payment-step" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="bg-white rounded-[var(--radius-lg)] p-8 shadow-sm border border-[var(--border)]">
                   <button onClick={() => setCheckoutStep(1)} className="text-sm font-bold text-[var(--secondary)] mb-6 flex items-center gap-2">Back to Cart</button>
                   <h1 className="text-2xl font-black mb-10">Choose Payment Method</h1>
                   <div className="space-y-4">
                      {[ { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard /> }, { id: 'upi', name: 'UPI (Paytm/GPay)', icon: <div className="bg-blue-600 text-[10px] text-white px-1 font-black rounded">UPI</div> } ].map((m) => (
                        <div key={m.id} onClick={() => setPaymentMethod(m.id)} className={`p-5 rounded-[var(--radius-md)] border-2 cursor-pointer transition-all flex items-center gap-6 ${paymentMethod === m.id ? 'border-[var(--secondary)] bg-[#1FB33B05]' : 'border-gray-100'}`}>
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === m.id ? 'bg-[var(--secondary)] text-white' : 'bg-gray-100 text-gray-400'}`}>{m.icon}</div>
                           <div className="flex-1"><p className="font-bold">{m.name}</p></div>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
            <div className="space-y-6">
               <div className="bg-white rounded-[var(--radius-lg)] p-8 shadow-sm border border-[var(--border)]">
                  <h3 className="text-lg font-black mb-6">Bill Details</h3>
                  <div className="space-y-4 text-sm font-medium">
                     <div className="flex justify-between items-center text-[var(--text-muted)]"><span>Item Total</span><span className="text-[var(--text-main)] font-bold">₹{subtotal}</span></div>
                     <div className="flex justify-between items-center text-[var(--text-muted)]"><span>Delivery Fee</span><span className={`font-bold ${deliveryFee === 0 ? 'text-[var(--secondary)]' : 'text-[var(--text-main)]'}`}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                     <div className="pt-4 mt-4 border-t border-[var(--border)] flex justify-between items-center text-[var(--text-main)]"><span className="text-lg font-black tracking-tight">Grand Total</span><span className="text-2xl font-black">₹{grandTotal}</span></div>
                  </div>
                  <button onClick={handleCheckout} className="w-full bg-[var(--secondary)] text-white mt-10 py-5 rounded-[var(--radius-md)] font-black text-xl shadow-xl hover:bg-[var(--secondary-dark)] transition">{checkoutStep === 1 ? 'Proceed to Pay' : 'Pay via ' + paymentMethod.toUpperCase()} <ChevronRight size={24}/></button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
