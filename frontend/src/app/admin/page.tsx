"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Truck, 
  Phone, 
  MapPin, 
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Package,
  Volume2,
  VolumeX
} from "lucide-react";
import api from "@/lib/api";

interface OrderItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

interface Order {
  id: string;
  user_id: string;
  phone_number: string;
  delivery_address: string;
  total_amount: number;
  items: OrderItem[];
  status: "confirmed" | "packing" | "out_for_delivery" | "delivered";
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousOrderCount = useRef<number>(0);

  // Play audio notification chime using Web Audio API
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio context might be restricted before first user interaction
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/v1/orders/all");
      if (res.data.orders) {
        const fetched: Order[] = res.data.orders;
        
        // Detect new order arrival and trigger sound
        if (previousOrderCount.current > 0 && fetched.length > previousOrderCount.current) {
          playNotificationSound();
        }
        previousOrderCount.current = fetched.length;
        setOrders(fetched);
      }
    } catch (err) {
      console.error("Order fetch error:", err);
    }
  };

  // Auto-polling every 5 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string, nextStatus: Order["status"]) => {
    // Optimistic UI Update
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: nextStatus } : ord))
    );

    try {
      await api.patch(`/api/v1/orders/${orderId}/status`, {
        status: nextStatus,
      });
    } catch (err) {
      console.error("Failed to update status on server:", err);
    }
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== "delivered").length;
  const completedOrdersCount = orders.filter((o) => o.status === "delivered").length;

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "confirmed":
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> New Order</span>;
      case "packing":
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Packing</span>;
      case "out_for_delivery":
        return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1"><Truck className="w-3 h-3" /> Out for Delivery</span>;
      case "delivered":
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Delivered</span>;
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Store Owner Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">Real-time Order Processing & Fulfillment Hub</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition ${
                soundEnabled 
                  ? "bg-slate-900 border-emerald-500/50 text-emerald-400" 
                  : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
              title={soundEnabled ? "Sound Alert Enabled" : "Sound Muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setLoading(true);
                fetchOrders().finally(() => setLoading(false));
              }}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-medium transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Revenue</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">₹{totalRevenue}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Processing</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{activeOrdersCount}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Completed Orders</p>
              <h3 className="text-2xl font-black text-slate-200 mt-1">{completedOrdersCount}</h3>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl text-slate-300">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(["confirmed", "packing", "out_for_delivery", "delivered"] as const).map((colStatus) => {
            const columnOrders = orders.filter((o) => o.status === colStatus);
            
            return (
              <div key={colStatus} className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col min-h-[520px]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {colStatus.replace(/_/g, " ")}
                  </h2>
                  <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-bold">
                    {columnOrders.length}
                  </span>
                </div>

                <div className="space-y-3.5 flex-1 overflow-y-auto pr-0.5">
                  {columnOrders.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-[11px] text-slate-600">
                      No orders in this stage
                    </div>
                  ) : (
                    columnOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-slate-950 border border-slate-800/90 rounded-xl p-3.5 space-y-3 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-emerald-400 font-bold">{order.id}</span>
                          {getStatusBadge(order.status)}
                        </div>

                        {/* Order Items Breakdown */}
                        <div className="bg-slate-900/70 rounded-lg p-2.5 text-xs space-y-1 border border-slate-800/50">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-slate-300">
                              <span className="truncate max-w-[140px]">{it.quantity} {it.unit} {it.product_name}</span>
                              <span className="font-semibold text-slate-400 ml-2">₹{it.quantity * it.unit_price}</span>
                            </div>
                          ))}
                          <div className="border-t border-slate-800 pt-1.5 mt-1 flex justify-between font-bold text-emerald-400 text-xs">
                            <span>Grand Total</span>
                            <span>₹{order.total_amount}</span>
                          </div>
                        </div>

                        {/* Customer Information */}
                        <div className="text-[11px] text-slate-400 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span>{order.phone_number}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span className="truncate">{order.delivery_address}</span>
                          </div>
                        </div>

                        {/* Transition Actions */}
                        <div className="pt-1">
                          {order.status === "confirmed" && (
                            <button
                              onClick={() => updateStatus(order.id, "packing")}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 transition"
                            >
                              Start Packing <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {order.status === "packing" && (
                            <button
                              onClick={() => updateStatus(order.id, "out_for_delivery")}
                              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 transition"
                            >
                              Dispatch Order <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {order.status === "out_for_delivery" && (
                            <button
                              onClick={() => updateStatus(order.id, "delivered")}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 transition"
                            >
                              Mark Delivered <CheckCircle className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}
