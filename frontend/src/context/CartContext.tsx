"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type NavTab = "voice" | "products" | "orders" | "profile";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  qty: number;
}

interface CartContextType {
  cart: Record<string, CartItem>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productKey: string) => void;
  updateQty: (productKey: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [activeTab, setActiveTab] = useState<NavTab>("voice");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: existing
          ? { ...existing, qty: existing.qty + item.qty }
          : item,
      };
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productKey: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productKey];
      return next;
    });
  };

  const updateQty = (productKey: string, qty: number) => {
    setCart((prev) => {
      if (!prev[productKey]) return prev;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[productKey];
        return next;
      }
      return { ...prev, [productKey]: { ...prev[productKey], qty } };
    });
  };

  const clearCart = () => setCart({});

  const cartCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartCount,
        cartTotal,
        activeTab,
        setActiveTab,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}