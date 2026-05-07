import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Invalid cart data in storage, resetting...");
      return [];
    }
  });

  const getTieredPrice = (product, quantity) => {
    if (product.isValuePack) return product.price || 0;
    const isWholesale = (user?.role === 'b2b' && user?.isApproved) || (user?.role === 'admin' && window.location.hash === '#b2b-view');
    if (!isWholesale) return product.b2cNewPrice || 0;

    const basePrice = product.b2bNewPrice || 0;
    if (!product.b2bTiers) return basePrice;

    try {
      const tiers = JSON.parse(product.b2bTiers);
      if (!Array.isArray(tiers) || tiers.length === 0) return basePrice;

      // Find the best tier (highest minQty <= quantity)
      const sortedTiers = [...tiers].sort((a, b) => b.minQty - a.minQty);
      const applicableTier = sortedTiers.find(t => quantity >= t.minQty);
      
      return applicableTier ? (applicableTier.price || basePrice) : basePrice;
    } catch (e) {
      console.error("Error parsing B2B tiers:", e);
      return basePrice;
    }
  };

  const [bulkDiscount, setBulkDiscount] = useState(0);
  const [appSettings, setAppSettings] = useState(null);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success) setAppSettings(data.data);
      } catch (e) {}
    };
    fetchSettingsData();
  }, []);

  const addToCart = (product, quantity = 1) => {
    let minQty = 1;
    if (user?.role === 'b2b' && user?.isApproved) {
      minQty = product.minB2BQty || 1;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && !item.isValuePack);
      if (existing) {
        const newQty = existing.quantity + (quantity >= minQty ? quantity : minQty);
        return prev.map(item => item.id === product.id ? { ...item, quantity: newQty } : item);
      }
      return [...prev, { ...product, quantity: quantity >= minQty ? quantity : minQty }];
    });
  };

  const addValuePackToCart = (pack) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === pack.id && item.isValuePack);
      if (existing) {
        return prev.map(item => item.id === pack.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...pack, quantity: 1, isValuePack: true }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => setCartItems([]);

  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => {
    const currentPrice = getTieredPrice(item, item.quantity);
    return acc + (currentPrice * item.quantity);
  }, 0);

  // Bulk Basket Logic
  const bulkItems = cartItems.filter(item => item.isBulkOnly);
  const bulkSubtotal = bulkItems.reduce((acc, item) => {
    const currentPrice = getTieredPrice(item, item.quantity);
    return acc + (currentPrice * item.quantity);
  }, 0);

  const bulkSavings = bulkItems.reduce((acc, item) => {
    const oldPrice = item.b2cOldPrice || item.price || 0;
    const currentPrice = getTieredPrice(item, item.quantity);
    return acc + ((oldPrice - currentPrice) * item.quantity);
  }, 0);

  // Volume Discount
  const threshold = appSettings?.bulkDiscountThreshold || 2000;
  const percentage = appSettings?.bulkDiscountPercentage || 5;
  const isBulkDiscountEligible = bulkSubtotal >= threshold;
  const bulkVolumeDiscount = isBulkDiscountEligible ? (bulkSubtotal * (percentage / 100)) : 0;

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, addValuePackToCart, removeFromCart, updateQuantity, clearCart, 
      subtotal, cartCount, getTieredPrice,
      bulkItems, bulkSubtotal, bulkSavings, bulkVolumeDiscount, isBulkDiscountEligible,
      bulkThreshold: threshold, bulkPercentage: percentage
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
