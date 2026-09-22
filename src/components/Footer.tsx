import Link from 'next/link';
import { Truck, ShieldCheck, RefreshCw, Headphones, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-brand-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free Express Shipping</h4>
              <p className="text-xs text-slate-400">On all orders above ₹500</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-brand-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Authentic Products</h4>
              <p className="text-xs text-slate-400">Directly from verified brands</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-brand-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Easy 7-Day Returns</h4>
              <p className="text-xs text-slate-400">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-brand-400">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Customer Support</h4>
              <p className="text-xs text-slate-400">Call or email us anytime</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          {/* Brand & About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg indian-gradient flex items-center justify-center text-white font-bold text-lg">
                Y
              </div>
              <span className="font-bold text-xl text-white">YashodhaMart</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              YashodhaMart is India&apos;s fastest growing full-stack online shopping platform providing quality fashion, electronics, home essentials, beauty, and daily groceries at wholesale prices.
            </p>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-sm font-bold text-white mb-3">Customer Care</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/profile" className="hover:text-brand-400 transition">My Account</Link></li>
              <li><Link href="/orders" className="hover:text-brand-400 transition">Track Your Order</Link></li>
              <li><Link href="/wishlist" className="hover:text-brand-400 transition">Saved Wishlist</Link></li>
              <li><Link href="/cart" className="hover:text-brand-400 transition">View Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="text-sm font-bold text-white mb-3">Top Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?category=fashion" className="hover:text-brand-400 transition">Fashion & Apparel</Link></li>
              <li><Link href="/products?category=electronics" className="hover:text-brand-400 transition">Electronics & Laptops</Link></li>
              <li><Link href="/products?category=mobile-accessories" className="hover:text-brand-400 transition">Mobile Accessories</Link></li>
              <li><Link href="/products?category=home-kitchen" className="hover:text-brand-400 transition">Home & Kitchen</Link></li>
            </ul>
          </div>

          {/* Admin & Security */}
          <div>
            <h5 className="text-sm font-bold text-white mb-3">Admin & Security</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/admin/login" className="text-brand-400 font-semibold hover:underline">Admin Portal Access</Link></li>
              <li><span className="text-slate-400">Encrypted SSL Payment Gateway</span></li>
              <li><span className="text-slate-400">Strict Privacy & Security Standards</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} YashodhaMart. All Rights Reserved. Built for College Project Demo.</p>
          <p className="flex items-center gap-1">
            Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Shoppers
          </p>
        </div>
      </div>
    </footer>
  );
}
