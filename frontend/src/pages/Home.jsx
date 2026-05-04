import React, { useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchStores, fetchCategories, fetchHomeSections, fetchSettings } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import {
  ChevronRight, ChevronLeft, Star, TrendingUp, Package, Truck, ShieldCheck,
  Leaf, Clock, Award, Zap, Image as ImageIcon, Rocket, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// ── Section Row ────────────────────────────────────────────────────────────
const SectionRow = ({ title, subtitle, icon: Icon, products, allProducts = [], accentColor = 'text-[var(--secondary)]' }) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10 md:mb-14">
      <div className="section-header px-1 mb-3 md:mb-5">
        <div>
          <span className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 block ${accentColor}`}>{subtitle}</span>
          <h2 className="text-2xl md:text-3xl font-[900] text-slate-900 heading-tight flex items-center gap-2">
            {Icon && <Icon size={22} className={accentColor} />}
            {title}
          </h2>
        </div>
      </div>
      <div className="scroll-row">
        {products.filter(p => p && p.id).map((product) => (
          <div key={product.id} className="w-[160px] md:w-auto">
            <ProductCard product={product} allProducts={allProducts} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Full-Width Hero Carousel ────────────────────────────────────────────────
const HeroCarousel = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % images.length);
  }, [images.length]);

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, images.length]);

  // Placeholder when no images are uploaded
  if (!images || images.length === 0) {
    return (
      <section className="w-full mt-6 mb-6 md:mb-10">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div
            className="w-full bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center rounded-[32px] overflow-hidden"
            style={{ height: 'clamp(250px, 35vw, 500px)' }}
          >
            <div className="flex flex-col items-center gap-3 text-slate-300 text-center px-6">
              <div className="w-20 h-20 rounded-3xl bg-slate-200 flex items-center justify-center">
                <ImageIcon size={36} className="text-slate-300" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest">Hero Carousel</p>
              <p className="text-xs font-medium">Upload images from Admin Panel → Global Settings → Hero Carousel</p>
            </div>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section className="w-full mt-6 mb-6 md:mb-10 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
        <div className="relative w-full rounded-[32px] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm" style={{ height: 'clamp(240px, 35vw, 480px)' }}>
          {/* Slides */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img
                src={images[current].url}
                alt={`Hero banner ${current + 1}`}
                className="w-full h-full object-fill"
              />
            </motion.div>
          </AnimatePresence>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-slate-800' : 'w-2 h-2 bg-slate-800/20'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ── Promo Cards below Flash Sale (admin-managed) ───────────────────────────
const PromoCardsRow = ({ cards }) => {
  // Always show 4 card slots
  const slots = [...(cards || [])];
  while (slots.length < 4) slots.push(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-0">
      {slots.slice(0, 4).map((card, idx) => (
        card ? (
          <div key={card.id || idx} className="w-full rounded-2xl overflow-hidden shadow-sm bg-white border border-slate-100 p-1" style={{ aspectRatio: '3/2' }}>
            <img src={card.url} alt={`Promo ${idx + 1}`} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div
            key={`placeholder-${idx}`}
            className="w-full rounded-2xl bg-slate-800/60 border border-white/10 border-dashed flex flex-col items-center justify-center text-white/30 gap-2"
            style={{ aspectRatio: '3/2' }}
          >
            <ImageIcon size={20} />
            <p className="text-[9px] font-black uppercase tracking-widest">Card {idx + 1}</p>
          </div>
        )
      ))}
    </div>
  );
};

// ── Flash Sale Timer ────────────────────────────────────────────────────────
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
            <span className="text-2xl md:text-3xl font-[900] text-white leading-none">{val}</span>
            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mt-0.5">{['HRS', 'MIN', 'SEC'][i]}</p>
          </div>
          {i < 2 && <span className="text-2xl font-black text-white/40">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Delivery / Trust Section ────────────────────────────────────────────────
const DeliverySection = ({ deliveryImage }) => {
  const trustPoints = [
    { icon: Truck, title: 'Lightning Fast Delivery', desc: 'Fresh groceries delivered in under 10 minutes, straight from our farm partners to your doorstep.', color: 'text-[var(--secondary)]', bg: 'bg-emerald-50' },
    { icon: Leaf, title: '100% Farm Fresh', desc: 'Sourced directly from certified farmers. No middlemen, no cold storage. Freshness guaranteed.', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: ShieldCheck, title: 'Quality Assured', desc: 'Every product passes our strict quality check before it reaches you. We stand by what we sell.', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Award, title: 'Best Price Promise', desc: 'We match or beat market prices. Smart savings on your daily essentials, every single day.', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10 md:mb-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left — Text & Trust Points */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--secondary)] mb-2 block">Why QwikBasket</span>
          <h2 className="text-2xl md:text-4xl font-[900] text-slate-900 heading-tight mb-6 leading-tight">
            Delivering Quality &<br />
            <span className="text-[var(--secondary)]">Building Trust</span>
          </h2>
          <p className="text-slate-500 font-medium text-sm md:text-base mb-8 leading-relaxed max-w-md">
            We're not just a grocery app — we're a promise of quality, speed, and value. Every delivery reflects our commitment to you and the farmers who grow your food.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trustPoints.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${point.bg}`}>
                  <point.icon size={18} className={point.color} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm leading-tight mb-1">{point.title}</h4>
                  <p className="text-slate-500 text-[11px] font-medium leading-snug">{point.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right — Admin-uploaded image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {deliveryImage ? (
            <div className="w-full rounded-[32px] overflow-hidden shadow-xl bg-white border border-slate-100 p-2" style={{ height: 'clamp(280px, 40vw, 480px)' }}>
              <img src={deliveryImage} alt="Delivery quality" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div
              className="w-full rounded-[24px] bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center"
              style={{ height: 'clamp(280px, 40vw, 480px)' }}
            >
              <div className="flex flex-col items-center gap-4 text-slate-400 px-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-200 flex items-center justify-center">
                  <Truck size={32} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest mb-1">Delivery Section Image</p>
                  <p className="text-xs font-medium">Upload from Admin Panel → Global Settings</p>
                </div>
              </div>
            </div>
          )}
          <div className="absolute -bottom-4 -left-4 bg-[var(--secondary)] text-white rounded-2xl px-4 py-3 shadow-xl">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Avg Delivery</p>
                <p className="text-lg font-[900] leading-none">8 Mins</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 bg-white text-slate-900 rounded-2xl px-4 py-3 shadow-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-500 fill-amber-500" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rated</p>
                <p className="text-lg font-[900] leading-none">4.9/5</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ── Main Home ───────────────────────────────────────────────────────────────
const Home = () => {
  const { user } = useAuth();
  const isB2B = user?.role === 'b2b';
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [homeSections, setHomeSections] = useState({ latest: [], trending: [], mostPurchased: [] });
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      try {
        const [psRaw, ss, cs, sections, settingsData] = await Promise.all([
          fetchProducts(), fetchStores(), fetchCategories(), fetchHomeSections(), fetchSettings()
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
        setSiteSettings(settingsData);
      } catch (err) {
        console.error('Home loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, [user?.role]);

  useEffect(() => {
    if (window.location.hash === '#stores') {
      const el = document.getElementById('stores');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const flashProducts = products.filter(p => p && p.isFlashSale);

  // Parse hero images JSON from settings
  let heroImages = [];
  try { heroImages = siteSettings?.heroImages ? JSON.parse(siteSettings.heroImages) : []; } catch { heroImages = []; }

  // Parse promo cards JSON from settings
  let promoCards = [];
  try { promoCards = siteSettings?.homePromoCards ? JSON.parse(siteSettings.homePromoCards) : []; } catch { promoCards = []; }

  const deliveryImage = siteSettings?.deliverySectionImage || '';

  return (
    <div className="bg-white overflow-hidden pb-6">

      {/* ── Full-Width Hero Carousel ────────────────────── */}
      <HeroCarousel images={heroImages} />

      {/* ── Same Day Delivery Banner ─────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-8 md:mb-10">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-lg shadow-emerald-200/40">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10 flex items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5">
            <div className="flex items-center gap-3 md:gap-5">
              <div className="flex-shrink-0 w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Truck size={22} className="text-white md:hidden" />
                <Truck size={28} className="text-white hidden md:block" />
              </div>
              <div>
                <h3 className="text-white font-black text-sm md:text-lg lg:text-xl leading-tight tracking-tight">Same Day Delivery</h3>
                <p className="text-white/70 text-[10px] md:text-xs font-bold mt-0.5">Order now & get it delivered today — fresh & fast!</p>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-3 border border-white/10">
              <Timer size={16} className="text-white md:hidden" />
              <Timer size={20} className="text-white hidden md:block" />
              <div>
                <p className="text-[8px] md:text-[9px] font-black text-white/60 uppercase tracking-widest">Today</p>
                <p className="text-white font-black text-xs md:text-sm leading-none">Free Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────── */}
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
                  group-hover:bg-white group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
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

      {/* ── Trending ─────────────────────────────────────── */}
      <SectionRow title="Trending" subtitle="Hot Right Now" icon={TrendingUp} products={homeSections.trending} allProducts={products} accentColor="text-orange-500" />

      {/* ── Flash Sale (moved below Trending) ────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-6 md:mb-10">
        <div className="relative rounded-[28px] md:rounded-[40px] overflow-hidden shadow-2xl"
          style={{ background: isB2B ? '#0f172a' : 'linear-gradient(135deg, #0f172a 0%, #1e0a3c 50%, #0f172a 100%)' }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-[var(--secondary)]/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[80px]" />
          </div>
          <div className="relative z-10 px-6 md:px-10 py-7 md:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.6)]" />
                <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.35em]">Live Deals</span>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-[900] text-white heading-tight flex items-center gap-3">
                <Zap size={30} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                {isB2B ? 'Bulk Deals' : 'Flash Store'}
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Ends In</span>
              <FlashTimer />
            </div>
          </div>
          <div className="relative z-10 p-5 md:p-10">
            {flashProducts.length > 0 ? (
              <div className="flash-scroll mb-8">
                {flashProducts.map(product => (
                  <div key={`sale-${product.id}`} className="w-[155px] md:w-auto">
                    <ProductCard product={product} allProducts={products} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-white/20 text-lg font-black uppercase tracking-[0.3em] mb-8">Restocking Pulse deals...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Latest ──────────────────────────────────────── */}
      <SectionRow title="Just Arrived" subtitle="New Products" icon={Package} products={homeSections.latest} allProducts={products} accentColor="text-indigo-500" />

      {/* Admin-managed promo image cards */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-10">
        <PromoCardsRow cards={promoCards} />
      </section>


      {/* ── Most Purchased ───────────────────────────────── */}
      <SectionRow title="Crowd Favorites" subtitle="Most Purchased" icon={Star} products={homeSections.mostPurchased} allProducts={products} accentColor="text-[var(--secondary)]" />

      {/* ── Specialty Stores ─────────────────────────────── */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {stores.map(store => (
              <Link to={`/store/${store.id}`} key={store.id} className="group block overflow-hidden rounded-[18px] shadow-sm hover:shadow-lg transition-all duration-300">
                {store.image ? (
                  <div className="w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="w-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                    <div className="text-center text-slate-300 px-4">
                      <Package size={24} className="mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Store Image</p>
                    </div>
                  </div>
                )}
                <div className="pt-2.5 pb-1 px-1">
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[var(--secondary)] transition-colors leading-tight">{store.name}</h3>
                  {store.subtitle && <p className="text-[10px] text-slate-400 font-bold mt-0.5">{store.subtitle}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Delivery / Trust Section (below stores) ────────── */}
      <DeliverySection deliveryImage={deliveryImage} />

    </div>
  );
};

export default Home;
