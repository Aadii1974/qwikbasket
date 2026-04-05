import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import CategoryPage from './pages/CategoryPage';
import StorePage from './pages/StorePage';
import GlobalLoader from './components/GlobalLoader';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* Global Loader Overlay */}
          <AnimatePresence mode="wait">
             {isInitialLoad && <GlobalLoader onFinish={() => setIsInitialLoad(false)} />}
          </AnimatePresence>

          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/store/:id" element={<StorePage />} />
                {/* Fallback route */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
