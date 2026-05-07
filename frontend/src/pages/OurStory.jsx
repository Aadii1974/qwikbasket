import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  ShieldCheck, 
  Heart, 
  Award, 
  Users, 
  Clock, 
  Sprout, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Globe, 
  MapPin, 
  Quote, 
  ArrowRight, 
  HeartHandshake,
  TrendingUp,
  Award as RibbonIcon,
  Smile,
  ShieldAlert
} from 'lucide-react';
import useSEO from '../hooks/useSEO';

const OurStory = () => {
  const navigate = useNavigate();
  
  useSEO({
    title: 'Our Story – QwikBasket by Real Farms',
    description: 'Discover how QwikBasket bridges the gap between organic farmers and urban families. Fresh, farm-sourced groceries delivered with purpose, speed, and passion.',
    canonical: '/our-story',
    keywords: ['about QwikBasket', 'Real Farms story', 'farm to door', 'organic grocery India', 'sustainable farming', 'fair trade agriculture'],
  });

  // Active Philosophy Tab State
  const [activeTab, setActiveTab] = useState('mission');

  // Grocery Spend Calculator State
  const [monthlySpend, setMonthlySpend] = useState(5000);

  // Impact Calculations
  const qwikBasketFarmerShare = Math.round(monthlySpend * 0.75);
  const standardRetailFarmerShare = Math.round(monthlySpend * 0.28);
  const extraFarmerEarnings = qwikBasketFarmerShare - standardRetailFarmerShare;
  const plasticBagsSaved = Math.round(monthlySpend * 0.015);
  const co2ReducedKg = (monthlySpend * 0.012).toFixed(1);

  // Philosophy Tab Contents
  const tabs = {
    mission: {
      title: "Our Sourcing Mission",
      subtitle: "Unlocking Prosperity, One Harvest at a Time",
      content: "We bypass the multi-tiered traditional wholesale distribution hubs ('mandis') where produce standardly sits for days. By establishing direct sorting hubs right in organic farm clusters, we ensure that fresh produce is delivered from the vine to your family within hours of harvesting, while returning 75% of the purchase value directly to the grower's hands.",
      accent: "from-emerald-500 to-teal-600",
      icon: Sprout,
      benefits: ["Direct Farmer-to-Door Route", "Guaranteed Fair-Trade Minimums", "Harvest-on-Demand Operations"]
    },
    vision: {
      title: "Our Green Vision",
      subtitle: "A Zero-Waste, Soil-First Agricultural Future",
      content: "Agriculture shouldn't cost the Earth. Our vision spans the next generation of soil microbiology and circular distribution. We envision a future where 100% of urban organic groceries are sourced from carbon-sequestering biodynamic farms and delivered in zero-plastic compostable packaging, eliminating food miles and pesticide runoff.",
      accent: "from-emerald-600 to-green-700",
      icon: Globe,
      benefits: ["Carbon-Negative Logistics", "Biodiversity Restoration", "Zero Synthetic Runoffs"]
    },
    promise: {
      title: "Our Quality Promise",
      subtitle: "Every Fruit. Every Leaf. Zero Compromise.",
      content: "To us, quality isn't a marketing slogan—it's a rigorous standard of soil biology, chemical testing, and strict cold-chain mechanics. Every single batch of produce is checked for natural sugar levels (Brix testing), undergoes residue-free certification, and is cooled immediately upon harvesting to preserve original vitamins and minerals.",
      accent: "from-amber-500 to-orange-600",
      icon: ShieldCheck,
      benefits: ["Residue-Free Pesticide Screening", "Brix Sugar and Nutrient Audits", "Thermal-Insulated Deliveries"]
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-emerald-500 selection:text-white pb-16">
      
      {/* ── BACKGROUND GLOW DECORATIONS ── */}
      <div className="absolute top-0 left-0 right-0 h-[80vh] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-300/10 blur-[120px]" />
        <div className="absolute top-[30%] -right-[10%] w-[45%] h-[45%] rounded-full bg-amber-400/10 blur-[140px]" />
        <div className="absolute top-[60%] left-[20%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden z-10 px-4 max-w-[1440px] mx-auto lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-emerald-100/60 backdrop-blur-md border border-emerald-500/20 px-4.5 py-1.5 rounded-full text-[11px] font-extrabold text-[var(--secondary)] uppercase tracking-[0.2em] shadow-sm"
            >
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              <span>Est. 2024 • Our Shared Journey</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-[900] text-slate-900 leading-[1.08] tracking-tight font-outfit"
            >
              Nurturing <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Nature</span>,<br />
              Nourishing <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Urban Lives</span>.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl"
            >
              QwikBasket was born from a simple, burning question: Why should organic food be a luxury for the city, while the farmers who nurture it receive pennies? We built a logistics highway connecting direct fields to your basket in minutes.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <button 
                onClick={() => navigate('/categories')} 
                className="bg-slate-900 text-white hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-100 transition duration-300 font-extrabold text-sm px-8 py-4 rounded-2xl flex items-center gap-2 group cursor-pointer"
              >
                <span>Browse Farm Fresh</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
              <a 
                href="#impact-calculator" 
                className="bg-white text-slate-800 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 font-extrabold text-sm px-8 py-4 rounded-2xl flex items-center gap-2 transition duration-300 shadow-sm"
              >
                <span>Calculate Your Impact</span>
                <TrendingUp size={16} className="text-emerald-500" />
              </a>
            </motion.div>
          </div>

          {/* Hero Right Image Montage */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative rounded-[40px] overflow-hidden shadow-[0_30px_70px_rgba(4,79,29,0.12)] border border-white bg-white/50 p-3"
            >
              <div className="rounded-[32px] overflow-hidden relative h-[450px]">
                <img 
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200" 
                  alt="Organic Field" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                
                {/* Floating Bottom Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-lg p-5 rounded-3xl border border-white/20 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-black text-sm uppercase tracking-wide">Direct from Soil</h4>
                    <p className="text-slate-600 text-xs font-semibold mt-0.5">100% Pesticide-Free & Organic Certified</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Decorative Mini Stats Bubble */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="absolute -top-6 -right-6 bg-amber-400 text-slate-900 p-5 rounded-3xl shadow-xl border border-amber-300 font-outfit hidden sm:block"
            >
              <div className="flex items-center gap-2">
                <Clock size={18} className="animate-spin text-slate-900" style={{ animationDuration: '4s' }} />
                <span className="font-black text-base">45 Min delivery</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── THE INTERACTIVE IMPACT CALCULATOR ── */}
      <section id="impact-calculator" className="py-16 bg-white border-y border-slate-100 relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 rounded-[40px] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden">
            
            {/* Ambient Background Patterns */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              
              {/* Calculator Left */}
              <div className="lg:col-span-5 space-y-6">
                <span className="inline-block bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-extrabold uppercase tracking-widest text-[10px] px-3.5 py-1 rounded-full">
                  Interactive Impact Simulator
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-outfit leading-tight">
                  See the Real Difference Your Groceries Make
                </h2>
                <p className="text-emerald-100/80 font-medium text-sm leading-relaxed">
                  By moving your monthly grocery spend to QwikBasket, you cut out exploitative wholesale intermediaries, guarantee fair compensation to organic farmers, eliminate petroleum plastic wrappers, and bypass heavy-emission transport vehicles.
                </p>

                {/* Input Slider */}
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between items-end font-outfit">
                    <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">Monthly Grocery Budget</span>
                    <span className="text-2xl font-black text-amber-300">₹{monthlySpend.toLocaleString('en-IN')}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="15000" 
                    step="500"
                    value={monthlySpend} 
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="w-full h-2.5 bg-emerald-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none" 
                  />
                  <div className="flex justify-between text-[10px] text-emerald-200/60 font-bold uppercase tracking-wider pt-1">
                    <span>₹1,000</span>
                    <span>₹5,000</span>
                    <span>₹10,000</span>
                    <span>₹15,000</span>
                  </div>
                </div>
              </div>

              {/* Calculator Right - Outcomes Grid */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card 1: Direct Sourcing Share Compare */}
                  <div className="bg-emerald-900/60 backdrop-blur border border-emerald-500/20 p-6.5 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                        <HeartHandshake size={20} />
                      </div>
                      <span className="text-[10px] text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full font-bold">FAIR-TRADE ETHICS</span>
                    </div>
                    <div>
                      <h4 className="text-emerald-200 text-[11px] font-black uppercase tracking-wider">Direct Sourcing Share</h4>
                      <p className="text-3xl font-black text-white mt-1">₹{qwikBasketFarmerShare.toLocaleString('en-IN')}</p>
                      <p className="text-emerald-100/60 text-[11px] font-medium mt-1">
                        Goes directly to farmers. Standard retail yields only <span className="text-amber-300 font-bold">₹{standardRetailFarmerShare.toLocaleString('en-IN')}</span> for the same basket.
                      </p>
                    </div>
                    <div className="border-t border-emerald-800/60 pt-3 flex items-center justify-between text-xs font-bold text-emerald-100">
                      <span>Extra Farmer Income:</span>
                      <span className="text-emerald-400">+₹{extraFarmerEarnings.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Card 2: Plastic Saved */}
                  <div className="bg-emerald-900/60 backdrop-blur border border-emerald-500/20 p-6.5 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                        <Leaf size={20} />
                      </div>
                      <span className="text-[10px] text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full font-bold">CIRCULAR ECO</span>
                    </div>
                    <div>
                      <h4 className="text-emerald-200 text-[11px] font-black uppercase tracking-wider">Plastic Waste Eliminated</h4>
                      <p className="text-3xl font-black text-white mt-1">{plasticBagsSaved} Bags</p>
                      <p className="text-emerald-100/60 text-[11px] font-medium mt-1">
                        Plastic bags & multi-layer poly wrappers replaced with cornstarch-based, home-compostable carriers and organic cotton bags.
                      </p>
                    </div>
                    <div className="border-t border-emerald-800/60 pt-3 text-xs font-bold text-emerald-100 flex items-center gap-1">
                      <span>100% Biodegradable Materials</span>
                    </div>
                  </div>

                  {/* Card 3: Carbon Offset */}
                  <div className="bg-emerald-900/60 backdrop-blur border border-emerald-500/20 p-6.5 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                        <Globe size={20} />
                      </div>
                      <span className="text-[10px] text-teal-300 bg-teal-400/10 border border-teal-400/20 px-2.5 py-0.5 rounded-full font-bold">CLEAN LOGISTICS</span>
                    </div>
                    <div>
                      <h4 className="text-emerald-200 text-[11px] font-black uppercase tracking-wider">Carbon Footprint Saved</h4>
                      <p className="text-3xl font-black text-white mt-1">{co2ReducedKg} kg CO₂</p>
                      <p className="text-emerald-100/60 text-[11px] font-medium mt-1">
                        Saved by optimizing delivery routes and using our localized electric-vehicle fleet instead of high-emission commercial trucks.
                      </p>
                    </div>
                    <div className="border-t border-emerald-800/60 pt-3 text-xs font-bold text-emerald-100">
                      <span>Carbon Neutral Delivery Route</span>
                    </div>
                  </div>

                  {/* Card 4: Community Impact Statement */}
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 p-6.5 rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider w-fit">
                        <Smile size={12} />
                        <span>Social Prosperity</span>
                      </div>
                      <h3 className="text-xl font-black font-outfit mt-4 leading-snug">
                        Your grocery order supports regenerative organic agriculture.
                      </h3>
                      <p className="text-slate-800/80 text-[11px] font-semibold mt-2">
                        By funding organic growers directly, you help conserve local groundwater and prevent pesticide soil contamination.
                      </p>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button 
                        onClick={() => navigate('/categories')} 
                        className="bg-slate-900 text-white hover:bg-slate-800 transition py-2.5 px-4.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Start Your Eco Basket</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── THE THREE PILLARS (INTERACTIVE TABS) ── */}
      <section className="py-20 px-4 max-w-[1440px] mx-auto lg:px-10 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[var(--secondary)] font-extrabold uppercase tracking-widest text-xs">Our Operational Philosophy</span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-outfit mt-2 tracking-tight">The Three Foundations</h2>
          <p className="text-slate-500 font-medium text-base mt-3">Click on any core pillar to understand our unique, transparent agrarian ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Tab Selection Column */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {Object.keys(tabs).map((tabKey) => {
              const tab = tabs[tabKey];
              const IconComp = tab.icon;
              const isActive = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`flex items-center gap-4 p-5 rounded-[24px] text-left transition-all duration-300 border cursor-pointer ${
                    isActive 
                      ? 'bg-white border-emerald-500/20 shadow-[0_15px_35px_rgba(4,79,29,0.06)] scale-[1.02]' 
                      : 'bg-transparent border-transparent hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? 'bg-[var(--secondary)] text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <IconComp size={22} />
                  </div>
                  <div>
                    <h4 className={`font-black text-sm uppercase tracking-wider ${isActive ? 'text-[var(--secondary)]' : 'text-slate-500'}`}>
                      {tabKey === 'mission' ? 'Pillar 01' : tabKey === 'vision' ? 'Pillar 02' : 'Pillar 03'}
                    </h4>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">{tab.title}</h3>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel Panel */}
          <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-[36px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] min-h-[380px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className={`inline-block bg-gradient-to-r ${tabs[activeTab].accent} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}>
                    ACTIVE STATEMENT
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black font-outfit text-slate-900 leading-tight">
                    {tabs[activeTab].subtitle}
                  </h3>
                </div>

                <p className="text-slate-600 font-medium text-base leading-relaxed">
                  {tabs[activeTab].content}
                </p>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs text-slate-400 font-black uppercase tracking-wider mb-4">Core Principles Maintained</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {tabs[activeTab].benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200/40 p-3 rounded-2xl">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <Leaf size={10} className="fill-emerald-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* ── THE TIMELINE / OUR HISTORY ── */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        
        {/* Abstract Glowing shapes */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-15">
          <div className="absolute top-[20%] left-[-10%] w-96 h-96 rounded-full bg-emerald-500 blur-[130px]" />
          <div className="absolute bottom-[20%] right-[-10%] w-96 h-96 rounded-full bg-amber-500 blur-[130px]" />
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-emerald-400 font-extrabold uppercase tracking-widest text-xs">Chronology of Growth</span>
            <h2 className="text-3xl md:text-5xl font-black font-outfit mt-2 tracking-tight">Our Journey In Milestones</h2>
            <p className="text-slate-400 font-medium text-base mt-3">From walking the fields to transforming the urban grocery infrastructure.</p>
          </div>

          {/* Timeline Tree */}
          <div className="relative border-l-2 border-slate-700/60 md:border-l-0 max-w-4xl mx-auto md:before:absolute md:before:left-1/2 md:before:top-0 md:before:bottom-0 md:before:w-[2px] md:before:bg-slate-700/60 pb-12">
            
            {/* Timeline Item 1 */}
            <div className="relative pl-8 md:pl-0 md:grid md:grid-cols-2 md:gap-16 mb-16 md:even:flex-row-reverse group">
              {/* Node Badge */}
              <div className="absolute left-[-9px] top-1.5 md:left-1/2 md:-ml-2.5 w-5 h-5 rounded-full bg-slate-950 border-4 border-emerald-500 z-10 group-hover:scale-125 transition-transform duration-300 shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
              
              {/* Year Marker Desktop (Left side) */}
              <div className="hidden md:flex justify-end text-right pr-4 pt-1 flex-col items-end">
                <span className="text-emerald-400 font-black text-3xl font-outfit">Jan 2024</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">THE CONCEPTION</span>
              </div>
              
              {/* Card Container */}
              <div className="bg-slate-950/60 border border-slate-800 backdrop-blur-md p-7.5 rounded-3xl group-hover:border-emerald-500/30 transition duration-300">
                <div className="flex md:hidden items-center justify-between mb-2">
                  <span className="text-emerald-400 font-black text-xl font-outfit">Jan 2024</span>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">THE CONCEPTION</span>
                </div>
                <h3 className="text-xl font-black font-outfit mb-3">The Seed is Sown</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">
                  Our founders, Arjun and Ananya, spent three weeks living with farming collectives in the Western Ghats region. Disheartened by witnessing third-party traders buy gorgeous heirloom tomatoes for ₹4/kg and resell them to cities for ₹90/kg, they pledged to build a completely direct pipeline.
                </p>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full w-fit mt-4">
                  <Sprout size={12} />
                  <span>Maharashtra Field Surveys</span>
                </div>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative pl-8 md:pl-0 md:grid md:grid-cols-2 md:gap-16 mb-16 md:even:flex-row-reverse group">
              {/* Node Badge */}
              <div className="absolute left-[-9px] top-1.5 md:left-1/2 md:-ml-2.5 w-5 h-5 rounded-full bg-slate-950 border-4 border-amber-500 z-10 group-hover:scale-125 transition-transform duration-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
              
              {/* Year Marker Desktop (Right side) */}
              <div className="hidden md:flex order-last pl-4 pt-1 flex-col items-start">
                <span className="text-amber-400 font-black text-3xl font-outfit">Jul 2024</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">COLD COOPERATIVES</span>
              </div>

              {/* Card Container */}
              <div className="bg-slate-950/60 border border-slate-800 backdrop-blur-md p-7.5 rounded-3xl group-hover:border-amber-500/30 transition duration-300 md:col-start-1">
                <div className="flex md:hidden items-center justify-between mb-2">
                  <span className="text-amber-400 font-black text-xl font-outfit">Jul 2024</span>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">COLD COOPERATIVES</span>
                </div>
                <h3 className="text-xl font-black font-outfit mb-3">Unlocking Cold Logistics</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">
                  We built our first three climate-controlled village collection chambers. These localized units cool the freshly plucked herbs, leafy greens, and exotic fruits down to 6°C instantly, preventing respiration rot and maintaining full trace nutrition prior to transit.
                </p>
                <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full w-fit mt-4">
                  <Clock size={12} />
                  <span>3 Sorting Stations Connected</span>
                </div>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="relative pl-8 md:pl-0 md:grid md:grid-cols-2 md:gap-16 mb-16 group">
              {/* Node Badge */}
              <div className="absolute left-[-9px] top-1.5 md:left-1/2 md:-ml-2.5 w-5 h-5 rounded-full bg-slate-950 border-4 border-teal-400 z-10 group-hover:scale-125 transition-transform duration-300 shadow-[0_0_15px_rgba(45,212,191,0.6)]" />
              
              {/* Year Marker Desktop (Left side) */}
              <div className="hidden md:flex justify-end text-right pr-4 pt-1 flex-col items-end">
                <span className="text-teal-400 font-black text-3xl font-outfit">Apr 2025</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">QWIKBASKET DEBUT</span>
              </div>

              {/* Card Container */}
              <div className="bg-slate-950/60 border border-slate-800 backdrop-blur-md p-7.5 rounded-3xl group-hover:border-teal-500/30 transition duration-300">
                <div className="flex md:hidden items-center justify-between mb-2">
                  <span className="text-teal-400 font-black text-xl font-outfit">Apr 2025</span>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">QWIKBASKET DEBUT</span>
                </div>
                <h3 className="text-xl font-black font-outfit mb-3">Launching QwikBasket</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">
                  The initial release of the QwikBasket platform went live! Over 2,000 households joined in the first month. Our routing algorithms automated deliveries so that a fresh basket of morning harvest is sorted and delivered in record time, while keeping delivery emissions low.
                </p>
                <div className="flex items-center gap-1.5 bg-teal-400/10 border border-teal-400/20 text-teal-400 text-[10px] font-bold px-3 py-1 rounded-full w-fit mt-4">
                  <Users size={12} />
                  <span>2,000+ Founding Subscriptions</span>
                </div>
              </div>
            </div>

            {/* Timeline Item 4 */}
            <div className="relative pl-8 md:pl-0 md:grid md:grid-cols-2 md:gap-16 group">
              {/* Node Badge */}
              <div className="absolute left-[-9px] top-1.5 md:left-1/2 md:-ml-2.5 w-5 h-5 rounded-full bg-slate-950 border-4 border-rose-400 z-10 group-hover:scale-125 transition-transform duration-300 shadow-[0_0_15px_rgba(251,113,133,0.6)]" />
              
              {/* Year Marker Desktop (Right side) */}
              <div className="hidden md:flex order-last pl-4 pt-1 flex-col items-start">
                <span className="text-rose-400 font-black text-3xl font-outfit">Today</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">THE GREEN COALITION</span>
              </div>

              {/* Card Container */}
              <div className="bg-slate-950/60 border border-slate-800 backdrop-blur-md p-7.5 rounded-3xl group-hover:border-rose-500/30 transition duration-300 md:col-start-1">
                <div className="flex md:hidden items-center justify-between mb-2">
                  <span className="text-rose-400 font-black text-xl font-outfit">Today</span>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">THE GREEN COALITION</span>
                </div>
                <h3 className="text-xl font-black font-outfit mb-3">Expanding Sustainable Sourcing</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">
                  QwikBasket now supports 500+ local farming partners. Every week, we deliver chemical-free fruits, pesticide-free vegetables, grains, and daily farm-essentials to 10k+ families. We remain committed to keeping our supply chain eco-friendly and direct.
                </p>
                <div className="flex items-center gap-1.5 bg-rose-400/10 border border-rose-400/20 text-rose-400 text-[10px] font-bold px-3 py-1 rounded-full w-fit mt-4">
                  <Award size={12} />
                  <span>500+ Farm Cooperatives Active</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── THE PIONEERS (FOUNDERS SECTIONS) ── */}
      <section className="py-24 px-4 max-w-[1440px] mx-auto lg:px-10 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[var(--secondary)] font-extrabold uppercase tracking-widest text-xs">The Visionaries</span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-outfit mt-2 tracking-tight">Our Pioneers</h2>
          <p className="text-slate-500 font-medium text-base mt-3">The hands and brains engineering an equitable agriculture model.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Founder 1 */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-[32px] overflow-hidden border border-slate-200/60 shadow-[0_15px_35px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_50px_rgba(4,79,29,0.07)] hover:border-emerald-500/10 transition-all duration-300 group"
          >
            <div className="h-[320px] overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" 
                alt="Arjun Mehta" 
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="bg-amber-400 text-slate-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                  FOUNDER & CEO
                </span>
                <h3 className="text-2xl font-black font-outfit text-white mt-2">Arjun Mehta</h3>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="relative">
                <Quote className="absolute -top-3 -left-3 text-slate-100 transform -scale-x-100" size={32} />
                <p className="text-slate-500 font-medium text-sm leading-relaxed italic relative z-10">
                  "If our tech fails to put money in the hands of the cultivator in rural villages, then we have built the wrong system. Agritech is not about code; it's about farmer financial security."
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} className="text-emerald-600" />
                <span>Field Sourcing Office, Pune</span>
              </div>
            </div>
          </motion.div>

          {/* Founder 2 */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-[32px] overflow-hidden border border-slate-200/60 shadow-[0_15px_35px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_50px_rgba(4,79,29,0.07)] hover:border-emerald-500/10 transition-all duration-300 group"
          >
            <div className="h-[320px] overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600" 
                alt="Ananya Roy" 
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                  CO-FOUNDER & CHIEF AGRONOMIST
                </span>
                <h3 className="text-2xl font-black font-outfit text-white mt-2">Ananya Roy</h3>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="relative">
                <Quote className="absolute -top-3 -left-3 text-slate-100 transform -scale-x-100" size={32} />
                <p className="text-slate-500 font-medium text-sm leading-relaxed italic relative z-10">
                  "Sustainable soil yields nutrient-rich produce. We work closely with our partners to audit soil microbiomes, ensuring that synthetic chemical pesticides never contaminate our harvests."
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} className="text-emerald-600" />
                <span>R&D Greenhouse Labs, Satara</span>
              </div>
            </div>
          </motion.div>

          {/* Founder 3 */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-[32px] overflow-hidden border border-slate-200/60 shadow-[0_15px_35px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_50px_rgba(4,79,29,0.07)] hover:border-emerald-500/10 transition-all duration-300 group"
          >
            <div className="h-[320px] overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600" 
                alt="Rohan Das" 
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="bg-teal-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                  CHIEF OF LOGISTICS
                </span>
                <h3 className="text-2xl font-black font-outfit text-white mt-2">Rohan Das</h3>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="relative">
                <Quote className="absolute -top-3 -left-3 text-slate-100 transform -scale-x-100" size={32} />
                <p className="text-slate-500 font-medium text-sm leading-relaxed italic relative z-10">
                  "Every delivery has a cold chain timeline. From harvest to urban routing, our electric fleet operates round-the-clock so that you receive items that are fresh and vitamin-dense."
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} className="text-emerald-600" />
                <span>Main Fulfillment Center, Mumbai</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── THE FARMER VOICES TESTIMONIALS ── */}
      <section className="py-20 bg-slate-100 z-10 relative border-t border-slate-200/50">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[var(--secondary)] font-extrabold uppercase tracking-widest text-xs">Community Voices</span>
              <h2 className="text-3xl md:text-[44px] font-black text-slate-900 font-outfit leading-tight tracking-tight">
                Stories from the Roots of the Earth
              </h2>
              <p className="text-slate-600 font-medium text-base leading-relaxed">
                Our ecosystem's real strength lies in the farmers who tend to the crops. We make sure they get direct support and clean, stable financial resources in return for their commitment to farming without pesticides.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3.5 bg-white p-4.5 rounded-2xl border border-slate-200/40">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">₹</div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm">Direct Payment in 24h</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Clearing invoices rapidly to preserve cash liquidity.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 bg-white p-4.5 rounded-2xl border border-slate-200/40">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <RibbonIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm">Zero-Commission Trade</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Bypassing wholesale agents to maximize farmer earnings.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials Grid right */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Farmer 1 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow duration-300 relative space-y-6 flex flex-col justify-between">
                <Quote className="text-emerald-100 absolute top-4 right-4" size={48} />
                <p className="text-slate-600 font-medium text-sm leading-relaxed relative z-10 italic">
                  "QwikBasket has transformed my farm. I now get fair prices paid directly to me within 24 hours, and I can focus entirely on growing clean, pesticide-free vegetables."
                </p>
                <div className="flex items-center gap-4 relative z-10 pt-4 border-t border-slate-50">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=200" 
                      alt="Baldev Singh" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Baldev Singh</h4>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">Veggie Grower, Pune Region</p>
                  </div>
                </div>
              </div>

              {/* Farmer 2 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow duration-300 relative space-y-6 flex flex-col justify-between">
                <Quote className="text-emerald-100 absolute top-4 right-4" size={48} />
                <p className="text-slate-600 font-medium text-sm leading-relaxed relative z-10 italic">
                  "Working with QwikBasket lets me focus on preserving heritage apple orchards. They take care of the logistics and cooling, and ensure our apples reach the city fresh and unblemished."
                </p>
                <div className="flex items-center gap-4 relative z-10 pt-4 border-t border-slate-50">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" 
                      alt="Meera Bai" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Meera Bai</h4>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">Heritage Orchardist, Shimla</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── THE ENVIRONMENTAL & SUSTAINABILITY PLEDGE ── */}
      <section className="py-20 bg-emerald-950 text-white relative z-10 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-emerald-300 font-extrabold uppercase tracking-widest text-xs">A Sustainable Legacy</span>
              <h2 className="text-3xl md:text-5xl font-black font-outfit leading-tight tracking-tight">
                Our Ecological Pledge to the Planet
              </h2>
              <p className="text-emerald-100/80 font-medium text-base leading-relaxed">
                Agriculture shouldn't leave scars. At QwikBasket, our green initiatives go beyond simple packaging. We are dedicated to building a zero-waste, carbon-conscious network that supports biodiversity.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-emerald-900/40 border border-emerald-800 p-5 rounded-2xl flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                    <Leaf size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Compostable Materials</h4>
                    <p className="text-emerald-200/60 text-xs mt-1 leading-relaxed">Replacing standard single-use plastics with natural, home-compostable corn-starch wraps and cotton mesh bags.</p>
                  </div>
                </div>

                <div className="bg-emerald-900/40 border border-emerald-800 p-5 rounded-2xl flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Electric Logistical Fleet</h4>
                    <p className="text-emerald-200/60 text-xs mt-1 leading-relaxed">Using localized electric vehicles for our last-mile deliveries to help reduce inner-city exhaust pollution.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphic column */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-[40px] overflow-hidden shadow-2xl relative h-[400px]">
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000" 
                  alt="Environmental Sprouts" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent" />
                
                {/* Overlay card */}
                <div className="absolute bottom-8 left-8 right-8 bg-emerald-900/90 backdrop-blur-md p-6.5 rounded-3xl border border-emerald-500/20 text-center">
                  <h4 className="font-black font-outfit text-white text-base">Carbon-Neutral Sourcing Highway</h4>
                  <p className="text-emerald-200/80 text-xs mt-1.5 leading-relaxed font-semibold">
                    We offset 100% of our carbon footprint by collaborating directly with smallholder farming clusters and investing in reforestation projects.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── BREATHTAKING FINAL CTA ── */}
      <section className="py-24 text-center px-4 relative z-10">
        <div className="max-w-3xl mx-auto bg-white border border-slate-200/60 rounded-[48px] p-8 md:p-16 shadow-[0_30px_80px_rgba(4,79,29,0.04)] relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-400/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Heart className="text-[var(--secondary)] fill-[var(--secondary)]/15" size={32} />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-outfit leading-tight tracking-tight">
              Join the Freshness Revolution
            </h2>
            
            <p className="text-slate-500 font-medium text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Experience the difference of direct farm-to-table groceries. Eat food the way nature intended, chemical-free, direct, and transparent.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => navigate('/categories')} 
                className="w-full sm:w-auto bg-slate-900 text-white hover:bg-emerald-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100 transition duration-300 px-10 py-4.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Shopping</span>
                <ChevronRight size={16} />
              </button>
              
              <a 
                href="/#stores" 
                className="w-full sm:w-auto bg-slate-100 text-slate-800 hover:bg-slate-200 hover:-translate-y-1 transition duration-300 px-10 py-4.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2"
              >
                <span>Explore Local Stores</span>
                <MapPin size={16} className="text-emerald-600" />
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default OurStory;
