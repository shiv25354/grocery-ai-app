"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, PackageCheck, Truck, User, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const navItems = [
  { href: "/", icon: Mic, label: "Voice", tab: "voice" as const },
  { href: "/products", icon: PackageCheck, label: "Products", tab: "products" as const },
  { href: "/orders", icon: Truck, label: "Orders", tab: "orders" as const },
  { href: "/profile", icon: User, label: "Profile", tab: "profile" as const },
];

export default function NavigationWithCart() {
  const pathname = usePathname();
  const { cartCount, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  const getActiveTab = (path: string) => {
    if (path === "/") return "voice";
    if (path.startsWith("/products")) return "products";
    if (path.startsWith("/orders")) return "orders";
    if (path.startsWith("/profile")) return "profile";
    return "voice";
  };

  const activeTab = getActiveTab(pathname);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white border-t border-slate-100 shadow-[0_-4px_24px_rgba(15,23,42,0.06)]"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 py-2.5">
          {navItems.map(({ href, icon: Icon, label, tab }) => (
            <Link
              key={tab}
              href={href}
              className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 touch-target ${
                activeTab === tab
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
              aria-current={activeTab === tab ? "page" : undefined}
            >
              <Icon className={`w-6 h-6 ${activeTab === tab ? "text-emerald-600" : ""}`} aria-hidden="true" />
              <span className="text-xs font-medium leading-none">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-20 right-4 max-w-md mx-auto z-30 bg-emerald-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-emerald-600/30 flex items-center gap-2 text-sm font-semibold transition-all hover:bg-emerald-500 active:scale-[0.98] touch-target"
          aria-label={`View cart with ${cartCount} items`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>View Bag</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{cartCount}</span>
          <span className="text-xs">₹{cartTotal}</span>
        </button>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, updateQty, removeFromCart, clearCart, cartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-[-8px_0_32px_rgba(15,23,42,0.12)] flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-950">Your Cart</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 touch-target"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Object.entries(cart).length === 0 ? (
            <p className="text-center text-slate-500 py-10 text-sm">Cart is empty</p>
          ) : (
            Object.entries(cart).map(([key, item]) => (
              <div
                key={key}
                className="flex gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100"
              >
                <div className="w-16 h-16 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🛒</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-950 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">₹{item.price} / {item.unit}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(key, item.qty - 1)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded touch-target"
                      aria-label="Decrease quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-sm font-semibold text-slate-950 w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(key, item.qty + 1)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded touch-target"
                      aria-label="Increase quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeFromCart(key)}
                      className="ml-auto p-1.5 text-slate-400 hover:text-rose-400 touch-target"
                      aria-label="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-950">₹{item.price * item.qty}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {Object.keys(cart).length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-950">₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mb-4">
              <span>Delivery</span>
              <span className="text-emerald-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-950 mb-4">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
            <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold touch-target transition-colors hover:bg-emerald-500">
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 text-slate-500 text-sm font-medium touch-target"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}