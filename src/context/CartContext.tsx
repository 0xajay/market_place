'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '@/lib/actions';

type CartItem = {
  id: number;
  cart_id: string;
  product_id: string;
  quantity: number;
  product: any;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart when user changes
  useEffect(() => {
    async function fetchCart() {
      if (!user) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const cart = await getCart(user.id);
        setItems(cart.items || []);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      alert("Please login to add items to your cart.");
      return;
    }
    
    // Optimistic update
    const existing = items.find(i => i.product_id === productId);
    // Since we don't have the full product optimistically easily, we just refetch after API call
    try {
      const updatedCart = await apiAddToCart(user.id, productId, quantity);
      setItems(updatedCart.items || []);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add to cart");
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;
    
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      
      const updatedCart = await apiUpdateCartItem(user.id, productId, quantity);
      setItems(updatedCart.items || []);
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;
    
    try {
      const updatedCart = await apiRemoveCartItem(user.id, productId);
      setItems(updatedCart.items || []);
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    
    try {
      await apiClearCart(user.id);
      setItems([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, isLoading, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
