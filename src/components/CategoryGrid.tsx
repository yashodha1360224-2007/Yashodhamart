import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CategoryProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  subcategories?: any[];
  _count?: {
    products?: number;
  };
}

export default function CategoryGrid({ categories }: { categories: CategoryProps[] }) {
  // Show only top-level parent categories
  const parentCategories = categories.filter((c) => !c.parentId);
  // Display top 10 on home grid with View All leading to /categories
  const displayCategories = parentCategories.slice(0, 10);

  return (
    <div className="my-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-orange-100 text-brand-600">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shop by Department</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Explore 20+ specialized Indian e-commerce categories and 150+ subcategories
          </p>
        </div>

        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline group"
        >
          <span>View All 20 Departments</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3 sm:gap-4">
        {displayCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-500 transition-all duration-300 text-center"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2.5 bg-slate-100 group-hover:scale-105 transition-transform duration-300 shadow-xs">
              <Image
                src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'}
                alt={cat.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-1 leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Quick Category Highlights Banner */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900">Trending Now:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {parentCategories.slice(0, 7).map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="px-2.5 py-1 bg-white hover:bg-brand-50 hover:text-brand-600 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 transition"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/categories"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
        >
          Explore All Categories & Subcategories →
        </Link>
      </div>
    </div>
  );
}
