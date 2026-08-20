"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, Search, Sparkles, Mic, PackageCheck, Truck, User } from "lucide-react";
import { usePathname } from "next/navigation";

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
}

const PRODUCT: Product = {
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
};

const CART_ITEMS = 3;
const CART_TOTAL = 112;

export default function ProductReelPage() {
  const pathname = usePathname();
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedOption = PRODUCT.weightOptions[selectedWeightIndex];
  const currentPrice = selectedOption.price;

  const handleAddToCart = () => {
    setIsInCart(true);
    setQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(0, prev + delta));
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div
      ref={scrollRef}
      className="relative h-screen w-full max-w-[390px] mx-auto bg-white overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <div className="h-full snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
        <section className="snap-start flex-shrink-0 h-screen relative">
          <div className="absolute inset-0 z-0">
            <Image
              src={PRODUCT.image}
              alt={PRODUCT.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent" />
          </div>

          <header className="relative z-10 flex items-center justify-between px-4 py-4 pt-6">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200 transition-all hover:shadow-md active:scale-[0.97]"
              aria-label="Back"
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
        </section>

        <section className="snap-start flex-shrink-0 relative z-20">
          <div className="relative bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(15,23,42,0.08)] min-h-[520px] pb-28">
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
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
                  <span className="text-3xl font-extrabold text-slate-950 tabular-nums">₹{currentPrice}</span>
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
                    onClick={() => setSelectedWeightIndex(index)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      selectedWeightIndex === index
                        ? "bg-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)]"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300"
                    }`}
                    aria-pressed={selectedWeightIndex === index}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent">
              {isInCart ? (
                <div className="flex items-center justify-between gap-4 bg-slate-950 rounded-xl px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-lg font-bold text-white tabular-nums w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      aria-label="Increase quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">₹{quantity * currentPrice}</span>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-slate-950 text-white font-semibold py-4 rounded-xl transition-all hover:bg-slate-800 active:scale-[0.985] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>+ Add {selectedOption.label} to Bag (₹{currentPrice})</span>
                </button>
              )}
            </div>
          </div>

          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 z-30 pointer-events-none">
            <div className="pointer-events-auto bg-slate-950 rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.18)] flex items-center justify-between px-5 py-3.5 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
                  <PackageCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{CART_ITEMS} Items</p>
                  <p className="text-emerald-400 text-xs font-medium">₹{CART_TOTAL}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-colors flex items-center gap-1.5">
                View Bag
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-40" aria-label="Main navigation">
        <div className="bg-white border-t border-slate-100 rounded-t-[24px] shadow-[0_-4px_24px_rgba(15,23,42,0.06)] px-2 py-2.5">
          <div className="flex items-center justify-around">
            <NavItem
              icon={Mic}
              label="Voice AI"
              active={pathname === "/voice"}
              href="/voice"
            />
            <NavItem
              icon={PackageCheck}
              label="Products"
              active={pathname === "/product/reel" || pathname === "/"}
              href="/product/reel"
            />
            <NavItem
              icon={Truck}
              label="My Orders"
              active={pathname === "/orders"}
              href="/orders"
            />
            <NavItem
              icon={User}
              label="Profile"
              active={pathname === "/profile"}
              href="/profile"
            />
          </div>
        </div>
      </nav>
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
      className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 ${
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