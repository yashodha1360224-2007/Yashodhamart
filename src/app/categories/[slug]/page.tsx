'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import ProductSortSelect from '@/components/ProductSortSelect';
import {
  Layers,
  ChevronRight,
  PackageX,
  Sparkles,
  Filter,
  Check,
  ArrowLeft
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

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPercent: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string;
  category: { id: string; name: string; slug: string };
  subcategory?: { id: string; name: string; slug: string } | null;
}

function CategoryDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = params.slug as string;
  const currentSubcategory = searchParams.get('subcategory') || '';
  const currentSort = searchParams.get('sort') || 'popular';

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch category details and subcategories
  useEffect(() => {
    async function loadCategory() {
      try {
        const res = await fetch(`/api/categories?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setCategory(data.category);
        }
      } catch (err) {
        console.error('Failed to load category:', err);
      } finally {
        setLoadingCategory(false);
      }
    }
    loadCategory();
  }, [slug]);

  // Fetch products in this category (filtered by subcategory if specified)
  const fetchCategoryProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const qParams = new URLSearchParams();
      qParams.set('category', slug);
      if (currentSubcategory) qParams.set('subcategory', currentSubcategory);
      if (currentSort) qParams.set('sort', currentSort);

      const res = await fetch(`/api/products?${qParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products for category:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, [slug, currentSubcategory, currentSort]);

  useEffect(() => {
    fetchCategoryProducts();
  }, [fetchCategoryProducts]);

  const handleSelectSubcategory = (subSlug: string) => {
    const updated = new URLSearchParams(Array.from(searchParams.entries()));
    if (subSlug) {
      updated.set('subcategory', subSlug);
    } else {
      updated.delete('subcategory');
    }
    router.push(`/categories/${slug}?${updated.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    const updated = new URLSearchParams(Array.from(searchParams.entries()));
    updated.set('sort', newSort);
    router.push(`/categories/${slug}?${updated.toString()}`);
  };

  if (loadingCategory) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading department details...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Department Not Found</h2>
        <p className="text-xs text-slate-500">
          The category you are looking for does not exist or has been relocated.
        </p>
        <Link
          href="/categories"
          className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow inline-block"
        >
          View All Categories
        </Link>
      </div>
    );
  }

  const activeSubcategoryObj = category.subcategories?.find(
    (s) => s.slug === currentSubcategory
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link href="/" className="hover:text-brand-600 transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-brand-600 transition">
          All Categories
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{category.name}</span>
        {activeSubcategoryObj && (
          <>
            <span>/</span>
            <span className="text-brand-600 font-bold">{activeSubcategoryObj.name}</span>
          </>
        )}
      </nav>

      {/* Hero Category Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="space-y-3 z-10 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-brand-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Verified Department Collection
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {activeSubcategoryObj ? `${activeSubcategoryObj.name}` : category.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {activeSubcategoryObj?.description ||
              category.description ||
              'Explore handpicked products, authentic quality, and wholesale pricing.'}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-slate-500 font-medium pt-1">
            <span>
              <strong>{category.subcategories?.length || 0}</strong> Subcategories
            </span>
            <span>•</span>
            <span>
              <strong>{products.length}</strong> Products Displayed
            </span>
          </div>
        </div>

        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-slate-100 shadow-md border border-slate-200 flex-shrink-0">
          <Image
            src={category.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'}
            alt={category.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Subcategory Filter Carousel / Chips Navigation */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-brand-600" /> Filter by Subcategory
            </span>
            {currentSubcategory && (
              <button
                onClick={() => handleSelectSubcategory('')}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Clear Subcategory Filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {/* All Products Chip */}
            <button
              onClick={() => handleSelectSubcategory('')}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                !currentSubcategory
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {!currentSubcategory && <Check className="w-3.5 h-3.5" />}
              All {category.name}
            </button>

            {/* Individual Subcategories */}
            {category.subcategories.map((sub) => {
              const isActive = currentSubcategory === sub.slug;
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubcategory(sub.slug)}
                  className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-brand-600 text-white font-bold shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  {isActive && <Check className="w-3.5 h-3.5" />}
                  {sub.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Products Section Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {activeSubcategoryObj ? activeSubcategoryObj.name : `All ${category.name} Products`}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Showing {products.length} products with standard 2-Day Express Dispatch
          </p>
        </div>

        <ProductSortSelect currentSort={currentSort} onSortChange={handleSortChange} />
      </div>

      {/* Products Listing Grid */}
      {loadingProducts ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <PackageX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Products in this selection</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We currently don&apos;t have items matching this subcategory. You can explore other subcategories or view all products.
          </p>
          <button
            onClick={() => handleSelectSubcategory('')}
            className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-brand-700 transition"
          >
            View All {category.name}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-slate-500">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Loading department...
        </div>
      }
    >
      <CategoryDetailContent />
    </Suspense>
  );
}
