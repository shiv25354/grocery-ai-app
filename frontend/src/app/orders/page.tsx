"use client";

import React from "react";
import Link from "next/link";
import { PackageCheck, Truck, MapPin, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Order {
  id: string;
  date: string;
  status: "delivered" | "out-for-delivery" | "preparing" | "cancelled";
  items: { name: string; qty: number; price: number }[];
  total: number;
  deliveryAddress: string;
  deliveryTime?: string;
  deliveryPartner?: { name: string; phone: string; rating: number };
}

const ORDERS: Order[] = [
  {
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
    deliveryPartner: { name: "Rajesh Kumar", phone: "+91 98765 43210", rating: 4.9 },
  },
  {
    id: "ORD-20241219-003",
    date: "Dec 19, 2024 • 06:45 PM",
    status: "delivered",
    items: [
      { name: "Basmati Rice (5kg)", qty: 1, price: 550 },
      { name: "Red Onion (2kg)", qty: 1, price: 75 },
    ],
    total: 625,
    deliveryAddress: "Flat 402, Green Park, New Delhi",
    deliveryTime: "Delivered at 7:15 PM",
  },
  {
    id: "ORD-20241218-002",
    date: "Dec 18, 2024 • 11:20 AM",
    status: "delivered",
    items: [
      { name: "Banana (1 dozen)", qty: 2, price: 50 },
      { name: "Greek Yogurt (cup)", qty: 3, price: 85 },
    ],
    total: 355,
    deliveryAddress: "Flat 402, Green Park, New Delhi",
    deliveryTime: "Delivered at 11:50 AM",
  },
  {
    id: "ORD-20241217-001",
    date: "Dec 17, 2024 • 04:30 PM",
    status: "cancelled",
    items: [
      { name: "Dark Chocolate (bar)", qty: 2, price: 120 },
    ],
    total: 240,
    deliveryAddress: "Flat 402, Green Park, New Delhi",
  },
];

const STATUS_CONFIG = {
  "out-for-delivery": { label: "Out for Delivery", color: "bg-emerald-100 text-emerald-700", icon: Truck, pulse: true },
  "delivered": { label: "Delivered", color: "bg-slate-100 text-slate-700", icon: CheckCircle },
  "preparing": { label: "Preparing", color: "bg-amber-100 text-amber-700", icon: Truck },
  "cancelled": { label: "Cancelled", color: "bg-rose-100 text-rose-700", icon: XCircle },
};

export default function OrdersPage() {
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="p-4 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-950">My Orders</h1>
          {cartCount > 0 && (
            <Link
              href="/products"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl touch-target"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{cartCount} in cart</span>
            </Link>
          )}
        </header>

        {/* Live Delivery Highlight Card */}
        <LiveDeliveryCard order={ORDERS[0]} />

        {/* Order History */}
        <div>
          <h2 className="text-lg font-semibold text-slate-950 mb-3">Order History</h2>
          <div className="space-y-3">
            {ORDERS.slice(1).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        {ORDERS.length <= 1 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-950 font-semibold mb-1">No orders yet</h3>
            <p className="text-slate-500 text-sm mb-4">Start shopping to see your orders here</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl touch-target"
            >
              <PackageCheck className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function LiveDeliveryCard({ order }: { order: Order }) {
  const config = STATUS_CONFIG[order.status];

  return (
    <Link
      href="/orders/track"
      className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm touch-target"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-500">LIVE</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
                {config.label}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-950 truncate">Order {order.id}</p>
            <p className="text-xs text-slate-500">{order.date}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 mt-1" />
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <config.icon className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-950 text-sm">{order.deliveryTime}</p>
            <p className="text-xs text-slate-500 truncate">{order.deliveryAddress}</p>
          </div>
          {order.deliveryPartner && (
            <div className="text-right">
              <p className="text-xs text-slate-500">Delivery Partner</p>
              <p className="font-medium text-slate-950 text-sm">{order.deliveryPartner.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-amber-500">★</span>
                <span className="text-xs font-medium text-slate-700">{order.deliveryPartner.rating}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">{order.items.length} items</span>
          <span className="font-bold text-slate-950">₹{order.total}</span>
        </div>
      </div>
    </Link>
  );
}

function OrderCard({ order }: { order: Order }) {
  const config = STATUS_CONFIG[order.status];

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 touch-target">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-950">Order {order.id}</p>
          <p className="text-xs text-slate-500">{order.date}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color} flex-shrink-0`}>
          {config.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{item.name} × {item.qty}</span>
            <span className="text-slate-950 font-medium">₹{item.price * item.qty}</span>
          </div>
        ))}
        {order.items.length > 2 && (
          <div className="text-xs text-slate-500">+ {order.items.length - 2} more items</div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 truncate max-w-[200px]">{order.deliveryAddress}</span>
        </div>
        <span className="font-bold text-slate-950">₹{order.total}</span>
      </div>

      {order.status === "out-for-delivery" && (
        <Link
          href="/orders/track"
          className="mt-3 w-full text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 touch-target"
        >
          Track Live Delivery →
        </Link>
      )}
    </div>
  );
}