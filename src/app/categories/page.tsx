'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Layers,
  Search,
  ArrowRight,
  Sparkles,
  Package,
  ChevronRight,
  FolderTree
} from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { products: number };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  subcategories: Subcategory[];
  _count: { products: number };
}

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchAllCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchesParent =
      cat.name.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q);

    const matchesSub = cat.subcategories?.some((s) =>
      s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
    );

    return matchesParent || matchesSub;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-brand-600 transition">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">All Departments & Categories</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Complete Indian Catalog Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Explore All 20+ Departments
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Browse through our expansive collection of 150+ subcategories across groceries, fashion, electronics, appliances, and home essentials.
          </p>

          {/* Search within Categories */}
          <div className="relative max-w-md pt-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category or subcategory (e.g. Rice, Kurti, Laptop)..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white/20 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5" />
          </div>
        </div>

        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Loading YashodhaMart category directory...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
          <FolderTree className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No categories matching &quot;{searchQuery}&quot;</h3>
          <p className="text-xs text-slate-500">Try searching for broader keywords like Grocery, Fashion, or Books.</p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-brand-500/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Department Header */}
                <div className="flex items-start gap-4 mb-3">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-600" />
                    </Link>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {cat.description || 'Explore deals and products in this department.'}
                    </p>
                  </div>
                </div>

                {/* Subcategories Chip List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Subcategories ({cat.subcategories?.length || 0})
                  </span>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {cat.subcategories?.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/categories/${cat.slug}?subcategory=${sub.slug}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-[11px] font-medium border border-slate-200/60 transition"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-brand-600" />
                  {cat._count?.products || 0} Products
                </span>

                <Link
                  href={`/categories/${cat.slug}`}
                  className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  View Department <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
