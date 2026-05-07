import React, { useEffect, useState } from 'react';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide bottom nav on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { path: '/', icon: <Home size={24} />, label: 'Home' },
    { path: '/categories', icon: <LayoutGrid size={24} />, label: 'Categories' },
    { path: user ? '/profile' : '/login', icon: <ShoppingBag size={24} />, label: 'Orders' },
    { path: user ? '/profile' : '/login', icon: <User size={24} />, label: 'Profile' },
  ];

  if (location.pathname === '/cart') return null;

  return (
    <div 
      className={`fixed bottom-4 left-4 right-4 z-50 md:hidden transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-[150%]'}`}
    >
      <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[-5px_-5px_15px_rgba(255,255,255,0.8),_5px_5px_15px_rgba(0,0,0,0.1)] rounded-[32px] px-6 py-3 flex justify-between items-center bg-blend-overlay">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (item.path === '/categories' && location.pathname.startsWith('/category'));
          
          return (
            <Link 
              key={idx} 
              to={item.path} 
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[var(--secondary)] scale-110' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`p-2 rounded-2xl ${isActive ? 'bg-[var(--secondary)]/10' : 'bg-transparent'}`}>
                 {item.icon}
              </div>
              <span className={`text-[10px] font-black tracking-widest uppercase ${isActive ? 'text-[var(--secondary)]' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
