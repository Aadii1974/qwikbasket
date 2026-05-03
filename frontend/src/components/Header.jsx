import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, MapPin, ChevronDown, Bell, LogOut, Menu, Check, Loader2, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { checkServiceability, getUserProfile } from '../services/api';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount, subtotal } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  
  // Location & Serviceability State
  const [locationStr, setLocationStr] = useState('Fetching Location...');
  const [pincode, setPincode] = useState('');
  const [isServiceable, setIsServiceable] = useState(null);
  const [isLocating, setIsLocating] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualPincode, setManualPincode] = useState('');

  // Farmer Coins Wallet
  const [farmerCoins, setFarmerCoins] = useState(0);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'delivery_agent') {
      getUserProfile().then(res => {
        if (res?.success) setFarmerCoins(res.data.farmerCoins || 0);
      });
    }
  }, [user]);

  // Initial Location Fetch
  useEffect(() => {
    const savedPincode = localStorage.getItem('userPincode');
    const savedLocation = localStorage.getItem('userLocationStr');
    
    if (savedPincode && savedLocation) {
      setPincode(savedPincode);
      setLocationStr(savedLocation);
      verifyPincode(savedPincode);
    } else {
      autoFetchLocation();
    }
  }, []);

  const autoFetchLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setLocationStr('Location not supported');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        const fetchedPincode = data.address?.postcode || '';
        const cityOrTown = data.address?.city || data.address?.town || data.address?.county || 'Unknown Area';
        const displayStr = fetchedPincode ? `${cityOrTown}, ${fetchedPincode}` : cityOrTown;
        
        setLocationStr(displayStr);
        if (fetchedPincode) {
           setPincode(fetchedPincode);
           verifyPincode(fetchedPincode);
           localStorage.setItem('userPincode', fetchedPincode);
           localStorage.setItem('userLocationStr', displayStr);
        } else {
           setIsServiceable(false);
        }
      } catch (err) {
        setLocationStr('Could not determine area');
        setIsServiceable(false);
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      setLocationStr('Location access denied');
      setIsLocating(false);
      setIsServiceable(false);
    });
  };

  const verifyPincode = async (code) => {
     setIsLocating(true);
     try {
       const res = await checkServiceability(code);
       setIsServiceable(res.serviceable);
     } catch (err) {
       setIsServiceable(false);
     } finally {
       setIsLocating(false);
     }
  };

  const handleManualPincodeSubmit = (e) => {
     e.preventDefault();
     if(manualPincode.length < 5) return;
     setPincode(manualPincode);
     setLocationStr(`Pincode: ${manualPincode}`);
     verifyPincode(manualPincode);
     localStorage.setItem('userPincode', manualPincode);
     localStorage.setItem('userLocationStr', `Pincode: ${manualPincode}`);
     setShowLocationModal(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${searchInput}`);
    }
  };

  return (
    <>
      <header className="glass-nav sticky top-0 z-40 py-2 md:py-3 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center gap-1.5 group min-w-0 flex-shrink-0">
              <span className="text-[20px] md:text-[28px] font-[900] tracking-tighter truncate" style={{ color: 'var(--secondary)' }}>
                Qwik<span className="text-slate-800">Basket</span>
              </span>
              <span className="bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded-full font-[900] uppercase tracking-wider hidden md:block shadow-sm border border-amber-200">
                by Real Farms
              </span>
            </Link>

            <div 
               className="hidden md:flex flex-col border-l border-slate-100 pl-5 cursor-pointer hover:opacity-70 transition-opacity"
               onClick={() => setShowLocationModal(true)}
            >
              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                {isLocating ? (
                   <span className="flex items-center gap-1"><Loader2 size={9} className="animate-spin" /> Locating...</span>
                ) : isServiceable ? (
                   <span className="text-[var(--secondary)] flex items-center gap-1">
                     <Check size={9} strokeWidth={4} /> Express Delivery
                   </span>
                ) : (
                   <span className="text-red-500 uppercase">Out of zone</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[12px] font-bold text-slate-800 truncate max-w-[140px]">
                <span className="truncate">{locationStr}</span>
                <ChevronDown size={12} className="text-slate-400 flex-shrink-0" />
              </div>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-6 mr-4">
            <Link to="/our-story" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[var(--secondary)] transition-colors">
              Our Story
            </Link>
          </div>

          <div className="flex-1 max-w-[500px] mx-4 lg:mx-8 hidden lg:flex">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--secondary)] transition-colors pointer-events-none">
                <Search size={16} strokeWidth={2.5} />
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={user?.role === 'b2b' ? 'Search bulk inventory...' : 'Search groceries, dairy, produce...'}
                className="w-full py-3 pl-11 pr-4 rounded-full bg-slate-50/80 border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-[var(--secondary)]/40 focus:ring-4 focus:ring-[var(--secondary)]/8"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile search icon */}
            <Link to="/search" className="lg:hidden p-2.5 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0">
              <Search size={17} strokeWidth={2.5} />
            </Link>

            {/* Desktop user menu */}
            <div className="hidden lg:block">
              {user ? (
                <div
                  className="relative py-1"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => {
                    // Small delay so moving from trigger to menu doesn't close it
                    setTimeout(() => setShowDropdown(false), 100);
                  }}
                >
                  <button className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-[var(--secondary)] transition-colors px-3 py-2 rounded-full hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-full bg-[var(--secondary)]/10 flex items-center justify-center text-[var(--secondary)] flex-shrink-0">
                      <User size={16} strokeWidth={2.5} />
                    </div>
                    <span className="hidden xl:inline max-w-[100px] truncate">{user.name}</span>
                  </button>
                  {/* Invisible bridge — fills the 6px gap between button bottom and dropdown top */}
                  {showDropdown && (
                    <div className="absolute top-full right-0 w-full h-3 bg-transparent z-40" />
                  )}
                  {showDropdown && (
                    <div
                      className="absolute top-full right-0 w-60 mt-1.5 p-1 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                      onMouseEnter={() => setShowDropdown(true)}
                      onMouseLeave={() => setShowDropdown(false)}
                    >
                      <div className="p-4 rounded-xl bg-slate-50 mb-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Signed in as</p>
                        <p className="font-extrabold text-sm truncate text-slate-900">{user.name}</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                          user.role === 'admin' ? 'bg-slate-900 text-white' :
                          user.role === 'delivery_agent' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'b2b' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : user.role === 'delivery_agent' ? 'Delivery Agent' : user.role === 'b2b' ? 'Business' : 'Member'}
                        </span>
                      </div>
                      {user.role === 'delivery_agent' ? (
                        <Link to="/delivery" className="flex items-center p-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors">Delivery Dashboard</Link>
                      ) : (
                        <Link to="/profile" className="flex items-center p-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[var(--secondary)] rounded-xl transition-colors">My Account</Link>
                      )}
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center p-3 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors">Admin Panel</Link>
                      )}
                      <button onClick={logout} className="w-full flex items-center gap-2 p-3 text-red-500 text-sm font-bold hover:bg-red-50 rounded-xl border-t border-slate-100 mt-1 transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="px-5 py-2 rounded-full text-sm font-black text-slate-700 border border-slate-200 hover:border-[var(--secondary)] hover:text-[var(--secondary)] transition-all">
                  Sign In
                </Link>
              )}
            </div>

            {/* Wallet Button */}
            {user && (user.role === 'b2c' || user.role === 'b2b') && (
               <Link to="/profile" onClick={() => localStorage.setItem('profileActiveTab', 'wallet')} className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 px-3 py-2 rounded-full hover:shadow-md transition border border-yellow-200">
                  <span className="text-sm drop-shadow-sm">👳🏽‍♂️</span>
                  <span className="font-black text-sm drop-shadow-sm">{farmerCoins}</span>
               </Link>
            )}

            {/* Cart Button */}
            {user?.role !== 'delivery_agent' && (
              <Link to="/cart"
                className="flex items-center gap-2.5 bg-[var(--secondary)] text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-md shadow-[var(--secondary)]/25 hover:shadow-lg hover:brightness-105 transition-all active:scale-95 flex-shrink-0">
                <div className="relative">
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  {cartCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 bg-white text-[var(--secondary)] text-[9px] min-w-[15px] h-[15px] rounded-full flex justify-center items-center font-black leading-none">
                      {cartCount > 9 ? '9+' : cartCount}
                    </div>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest leading-none opacity-75">Cart</span>
                  <span className="text-sm font-black leading-snug">₹{Number(subtotal || 0).toFixed(2)}</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
           <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-8 relative">
              <button 
                onClick={() => setShowLocationModal(false)}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center font-bold"
              >✕</button>
              <h3 className="text-2xl font-black mb-2 text-slate-900">Change Location</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">Enter your pincode to check serviceability or use auto-detect.</p>
              
              <button 
                 onClick={() => { setShowLocationModal(false); autoFetchLocation(); }}
                 className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 py-4 rounded-xl font-black mb-6 hover:bg-emerald-100 transition"
              >
                 <Navigation size={18} /> Auto Detect Location
              </button>

              <div className="flex items-center gap-4 mb-6">
                 <div className="h-px bg-gray-200 flex-1"></div>
                 <span className="text-xs font-bold text-gray-400 uppercase">OR</span>
                 <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              <form onSubmit={handleManualPincodeSubmit}>
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Enter Pincode</label>
                 <input 
                    type="text" 
                    placeholder="e.g. 110001" 
                    value={manualPincode}
                    onChange={(e) => setManualPincode(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 px-5 py-4 rounded-xl outline-none focus:border-[var(--secondary)] font-black text-lg transition mb-4"
                    maxLength={6}
                 />
                 <button type="submit" disabled={manualPincode.length < 5} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-slate-800 transition disabled:opacity-50">
                    Check Serviceability
                 </button>
              </form>
           </div>
        </div>
      )}
    </>
  );
};

export default Header;
