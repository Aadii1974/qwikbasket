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

  const addToCart = (product, quantity = 1) => {
    let minQty = 1;
    if (user?.role === 'b2b' && user?.isApproved) {
      minQty = product.minB2BQty || 1;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + (quantity >= minQty ? quantity : minQty) } : item);
      }
      return [...prev, { ...product, quantity: quantity >= minQty ? quantity : minQty }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  }

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = (user?.role === 'b2b' && user?.isApproved) ? item.b2bPrice : item.b2cPrice;
    return acc + (price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
