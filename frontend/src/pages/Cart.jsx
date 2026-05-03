import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Trash2, ShoppingBag, Plus, Minus, ChevronRight, Truck, CheckCircle2,
  FileText, Package, PartyPopper, Clock, Zap, Shield, Star,
  MapPin, Phone, User, Tag, Home, Navigation, ArrowRight,
  Gift, Sparkles, AlertCircle, Info, Rocket,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  checkServiceability, createOrder, createRazorpayOrder,
  fetchSettings, fetchRecommendations,
  fetchAddresses, createAddress,
  validateCoupon, getUserProfile, fetchPublicCoupons
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
  if (slots.length === 0) {
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
  const cutoff = settings.qwikDeliveryCutoffHour ?? 20;
  return new Date().getHours() < cutoff;
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
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0"
    >
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
        {imgs[0]
          ? <img src={imgs[0]} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-slate-900 text-sm truncate">{item.name}</p>
        <p className="text-xs text-slate-400 font-medium">{item.unit}</p>
        {isB2B && item.b2bPrice && (
          <span className="text-[10px] bg-blue-100 text-blue-700 font-black px-1.5 py-0.5 rounded-full">B2B Price</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1">
          <button
            onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}
            className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-red-50 hover:text-red-500 transition active:scale-90"
          >
            {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
          </button>
          <span className="font-black text-slate-900 w-5 text-center text-sm">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 rounded-lg bg-[var(--secondary)] shadow-sm flex items-center justify-center text-white hover:bg-[var(--secondary-dark)] transition active:scale-90"
          >
            <Plus size={12} />
          </button>
        </div>
        <p className="font-black text-slate-900 text-sm w-16 text-right">₹{(price * item.quantity).toFixed(0)}</p>
      </div>
    </motion.div>
  );
};

// ─── Fee Line ────────────────────────────────────────────────────
const FeeLine = ({ icon, label, sublabel, amount, highlight, free, strikethrough, color = 'text-slate-600' }) => (
  <div className={`flex items-start justify-between py-2 ${highlight ? 'bg-emerald-50 -mx-4 px-4 rounded-xl my-1' : ''}`}>
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5">{icon}</span>}
      <div>
        <p className={`text-sm font-bold ${color}`}>{label}</p>
        {sublabel && <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5 max-w-[220px]">{sublabel}</p>}
      </div>
    </div>
    <div className="text-right ml-4 flex-shrink-0">
      {free
        ? <span className="text-sm font-black text-emerald-600">FREE</span>
        : <span className={`text-sm font-black ${strikethrough ? 'line-through text-slate-300' : 'text-slate-900'}`}>₹{amount}</span>
      }
    </div>
  </div>
);

// ─── Steps ──────────────────────────────────────────────────────
const STEPS = ['Cart', 'Address', 'Delivery & Pay'];

// ════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
const Cart = () => {
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, subtotal, clearCart, getTieredPrice } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placedOrder, setPlacedOrder] = useState(null);
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [appSettings, setAppSettings] = useState(null);

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
    fetchPublicCoupons().then(res => setPublicCoupons(res));
  }, []);

  // Address state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ fullName: '', phone: '', addressLine: '', landmark: '', pincode: '' });
  const [addrError, setAddrError] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // null | 'checking' | 'ok' | 'error'

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

  // Load settings
  useEffect(() => {
    fetchSettings().then(s => { if (s) setAppSettings(s); });
  }, []);

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
    const loadAddresses = async () => {
      if (user) {
        try {
          const backendAddresses = await fetchAddresses();
          if (backendAddresses && backendAddresses.length > 0) {
            setSavedAddresses(backendAddresses);
            const defaultAddr = backendAddresses.find(a => a.isDefault) || backendAddresses[0];
            if (!selectedAddressId) setSelectedAddressId(defaultAddr.id);
            // Sync to localStorage as cache
            localStorage.setItem('qb_addresses', JSON.stringify(backendAddresses));
            return;
          }
        } catch (e) { /* fall through to localStorage */ }
      }
      // Fallback: localStorage (guest or backend unavailable)
      try {
        const stored = JSON.parse(localStorage.getItem('qb_addresses') || '[]');
        setSavedAddresses(stored);
        if (stored.length > 0 && !selectedAddressId) setSelectedAddressId(stored[0].id);
      } catch {}
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

  // Fee calculation
  const fees = computeFees(subtotal, deliveryType, appSettings || {});
  const qwikOk = isQwikAvailable(appSettings || {});
  const isB2B = user?.role === 'b2b' && user?.isApproved;

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const afterCoupon = Math.max(0, fees.total - discountAmount);
  const redemptionRate = appSettings?.farmerCoinRedemptionRate || 1;
  const coinsRedeemed = useFarmerCoins ? Math.min(farmerCoins, Math.floor(afterCoupon / redemptionRate)) : 0;
  const finalTotal = afterCoupon - (coinsRedeemed * redemptionRate);

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
    if (!/^\d{10}$/.test(phone)) return setAddrError('Please enter a valid 10-digit phone number.');
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

    if (checkoutStep === 1) { setCheckoutStep(2); return; }

    if (checkoutStep === 2) {
      if (!selectedAddressId && savedAddresses.length === 0) {
        return alert('Please add a delivery address to continue.');
      }
      if (!selectedAddressId) return alert('Please select a delivery address.');
      setCheckoutStep(3);
      return;
    }

    if (checkoutStep === 3) {
      if (deliveryType === 'Qwik' && !qwikOk) {
        return alert('Qwik Delivery is not available after 8 PM. Please choose Smart Delivery.');
      }

      setIsProcessing(true);
      try {
        let paymentId = null;
        if (paymentMethod === 'online') {
          const result = await startRazorpay();
          if (!result || !result.success) { setIsProcessing(false); return; }
          paymentId = result.paymentId;
        }
        const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);
        const orderData = {
          items: cartItems.map(i => ({
            productId: i.id, name: i.name,
            price: getTieredPrice ? getTieredPrice(i, i.quantity) : i.price,
            quantity: i.quantity, unit: i.unit,
            image: i.images?.[0] || '',
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
          couponCode: appliedCoupon ? appliedCoupon.code : null,
        };
        const result = await createOrder(orderData);
        setPlacedOrder(result.data || result);
        setShowConfetti(true);
        setCheckoutStep(4);
        clearCart();
        setTimeout(() => setShowConfetti(false), 4000);
      } catch (err) {
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

              {/* Stepper */}
              <div className="flex items-center justify-center gap-0 mb-10">
                {STEPS.map((step, i) => {
                  const stepNum = i + 1;
                  const isActive = checkoutStep === stepNum;
                  const isDone = checkoutStep > stepNum;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 ${isDone ? 'bg-[var(--secondary)] text-white' : isActive ? 'bg-slate-900 text-white ring-4 ring-slate-200' : 'bg-white text-gray-300 border-2 border-gray-200'}`}>
                          {isDone ? <CheckCircle2 size={18} /> : stepNum}
                        </div>
                        <span className={`text-[10px] font-black mt-2 uppercase tracking-widest ${isActive ? 'text-slate-900' : isDone ? 'text-[var(--secondary)]' : 'text-gray-300'}`}>{step}</span>
                      </div>
                      {i < STEPS.length - 1 && <div className={`h-0.5 w-12 md:w-20 mb-5 mx-1 transition-all duration-500 ${checkoutStep > stepNum ? 'bg-[var(--secondary)]' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* ── Left Column ──────────────────────────── */}
                <div className="lg:col-span-2">
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
                                  <Link
                                    key={p.id}
                                    to={`/product/${p.id}`}
                                    className="flex-shrink-0 w-32 bg-slate-50 rounded-2xl p-3 border border-slate-100 hover:border-[var(--secondary)]/30 hover:bg-emerald-50 transition-all group"
                                  >
                                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-white mb-2 border border-slate-100">
                                      {recImgs[0]
                                        ? <img src={recImgs[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>}
                                    </div>
                                    <p className="text-xs font-black text-slate-800 line-clamp-2 leading-tight mb-1">{p.name}</p>
                                    <p className="text-xs font-black text-[var(--secondary)]">{recPrice > 0 ? `₹${recPrice}` : ''}</p>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
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
                                          required name="phone" value={addrForm.phone} onChange={handleAddrChange}
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
                          {!showAddressForm && savedAddresses.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                              <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
                              <p className="font-bold text-gray-500">No addresses yet.</p>
                              <p className="text-sm text-gray-400 mt-1">Add your first delivery address above.</p>
                            </div>
                          )}

                          <div className="grid gap-3 mt-2">
                            {savedAddresses.map(addr => (
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
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-black text-slate-900">{addr.fullName}</span>
                                      <span className="text-sm font-bold text-gray-400">· {addr.phone}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed">{addr.addressLine}</p>
                                    {addr.landmark && <p className="text-xs text-gray-400 font-medium mt-0.5">Near: {addr.landmark}</p>}
                                    <p className="text-xs font-bold text-gray-400 mt-1">Pincode: {addr.pincode}</p>
                                  </div>
                                  {selectedAddressId === addr.id && (
                                    <div className="bg-[var(--secondary)] text-white rounded-lg px-2 py-1 text-[10px] font-black">Selected</div>
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
                          <label
                            onClick={() => qwikOk && setDeliveryType('Qwik')}
                            className={`block p-5 rounded-2xl border-2 transition-all mb-6 ${!qwikOk ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50' : `cursor-pointer ${deliveryType === 'Qwik' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-amber-200 bg-white'}`}`}
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
                                    ? <span className="ml-auto text-[10px] bg-slate-200 text-slate-600 font-black px-2 py-0.5 rounded-full">Closes at 8 PM</span>
                                    : <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 font-black px-2 py-0.5 rounded-full">FAST-TRACK ⚡</span>
                                  }
                                </div>
                                <p className="text-sm text-slate-600 font-medium mb-2">
                                  {qwikOk
                                    ? 'Priority instant delivery — your order jumps to the front of the queue!'
                                    : 'Qwik Delivery is only available until 8:00 PM. Place your order early!'}
                                </p>
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
                          </label>

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

                          {publicCoupons.length > 0 && !appliedCoupon && (
                            <div className="mt-3 space-y-2">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Coupons</p>
                               {publicCoupons.map(c => (
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
                      ) : checkoutStep === 2 ? (
                        <><Truck size={18} /> Choose Delivery</>
                      ) : (
                        <><CheckCircle2 size={18} /> {paymentMethod === 'online' ? 'Pay & Place Order' : 'Place Order'}</>
                      )}
                    </motion.button>

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
    </div>
  );
};

export default Cart;
