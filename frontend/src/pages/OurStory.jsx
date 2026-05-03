import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Heart, Award, Users, MapPin, Clock } from 'lucide-react';

const OurStory = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=2070&auto=format&fit=crop" 
            alt="Organic Farm" 
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[var(--secondary)] font-black uppercase tracking-[0.4em] mb-4 block"
          >
            Since 2024
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-[900] text-white mb-6 leading-tight"
          >
            Nurturing Nature, <br /> Nourishing Life.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto"
          >
            QwikBasket was born from a simple idea: bringing the farm's purest harvest directly to your doorstep with lightning speed.
          </motion.p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-4 max-w-[1440px] mx-auto lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[var(--secondary)] font-black uppercase tracking-widest mb-2 block">Our Vision</span>
            <h2 className="text-3xl md:text-5xl font-[900] text-slate-900 mb-8 leading-tight">
              Bridging the gap between <span className="text-emerald-600">Pure Farms</span> and <span className="text-orange-500">Your Home</span>.
            </h2>
            <div className="space-y-6">
              <p className="text-slate-600 text-lg leading-relaxed">
                At QwikBasket, we believe that everyone deserves access to fresh, high-quality produce without compromising on time. Our journey started in the lush fields where we saw the hard work of farmers and the struggle of urban families to find authentic, fresh groceries.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                We've built a ecosystem that empowers local farmers while providing you with a seamless, rapid delivery experience. Every product in your basket is handpicked, quality-checked, and delivered with love.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-[40px] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=2025&auto=format&fit=crop" 
                alt="Fresh Harvest" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Leaf size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900">100% Organic</h4>
                  <p className="text-xs text-slate-500 font-bold">Certified Quality</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-slate-50 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 text-center mb-16">
          <span className="text-[var(--secondary)] font-black uppercase tracking-widest mb-2 block">Our Pillars</span>
          <h2 className="text-3xl md:text-5xl font-[900] text-slate-900">Values that Drive Us</h2>
        </div>
        
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: ShieldCheck, 
              title: "Uncompromising Quality", 
              desc: "From farm to fork, we maintain the highest standards of hygiene and freshness for every item.",
              color: "bg-blue-50 text-blue-600"
            },
            { 
              icon: Clock, 
              title: "Lightning Speed", 
              desc: "We value your time. Our optimized delivery network ensures your groceries reach you in record time.",
              color: "bg-orange-50 text-orange-600"
            },
            { 
              icon: Users, 
              title: "Farmer First", 
              desc: "We ensure fair pricing and direct support for our farming partners, nurturing sustainable agriculture.",
              color: "bg-emerald-50 text-emerald-600"
            }
          ].map((val, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group"
            >
              <div className={`w-16 h-16 rounded-2xl ${val.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <val.icon size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4">{val.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {val.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 max-w-[1440px] mx-auto lg:px-10">
        <div className="bg-slate-900 rounded-[48px] p-12 md:p-20 relative overflow-hidden text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--secondary)]/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
          </div>
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            {[
              { label: "Farmers Joined", val: "500+" },
              { label: "Pincodes Served", val: "50+" },
              { label: "Happy Families", val: "10k+" },
              { label: "Quality Checks", val: "100%" }
            ].map((stat, i) => (
              <div key={i}>
                <h4 className="text-4xl md:text-5xl font-black text-white mb-2">{stat.val}</h4>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <Heart className="mx-auto text-[var(--secondary)] mb-6 fill-[var(--secondary)]/20" size={48} />
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Join the Revolution of Freshness</h2>
          <p className="text-slate-500 font-medium text-lg mb-10">
            Experience the difference of truly fresh, direct-from-farm groceries. Your health and convenience are our top priorities.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="bg-[var(--secondary)] text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-green-100 hover:-translate-y-1 transition-all">
              Start Shopping
            </button>
            <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-slate-200 hover:-translate-y-1 transition-all">
              Locate Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurStory;
