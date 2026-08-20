"use client";

import React, { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CheckoutDrawer() {
  const { cart, cartTotal, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const [step, setStep] = useState<"address" | "payment" | "success">("address");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  if (!isCartOpen || Object.keys(cart).length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "address") setStep("payment");
    else if (step === "payment") {
      setStep("success");
      setTimeout(() => {
        clearCart();
        setIsCartOpen(false);
        setStep("address");
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="fixed inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} aria-hidden="true" />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-[-8px_0_32px_rgba(15,23,42,0.12)] flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-950">Checkout</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 touch-target"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === "address" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-medium text-slate-950">Delivery Address</h3>
              <div>
                <label htmlFor="address" className="block text-sm text-slate-600 mb-1">
                  Full Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                  placeholder="Flat 402, Green Park, New Delhi"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold touch-target transition-colors hover:bg-emerald-500">
                Continue to Payment
              </button>
            </form>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              <h3 className="font-medium text-slate-950">Payment Method</h3>
              <div className="space-y-2">
                {["UPI", "Card", "Net Banking", "Cash on Delivery"].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-emerald-300 transition-colors touch-target"
                  >
                    <input type="radio" name="payment" value={method} className="text-emerald-600" />
                    <span className="font-medium text-slate-950">{method}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold touch-target transition-colors hover:bg-emerald-500"
              >
                Place Order (₹{cartTotal})
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-950 mb-2">Order Placed!</h3>
              <p className="text-slate-500 text-sm mb-6">Your order has been confirmed. Delivery in 30 mins.</p>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 w-full text-left">
                <p className="font-medium text-emerald-800 mb-1">Order Summary</p>
                <p className="text-sm text-emerald-700">{Object.values(cart).length} items • ₹{cartTotal}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}