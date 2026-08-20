"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, Search, Sparkles, PackageCheck, Truck, User, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  subtitle: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  unit: string;
  weightOptions: { value: string; label: string; price: number }[];
  image: string;
  badge: string;
  category: string;
  emoji: string;
}

const PRODUCTS: Product[] = [
  {
    id: "tomato-001",
    name: "Fresh Desi Tomato",
    subtitle: "Tamatar",
    rating: 4.9,
    reviewCount: 2847,
    price: 35,
    unit: "kg",
    weightOptions: [
      { value: "500g", label: "500g", price: 20 },
      { value: "1kg", label: "1kg", price: 35 },
      { value: "2kg", label: "2kg", price: 68 },
      { value: "5kg", label: "5kg", price: 165 },
    ],
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80",
    badge: "Sourced Today",
    category: "vegetables",
    emoji: "🍅",
  },
  {
    id: "potato-001",
    name: "Fresh Potato (Aloo)",
    subtitle: "Aloo",
    rating: 4.8,
    reviewCount: 3421,
    price: 30,
    unit: "kg",
    weightOptions: [
      { value: "500g", label: "500g", price: 18 },
      { value: "1kg", label: "1kg", price: 30 },
      { value: "2kg", label: "2kg", price: 55 },
      { value: "5kg", label: "5kg", price: 130 },
    ],
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80",
    badge: "Farm Fresh",
    category: "vegetables",
    emoji: "🥔",
  },
  {
    id: "onion-001",
    name: "Red Onion (Pyaaz)",
    subtitle: "Pyaaz",
    rating: 4.7,
    reviewCount: 2156,
    price: 40,
    unit: "kg",
    weightOptions: [
      { value: "500g", label: "500g", price: 22 },
      { value: "1kg", label: "1kg", price: 40 },
      { value: "2kg", label: "2kg", price: 75 },
      { value: "5kg", label: "5kg", price: 180 },
    ],
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80",
    badge: "Nashik Special",
    category: "vegetables",
    emoji: "🧅",
  },
  {
    id: "bread-001",
    name: "Brown Bread",
    subtitle: "Whole Wheat",
    rating: 4.6,
    reviewCount: 1876,
    price: 45,
    unit: "packet",
    weightOptions: [
      { value: "400g", label: "400g", price: 45 },
      { value: "800g", label: "800g", price: 80 },
    ],
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    badge: "Baked Fresh",
    category: "bakery",
    emoji: "🍞",
  },
  {
    id: "milk-001",
    name: "Full Cream Milk",
    subtitle: "1 Litre",
    rating: 4.9,
    reviewCount: 4321,
    price: 66,
    unit: "packet",
    weightOptions: [
      { value: "500ml", label: "500ml", price: 35 },
      { value: "1L", label: "1 Litre", price: 66 },
      { value: "2L", label: "2 Litre", price: 125 },
    ],
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
    badge: "Amul Gold",
    category: "dairy",
    emoji: "🥛",
  },
  {
    id: "rice-001",
    name: "Basmati Rice",
    subtitle: "Premium Quality",
    rating: 4.8,
    reviewCount: 1567,
    price: 120,
    unit: "kg",
    weightOptions: [
      { value: "1kg", label: "1kg", price: 120 },
      { value: "5kg", label: "5kg", price: 550 },
      { value: "10kg", label: "10kg", price: 1050 },
    ],
    image: "https://images.unsplash.com/photo-1586201375761-83865011e356?w=800&q=80",
    badge: "Dehradun Basmati",
    category: "grains",
    emoji: "🍚",
  },
];

export default function ProductsPage() {
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="relative h-screen w-full max-w-md mx-auto bg-white overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <div className="h-full snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
        {PRODUCTS.map((PRODUCT, productIndex) => (
          <section
            key={PRODUCT.id}
            className="snap-start flex-shrink-0 relative z-10 min-h-screen"
          >
            <div className="relative h-screen">
              <div className="absolute inset-0 z-0">
                <Image
                  src={PRODUCT.image}
                  alt={PRODUCT.name}
                  fill
                  className="object-cover"
                  priority={productIndex === 0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent" />
              </div>

              <header className="relative z-10 flex items-center justify-between px-4 py-4 pt-6">
                <button
                  onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200 transition-all hover:shadow-md active:scale-[0.97]"
                  aria-label="Back to top"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-900" />
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                  <span className="text-emerald-700 text-xs font-semibold">⚡</span>
                  <span className="text-emerald-700 text-xs font-semibold">10m Express</span>
                </div>

                <button
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200 transition-all hover:shadow-md active:scale-[0.97]"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-slate-600" />
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-emerald-500" />
                </button>
              </header>

              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
            </div>

            <div className="relative bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(15,23,42,0.08)] min-h-[520px] pb-28">
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-2">
                      <span>{PRODUCT.emoji}</span>
                      <span>{PRODUCT.category}</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-950 tracking-tight leading-snug">
                      {PRODUCT.name} <span className="text-slate-500 font-normal">/ {PRODUCT.subtitle}</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span>★</span>
                        <span>{PRODUCT.rating}</span>
                      </span>
                      <span className="text-xs text-slate-400">({PRODUCT.reviewCount.toLocaleString()} reviews)</span>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ml-1">
                        {PRODUCT.badge}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-3xl font-extrabold text-slate-950 tabular-nums">₹{PRODUCT.weightOptions[1].price}</span>
                    {PRODUCT.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">₹{PRODUCT.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {PRODUCT.weightOptions.map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => {}}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        index === 1
                          ? "bg-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)]"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300"
                      }`}
                      aria-pressed={index === 1}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <ProductDetailCard product={PRODUCT} onAddToCart={addToCart} />
            </div>

            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 z-30 pointer-events-none">
              <CartSummary />
            </div>
          </section>
        ))}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-40" aria-label="Main navigation">
        <div className="bg-white border-t border-slate-100 rounded-t-[24px] shadow-[0_-4px_24px_rgba(15,23,42,0.06)] px-2 py-2.5">
          <div className="flex items-center justify-around">
            <NavItem icon={PackageCheck} label="Products" active={true} href="/products" />
            <NavItem icon={Truck} label="Orders" active={false} href="/orders" />
            <NavItem icon={User} label="Profile" active={false} href="/profile" />
          </div>
        </div>
      </nav>
    </div>
  );
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  qty: number;
}

function ProductDetailCard({ product, onAddToCart }: { product: Product; onAddToCart: (item: CartItem) => void }) {
  const { cart } = useCart();
  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const selectedWeightIndex = 1;

  const selectedOption = product.weightOptions[selectedWeightIndex];
  const currentPrice = selectedOption.price;
  const cartKey = `${product.id}-${selectedOption.value}`;
  const inCart = !!cart[cartKey];
  const cartQty = cart[cartKey]?.qty || 1;

  if (inCart) {
    setIsInCart(true);
    setQuantity(cartQty);
  }

  const handleAddToCart = () => {
    setIsInCart(true);
    setQuantity(1);
    onAddToCart({ id: cartKey, name: `${product.name} (${selectedOption.label})`, price: currentPrice, unit: selectedOption.label, qty: 1 });
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(0, quantity + delta);
    setQuantity(newQty);
    if (newQty === 0) {
      setIsInCart(false);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent">
      {isInCart ? (
        <div className="flex items-center justify-between gap-4 bg-slate-950 rounded-xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors touch-target"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-lg font-bold text-white tabular-nums w-8 text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors touch-target"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-semibold text-emerald-400">₹{quantity * currentPrice}</span>
        </div>
      ) : (
        <button
          onClick={handleAddToCart}
          className="w-full bg-slate-950 text-white font-semibold py-4 rounded-xl transition-all hover:bg-slate-800 active:scale-[0.985] flex items-center justify-center gap-2 touch-target"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>+ Add {selectedOption.label} to Bag (₹{currentPrice})</span>
        </button>
      )}
    </div>
  );
}

function CartSummary() {
  const { cartCount, cartTotal } = useCart();

  if (cartCount === 0) return null;

  return (
    <div className="pointer-events-auto bg-slate-950 rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.18)] flex items-center justify-between px-5 py-3.5 border border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{cartCount} Items</p>
          <p className="text-emerald-400 text-xs font-medium">₹{cartTotal}</p>
        </div>
      </div>
      <a
        href="/orders"
        className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-colors flex items-center gap-1.5 touch-target"
      >
        View Bag
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  href: string;
}

function NavItem({ icon: Icon, label, active, href }: NavItemProps) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 touch-target ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={`w-6 h-6 ${active ? "text-emerald-600" : ""}`} aria-hidden="true" />
      <span className="text-xs font-medium leading-none">{label}</span>
    </a>
  );
}