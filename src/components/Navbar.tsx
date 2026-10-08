'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Package,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  MapPin,
  Clock,
  Layers
} from 'lucide-react';

interface UserState {
  id: string;
  name: string;
  email: string;
  role: string;
  cartCount: number;
  wishlistCount: number;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const categories = [
    { name: 'All Products', slug: '', path: '/products' },
    { name: 'Grocery', slug: 'grocery', path: '/categories/grocery' },
    { name: 'Fruits & Veg', slug: 'fruits-vegetables', path: '/categories/fruits-vegetables' },
    { name: 'Dairy & Bakery', slug: 'dairy-bakery', path: '/categories/dairy-bakery' },
    { name: 'Electronics', slug: 'electronics', path: '/categories/electronics' },
    { name: 'Fashion', slug: 'fashion', path: '/categories/fashion' },
    { name: 'Footwear', slug: 'footwear', path: '/categories/footwear' },
    { name: 'Beauty & Care', slug: 'beauty-personal-care', path: '/categories/beauty-personal-care' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', path: '/categories/home-kitchen' },
    { name: 'Appliances', slug: 'appliances', path: '/categories/appliances' },
    { name: 'Books', slug: 'books', path: '/categories/books' },
    { name: 'Toys & Games', slug: 'toys-games', path: '/categories/toys-games' },
    { name: 'Baby Products', slug: 'baby-products', path: '/categories/baby-products' },
    { name: 'Sports & Fitness', slug: 'sports-fitness', path: '/categories/sports-fitness' },
    { name: 'Jewellery', slug: 'jewellery-accessories', path: '/categories/jewellery-accessories' },
    { name: 'Automotive', slug: 'automotive', path: '/categories/automotive' },
  ];

  const fetchAuthMe = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user state:', error);
    }
  };

  useEffect(() => {
    fetchAuthMe();
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsProfileOpen(false);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (pathname.startsWith('/admin')) {
    return null; // Admin pages use AdminSidebar layout
  }

  return (
    <header className="sticky top-0 z-50 shadow-sm transition-all duration-200">
      {/* Top Banner Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Yashodha Express
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-brand-400" /> Free 2-Day Delivery on orders over ₹500 across India!
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> Deliver to: <strong className="text-white font-medium">Bengaluru 560038</strong>
            </span>
            <span className="hidden md:inline">|</span>
            <Link href="/admin/login" className="hidden md:flex items-center gap-1 text-slate-400 hover:text-brand-400 transition">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl indian-gradient flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              Y
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Yashodha<span className="text-brand-600">Mart</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 -mt-1 tracking-widest uppercase">
                India&apos;s Smart Superstore
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-2xl relative items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, or categories (e.g. Kurta, Headphones, Spices)..."
                className="w-full pl-4 pr-12 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center justify-center transition"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-slate-700 hover:text-brand-600 transition flex flex-col items-center group"
            >
              <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium hidden sm:inline">Wishlist</span>
              {user && user.wishlistCount > 0 && (
                <span className="absolute top-0 right-1 sm:right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {user.wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-slate-700 hover:text-brand-600 transition flex flex-col items-center group"
            >
              <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium hidden sm:inline">Cart</span>
              {user && user.cartCount > 0 && (
                <span className="absolute top-0 right-1 sm:right-2 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {user.cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-brand-500 transition bg-slate-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</span>
                    <span className="text-[10px] text-slate-500">My Account</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-brand-600 font-medium transition"
                    >
                      <User className="w-4 h-4 text-slate-400" /> Profile & Addresses
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-brand-600 font-medium transition"
                    >
                      <Package className="w-4 h-4 text-slate-400" /> My Orders
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-brand-600 font-medium transition"
                    >
                      <Heart className="w-4 h-4 text-slate-400" /> Saved Wishlist
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold transition text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-brand-600 border border-slate-200 hover:border-brand-500 rounded-xl transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-4 pr-10 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-500">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Category Navigation Bar */}
        <nav className="bg-slate-900 text-white overflow-x-auto no-scrollbar hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex items-center space-x-6 text-xs font-medium py-2.5">
            <Link
              href="/categories"
              className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" /> All Departments
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.path}
                className="whitespace-nowrap hover:text-brand-400 transition flex items-center gap-1.5"
              >
                {cat.slug === '' && <Sparkles className="w-3.5 h-3.5 text-brand-400" />}
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Browse Categories</p>
            <Link
              href="/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              All 20 Departments →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-600 transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <Link href="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-600" /> Admin Login Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
