import React from 'react';
import { Instagram, Twitter, Facebook, Youtube, ShoppingBag, Zap, Clock, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-24 pb-12 overflow-hidden relative">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--secondary)] to-transparent opacity-50"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--secondary)]/10 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
           {/* Brand Column */}
           <div className="space-y-6">
              <div className="flex items-center gap-2">
                 <div className="w-10 h-10 bg-[var(--secondary)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/50">
                    <ShoppingBag size={22} />
                 </div>
                 <span className="text-2xl font-black text-white tracking-tighter">QwikBasket</span>
              </div>
              <p className="text-sm font-medium leading-relaxed max-w-xs text-slate-400">
                 Experience the future of grocery shopping. Fresh produce from Real Farms delivered to your doorstep in minutes.
              </p>
              <div className="flex gap-4">
                 {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-[var(--secondary)] hover:text-white transition-all duration-300">
                       <Icon size={18} />
                    </a>
                 ))}
              </div>
           </div>

           {/* Quick Links */}
           <div>
              <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Shop Categories</h4>
              <ul className="space-y-4 text-sm font-bold">
                 {['Vegetables & Fruits', 'Dairy & Breakfast', 'Snacks & Drinks', 'Household Essentials'].map((item) => (
                    <li key={item}><a href="#" className="hover:text-[var(--secondary)] transition-colors inline-flex items-center gap-2 group"><div className="w-1 h-1 bg-slate-700 group-hover:bg-[var(--secondary)] transition-colors rounded-full"></div> {item}</a></li>
                 ))}
              </ul>
           </div>

           {/* Support */}
           <div>
              <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Customer Care</h4>
              <ul className="space-y-4 text-sm font-bold">
                 {['Track Order', 'Return Policy', 'Shipping Info', 'Help Center'].map((item) => (
                    <li key={item}><a href="#" className="hover:text-[var(--secondary)] transition-colors inline-flex items-center gap-2 group"><div className="w-1 h-1 bg-slate-700 group-hover:bg-[var(--secondary)] transition-colors rounded-full"></div> {item}</a></li>
                 ))}
              </ul>
           </div>

           {/* Features / Trust */}
           <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/5">
              <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Why Us?</h4>
              <div className="space-y-6">
                 {[
                    { icon: <Zap size={18} />, title: 'Qwik Delivery', desc: '10-20 mins avg' },
                    { icon: <ShieldCheck size={18} />, title: 'Verified Quality', desc: 'Real Farms Fresh' }
                 ].map((feat, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[var(--secondary)]">
                          {feat.icon}
                       </div>
                       <div>
                          <h5 className="text-white text-xs font-black uppercase tracking-wider">{feat.title}</h5>
                          <p className="text-[10px] text-slate-500 font-bold">{feat.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
              <p>© 2026 QwikBasket by Real Farms</p>
              <div className="hidden md:block w-1 h-1 bg-slate-700 rounded-full"></div>
              <p>Privacy Policy</p>
              <div className="hidden md:block w-1 h-1 bg-slate-700 rounded-full"></div>
              <p>Terms of Service</p>
           </div>
           
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mr-2">Secure Payments</span>
              <div className="flex gap-2">
                 {[1,2,3,4].map(i => <div key={i} className="w-10 h-6 bg-slate-800 rounded-md border border-slate-700/50"></div>)}
              </div>
           </div>

           <div className="flex items-center gap-2 text-xs font-bold">
              Built with <Heart className="text-red-500 fill-red-500 animate-pulse" size={14} /> for Qwik delivery.
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
