"use client";

import React from "react";
import { Search, ShoppingBag, Plus, Minus, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  category: "Fresh Produce" | "Dairy" | "Bakery" | "Staples";
  emoji: string;
  badge: string;
  price: number;
  unit: string;
  gradient: string;
}

const PRODUCTS: Product[] = [
  { id: "tomato-001", name: "Fresh Desi Tomato", category: "Fresh Produce", emoji: "🍅", badge: "Sourced Today", price: 35, unit: "kg", gradient: "from-emerald-400 to-green-600" },
  { id: "potato-001", name: "Fresh Potato (Aloo)", category: "Fresh Produce", emoji: "🥔", badge: "Farm Fresh", price: 30, unit: "kg", gradient: "from-green-400 to-emerald-600" },
  { id: "onion-001", name: "Red Onion (Pyaaz)", category: "Fresh Produce", emoji: "🧅", badge: "Nashik Special", price: 40, unit: "kg", gradient: "from-lime-400 to-green-600" },
  { id: "milk-001", name: "Full Cream Milk", category: "Dairy", emoji: "🥛", badge: "Amul Gold", price: 66, unit: "packet", gradient: "from-sky-400 to-blue-600" },
  { id: "yogurt-001", name: "Greek Yogurt", category: "Dairy", emoji: "🥣", badge: "High Protein", price: 85, unit: "cup", gradient: "from-blue-400 to-indigo-600" },
  { id: "bread-001", name: "Brown Bread", category: "Bakery", emoji: "🍞", badge: "Baked Fresh", price: 45, unit: "packet", gradient: "from-amber-400 to-orange-500" },
  { id: "rice-001", name: "Basmati Rice", category: "Staples", emoji: "🍚", badge: "Dehradun Basmati", price: 120, unit: "kg", gradient: "from-yellow-400 to-amber-600" },
  { id: "atta-001", name: "Whole Wheat Atta", category: "Staples", emoji: "🌾", badge: "100% Whole Wheat", price: 55, unit: "kg", gradient: "from-orange-400 to-amber-600" },
];

export default function Home() {
  const { cart, addToCart, updateQty, cartCount, cartTotal, setIsCartOpen } = useCart();

  const increment = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      qty: 1,
    });
  };

  const decrement = (product: Product) => {
    updateQty(product.id, (cart[product.id]?.qty || 0) - 1);
  };

  const cardBottom = cartCount > 0 ? "bottom-40" : "bottom-24";

  return (
    <div
      className="relative h-screen w-full max-w-md mx-auto overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* Top header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="px-4 py-2 bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm">
            <h1 className="text-base font-extrabold text-slate-950 leading-none">QuickSetu</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Reels shopping • 10-min delivery</p>
          </div>
          <button
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white/85 backdrop-blur-sm shadow-sm border border-slate-200"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </header>

      {/* Vertical Reels-style 1-by-1 snapping feed */}
      <div className="h-full snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
        {PRODUCTS.map((product) => {
          const qty = cart[product.id]?.qty || 0;

          return (
            <section
              key={product.id}
              className="snap-start h-screen w-full flex-shrink-0 relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient}`} />

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10rem] drop-shadow-xl">{product.emoji}</span>
              </div>

              {/* Item badges */}
              <div className="absolute top-24 left-4 right-4 z-10 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/90 text-emerald-700 text-xs font-bold shadow-sm">
                  {product.badge}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-950/70 text-white text-xs font-semibold backdrop-blur-sm">
                  {product.category}
                </span>
              </div>

              {/* Full-width responsive product card */}
              <div className={`absolute ${cardBottom} left-4 right-4 z-10`}>
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-950 text-lg truncate">{product.name}</p>
                      <p className="text-sm text-slate-500">
                        ₹{product.price} <span className="text-slate-400">/ {product.unit}</span>
                      </p>
                    </div>

                    {/* Quick quantity selector */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => decrement(product)}
                        disabled={qty === 0}
                        className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-target"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-slate-950 tabular-nums">{qty}</span>
                      <button
                        onClick={() => increment(product)}
                        className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors touch-target"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Floating View Bag pill with price aggregation */}
      {cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30"
          aria-label={`View bag with ${cartCount} items`}
        >
          <div className="bg-slate-950 rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.2)] flex items-center justify-between px-5 py-3.5 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {cartCount} Item{cartCount > 1 ? "s" : ""}
                </p>
                <p className="text-emerald-400 text-xs font-medium">₹{cartTotal}</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl">
              View Bag
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
