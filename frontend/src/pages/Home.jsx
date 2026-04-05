import React, { useState, useEffect } from 'react';
import { CATEGORIES, PRODUCTS, PROMOS, HERO_BANNERS, STORES } from '../services/mockData';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Star, ExternalLink, Smartphone } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const slideRightItem = {
  hidden: { opacity: 0, x: 50 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const scaleUpItem = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
};

const headerVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const Home = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Auto scroll for hero banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Handle Hash Navigation
  useEffect(() => {
    if (window.location.hash === '#stores') {
      const el = document.getElementById('stores');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  // Text Reveal Logic for CTA
  const textRevealTitle = "Get the app for a smoother experience.";
  const titleLetters = textRevealTitle.split("");
  const titleVariant = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } }
  };
  const letterVariant = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="pb-0 bg-slate-50 overflow-hidden">
      {/* 1. BIG HERO SLIDER (Slide-in X-axis + Parallax) */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mt-4 mb-10 relative">
        <div className="relative w-full h-[250px] md:h-[350px] lg:h-[450px] rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
          <AnimatePresence initial={false}>
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
              className="absolute inset-0 w-full h-full flex items-center px-8 md:px-16"
              style={{ background: HERO_BANNERS[currentSlide].bg }}
            >
              <div className="relative z-20 max-w-lg">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-tight mb-4 drop-shadow-md"
                  >
                    {HERO_BANNERS[currentSlide].title}
                  </motion.h2>
                  <motion.button 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-white text-black px-6 py-3 rounded-md font-bold text-sm shadow-md hover:scale-105 transition"
                  >
                    Explore Now
                  </motion.button>
              </div>
              
              {/* Parallax Background Image */}
              <motion.img 
                initial={{ scale: 1.2, x: 50 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ duration: 6, ease: "easeOut" }}
                src={HERO_BANNERS[currentSlide].image} 
                alt={HERO_BANNERS[currentSlide].title} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" 
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Slider Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
             {HERO_BANNERS.map((_, i) => (
               <button 
                 key={i} 
                 onClick={() => setCurrentSlide(i)}
                 className={`h-2.5 rounded-full transition-all ${i === currentSlide ? 'w-10 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/70'}`} 
               />
             ))}
          </div>
        </div>
      </section>

      {/* 2. Categories Section (circular format) */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mb-12 mt-6">
        <div className="flex items-center justify-between mb-6">
           <motion.h2 
             initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={headerVariant}
             className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2"
           >
              Shop by Category
           </motion.h2>
        </div>
        
        {/* Staggered entrance for categories */}
        <motion.div 
          variants={shouldReduceMotion ? {} : staggerContainer} 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-50px" }}
          className="flex gap-4 md:gap-8 overflow-x-auto py-6 px-4 -mx-4 scrollbar-hide"
        >
           {CATEGORIES.map((cat) => (
             <Link to={`/category/${cat.id}`} key={cat.id}>
               <motion.div 
                 variants={scaleUpItem}
                 whileHover={shouldReduceMotion ? {} : { scale: 1.05 }} 
                 className="flex flex-col items-center gap-3 cursor-pointer group flex-shrink-0 w-[90px] md:w-[110px]"
               >
                  <div 
                     className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] group-hover:shadow-[0_12px_25px_rgba(0,0,0,0.12)] group-hover:border-[var(--secondary)] transition-all duration-300 relative"
                     style={{ backgroundColor: cat.color }}
                  >
                    <img src={cat.image} className="w-[65%] h-[65%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" alt={cat.name} />
                  </div>
                  <span className="text-[13px] md:text-[15px] font-extrabold text-center leading-tight text-slate-800 px-1">{cat.name}</span>
               </motion.div>
             </Link>
           ))}
        </motion.div>
      </section>

      {/* 3. Trending Items (Popular Products) */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-8">
           <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={headerVariant}>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Popular Products</h2>
              <p className="text-slate-500 text-sm md:text-base font-semibold mt-1">Bestsellers across your city</p>
           </motion.div>
        </div>
        
        {/* Staggered fade up for product cards */}
        <motion.div 
           variants={shouldReduceMotion ? {} : staggerContainer} 
           initial="hidden" 
           whileInView="show" 
           viewport={{ once: true, margin: "-100px" }}
           className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-3 gap-y-6"
        >
           {PRODUCTS.map((product) => (
             <motion.div key={`trending-${product.id}`} variants={fadeUpItem}>
               <ProductCard product={product} />
             </motion.div>
           ))}
        </motion.div>
      </section>

      {/* 4. Small Promos Section */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mb-12">
        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide snap-x">
          {PROMOS.map((promo) => (
            <motion.div 
              key={promo.id} 
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUpItem}
              className="min-w-[280px] md:min-w-[340px] h-[160px] md:h-[180px] rounded-xl p-5 relative overflow-hidden shadow-sm snap-center flex-shrink-0 cursor-pointer hover:shadow-md transition border border-gray-100"
              style={{ background: promo.bg }}
            >
              <div className="relative z-10 max-w-[65%]">
                 <h3 className="text-xl font-black text-white leading-tight mb-1.5 drop-shadow-sm">{promo.title}</h3>
                 <p className="text-[11px] font-bold text-white/90 bg-black/20 w-max px-2 py-0.5 rounded uppercase tracking-wide">{promo.subtitle}</p>
              </div>
              
              {/* Subtle Floating/Bobbing animation on promo image */}
              <motion.img 
                animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                src={promo.image} 
                alt={promo.title} 
                className="absolute -bottom-2 -right-4 w-32 h-32 object-cover rounded-full shadow-lg opacity-90 border-4 border-white/20" 
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Latest Products */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-8">
           <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={headerVariant} className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Latest Additions
           </motion.h2>
        </div>
        <motion.div 
          variants={shouldReduceMotion ? {} : staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-3 gap-y-6"
        >
           {[...PRODUCTS].reverse().map((product) => (
             <motion.div key={`latest-${product.id}`} variants={fadeUpItem}>
               <ProductCard product={product} />
             </motion.div>
           ))}
        </motion.div>
      </section>
      
      {/* 6. Featured Products */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mb-20">
        <div className="flex items-center justify-between mb-8">
           <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={headerVariant} className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Featured Selections
           </motion.h2>
        </div>
        <motion.div 
          variants={shouldReduceMotion ? {} : staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-3 gap-y-6"
        >
           {PRODUCTS.slice(0, 4).map((product) => (
             <motion.div key={`featured-${product.id}`} variants={fadeUpItem}>
               <ProductCard product={product} />
             </motion.div>
           ))}
        </motion.div>
      </section>

      {/* 7. LIMITED TIME SALE SECTION (Physical Supermarket Shelf UI) */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mb-16">
         <div className="bg-[#1a1a1a] rounded-[24px] shadow-2xl relative overflow-hidden border-[6px] border-[#2c2c2c]">
            
            {/* Massive Glowing Store Header */}
            <div className="bg-gradient-to-b from-[#2a2a2a] to-[#111] border-b-[8px] border-[#0a0a0a] p-6 md:p-10 flex flex-col items-center justify-center relative shadow-2xl z-20">
               
               {/* 3D Vanishing Sign Animation */}
               <motion.div 
                 animate={shouldReduceMotion ? {} : { rotateX: [0, -90, -90, 0, 0], opacity: [1, 0, 0, 1, 1] }} 
                 transition={{ repeat: Infinity, duration: 4, times: [0, 0.2, 0.4, 0.6, 1], ease: 'easeInOut' }}
                 style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                 className="flex flex-col items-center origin-bottom"
               >
                  <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] tracking-tighter uppercase text-center flex items-center gap-4">
                     {/* Flickering Neon Glow Dots */}
                     <motion.span 
                       animate={shouldReduceMotion ? {} : { opacity: [1, 0.3, 1, 0.8, 1, 0.4, 1] }}
                       transition={{ repeat: Infinity, duration: 1.5 }}
                       className="text-red-500 drop-shadow-[0_0_12px_rgba(255,0,0,1)]"
                     >
                       ●
                     </motion.span>
                     Flash Store
                     <motion.span 
                       animate={shouldReduceMotion ? {} : { opacity: [1, 0.3, 1, 0.8, 1, 0.4, 1] }}
                       transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                       className="text-red-500 drop-shadow-[0_0_12px_rgba(255,0,0,1)]"
                     >
                       ●
                     </motion.span>
                  </h2>
                  <p className="text-[#FFD700] font-black mt-2 tracking-[0.2em] text-sm md:text-lg drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">DEALS EXPIRING SOON</p>
               </motion.div>
               
               <div className="absolute bottom-[-16px] w-[80%] h-4 bg-[#FF4500] blur-xl opacity-50 pointer-events-none"></div>
            </div>

            {/* The Shelf Display Area */}
            <div className="p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] bg-[#111]/90">
               
               {/* Shelf Rack 1 */}
               <div className="relative pb-4 mb-4">
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-0 items-end px-2">
                    {PRODUCTS.slice(0, 6).map((product) => (
                      <motion.div 
                        key={`sale-${product.id}`} 
                        whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.04, boxShadow: '0px 15px 30px rgba(255, 69, 0, 0.4)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="origin-bottom relative z-10 z-[1] hover:z-[50] rounded-2xl bg-white"
                      >
                         <ProductCard product={product} />
                      </motion.div>
                    ))}
                 </div>
                 {/* Physical Shelf Edge */}
                 <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-b from-[#3a3a3a] to-[#1a1a1a] rounded-sm border-t border-[#555] shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-20 flex justify-between px-10 items-center">
                    <div className="flex gap-2">
                      <div className="w-16 h-1.5 bg-[#FF4500] shadow-[0_0_8px_#FF4500] rounded-full"></div>
                      <div className="w-16 h-1.5 bg-[#FF4500] shadow-[0_0_8px_#FF4500] rounded-full hidden md:block"></div>
                    </div>
                    <div className="text-[9px] font-black font-mono text-[#777] tracking-widest hidden md:block">AISLE 01</div>
                 </div>
               </div>

            </div>
         </div>
      </section>

      {/* 8. Stores */}
      <section id="stores" className="max-w-[1400px] mx-auto px-4 lg:px-8 mb-24 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
           <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={headerVariant}>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Specialty Stores</h2>
              <p className="text-slate-500 text-sm font-semibold mt-1">Explore our dedicated aisles and vendors</p>
           </motion.div>
        </div>
        
        {/* Slide Right Staggered Entrance */}
        <motion.div 
          variants={shouldReduceMotion ? {} : staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
          className="flex gap-6 overflow-x-auto py-4 scrollbar-hide snap-x"
        >
           {STORES.map((store) => (
             <motion.div key={store.id} variants={slideRightItem}>
               <Link 
                 to={`/store/${store.id}`} 
                 className="min-w-[300px] md:min-w-[360px] bg-white border border-gray-200 rounded-3xl flex flex-col hover:border-[var(--secondary)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 snap-start overflow-hidden group cursor-pointer block"
               >
                  <div className="h-40 w-full relative overflow-hidden bg-gray-100">
                     <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                     <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded border border-white/20">
                        <Star size={12} fill="currentColor" className="text-yellow-400" /> {store.rating}
                     </div>
                  </div>
                  <div className="p-5 flex flex-col bg-white">
                     <h3 className="font-extrabold text-[18px] text-[#1f1f1f] mb-1 flex items-center gap-1.5 group-hover:text-[var(--secondary)] transition-colors">
                       {store.name} <ExternalLink size={14} className="text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"/>
                     </h3>
                     <p className="text-gray-500 text-sm font-medium mb-3">{store.subtitle}</p>
                     <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-100 w-max px-3 py-1.5 rounded-lg shadow-sm">
                       {store.items}+ Options Available
                     </div>
                  </div>
               </Link>
             </motion.div>
           ))}
        </motion.div>
      </section>

      {/* 9. Call to Action */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mb-24">
         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[32px] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 border border-blue-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="max-w-xl relative z-10">
               {/* Text Reveal Animation */}
               <motion.h2 
                 variants={shouldReduceMotion ? {} : titleVariant}
                 initial="hidden"
                 whileInView="show"
                 viewport={{ once: true }}
                 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-5 tracking-tighter"
               >
                  {titleLetters.map((char, index) => (
                    <motion.span key={index} variants={letterVariant}>
                      {char}
                    </motion.span>
                  ))}
               </motion.h2>
               
               <p className="text-slate-600 font-semibold mb-10 text-lg">Order thousands of items with a few taps. Download the app and grab your groceries instantly.</p>
               <div className="flex flex-wrap gap-4">
                  <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-slate-800 transition shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    <Smartphone size={24} /> Download for iOS
                  </button>
                  <button className="bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:border-[var(--secondary)] hover:text-[var(--secondary)] transition hover:-translate-y-1">
                    <Smartphone size={24} /> Download for Android
                  </button>
               </div>
            </div>
            
            {/* Phone Mockup Floating Loop */}
            <motion.div 
               animate={shouldReduceMotion ? {} : { y: [0, -15, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
               className="hidden md:block w-56 h-64 bg-white/50 backdrop-blur border border-white rounded-[32px] shadow-2xl relative overflow-hidden z-10 p-4"
            >
               {/* Decorative App Mockup Block */}
               <div className="w-full h-full bg-white rounded-2xl shadow-inner border border-slate-100 flex flex-col pt-6 items-center">
                  <div className="w-20 h-4 bg-slate-100 rounded-full mb-6"></div>
                  <div className="w-4/5 h-24 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-dark)] rounded-2xl mt-4 shadow-lg"></div>
                  <div className="flex gap-2 mt-4 w-4/5">
                     <div className="w-1/2 h-16 bg-slate-50 rounded-xl border border-slate-100"></div>
                     <div className="w-1/2 h-16 bg-slate-50 rounded-xl border border-slate-100"></div>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
         <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
               <div>
                  <h4 className="font-black text-[#1f1f1f] mb-4">Categories</h4>
                  <ul className="space-y-2 text-sm text-gray-600 font-medium">
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Dairy, Bread & Eggs</a></li>
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Munchies</a></li>
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Cold Drinks</a></li>
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Meat</a></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-black text-[#1f1f1f] mb-4">Company</h4>
                  <ul className="space-y-2 text-sm text-gray-600 font-medium">
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">About Us</a></li>
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Careers</a></li>
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Blog</a></li>
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Press</a></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-black text-[#1f1f1f] mb-4">Partner</h4>
                  <ul className="space-y-2 text-sm text-gray-600 font-medium">
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Partner with us</a></li>
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Seller Portal (B2B)</a></li>
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Delivery Partners</a></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-black text-[#1f1f1f] mb-4">Support</h4>
                  <ul className="space-y-2 text-sm text-gray-600 font-medium">
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Help Center</a></li>
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Terms of Service</a></li>
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Privacy Policy</a></li>
                     <li><a href="#" className="hover:text-[var(--blinkit-green)]">Contact Us</a></li>
                  </ul>
               </div>
            </div>
            <div className="border-t border-gray-100 flex flex-col md:flex-row items-center justify-between pt-6 text-sm text-gray-400 font-medium font-sans">
               <p>© 2026 Unified E-Commerce. All rights reserved.</p>
               <div className="flex gap-4 mt-4 md:mt-0">
                  <span>Facebook</span>
                  <span>Twitter</span>
                  <span>Instagram</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Home;
