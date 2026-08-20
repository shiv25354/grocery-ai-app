"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Settings, Bell, Shield, MapPin, CreditCard, LogOut, Globe, Languages, ChevronRight, Check, Moon, Sun, Monitor, PackageCheck, Truck, Heart, HelpCircle, ChevronLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";

const LANGUAGES = [
  { code: "hinglish", name: "Hinglish", native: "Hinglish", flag: "🇮🇳" },
  { code: "hindi", name: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { code: "english", name: "English", native: "English", flag: "🇬🇧" },
];

const THEMES = [
  { code: "system", name: "System", icon: Monitor },
  { code: "light", name: "Light", icon: Sun },
  { code: "dark", name: "Dark", icon: Moon },
];

const SETTINGS_SECTIONS = [
  {
    title: "Account",
    items: [
      { id: "profile", label: "Edit Profile", icon: User, href: "/profile/edit" },
      { id: "addresses", label: "Saved Addresses", icon: MapPin, href: "/profile/addresses" },
      { id: "payment", label: "Payment Methods", icon: CreditCard, href: "/profile/payment" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { id: "language", label: "Language", icon: Languages },
      { id: "theme", label: "Theme", icon: Monitor },
      { id: "notifications", label: "Notifications", icon: Bell, href: "/profile/notifications" },
    ],
  },
  {
    title: "Support",
    items: [
      { id: "help", label: "Help Center", icon: HelpCircle, href: "/help" },
      { id: "privacy", label: "Privacy Policy", icon: Shield, href: "/privacy" },
      { id: "terms", label: "Terms of Service", icon: Shield, href: "/terms" },
    ],
  },
];

export default function ProfilePage() {
  const { cartCount: _cartCount } = useCart();
  const [language, setLanguage] = useState("hinglish");
  const [theme, setTheme] = useState("system");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const currentTheme = THEMES.find(t => t.code === theme) || THEMES[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-slate-950">Profile</h1>
        </div>
      </header>

      <div className="pt-20 px-4 space-y-6 pb-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-3xl">
              RJ
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-950 truncate">Rajesh Kumar</h2>
              <p className="text-sm text-slate-500">+91 98765 43210</p>
              <p className="text-xs text-slate-400 mt-1">rajesh@email.com</p>
            </div>
            <Link
              href="/profile/edit"
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors touch-target"
              aria-label="Edit profile"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={PackageCheck} label="Orders" value="24" color="emerald" />
          <StatCard icon={Heart} label="Saved" value="8" color="rose" />
          <StatCard icon={Truck} label="Deliveries" value="22" color="blue" />
        </div>

        {/* Language Selector */}
        <SettingCard
          icon={Languages}
          title="Language"
          subtitle={`Current: ${currentLang.name}`}
          action={
            <button
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl touch-target"
            >
              <Globe className="w-4 h-4" />
              Change
            </button>
          }
        />

        {/* Theme Selector */}
        <SettingCard
          icon={Monitor}
          title="Theme"
          subtitle={`Current: ${currentTheme.name}`}
          action={
            <button
              onClick={() => setShowThemeModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl touch-target"
            >
              <Monitor className="w-4 h-4" />
              Change
            </button>
          }
        />

        {/* Settings Sections */}
        {SETTINGS_SECTIONS.map((section) => (
          <SettingsSection key={section.title} section={section} />
        ))}

        {/* Logout */}
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-rose-600 font-medium rounded-xl hover:bg-rose-50 transition-colors touch-target">
          <LogOut className="w-5 h-5" />
          Log Out
        </button>

        <p className="text-center text-xs text-slate-400">
          QuickSetu v1.0.0 • Built with ❤️ for India
        </p>
      </div>

      {/* Language Modal */}
      {showLanguageModal && (
        <Modal onClose={() => setShowLanguageModal(false)} title="Select Language">
          <div className="space-y-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setShowLanguageModal(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors touch-target ${
                  language === lang.code
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-950">{lang.name}</p>
                  <p className="text-sm text-slate-500">{lang.native}</p>
                </div>
                {language === lang.code && <Check className="w-5 h-5 text-emerald-500" />}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Theme Modal */}
      {showThemeModal && (
        <Modal onClose={() => setShowThemeModal(false)} title="Select Theme">
          <div className="space-y-2">
            {THEMES.map((t) => (
              <button
                key={t.code}
                onClick={() => { setTheme(t.code); setShowThemeModal(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors touch-target ${
                  theme === t.code
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <t.icon className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-950">{t.name}</span>
                {theme === t.code && <Check className="w-5 h-5 text-emerald-500 ml-auto" />}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-100 p-4 text-center ${colors[color as keyof typeof colors] || colors.emerald}`}>
      <Icon className="w-6 h-6 mx-auto mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}

function SettingCard({ icon: Icon, title, subtitle, action }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string; action: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-slate-950 truncate">{title}</p>
          <p className="text-sm text-slate-500 truncate">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function SettingsSection({ section }: { section: { title: string; items: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; href?: string }[] } }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">{section.title}</h3>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {section.items.map((item) => (
          <Link
            key={item.id}
            href={item.href || "#"}
            className={`flex items-center gap-3 px-4 py-3 border-t border-slate-100 last:border-0 touch-target transition-colors hover:bg-slate-50 ${item.href ? "" : "text-slate-500"}`}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="font-medium text-slate-950">{item.label}</span>
            {item.href && <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-2xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 touch-target">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}