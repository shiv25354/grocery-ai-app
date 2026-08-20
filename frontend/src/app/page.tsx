"use client";

import React, { useState } from "react";
import { PackageCheck, Leaf, Wheat, Milk, ShoppingCart, Sparkles, Utensils } from "lucide-react";
import { useCart } from "@/context/CartContext";
import VoiceAssistant from "@/components/VoiceAssistant";

interface ExtractedItem {
  item_name: string;
  quantity?: number;
  unit?: string;
}

interface OrderSuccess {
  id: string;
}

const CATEGORIES = [
  { id: "vegetables", name: "Vegetables", icon: Leaf, color: "bg-emerald-100 text-emerald-700", emoji: "🥦" },
  { id: "fruits", name: "Fruits", icon: Sparkles, color: "bg-amber-100 text-amber-700", emoji: "🍎" },
  { id: "bakery", name: "Bakery", icon: Wheat, color: "bg-orange-100 text-orange-700", emoji: "🍞" },
  { id: "dairy", name: "Dairy", icon: Milk, color: "bg-blue-100 text-blue-700", emoji: "🥛" },
  { id: "grains", name: "Grains & Staples", icon: Wheat, color: "bg-yellow-100 text-yellow-700", emoji: "🌾" },
  { id: "snacks", name: "Snacks", icon: Utensils, color: "bg-purple-100 text-purple-700", emoji: "🍿" },
];

const PRODUCTS_CATALOG = [
  { id: "p1", name: "Fresh Potato (Aloo)", category: "vegetables", price: 30, unit: "kg", emoji: "🥔" },
  { id: "p2", name: "Onion (Pyaaz)", category: "vegetables", price: 40, unit: "kg", emoji: "🧅" },
  { id: "p3", name: "Tomato (Tamatar)", category: "vegetables", price: 35, unit: "kg", emoji: "🍅" },
  { id: "p4", name: "Brown Bread", category: "bakery", price: 45, unit: "packet", emoji: "🍞" },
  { id: "p5", name: "Full Cream Milk (1L)", category: "dairy", price: 66, unit: "packet", emoji: "🥛" },
  { id: "p6", name: "Basmati Rice", category: "grains", price: 120, unit: "kg", emoji: "🍚" },
  { id: "p7", name: "Banana (Kela)", category: "fruits", price: 50, unit: "dozen", emoji: "🍌" },
  { id: "p8", name: "Apple (Seb)", category: "fruits", price: 180, unit: "kg", emoji: "🍎" },
  { id: "p9", name: "Greek Yogurt", category: "dairy", price: 85, unit: "cup", emoji: "🥣" },
  { id: "p10", name: "Whole Wheat Atta", category: "grains", price: 55, unit: "kg", emoji: "🌾" },
  { id: "p11", name: "Masala Chips", category: "snacks", price: 20, unit: "packet", emoji: "🍟" },
  { id: "p12", name: "Dark Chocolate", category: "snacks", price: 120, unit: "bar", emoji: "🍫" },
];

export default function Home() {
  const { addToCart } = useCart();
  const [showCatalog, setShowCatalog] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccess | null>(null);

  const handleVoiceItems = (extractedItems: ExtractedItem[]) => {
    extractedItems.forEach((item) => {
      const queryName = (item.item_name || "").toLowerCase();
      const matched = PRODUCTS_CATALOG.find(
        (p) =>
          p.name.toLowerCase().includes(queryName) ||
          queryName.includes(p.name.toLowerCase().split(" ")[0])
      );

      if (matched) {
        addToCart({ id: matched.id, name: matched.name, price: matched.price, unit: matched.unit, qty: item.quantity || 1 });
      } else {
        addToCart({
          id: `custom_${Date.now()}`,
          name: item.item_name,
          price: 50,
          unit: item.unit || "unit",
          qty: item.quantity || 1,
        });
      }
    });
  };

  const handleCheckout = () => {
    setOrderSuccess({ id: `ORD-${Date.now()}` });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Ambient Voice Section */}
      <section className="p-4 pt-6 space-y-4">
        <header className="text-center space-y-2 px-4">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            QuickSetu
          </h1>
          <p className="text-slate-500 text-sm">Voice-first grocery shopping • 10-min express delivery</p>
        </header>

        <VoiceAssistant onItemsExtracted={handleVoiceItems} />

        {orderSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 mx-4 animate-slide-up">
            <PackageCheck className="w-6 h-6 flex-shrink-0 text-emerald-500" />
            <div>
              <p className="font-bold text-sm">Order Placed Successfully!</p>
              <p className="text-xs text-emerald-600">Order ID: {orderSuccess.id}</p>
            </div>
          </div>
        )}

        {/* Category Bento Grid - 3x2 */}
        <div className="mx-4 mt-2">
          <h2 className="text-lg font-semibold text-slate-950 mb-3 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            Shop by Category
          </h2>
<div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setShowCatalog(true)}
                className={`relative aspect-square rounded-2xl p-4 flex flex-col items-center justify-center gap-2 touch-target overflow-hidden ${cat.color} transition-all hover:shadow-lg active:scale-[0.98]`}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="font-semibold text-sm text-center">{cat.name}</span>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Add Popular Items */}
        <div className="mx-4 mt-6">
          <h2 className="text-lg font-semibold text-slate-950 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Popular Right Now
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCTS_CATALOG.slice(0, 6).map((prod) => (
              <button
                key={prod.id}
                onClick={() => addToCart({ id: prod.id, name: prod.name, price: prod.price, unit: prod.unit, qty: 1 })}
                className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col items-center gap-2 touch-target transition-all hover:shadow-md hover:border-emerald-200 active:scale-[0.98]"
              >
                <span className="text-3xl">{prod.emoji}</span>
                <div className="text-center w-full">
                  <p className="font-medium text-sm text-slate-950 truncate">{prod.name}</p>
                  <p className="text-xs text-slate-500">₹{prod.price} <span className="font-normal">/ {prod.unit}</span></p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Cart Indicator handled by NavigationWithCart */}
    </div>
  );
}