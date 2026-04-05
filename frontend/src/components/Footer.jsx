import React from 'react';
import { Instagram, Twitter, Facebook, Youtube, ShoppingBag, Zap, Clock, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-[var(--border)] pt-20 pb-12">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-12 mb-20">
           <div className="flex gap-6 items-start group">
              <div className="w-16 h-16 bg-[#F3F9F3] rounded-full flex items-center justify-center text-[var(--secondary)] group-hover:bg-[var(--secondary)] group-hover:text-white transition duration-300"><Zap size={32} /></div>
              <div><h4 className="text-xl font-black mb-2">Minute Delivery</h4><p className="text-[var(--text-muted)] text-sm font-medium">Get groceries delivered in minutes.</p></div>
           </div>
           <div className="flex gap-6 items-start group">
              <div className="w-16 h-16 bg-[#F3F9F3] rounded-full flex items-center justify-center text-[var(--secondary)] group-hover:bg-[var(--secondary)] group-hover:text-white transition duration-300"><Clock size={32} /></div>
              <div><h4 className="text-xl font-black mb-2">24/7 Operations</h4><p className="text-[var(--text-muted)] text-sm font-medium">Ordering snacks at 3 AM? We've got you covered.</p></div>
           </div>
           <div className="flex gap-6 items-start group">
              <div className="w-16 h-16 bg-[#F3F9F3] rounded-full flex items-center justify-center text-[var(--secondary)] group-hover:bg-[var(--secondary)] group-hover:text-white transition duration-300"><ShieldCheck size={32} /></div>
              <div><h4 className="text-xl font-black mb-2">Safe & Reliable</h4><p className="text-[var(--text-muted)] text-sm font-medium">Quality checks for every product delivered.</p></div>
           </div>
        </div>
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-[var(--text-muted)] text-sm font-medium">
           <p>© 2026 Blinkit Unified (B2C & B2B). All Rights Reserved.</p>
           <div className="flex items-center gap-2">Made with <Heart className="text-red-500 fill-red-500" size={14} /> for modern commerce.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
