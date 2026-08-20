import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import NavigationWithCart from "@/components/NavigationWithCart";
import CheckoutDrawer from "@/components/CheckoutDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickSetu - Voice Grocery Shopping",
  description: "Smart voice-first grocery shopping with instant delivery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col relative pb-20">
        <CartProvider>
          <main className="flex-1 max-w-md mx-auto w-full min-h-screen">
            {children}
          </main>
          <NavigationWithCart />
          <CheckoutDrawer />
        </CartProvider>
      </body>
    </html>
  );
}