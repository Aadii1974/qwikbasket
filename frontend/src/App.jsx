import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import CategoryPage from './pages/CategoryPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductPage from './pages/ProductPage';
import StorePage from './pages/StorePage';
import SearchPage from './pages/SearchPage';
import DeliveryDashboard from './pages/DeliveryDashboard';
import GlobalLoader from './components/GlobalLoader';
import ScrollToTop from './components/ScrollToTop';
import BottomNav from './components/BottomNav';
import NightShutter from './components/NightShutter';
import { AnimatePresence } from 'framer-motion';
import { Smartphone, X } from 'lucide-react';
import { fetchSettings } from './services/api';

function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  return (
    <AuthProvider>
      <CartProvider>
        <AppContent isInitialLoad={isInitialLoad} setIsInitialLoad={setIsInitialLoad} />
      </CartProvider>
    </AuthProvider>
  );
}

const AppContent = ({ isInitialLoad, setIsInitialLoad }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings().then(data => {
      if (data) setSettings(data);
    });
  }, []);

  const isNightTime = () => {
    if (user?.role === 'admin') return false;
    if (window.location.pathname === '/login') return false;
    if (window.location.pathname.startsWith('/admin')) return false;

    // If settings haven't loaded, default to 0-0 (always open) to avoid blocking users
    const start = settings ? Number(settings.nightModeStartHour) || 0 : 0;
    const end = settings ? Number(settings.nightModeEndHour) || 0 : 0;
    const h = new Date().getHours();
    
    // If start and end are same, it's never night time
    if (start === end) return false;

    if (start > end) {
      return h >= start || h < end;
    }
    return h >= start && h < end;
  };

  // Night shutter state
  const [showNight, setShowNight]       = useState(false);
  const [isOpening, setIsOpening]       = useState(false); // morning re-open animation
  const [shutterDone, setShutterDone]   = useState(false);

  // Check night mode whenever settings change or every 60s
  useEffect(() => {
    const check = () => {
      const night = isNightTime();
      // Transition: was showing shutter, now it's daytime → play opening animation
      if (!night && showNight) {
        setShowNight(false);
        setIsOpening(true);
      } else if (night && !showNight) {
        setShowNight(true);
        setIsOpening(false);
      }
    };
    check(); // immediate check
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNight, settings]);

  // Initial mount — if it's night, show shutter straight away
  useEffect(() => {
    if (isNightTime()) setShowNight(true);
  }, [settings, user?.role]);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('pwaPromptDismissed')) {
        setShowInstallPopup(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowInstallPopup(false);
      });
    } else {
      alert("App can only be installed in supported browsers or has already been installed.");
    }
  };

  useEffect(() => {
    const triggerInstall = () => handleInstallApp();
    window.addEventListener('trigger-pwa-install', triggerInstall);
    return () => window.removeEventListener('trigger-pwa-install', triggerInstall);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredPrompt]);

  return (
    <Router>
      <ScrollToTop />

      {/* ── Night Shutter / Morning Opening ── */}
      <AnimatePresence>
        {showNight && (
          <NightShutter key="night" isOpening={false} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpening && (
          <NightShutter
            key="opening"
            isOpening={true}
            onOpeningDone={() => { setIsOpening(false); setShutterDone(true); }}
          />
        )}
      </AnimatePresence>

      {/* Global Loader Overlay */}
      <AnimatePresence mode="wait">
        {isInitialLoad && <GlobalLoader onFinish={() => setIsInitialLoad(false)} />}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen" data-user-role={user?.role} style={{ display: (showNight || isOpening) ? 'none' : 'flex' }}>
        <Header />

        {/* Install App Popup */}
        <AnimatePresence>
          {showInstallPopup && (
            <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-white shadow-2xl rounded-2xl p-4 z-50 border border-gray-100 flex items-start gap-4 animate-fade-up">
              <div className="bg-[var(--secondary)]/10 p-3 rounded-xl">
                <Smartphone size={24} className="text-[var(--secondary)]" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-sm text-slate-900">Get the App</h4>
                <p className="text-xs text-slate-500 font-medium mb-3">Install our app for a better, smoother native experience!</p>
                <div className="flex gap-2">
                  <button onClick={handleInstallApp} className="bg-[var(--secondary)] text-white text-xs font-black px-4 py-2 rounded-lg hover:bg-[var(--secondary-dark)] transition">Install</button>
                  <button onClick={() => { setShowInstallPopup(false); localStorage.setItem('pwaPromptDismissed', 'true'); }} className="bg-slate-100 text-slate-600 text-xs font-black px-4 py-2 rounded-lg hover:bg-slate-200 transition">Maybe Later</button>
                </div>
              </div>
              <button onClick={() => setShowInstallPopup(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={16}/></button>
            </div>
          )}
        </AnimatePresence>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/store/:id" element={<StorePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/delivery" element={<DeliveryDashboard />} />
            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
        <BottomNav />
      </div>
    </Router>
  );
};

export default App;
