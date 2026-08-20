"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Truck, CheckCircle, Clock, Phone, User, Navigation, Home, PackageCheck, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

const ORDER = {
  id: "ORD-20241220-001",
  date: "Dec 20, 2024 • 10:30 AM",
  status: "out-for-delivery",
  items: [
    { name: "Fresh Desi Tomato (1kg)", qty: 2, price: 35 },
    { name: "Full Cream Milk (1L)", qty: 1, price: 66 },
    { name: "Brown Bread (400g)", qty: 1, price: 45 },
  ],
  total: 181,
  deliveryAddress: "Flat 402, Green Park, New Delhi",
  deliveryTime: "Arriving in 12 mins",
  deliveryPartner: { name: "Rajesh Kumar", phone: "+91 98765 43210", rating: 4.9, avatar: "RK" },
  store: { name: "QuickSetu Green Park", address: "Shop 12, Green Park Market", coords: { lat: 28.5675, lng: 77.1900 } },
  customer: { coords: { lat: 28.5720, lng: 77.1950 } },
};

const STEPS = [
  { id: "confirmed", label: "Order Confirmed", icon: CheckCircle, time: "10:30 AM" },
  { id: "preparing", label: "Preparing", icon: PackageCheck, time: "10:35 AM" },
  { id: "picked", label: "Picked Up", icon: Truck, time: "10:45 AM" },
  { id: "delivering", label: "Out for Delivery", icon: Navigation, time: "10:50 AM" },
  { id: "delivered", label: "Delivered", icon: Home, time: "—" },
];

export default function TrackPage() {
  const { cartCount: _cartCount } = useCart();
  const [driverPosition, setDriverPosition] = useState(0.6);
  const [showCallModal, setShowCallModal] = useState(false);

  const currentStep = driverPosition >= 1 ? 4 : driverPosition > 0.75 ? 3 : driverPosition > 0.5 ? 2 : driverPosition > 0.25 ? 1 : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPosition((prev) => {
        const next = prev + 0.005;
        return next > 1 ? 1 : next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/orders" className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors touch-target">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-lg font-semibold text-slate-950">Track Order</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="pt-20 px-4 space-y-4">
        {/* Live Map Section */}
        <div className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="aspect-[4/3] relative overflow-hidden">
            <LiveMap
              driverPosition={driverPosition}
            />
            <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-950">Store</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg text-xs">
                <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                  <Truck className="w-3 h-3 text-emerald-500 rotate-45" />
                </div>
                <span className="font-medium text-slate-950">Driver</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg text-xs">
                <span className="w-2 h-2 rounded-full bg-slate-950" />
                <span className="font-medium text-slate-950">You</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950 text-sm">{ORDER.deliveryPartner.name}</p>
                  <p className="text-xs text-slate-500">{ORDER.deliveryPartner.phone} • ★ {ORDER.deliveryPartner.rating}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCallModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl touch-target"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-emerald-600">{ORDER.deliveryTime}</span>
              <span className="text-slate-400">•</span>
              <span>{ORDER.items.length} items • ₹{ORDER.total}</span>
            </div>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <h2 className="font-semibold text-slate-950 mb-4">Delivery Progress</h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100" />
            <div className="absolute left-6 top-0 h-full w-0.5 bg-emerald-500" style={{ height: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />

            {STEPS.map((step, index) => (
              <div key={step.id} className="relative flex items-start gap-4 mb-6 last:mb-0">
                <div className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${
                  index <= currentStep
                    ? "bg-emerald-500 text-white shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className={`font-medium text-sm ${index <= currentStep ? "text-slate-950" : "text-slate-500"}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${index <= currentStep ? "text-emerald-600" : "text-slate-400"}`}>
                    {step.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <h2 className="font-semibold text-slate-950 mb-3">Order Summary</h2>
          <div className="space-y-2 mb-3">
            {ORDER.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.name} × {item.qty}</span>
                <span className="text-slate-950 font-medium">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
            <span className="text-slate-500">Total</span>
            <span className="font-bold text-slate-950">₹{ORDER.total}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Delivery to</p>
            <p className="text-sm text-slate-950 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {ORDER.deliveryAddress}
            </p>
          </div>
        </div>

        {/* Delivery Partner Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <h2 className="font-semibold text-slate-950 mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Delivery Partner
          </h2>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
              {ORDER.deliveryPartner.avatar}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-950">{ORDER.deliveryPartner.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-amber-500">★ {ORDER.deliveryPartner.rating}</span>
                <span className="text-xs text-slate-400">124 deliveries</span>
              </div>
            </div>
            <button
              onClick={() => setShowCallModal(true)}
              className="p-2 bg-emerald-600 text-white rounded-xl touch-target"
            >
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowCallModal(false)}>
          <div className="w-full max-w-md bg-white rounded-t-2xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-950">Call Delivery Partner</h3>
              <button onClick={() => setShowCallModal(false)} className="p-2 text-slate-400 hover:text-slate-600 touch-target">
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600 font-bold text-2xl">
                {ORDER.deliveryPartner.avatar}
              </div>
              <p className="text-xl font-bold text-slate-950">{ORDER.deliveryPartner.name}</p>
              <p className="text-slate-500 mt-1">{ORDER.deliveryPartner.phone}</p>
            </div>
            <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold touch-target flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Call Now
            </button>
            <button onClick={() => setShowCallModal(false)} className="w-full mt-3 text-slate-500 text-sm font-medium touch-target">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveMap({ driverPosition }: { driverPosition: number }) {
  return (
    <div className="relative w-full h-full bg-slate-100">
      <canvas
        className="w-full h-full"
        width={400}
        height={300}
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) drawMap(ctx, driverPosition);
          }
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <div
            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-emerald-500 border-3 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ left: `${20 + driverPosition * 360}px` }}
          />
        </div>
      </div>
    </div>
  );
}

function drawMap(ctx: CanvasRenderingContext2D, progress: number) {
  const width = 400;
  const height = 300;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= width; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for (let i = 0; i <= height; i += 20) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(20, 150);
  ctx.bezierCurveTo(100, 80, 200, 220, 380, 150);
  ctx.stroke();
  ctx.setLineDash([]);

  const pathLength = 360;
  const driverX = 20 + progress * pathLength;
  const driverY = 150 + Math.sin(progress * Math.PI * 2) * 30;

  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(driverX, driverY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(20, 150, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(380, 150, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "10px system-ui";
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "center";
  ctx.fillText("STORE", 20, 170);
  ctx.fillText("YOU", 380, 170);
}