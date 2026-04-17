import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAgentOrders, fetchAgentMetrics, markAsDelivered } from '../services/api';
import { 
  Bike, Package, MapPin, CheckCircle2, History,
  BarChart3, Wallet, ArrowRight, TrendingUp, Award,
  ChevronRight, Calendar, Zap, Clock, IndianRupee, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeliveryTypeBadge = ({ type }) => (
  type === 'Qwik'
    ? (
      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
        <Zap size={9} className="fill-amber-500" /> Qwik
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
        <Clock size={9} /> Smart
      </span>
    )
);

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [justDeliveredId, setJustDeliveredId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'orders') {
        const data = await fetchAgentOrders();
        setOrders(data);
      } else {
        const data = await fetchAgentMetrics();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      setProcessingId(orderId);
      // Optimistic UI — remove from list immediately
      setJustDeliveredId(orderId);
      const result = await markAsDelivered(orderId);
      
      // Remove from list after animation completes
      setTimeout(() => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        setJustDeliveredId(null);
      }, 600);

      const earned = result?.earnings ?? 0;
      showToast(earned > 0 ? `✅ Delivered! ₹${earned} added to your earnings.` : '✅ Order marked as delivered!');
    } catch (err) {
      setJustDeliveredId(null);
      showToast('❌ Failed to update. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  if (!user || user.role !== 'delivery_agent') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="bg-red-50 p-6 rounded-full mb-4"><Bike size={48} className="text-red-500" /></div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500 max-w-sm">This dashboard is only accessible to registered delivery agents.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-12 pt-16 lg:pt-24 px-4 sm:px-6">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
          <div>
            <span className="text-[var(--secondary)] font-black text-xs uppercase tracking-widest bg-[var(--secondary)]/10 px-3 py-1 rounded-full">Active Partner</span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Welcome, {user.name}! 👋</h1>
            <p className="text-slate-500 font-medium">Ready for today's deliveries?</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 noscroll">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm min-w-[140px] flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Assigned</p>
              <h3 className="text-xl font-black text-slate-900">{orders.length} Orders</h3>
            </div>
            {metrics && (
              <div className="bg-[var(--secondary)] p-4 rounded-2xl shadow-lg shadow-[var(--secondary)]/20 min-w-[140px] flex-1 text-white">
                <p className="text-xs font-bold opacity-80 uppercase">Today's Earnings</p>
                <h3 className="text-xl font-black">₹{metrics.dayWise?.[0]?.totalEarnings || 0}</h3>
              </div>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 mb-8 w-full md:w-fit">
          {[
            { id: 'orders', icon: Package, label: 'My Orders' },
            { id: 'metrics', icon: BarChart3, label: 'Performance' },
            { id: 'payments', icon: Wallet, label: 'Earnings' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Icon size={18} />{label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {/* ── Orders Tab ─────────────────────────────────── */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full py-20 text-center text-slate-400 font-bold">Loading tasks...</div>
              ) : orders.length === 0 ? (
                <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">All Clear! 🎉</h3>
                  <p className="text-slate-500 text-sm mt-1">No pending orders. Check back soon.</p>
                </div>
              ) : (
                orders.map(order => (
                  <AnimatePresence key={order.id}>
                    {justDeliveredId !== order.id && (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.35 }}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:border-[var(--secondary)]/30 transition-all duration-300"
                      >
                        {/* Card header */}
                        <div className="p-5 border-b border-slate-50 flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Order</span>
                            <h4 className="font-black text-slate-900">{order.orderNumber}</h4>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="bg-yellow-50 text-yellow-600 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">{order.status}</div>
                            <DeliveryTypeBadge type={order.deliveryType || 'Smart'} />
                          </div>
                        </div>

                        <div className="p-5 space-y-4">
                          {/* Delivery slot */}
                          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                            <Clock size={14} className="text-emerald-500 flex-shrink-0" />
                            <p className="text-xs font-black text-slate-700 leading-tight">{order.deliverySlot || 'Smart Delivery'}</p>
                          </div>

                          {/* Address */}
                          <div className="flex gap-3">
                            <div className="bg-slate-50 p-2 rounded-xl text-slate-400 flex-shrink-0">
                              <MapPin size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase leading-none mb-1">Deliver To</p>
                              <p className="text-sm font-black text-slate-800">{order.deliveryAddress?.fullName}</p>
                              <p className="text-xs font-medium text-slate-500 leading-relaxed mt-0.5">
                                {order.deliveryAddress?.addressLine}
                                {order.deliveryAddress?.landmark && `, near ${order.deliveryAddress.landmark}`}
                              </p>
                              <p className="text-xs font-bold text-slate-400 mt-0.5">
                                📞 {order.deliveryAddress?.phone} · PIN {order.deliveryAddress?.pincode}
                              </p>
                            </div>
                          </div>

                          {/* Payment */}
                          <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Payment</p>
                              <span className="text-sm font-black text-slate-900 uppercase">{order.paymentMethod}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Amount</p>
                              <span className="text-sm font-black text-slate-900">₹{order.totalAmount}</span>
                            </div>
                            {order.agentEarnings > 0 && (
                              <div className="text-right">
                                <p className="text-[10px] font-black text-emerald-500 uppercase leading-none mb-1">Your Earnings</p>
                                <span className="text-sm font-black text-emerald-600">+₹{order.agentEarnings}</span>
                              </div>
                            )}
                          </div>

                          {/* Mark delivered button */}
                          <button
                            onClick={() => handleMarkDelivered(order.id)}
                            disabled={processingId === order.id}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all group active:scale-95"
                          >
                            {processingId === order.id ? (
                              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Confirming...</>
                            ) : (
                              <>
                                <CheckCircle2 size={18} className="group-hover:text-emerald-400 transition-colors" />
                                Mark as Delivered
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))
              )}
            </motion.div>
          )}

          {/* ── Metrics Tab ────────────────────────────────── */}
          {activeTab === 'metrics' && (
            <motion.div key="metrics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Total Deliveries', value: metrics?.totalDeliveries || 0, icon: Package, color: 'blue' },
                  { label: 'This Month', value: metrics?.currentMonthStats?.orders || 0, icon: CheckCircle2, color: 'green' },
                  { label: 'Incentives Earned', value: `₹${metrics?.currentMonthStats?.incentives || 0}`, icon: Award, color: 'yellow' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className={`bg-${color}-50 p-4 rounded-2xl text-${color}-500`}><Icon size={24} /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
                      <h3 className="text-2xl font-black text-slate-900">{value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Monthly Incentive Progress</h3>
                    <p className="text-sm font-medium text-slate-500">Complete {metrics?.currentMonthStats?.threshold || 0} deliveries to unlock your bonus</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[var(--secondary)]">{(metrics?.currentMonthStats?.orders % metrics?.currentMonthStats?.threshold) || 0}</span>
                    <span className="text-slate-400 font-bold"> / {metrics?.currentMonthStats?.threshold}</span>
                  </div>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((metrics?.currentMonthStats?.orders % (metrics?.currentMonthStats?.threshold || 1)) / (metrics?.currentMonthStats?.threshold || 1)) * 100}%` }}
                    className="h-full bg-[var(--secondary)] rounded-full"
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><History size={20} className="text-slate-400" /> Recent Deliveries</h3>
                <div className="space-y-4">
                  {metrics?.dayWise?.slice(0, 7).map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 w-12 h-12 rounded-xl flex items-center justify-center text-slate-500"><Calendar size={20} /></div>
                        <div>
                          <h4 className="font-black text-slate-800">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</h4>
                          <p className="text-xs font-bold text-slate-400 uppercase">{day.count} Deliveries</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">₹{day.totalEarnings}</p>
                        <TrendingUp size={14} className="text-[var(--secondary)] ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Payments Tab ───────────────────────────────── */}
          {activeTab === 'payments' && (
            <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-200 mb-8 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-bold opacity-60 uppercase mb-2">Virtual Earnings Balance</p>
                  <h2 className="text-5xl font-black mb-6">₹{metrics?.monthly?.[0]?.totalEarnings || 0}</h2>
                  <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
                      <p className="text-[10px] font-black uppercase opacity-60">Base Pay</p>
                      <p className="text-sm font-black">₹{(metrics?.monthly?.[0]?.totalEarnings || 0) - (metrics?.currentMonthStats?.incentives || 0)}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
                      <p className="text-[10px] font-black uppercase opacity-60">Incentives</p>
                      <p className="text-sm font-black">₹{metrics?.currentMonthStats?.incentives || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet size={120} /></div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50"><h3 className="font-black text-slate-900">Monthly Earnings Summary</h3></div>
                <div className="divide-y divide-slate-50">
                  {metrics?.monthly?.map((month, idx) => (
                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <h4 className="font-black text-slate-800">{new Date(month.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase">{month.count} Deliveries</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900">₹{month.totalEarnings}</p>
                          <span className="text-[10px] font-black text-emerald-500 uppercase">Paid Out</span>
                        </div>
                        <ChevronRight size={20} className="text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
