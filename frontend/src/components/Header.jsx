import React, { useState } from 'react';
import { Search, ShoppingCart, User, MapPin, ChevronDown, Bell, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount, subtotal } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 py-4 shadow-sm">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-6">
           <Link to="/" className="flex items-center gap-2">
             <span className="text-3xl font-extrabold tracking-tighter" style={{ color: 'var(--secondary)' }}>
               blink<span className="text-[var(--primary)]">it</span>
             </span>
             <span className="bg-[var(--primary)] text-white text-[10px] px-1 rounded-sm font-bold uppercase tracking-widest h-min -mt-2">
               {user?.role === 'b2b' ? 'B2B' : 'PRO'}
             </span>
           </Link>

           <div className="hidden md:flex flex-col border-l border-gray-200 pl-6 animate-pulse">
             <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--secondary)]">
               <span className="uppercase">Delivery in 10 minutes</span>
             </div>
             <div className="flex items-center gap-1 text-sm font-semibold text-[var(--text-main)]">
               <span>Gurugram, Haryana</span>
               <ChevronDown size={14} className="text-[var(--primary)]" />
             </div>
           </div>
        </div>

        <div className="flex-1 max-w-[600px] mx-8 hidden lg:block">
           <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={20} />
              </span>
              <input 
                type="text" 
                placeholder='Search "milk", "bread" or "atta"...'
                className="w-full bg-[#f3f9f3] py-3 pl-12 pr-4 rounded-[var(--radius-md)] border border-transparent focus:border-[var(--secondary)] focus:bg-white transition-all outline-none"
              />
           </div>
        </div>

        <div className="flex items-center gap-6">
           {user ? (
             <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 font-semibold hover:text-[var(--secondary)] transition"
                >
                   <User size={20} />
                   <span className="hidden md:inline">{user.name}</span>
                </button>
                {showDropdown && (
                  <div className="absolute top-10 right-0 w-52 bg-white rounded-[var(--radius-md)] shadow-lg border border-[var(--border)] overflow-hidden fade-in">
                    <div className="p-4 border-b border-[var(--border)] bg-gray-50">
                      <p className="text-xs text-[var(--text-muted)]">Logged in as</p>
                      <p className="font-bold text-sm truncate">{user.name}</p>
                      {user.role === 'b2b' && !user.isApproved && (
                         <p className="text-xs text-amber-600 mt-1">Pending Approval</p>
                      )}
                    </div>
                    {user.role === 'admin' && (
                       <Link to="/admin" className="block p-3 hover:bg-[var(--background)] text-sm font-medium">Admin Panel</Link>
                    )}
                    <button onClick={logout} className="w-full text-left p-3 hover:bg-red-50 text-red-500 text-sm font-medium flex items-center gap-2">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
             </div>
           ) : (
             <Link to="/login" className="font-bold text-lg hover:text-[var(--secondary)] transition">
               Login
             </Link>
           )}

           <Link to="/cart" className="bg-[var(--secondary)] text-white px-5 py-3 rounded-[var(--radius-md)] flex items-center gap-2 hover:bg-[var(--secondary-dark)] transition transform hover:scale-105 shadow-md shadow-[#1FB33B44]">
              <ShoppingCart size={22} />
              <div className="flex flex-col items-start leading-[1.1]">
                <span className="text-[10px] font-bold uppercase tracking-wider">{cartCount} {cartCount === 1 ? 'Item' : 'Items'}</span>
                <span className="text-sm font-extrabold">₹{subtotal.toLocaleString()}</span>
              </div>
           </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
