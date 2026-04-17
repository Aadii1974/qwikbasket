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
    if (user?.role !== 'b2b' || !user?.isApproved) return product.b2cNewPrice || 0;

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

  const addToCart = (product, quantity = 1) => {
    let minQty = 1;
    if (user?.role === 'b2b' && user?.isApproved) {
      minQty = product.minB2BQty || 1;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const newQty = existing.quantity + (quantity >= minQty ? quantity : minQty);
        return prev.map(item => item.id === product.id ? { ...item, quantity: newQty } : item);
      }
      return [...prev, { ...product, quantity: quantity >= minQty ? quantity : minQty }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((acc, item) => {
    const currentPrice = getTieredPrice(item, item.quantity);
    return acc + (currentPrice * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, cartCount, getTieredPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
