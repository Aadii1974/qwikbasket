import React, { useState, useEffect } from 'react';
import { fetchProducts, fetchStores, fetchCategories, fetchHomeSections, fetchBanners } from '../services/api';
import { PROMOS as MOCK_PROMOS, HERO_BANNERS as MOCK_HERO } from '../services/mockData';

import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Star, ExternalLink, Smartphone, BarChart3, Truck, ShieldCheck, Zap, TrendingUp, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// ── Section Row Component ──────────────────────────────────────────────────
const SectionRow = ({ title, subtitle, icon: Icon, products, accentColor = 'text-[var(--secondary)]', viewAllLink }) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10 md:mb-14">
      {/* Header */}
      <div className="section-header px-1 mb-3 md:mb-5">
        <div>
          <span className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 block ${accentColor}`}>{subtitle}</span>
          <h2 className="text-2xl md:text-3xl font-[900] text-slate-900 heading-tight flex items-center gap-2">
            {Icon && <Icon size={22} className={accentColor} />}
            {title}
          </h2>
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[var(--secondary)] transition-colors px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100">
            See All <ChevronRight size={13} strokeWidth={3} />
          </Link>
        )}
      </div>

      {/* Mobile: horizontal scroll / Desktop: grid */}
      <div className="scroll-row">
        {products.filter(p => p && p.id).map((product) => (
          <div key={product.id} className="w-[160px] md:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Flash Sale Timer ───────────────────────────────────────────────────────
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
            <span className="text-2xl md:text-3xl font-[900] text-white font-outfit leading-none">{val}</span>
            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mt-0.5">{['HRS','MIN','SEC'][i]}</p>
          </div>
          {i < 2 && <span className="text-2xl font-black text-white/40">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Main Home Component ────────────────────────────────────────────────────
const Home = () => {
  const { user } = useAuth();
  const isB2B = user?.role === 'b2b';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [homeSections, setHomeSections] = useState({ latest: [], trending: [], mostPurchased: [] });

  const [allBanners, setAllBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeHeroBanners = allBanners.length > 0 
    ? allBanners.filter(b => b.type === (isB2B ? 'B2B_HERO' : 'HERO'))
    : MOCK_HERO;
    
  const activePromos = allBanners.length > 0
    ? allBanners.filter(b => b.type === (isB2B ? 'B2B_PROMO' : 'PROMO'))
    : MOCK_PROMOS;


  // Auto-scroll hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeHeroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeHeroBanners.length]);

  // Fetch data
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      try {
        const [psRaw, ss, cs, sections, bannerData] = await Promise.all([
          fetchProducts(), fetchStores(), fetchCategories(), fetchHomeSections(), fetchBanners()
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
        setHomeSections(sections || { latest: [], trending: [], mostPurchased: [] });
        setAllBanners(bannerData || []);

      } catch (err) {
        console.error('Home loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, [user?.role]);

  // Hash navigation
  useEffect(() => {
    if (window.location.hash === '#stores') {
      const el = document.getElementById('stores');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const flashProducts = products.filter(p => p && p.isFlashSale);

  return (
    <div className="bg-white overflow-hidden pb-6">

      {/* ── Hero Banner ─────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-3 md:px-6 lg:px-10 pt-4 pb-10 md:pb-14">
        <div className="relative w-full rounded-[28px] md:rounded-[40px] overflow-hidden bg-slate-900 shadow-2xl"
          style={{ height: 'clamp(220px, 42vw, 500px)' }}>
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={`${isB2B ? 'b2b' : 'b2c'}-${currentSlide}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="absolute inset-0 w-full h-full flex items-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10" />
              <motion.img
                initial={{ scale: 1.08 }} animate={{ scale: 1 }}
                transition={{ duration: 9, ease: 'linear' }}
                src={activeHeroBanners[currentSlide].image}
                className="absolute inset-0 w-full h-full object-cover opacity-100"
                alt=""
              />
              <div className="relative z-20 px-6 md:px-12 lg:px-20 max-w-xl">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}>
                  <span className="text-[var(--primary)] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-3 block">
                    {isB2B ? 'Warehouse Direct' : 'Fresh & Fast'}
                  </span>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-[900] text-white heading-tight mb-5 drop-shadow-sm">
                    {activeHeroBanners[currentSlide].title}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="btn-premium bg-white text-slate-900 px-7 md:px-10 py-3 md:py-4 text-xs md:text-sm shadow-xl"
                  >
                    {activeHeroBanners[currentSlide].cta || (isB2B ? 'Explore Wholesale' : 'Shop Now')}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-30">
            {activeHeroBanners.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-10 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Bar ───────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10 md:mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: BarChart3, title: isB2B ? 'Industrial Pricing' : 'Smart Savings', desc: isB2B ? 'Tiered B2B volume structures' : 'Daily discounts on favorites' },
            { icon: Truck, title: isB2B ? 'Dedicated Fleet' : 'Hyperlocal Speed', desc: isB2B ? 'High-capacity logistics' : 'Delivered in under 10 mins' },
            { icon: ShieldCheck, title: 'Secure Checkouts', desc: 'Enterprise-grade protection on every order' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex-shrink-0">
                <item.icon size={20} className="text-[var(--secondary)]" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base leading-tight">{item.title}</h4>
                <p className="text-slate-500 text-xs font-medium mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ──────────────────────────────── */}
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
                  group-hover:bg-white group-hover:shadow-lg group-hover:border-[var(--border-light)] group-hover:scale-105 transition-all duration-300">
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

      {/* ── Trending ────────────────────────────────── */}
      <SectionRow
        title="Trending"
        subtitle="Hot Right Now"
        icon={TrendingUp}
        products={homeSections.trending}
        accentColor="text-orange-500"
      />

      {/* ── Latest ──────────────────────────────────── */}
      <SectionRow
        title="Just Arrived"
        subtitle="New Products"
        icon={Package}
        products={homeSections.latest}
        accentColor="text-indigo-500"
      />

      {/* ── Promos ──────────────────────────────────── */}
      {activePromos.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10 md:mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {activePromos.slice(0, 3).map(promo => (
              <div key={promo.id}
                className="group relative h-[200px] md:h-[230px] rounded-[24px] md:rounded-[28px] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-400"
                style={{ background: promo.bg }}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-400" />
                <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-end">
                  <span className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">{promo.subtitle}</span>
                  <h3 className="text-xl md:text-2xl font-[900] text-white leading-tight mb-3">{promo.title}</h3>
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition-transform">
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </div>
                </div>
                <motion.img
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  src={promo.image}
                  className="absolute top-4 -right-2 w-36 h-36 object-cover mix-blend-lighten opacity-80"
                  alt=""
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Flash Sale ──────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10 md:mb-14">
        <div className="relative rounded-[28px] md:rounded-[40px] overflow-hidden shadow-2xl"
          style={{ background: isB2B ? '#0f172a' : 'linear-gradient(135deg, #0f172a 0%, #1e0a3c 50%, #0f172a 100%)' }}>

          {/* Decorative glow blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-[var(--secondary)]/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[80px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-red-600/10 rounded-full blur-[60px]" />
          </div>

          {/* Header */}
          <div className="relative z-10 px-6 md:px-10 py-7 md:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.6)]" />
                <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.35em]">Live Liquidation</span>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-[900] text-white heading-tight flex items-center gap-3">
                <Zap size={30} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                {isB2B ? 'Industrial Warehouse' : 'Flash Store'}
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Ends In</span>
              <FlashTimer />
              <p className="text-white/30 text-[10px] font-bold mt-1">Limited inventory — shop fast!</p>
            </div>
          </div>

          {/* Products — horizontal scroll on mobile, grid on desktop */}
          <div className="relative z-10 p-5 md:p-10">
            {flashProducts.length > 0 ? (
              <div className="flash-scroll">
                {flashProducts.map(product => (
                  <div key={`sale-${product.id}`} className="w-[155px] md:w-auto">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-white/15 text-lg font-black uppercase tracking-[0.3em]">Restocking Pulse deals...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Most Purchased (below Flash Sale) ───────── */}
      <SectionRow
        title="Crowd Favorites"
        subtitle="Most Purchased"
        icon={Star}
        products={homeSections.mostPurchased}
        accentColor="text-[var(--secondary)]"
      />

      {/* ── Specialty Stores ────────────────────────── */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {stores.map(store => (
              <Link to={`/store/${store.id}`} key={store.id} className="card-premium group overflow-hidden">
                <div className="h-44 w-full relative overflow-hidden rounded-t-[18px]">
                  <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/20 backdrop-blur text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/20">
                    <Star size={10} fill="currentColor" className="text-yellow-400" /> {store.rating}
                  </div>
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-[var(--secondary)] transition-colors mb-1 flex items-center justify-between">
                    {store.name} <ExternalLink size={16} className="text-slate-300 group-hover:text-[var(--secondary)] transition-all flex-shrink-0" />
                  </h3>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-4">{store.subtitle}</p>
                  <div className="flex items-center gap-3 border-t border-slate-50 pt-4">
                    <span className="text-[10px] font-black text-slate-700 px-3 py-1.5 bg-slate-50 rounded-lg">{store.items}+ Active SKU</span>
                    <span className="text-[10px] font-black text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-lg">Express Delivery</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── App Download CTA ────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10">
        <div className={`rounded-[28px] md:rounded-[40px] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden
          ${isB2B ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 to-white border border-slate-100'}`}>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--secondary)]/8 to-transparent pointer-events-none" />

          <div className="max-w-md relative z-10 text-center md:text-left">
            <h2 className={`text-3xl md:text-5xl font-[900] leading-[1.1] tracking-tighter mb-5 heading-tight ${isB2B ? 'text-white' : 'text-slate-900'}`}>
              {isB2B ? 'Logistics Simplified.' : 'Groceries on Demand.'}
              <br />
              <span className={`font-[400] italic ${isB2B ? 'text-white/40' : 'text-slate-400'}`}>Available everywhere.</span>
            </h2>
            <p className={`text-base md:text-lg font-medium mb-8 ${isB2B ? 'text-white/60' : 'text-slate-500'}`}>
              Join {isB2B ? 'thousands of businesses' : 'millions of shoppers'} using our app for the fastest experience.
            </p>
            <button onClick={() => window.dispatchEvent(new Event('trigger-pwa-install'))}
              className="btn-premium bg-[var(--secondary)] text-white px-8 py-4 shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
              <Smartphone size={18} /> Install App
            </button>
          </div>

          {/* Mock phone */}
          <div className="relative hidden md:block">
            <div className="absolute -inset-12 bg-[var(--secondary)]/10 rounded-full blur-[80px] opacity-60" />
            <motion.div animate={{ y: [0, -16, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-52 h-[400px] bg-white rounded-[38px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35)] border-[7px] border-slate-900 relative overflow-hidden flex flex-col">
              <div className="w-2/5 h-5 bg-slate-900 mx-auto rounded-b-xl mb-3" />
              <div className="flex-1 p-3.5 flex flex-col gap-3">
                <div className="w-full h-28 bg-slate-50 rounded-2xl border border-slate-100" />
                <div className="w-full h-3 bg-slate-100 rounded-full" />
                <div className="w-3/4 h-3 bg-slate-100 rounded-full" />
                <div className="grid grid-cols-2 gap-2.5 mt-1">
                  <div className="h-14 bg-slate-50 rounded-xl border border-slate-100" />
                  <div className="h-14 bg-slate-50 rounded-xl border border-slate-100" />
                </div>
                <div className="w-full h-10 bg-[var(--secondary)] rounded-xl mt-auto" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
