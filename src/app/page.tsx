import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/db';
import { Flame, Sparkles, TrendingUp, Tag, ShieldCheck } from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering

export default async function HomePage() {
  const [categories, featuredProducts, newArrivals, popularProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: 8,
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { isNewArrival: true, isActive: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { reviewCount: 'desc' },
      include: { category: true },
    }),
  ]);

  return (
    <div className="space-y-12">
      {/* 1. Hero Promotional Carousel */}
      <HeroCarousel />

      {/* 2. Featured Category Grid */}
      <CategoryGrid categories={categories} />

      {/* 3. Flash Sale / Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 fill-brand-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured Indian Deals</h2>
              <p className="text-xs text-slate-500 font-medium">Handpicked top deals with maximum savings</p>
            </div>
          </div>
          <Link
            href="/products?featured=true"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            Explore All Featured Deals →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Special Savings Banner */}
      <div className="rounded-3xl indian-gradient p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> EXTRA 10% INSTANT CASHBACK
          </span>
          <h3 className="text-2xl sm:text-3xl font-black">YashodhaMart Super Saver Festival</h3>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
            Use COD or Demo Online Payment at checkout for free priority delivery on orders over ₹500 across 25,000+ PIN codes!
          </p>
        </div>
        <Link
          href="/products"
          className="px-6 py-3 bg-white text-slate-900 font-black text-xs sm:text-sm rounded-2xl hover:bg-slate-100 shadow-lg transition whitespace-nowrap"
        >
          Shop Festival Sale Now
        </Link>
      </div>

      {/* 5. Trending New Arrivals */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 fill-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Arrivals</h2>
              <p className="text-xs text-slate-500 font-medium">Fresh additions to YashodhaMart catalog</p>
            </div>
          </div>
          <Link
            href="/products?newArrival=true"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            View New Arrivals →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Most Popular & Highly Rated */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Popular & Highest Rated</h2>
              <p className="text-xs text-slate-500 font-medium">Loved by thousands of shoppers across India</p>
            </div>
          </div>
          <Link
            href="/products?sort=popular"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            Explore Best Sellers →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Why Choose YashodhaMart */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
        <h3 className="text-center text-xl font-black text-slate-900 tracking-tight mb-2">
          Why Millions Shop at YashodhaMart
        </h3>
        <p className="text-center text-xs text-slate-500 mb-8 max-w-xl mx-auto">
          Built for reliability, authenticity, and transparent wholesale pricing for every household in India.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Direct Brand Warranty</h4>
            <p className="text-xs text-slate-500">100% genuine products sourced directly from manufacturers.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto font-black">
              ₹
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Wholesale Price Match</h4>
            <p className="text-xs text-slate-500">Get lowest prices with maximum discounts every single day.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto font-black">
              🚀
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Superfast Express Dispatch</h4>
            <p className="text-xs text-slate-500">Orders packed and dispatched within 24 hours of placement.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
