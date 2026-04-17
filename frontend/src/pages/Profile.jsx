import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchUserOrders, updateUserProfile,
  fetchAddresses, createAddress, updateAddress, deleteAddress,
  checkServiceability, getUserProfile
} from '../services/api';
import {
  Package, FileText, Download, CheckCircle2, Truck, Clock, Activity,
  MapPin, Plus, Trash2, Star, Phone, Home, Tag, Navigation, AlertCircle,
  User, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Helpers ──────────────────────────────────────────────────────
const getStatusColor = (status) => {
  const map = {
    Pending: 'bg-orange-100 text-orange-700',
    Processing: 'bg-blue-100 text-blue-700',
    Packed: 'bg-indigo-100 text-indigo-700',
    Shipped: 'bg-purple-100 text-purple-700',
    'Out for Delivery': 'bg-emerald-100 text-emerald-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending': return <Clock size={13} />;
    case 'Processing': return <Package size={13} />;
    case 'Packed': return <Package size={13} />;
    case 'Shipped': return <Truck size={13} />;
    case 'Out for Delivery': return <Truck size={13} />;
    case 'Delivered': return <CheckCircle2 size={13} />;
    default: return <Clock size={13} />;
  }
};

// ─── Address Form ──────────────────────────────────────────────────
const EMPTY_ADDR = { fullName: '', phone: '', addressLine: '', landmark: '', pincode: '' };

const AddressForm = ({ onSave, onCancel, isLoading }) => {
  const [form, setForm] = useState(EMPTY_ADDR);
  const [pincodeStatus, setPincodeStatus] = useState(null); // null | 'checking' | 'ok' | 'error'
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePincodeBlur = async () => {
    if (form.pincode.length !== 6) return;
    setPincodeStatus('checking');
    const result = await checkServiceability(form.pincode);
    setPincodeStatus(result.serviceable ? 'ok' : 'error');
    if (!result.serviceable) setError(result.message || "We don't deliver to this pincode yet.");
    else setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.fullName.length < 3) return setError('Full name must be at least 3 characters.');
    if (!/^\d{10}$/.test(form.phone)) return setError('Enter a valid 10-digit phone number.');
    if (form.addressLine.length < 5) return setError('Please enter your complete address.');
    if (!/^\d{6}$/.test(form.pincode)) return setError('Pincode must be exactly 6 digits.');
    if (pincodeStatus === 'error') return setError("We don't deliver to this pincode yet.");
    await onSave(form);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onSubmit={handleSubmit}
      className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-4"
    >
      <h3 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
        <MapPin size={15} className="text-[var(--secondary)]" /> Add New Address
      </h3>
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-3 rounded-xl mb-4">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />{error}
        </div>
      )}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <User size={13} className="absolute left-3 top-3.5 text-slate-400" />
            <input required name="fullName" value={form.fullName} onChange={handleChange}
              placeholder="Full Name *"
              className="w-full pl-8 pr-3 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium outline-none focus:border-[var(--secondary)] transition bg-white" />
          </div>
          <div className="relative">
            <Phone size={13} className="absolute left-3 top-3.5 text-slate-400" />
            <input required name="phone" value={form.phone} onChange={handleChange}
              placeholder="Phone *" maxLength={10} type="tel"
              className="w-full pl-8 pr-3 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium outline-none focus:border-[var(--secondary)] transition bg-white" />
          </div>
        </div>
        <div className="relative">
          <Home size={13} className="absolute left-3 top-3.5 text-slate-400" />
          <textarea required name="addressLine" value={form.addressLine} onChange={handleChange}
            placeholder="House No., Street, Area, City *" rows={2}
            className="w-full pl-8 pr-3 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium outline-none focus:border-[var(--secondary)] transition bg-white resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Tag size={13} className="absolute left-3 top-3.5 text-slate-400" />
            <input name="landmark" value={form.landmark} onChange={handleChange}
              placeholder="Landmark (optional)"
              className="w-full pl-8 pr-3 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium outline-none focus:border-[var(--secondary)] transition bg-white" />
          </div>
          <div className="relative">
            <Navigation size={13} className="absolute left-3 top-3.5 text-slate-400" />
            <input required name="pincode" value={form.pincode} onChange={handleChange}
              onBlur={handlePincodeBlur} placeholder="Pincode *" maxLength={6}
              className={`w-full pl-8 pr-8 py-3 rounded-xl border-2 text-sm font-medium outline-none transition bg-white
                ${pincodeStatus === 'ok' ? 'border-emerald-400' : pincodeStatus === 'error' ? 'border-red-400' : 'border-slate-200 focus:border-[var(--secondary)]'}`} />
            {pincodeStatus === 'checking' && <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-slate-300 border-t-[var(--secondary)] rounded-full animate-spin" />}
            {pincodeStatus === 'ok' && <CheckCircle2 size={13} className="absolute right-3 top-3.5 text-emerald-500" />}
          </div>
        </div>
        {pincodeStatus === 'ok' && (
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 size={11} /> Pincode verified — we deliver here!
          </p>
        )}
      </div>
      <div className="flex gap-3 mt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-3 font-bold text-slate-500 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition text-sm">Cancel</button>
        <button type="submit" disabled={isLoading}
          className="flex-1 py-3 bg-[var(--secondary)] text-white font-black rounded-xl disabled:opacity-50 hover:bg-[var(--secondary-dark)] transition text-sm">
          {isLoading ? 'Saving...' : 'Save Address'}
        </button>
      </div>
    </motion.form>
  );
};

// ─── Address Card ──────────────────────────────────────────────────
const AddressCard = ({ addr, onSetDefault, onDelete, isDeleting }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className={`p-5 rounded-2xl border-2 transition-all ${addr.isDefault ? 'border-[var(--secondary)] bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
  >
    <div className="flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${addr.isDefault ? 'bg-[var(--secondary)] text-white' : 'bg-slate-100 text-slate-400'}`}>
        <MapPin size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-black text-slate-900 text-sm">{addr.fullName}</span>
          <span className="text-xs text-slate-400 font-medium">· {addr.phone}</span>
          {addr.isDefault && (
            <span className="text-[10px] bg-[var(--secondary)] text-white font-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star size={9} fill="white" /> Default
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{addr.addressLine}</p>
        {addr.landmark && <p className="text-xs text-slate-400 mt-0.5">Near: {addr.landmark}</p>}
        <p className="text-xs font-bold text-slate-400 mt-1">Pincode: {addr.pincode}</p>
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        {!addr.isDefault && (
          <button
            onClick={() => onSetDefault(addr.id)}
            className="text-[11px] font-black text-[var(--secondary)] bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100 transition whitespace-nowrap"
          >
            Set Default
          </button>
        )}
        <button
          onClick={() => onDelete(addr.id)}
          disabled={isDeleting === addr.id}
          className="text-[11px] font-black text-red-500 bg-red-50 border border-red-100 px-2 py-1 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
        >
          {isDeleting === addr.id ? '...' : 'Remove'}
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Order Invoice ─────────────────────────────────────────────────
const downloadInvoice = (order) => {
  const invoiceHTML = `
    <html>
    <head>
      <title>Invoice - ${order.orderNumber}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; padding: 48px; color: #1e293b; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #059669; padding-bottom: 24px; margin-bottom: 32px; }
        .brand { font-size: 28px; font-weight: 900; color: #059669; letter-spacing: -1px; }
        .brand span { color: #1e293b; }
        .badge { background: #fef3c7; color: #92400e; font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 4px; border: 1px solid #fde68a; vertical-align: super; }
        .label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 4px; }
        .section { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #f8fafc; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #64748b; padding: 12px 16px; text-align: left; border-bottom: 2px solid #e2e8f0; }
        td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #334155; }
        .total-section { background: #f8fafc; border-radius: 12px; padding: 24px; text-align: right; }
        .grand-total { font-size: 22px; font-weight: 900; color: #1e293b; margin-top: 12px; }
        .status-badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 99px; text-transform: uppercase; letter-spacing: 1px; }
        .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">Qwik<span>Basket</span> <span class="badge">by Real Farms</span></div>
          <div style="margin-top: 8px; color: #64748b; font-size: 13px; font-weight: 600;">Freshness Delivered — Quality over Time</div>
        </div>
        <div style="text-align: right;">
          <div class="label">Invoice</div>
          <div style="font-size: 20px; font-weight: 900; color: #1e293b;">#${order.orderNumber}</div>
          <div style="color: #64748b; font-size: 13px; margin-top: 4px;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
      <div class="section">
        <div>
          <div class="label">Deliver To</div>
          <div style="font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 4px;">${order.deliveryAddress?.fullName || ''}</div>
          <div style="color: #64748b; font-size: 13px; line-height: 1.7;">
            ${order.deliveryAddress?.addressLine || ''}${order.deliveryAddress?.landmark ? '<br/>Near: ' + order.deliveryAddress.landmark : ''}<br/>
            Pincode: ${order.deliveryAddress?.pincode || ''}<br/>
            Ph: ${order.deliveryAddress?.phone || ''}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="label">Order Status</div>
          <span class="status-badge">${order.status || 'Pending'}</span>
          <div style="margin-top: 16px;">
            <div class="label">Delivery Type</div>
            <div style="font-weight: 800; color: #1e293b;">${order.deliveryType || 'Smart'} Delivery</div>
          </div>
          <div style="margin-top: 16px;">
            <div class="label">Payment Method</div>
            <div style="font-weight: 800; text-transform: uppercase; color: #1e293b;">${order.paymentMethod}</div>
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th><th>Unit</th><th>Qty</th><th>Unit Price</th><th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(order.items || []).map(item => `
            <tr>
              <td style="font-weight: 800; color: #1e293b;">${item.name}</td>
              <td>${item.unit || ''}</td>
              <td>${item.quantity}</td>
              <td>₹${Number(item.price || 0).toFixed(2)}</td>
              <td style="text-align: right; font-weight: 800;">₹${Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total-section">
        <div style="color: #64748b; font-weight: 700; margin-bottom: 8px;">Items Subtotal: ₹${Number(order.subtotal || 0).toFixed(2)}</div>
        <div style="color: #64748b; font-weight: 700; margin-bottom: 8px;">Delivery: ${(order.deliveryFee || 0) === 0 ? '<span style="color:#1FB33B; font-weight:800;">FREE</span>' : '₹' + Number(order.deliveryFee || 0).toFixed(2)}</div>
        ${order.packagingFee ? `<div style="color: #64748b; font-weight: 700; margin-bottom: 8px;">Care & Packaging: ₹${Number(order.packagingFee).toFixed(2)}</div>` : ''}
        ${order.smallCartFee ? `<div style="color: #64748b; font-weight: 700; margin-bottom: 8px;">Service Fee: ₹${Number(order.smallCartFee).toFixed(2)}</div>` : ''}
        <div class="grand-total">Grand Total: ₹${Number(order.totalAmount || 0).toFixed(2)}</div>
      </div>
      <div class="footer">Thank you for shopping with QwikBasket by Real Farms! For support, contact us at support@qwikbasket.com</div>
    </body>
    </html>
  `;
  const win = window.open('', '', 'width=900,height=700');
  win.document.write(invoiceHTML);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 500);
};

// ─── Order Card ────────────────────────────────────────────────────
const OrderCard = ({ order }) => {
  const isDelivered = order.status === 'Delivered';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-100">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Order #{order.orderNumber}</span>
          <p className="font-bold text-slate-900 mt-0.5 text-sm">
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' '}at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}{order.status}
          </div>
          <button onClick={() => downloadInvoice(order)}
            className="flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-800 transition">
            <FileText size={13} /> Download Invoice
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
        {(order.items || []).map((item, idx) => (
          <div key={idx} className="shrink-0 flex items-center gap-3 bg-slate-50 p-2 pr-4 rounded-xl border border-slate-100">
            {item.image
              ? <img src={item.image} alt={item.name} className="w-11 h-11 rounded-lg object-cover bg-white" />
              : <div className="w-11 h-11 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-lg">🌿</div>
            }
            <div>
              <p className="text-xs font-black text-slate-900 line-clamp-1 max-w-[110px]">{item.name}</p>
              <p className="text-[10px] font-bold text-slate-500">{item.quantity} × ₹{item.price}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{(order.items || []).length} items · {order.deliveryType || 'Smart'} Delivery</p>
        <p className="text-lg font-black text-slate-900">₹{Number(order.totalAmount || 0).toFixed(0)}</p>
      </div>
    </motion.div>
  );
};

// ─── Edit Profile Modal ────────────────────────────────────────────
const EditModal = ({ isOpen, onClose, form, setForm, onSave }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-black mb-6 text-slate-900">Edit Profile</h2>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:border-[var(--secondary)]" />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Phone Number</label>
            <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:border-[var(--secondary)]" />
          </div>
          <div className="flex gap-3 mt-8">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-slate-400 hover:bg-slate-50 transition rounded-2xl">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-[var(--secondary)] text-white font-black rounded-2xl shadow-lg shadow-green-100">Save Changes</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(localStorage.getItem('profileActiveTab') || 'orders'); // 'orders' | 'addresses' | 'wallet'

  useEffect(() => {
    if (localStorage.getItem('profileActiveTab')) {
       localStorage.removeItem('profileActiveTab');
    }
  }, []);

  // Profile data
  const [farmerCoins, setFarmerCoins] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState([]);

  // Orders
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [isAddrLoading, setIsAddrLoading] = useState(true);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [isSavingAddr, setIsSavingAddr] = useState(false);
  const [isDeletingAddr, setIsDeletingAddr] = useState(null);

  // Profile edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadOrders();
      loadAddresses();
    }
  }, [user]);

  const loadProfileData = async () => {
    const res = await getUserProfile();
    if (res?.success) {
       setFarmerCoins(res.data.farmerCoins || 0);
       setWalletTransactions(res.data.walletTransactions || []);
    }
  };

  const loadOrders = async () => {
    setIsOrdersLoading(true);
    const data = await fetchUserOrders();
    setOrders(data || []);
    setIsOrdersLoading(false);
  };

  const loadAddresses = async () => {
    setIsAddrLoading(true);
    const data = await fetchAddresses();
    setAddresses(data || []);
    setIsAddrLoading(false);
  };

  const handleSaveAddress = async (addrData) => {
    setIsSavingAddr(true);
    try {
      const isFirst = addresses.length === 0;
      const res = await createAddress({ ...addrData, isDefault: isFirst });
      if (res.success) {
        await loadAddresses();
        setShowAddrForm(false);
      } else {
        alert(res.error || 'Failed to save address');
      }
    } catch (e) {
      alert('Error saving address');
    } finally {
      setIsSavingAddr(false);
    }
  };

  const handleSetDefault = async (id) => {
    const res = await updateAddress(id, { isDefault: true });
    if (res.success) {
      await loadAddresses();
      // Also sync to localStorage for cart usage
      const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
      localStorage.setItem('qb_addresses', JSON.stringify(updated));
    }
  };

  const handleDeleteAddress = async (id) => {
    setIsDeletingAddr(id);
    try {
      const res = await deleteAddress(id);
      if (res.success) {
        await loadAddresses();
        // Update localStorage cache
        const updated = addresses.filter(a => a.id !== id);
        localStorage.setItem('qb_addresses', JSON.stringify(updated));
      }
    } finally {
      setIsDeletingAddr(null);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUserProfile(editForm);
      if (res.success) {
        updateUser(res.data);
        setIsEditModalOpen(false);
      } else {
        alert(res.error || 'Failed to update profile');
      }
    } catch (err) {
      alert(err.message || 'An error occurred');
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const pastOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');
  const totalSpent = orders.reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);

  if (!user) return null;

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ── Sidebar ───────────────────────────────────── */}
          <div className="w-full md:w-72 shrink-0 space-y-5">
            {/* Avatar */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-lg">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-black mb-1 text-slate-900">{user.name}</h2>
              <p className="text-sm font-bold text-slate-500 mb-5">{user.phone}</p>
              <span className="bg-emerald-100 text-emerald-700 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
                {user.role} Account
              </span>
            </div>

            {/* Stats */}
            <div className="bg-slate-900 rounded-3xl p-7 shadow-xl text-white">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">Account Overview</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-sm">Total Orders</span>
                <span className="text-xl font-black text-[var(--primary)]">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-sm">Total Spent</span>
                <span className="text-xl font-black text-emerald-400">₹{totalSpent.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-sm">Saved Addresses</span>
                <span className="text-xl font-black text-blue-400">{addresses.length}</span>
              </div>
              <div className="flex justify-between items-center mb-7">
                <span className="font-bold text-sm text-yellow-300">Farmer Coins</span>
                <span className="text-xl font-black text-yellow-500">👨‍🌾 {farmerCoins}</span>
              </div>
              <button onClick={logout} className="w-full py-3 border-2 border-slate-700 text-slate-300 font-black rounded-xl hover:bg-slate-800 transition text-sm">
                Log Out
              </button>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Quick Actions</h3>
              <button
                onClick={() => { setEditForm({ name: user.name, phone: user.phone }); setIsEditModalOpen(true); }}
                className="w-full py-3 bg-slate-50 text-slate-900 font-black rounded-xl border border-slate-100 hover:bg-slate-100 transition flex items-center justify-between px-4 text-sm"
              >
                <span className="flex items-center gap-2"><Activity size={15} /> Edit Profile</span>
                <ChevronRight size={15} className="text-slate-300" />
              </button>
              <a
                href={`https://wa.me/918976040532?text=${encodeURIComponent('Hi, I need support.')}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full py-3 bg-[var(--secondary)] text-white font-black rounded-xl shadow-lg shadow-green-100 hover:opacity-90 transition flex items-center justify-center gap-2 text-sm"
              >
                WhatsApp Support
              </a>
            </div>
          </div>

          {/* ── Main Content ──────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Tab Nav */}
            <div className="flex gap-1 overflow-x-auto bg-white border border-slate-100 rounded-2xl p-1.5 mb-7 shadow-sm w-full md:w-fit" style={{ scrollbarWidth: 'none' }}>
              {[['orders', 'My Orders'], ['wallet', 'Wallet'], ['addresses', 'Address Book']].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Orders Tab ──────────────────────────────── */}
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {isOrdersLoading ? (
                    <div className="text-center py-20 text-slate-400 font-bold">Loading your orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-14 text-center border border-slate-100 shadow-sm">
                      <Package size={64} className="mx-auto text-slate-200 mb-4" />
                      <h3 className="text-xl font-black text-slate-400 mb-2">No orders yet</h3>
                      <p className="text-slate-500 font-medium">Looks like you haven't placed an order yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {activeOrders.length > 0 && (
                        <>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Active Orders</h3>
                          {activeOrders.map(order => <OrderCard key={order.id} order={order} />)}
                        </>
                      )}
                      {pastOrders.length > 0 && (
                        <>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 mt-8">Past Orders</h3>
                          {pastOrders.map(order => <OrderCard key={order.id} order={order} />)}
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Addresses Tab ────────────────────────── */}
              {activeTab === 'addresses' && (
                <motion.div key="addresses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900">Address Book</h1>
                      <p className="text-sm text-slate-500 font-medium mt-1">Saved addresses auto-fill at checkout</p>
                    </div>
                    <button
                      onClick={() => setShowAddrForm(prev => !prev)}
                      className="flex items-center gap-2 bg-[var(--secondary)] text-white font-black text-sm px-5 py-3 rounded-2xl shadow-lg shadow-green-100 hover:opacity-90 transition"
                    >
                      <Plus size={16} /> Add Address
                    </button>
                  </div>

                  {/* Add Form */}
                  <AnimatePresence>
                    {showAddrForm && (
                      <AddressForm
                        onSave={handleSaveAddress}
                        onCancel={() => setShowAddrForm(false)}
                        isLoading={isSavingAddr}
                      />
                    )}
                  </AnimatePresence>

                  {/* Address list */}
                  {isAddrLoading ? (
                    <div className="text-center py-16 text-slate-400 font-bold">Loading addresses...</div>
                  ) : addresses.length === 0 && !showAddrForm ? (
                    <div className="bg-white rounded-3xl p-14 text-center border-2 border-dashed border-slate-200">
                      <MapPin size={48} className="mx-auto text-slate-200 mb-4" />
                      <h3 className="text-lg font-black text-slate-400 mb-1">No addresses saved</h3>
                      <p className="text-sm text-slate-500 font-medium">Add a delivery address to speed up checkout.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {addresses.map(addr => (
                          <AddressCard
                            key={addr.id}
                            addr={addr}
                            onSetDefault={handleSetDefault}
                            onDelete={handleDeleteAddress}
                            isDeleting={isDeletingAddr}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Info banner */}
                  {addresses.length > 0 && (
                    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-blue-900">Your default address is pre-selected at checkout</p>
                        <p className="text-xs text-blue-600 font-medium mt-0.5">
                          Addresses are securely stored and synced across all your devices.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Wallet Tab ──────────────────────────────── */}
              {activeTab === 'wallet' && (
                <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900">My Loyalty Wallet</h1>
                      <p className="text-sm text-slate-500 font-medium mt-1">Earn Farmer Coins on eligible orders and use them for discounts.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-3xl p-8 text-white shadow-xl mb-8 flex justify-between items-center">
                     <div>
                        <p className="text-yellow-100 text-sm font-bold uppercase tracking-widest mb-1">Available Balance</p>
                        <h2 className="text-5xl font-black drop-shadow-md flex items-center gap-2">👳🏽‍♂️ {farmerCoins}</h2>
                     </div>
                     <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Tag size={32} className="text-white drop-shadow" />
                     </div>
                  </div>

                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Transaction History</h3>
                  {walletTransactions.length === 0 ? (
                    <div className="bg-white rounded-3xl p-14 text-center border border-slate-100 shadow-sm">
                      <div className="text-4xl mb-4">💳</div>
                      <h3 className="text-lg font-black text-slate-400 mb-1">No transactions yet</h3>
                      <p className="text-sm text-slate-500 font-medium">Place an order to start earning.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {walletTransactions.map(tx => (
                        <div key={tx.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center text-lg ${tx.type === 'EARNED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                 {tx.type === 'EARNED' ? '⬇️' : '⬆️'}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 text-sm">{tx.description}</p>
                                 <p className="text-xs font-bold text-slate-400">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              </div>
                           </div>
                           <p className={`font-black text-lg ${tx.type === 'EARNED' ? 'text-green-600' : 'text-red-500'}`}>
                              {tx.type === 'EARNED' ? '+' : '-'}{tx.amount}
                           </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        form={editForm}
        setForm={setEditForm}
        onSave={handleEditProfile}
      />
    </div>
  );
};

export default Profile;
