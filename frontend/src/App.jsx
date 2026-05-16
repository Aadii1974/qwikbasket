import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import OurStory from './pages/OurStory';
import BulkBasket from './pages/BulkBasket';
import GlobalLoader from './components/GlobalLoader';
import ScrollToTop from './components/ScrollToTop';
import BottomNav from './components/BottomNav';
import { AnimatePresence, motion } from 'framer-motion';
import { Smartphone, X } from 'lucide-react';
import { fetchSettings } from './services/api';

function App() {
  // Only show splash loader when landing directly on the homepage.
  // This prevents Googlebot from seeing a 3-second blank screen on /search, /product/:id, etc.
  const isHomepageEntry = window.location.pathname === '/';
  const [isInitialLoad, setIsInitialLoad] = useState(isHomepageEntry);

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

  // Launch Popup State
  const [showLaunchPopup, setShowLaunchPopup] = useState(false);

  useEffect(() => {
    if (settings?.isLaunchMode && settings?.launchPopupImage) {
      setShowLaunchPopup(true);
    }
  }, [settings]);

  const closeLaunchPopup = () => {
    setShowLaunchPopup(false);
  };

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if app is already installed or running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      console.log('📱 Real Farms is running as an installed PWA. Hiding install prompts.');
      return; // Stop right here, never show the prompt if already installed!
    }

    // 2. iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /ipad|iphone|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // 3. For iOS, show the installation prompt guide on first load if not dismissed
    if (isIOSDevice && !localStorage.getItem('pwaPromptDismissed')) {
      setShowInstallPopup(true);
    }

    // 4. Android/Chrome beforeinstallprompt handler
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
    if (isIOS) {
      alert("📱 To install Real Farms on your iPhone:\n\n1. Tap the 'Share' button (📤 square with an up-arrow) at the bottom of Safari.\n2. Scroll down and choose 'Add to Home Screen'.\n\nEnjoy fresh organic groceries at your fingertips!");
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
        }
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
  }, [deferredPrompt, isIOS]);

  return (
    <Router>
      <ScrollToTop />

      {/* ── Launch Popup ── */}
      <AnimatePresence>
        {showLaunchPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-lg w-full bg-transparent rounded-3xl overflow-hidden"
            >
              <button 
                onClick={closeLaunchPopup} 
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition backdrop-blur-md border border-white/20"
              >
                <X size={20} />
              </button>
              <img src={settings.launchPopupImage} alt="Launch Details" className="w-full h-auto object-contain rounded-3xl shadow-2xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Loader Overlay */}
      <AnimatePresence mode="wait">
        {isInitialLoad && <GlobalLoader onFinish={() => setIsInitialLoad(false)} />}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen" data-user-role={user?.role}>
        <Header />

        {/* Install App Popup */}
        <AnimatePresence>
          {showInstallPopup && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[360px] bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(4,79,29,0.15)] rounded-3xl p-5 z-50 border border-slate-100 flex flex-col gap-4 overflow-hidden"
            >
              {/* Highlight gradient background layer */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none" />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-emerald-500/10 flex-shrink-0 bg-white">
                    <img src="/icon-192.png" alt="Real Farms Icon" className="w-full h-full object-cover animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">OFFICIAL PWA</span>
                    <h4 className="font-black text-lg text-slate-900 mt-1 leading-tight">Real Farms</h4>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInstallPopup(false)} 
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                >
                  <X size={16}/>
                </button>
              </div>

              <div className="space-y-2 relative z-10">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {isIOS 
                    ? "Install Real Farms directly to your iPhone's home screen for lightning-fast shopping and native-app speeds!"
                    : "Install our lightweight app directly to your home screen for lightning-fast shopping, native gestures, and exclusive mobile-only deals!"
                  }
                </p>
                <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100/30 text-[11px] font-bold text-slate-700 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">🥬</span>
                    <span>Farm Fresh produce in 45-60 mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">📱</span>
                    <span>Native app gestures & smooth flow</span>
                  </div>
                  {isIOS && (
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">📤</span>
                      <span>Tap Share ➡️ 'Add to Home Screen'</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-1 relative z-10">
                <button 
                  onClick={handleInstallApp} 
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white text-xs font-black py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition active:scale-[0.98]"
                >
                  {isIOS ? 'Show How to Install' : 'Install App'}
                </button>
                <button 
                  onClick={() => { setShowInstallPopup(false); localStorage.setItem('pwaPromptDismissed', 'true'); }} 
                  className="bg-slate-100 text-slate-600 text-xs font-black px-4 py-3.5 rounded-xl hover:bg-slate-200 transition"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
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
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/bulk-basket" element={<BulkBasket />} />
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
