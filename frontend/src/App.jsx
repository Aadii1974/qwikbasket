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
import { Smartphone, X, Share, PlusSquare } from 'lucide-react';
import { fetchSettings, fetchVapidPublicKey, subscribeToPush } from './services/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if app is already installed or running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      console.log('📱 Real Farms is running as an installed PWA. Hiding install prompts.');
      
      // Auto-subscribe to push notifications if app is installed
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(async (registration) => {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              const existingSub = await registration.pushManager.getSubscription();
              if (!existingSub) {
                const publicKey = await fetchVapidPublicKey();
                if (publicKey) {
                  const applicationServerKey = urlBase64ToUint8Array(publicKey);
                  const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey,
                  });
                  await subscribeToPush(subscription);
                  console.log('✅ Subscribed to push notifications successfully!');
                }
              }
            }
          } catch (err) {
            console.error('Failed to subscribe to push notifications', err);
          }
        });
      }
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
      setShowInstallPopup(false);
      setShowIOSGuide(true);
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
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 md:left-auto md:right-6 md:bottom-6 md:w-[380px] bg-white shadow-[0_-10px_50px_rgba(0,0,0,0.2)] md:shadow-[0_20px_50px_rgba(4,79,29,0.15)] rounded-t-3xl md:rounded-3xl p-6 z-[60] border-t md:border border-slate-100 flex flex-col gap-4"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-slate-200 flex-shrink-0 bg-white">
                    <img src="/icon-192.png" alt="Real Farms Icon" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-green-100 text-green-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">OFFICIAL APP</span>
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
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {isIOS 
                    ? "Install Real Farms directly to your iPhone's home screen for lightning-fast shopping and native-app speeds!"
                    : "Install our lightweight app directly to your home screen for lightning-fast shopping and native gestures!"
                  }
                </p>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs font-semibold text-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">🥬</span>
                    <span>Farm Fresh produce in 45-60 mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">📱</span>
                    <span>Native app gestures & smooth flow</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-2 relative z-10">
                <button 
                  onClick={handleInstallApp} 
                  className="flex-1 bg-[#044f1d] hover:bg-green-900 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-green-900/30 transition active:scale-[0.98]"
                >
                  {isIOS ? 'Install App' : 'Install App'}
                </button>
                <button 
                  onClick={() => { setShowInstallPopup(false); localStorage.setItem('pwaPromptDismissed', 'true'); }} 
                  className="bg-slate-100 text-slate-600 text-sm font-bold px-4 py-3.5 rounded-xl hover:bg-slate-200 transition"
                >
                  Later
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* iOS Install Guide Overlay */}
        <AnimatePresence>
          {showIOSGuide && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-4"
              onClick={() => setShowIOSGuide(false)}
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowIOSGuide(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full"
                >
                  <X size={18} />
                </button>
                
                <div className="text-center mb-6 mt-2">
                  <div className="w-16 h-16 mx-auto bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <Smartphone size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Install Real Farms App</h3>
                  <p className="text-slate-600 text-sm mt-2">Get the full experience on your iPhone with these 2 simple steps:</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 flex-shrink-0">
                      <Share size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">1. Tap the Share button</p>
                      <p className="text-xs text-slate-500">At the bottom of your Safari browser</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-700 flex-shrink-0">
                      <PlusSquare size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">2. Select Add to Home Screen</p>
                      <p className="text-xs text-slate-500">Scroll down the menu to find this option</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full mt-8 bg-[#044f1d] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 active:scale-[0.98] transition"
                >
                  Got it!
                </button>
              </motion.div>
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
