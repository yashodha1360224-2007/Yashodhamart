'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ProductFilterSidebar from '@/components/ProductFilterSidebar';
import ProductSortSelect from '@/components/ProductSortSelect';
import { X, PackageX, Sparkles } from 'lucide-react';

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
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const minDiscount = searchParams.get('minDiscount') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || 'popular';
  const featured = searchParams.get('featured') || '';
  const newArrival = searchParams.get('newArrival') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category) params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (minRating) params.set('minRating', minRating);
      if (minDiscount) params.set('minDiscount', minDiscount);
      if (inStock) params.set('inStock', 'true');
      if (sort) params.set('sort', sort);
      if (featured) params.set('featured', featured);
      if (newArrival) params.set('newArrival', newArrival);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch catalog:', error);
    } finally {
      setLoading(false);
    }
  }, [query, category, subcategory, minPrice, maxPrice, minRating, minDiscount, inStock, sort, featured, newArrival]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateURLParams = (newParams: Record<string, string | boolean | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === false) {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });

    router.push(`/products?${current.toString()}`);
  };

  const handleClearSearch = () => {
    updateURLParams({ q: undefined });
  };

  const activeCategoryObj = categories.find((c) => c.slug === category);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            {query
              ? `Search Results for "${query}"`
              : activeCategoryObj
              ? `${activeCategoryObj.name} Department`
              : 'Complete Product Catalog'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Showing {products.length} products with verified Indian pricing & deals
          </p>
        </div>

        <ProductSortSelect
          currentSort={sort}
          onSortChange={(newSort) => updateURLParams({ sort: newSort })}
        />
      </div>

      {(query || category || subcategory || minPrice || maxPrice || minRating || minDiscount || inStock) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">Active Filters:</span>

          {query && (
            <span className="bg-brand-50 text-brand-700 font-bold px-3 py-1 rounded-full border border-brand-200 flex items-center gap-1">
              Search: &quot;{query}&quot;
              <button onClick={handleClearSearch} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {category && (
            <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1">
              Category: {activeCategoryObj?.name || category}
              <button onClick={() => updateURLParams({ category: undefined, subcategory: undefined })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {subcategory && (
            <span className="bg-brand-50 text-brand-700 font-bold px-3 py-1 rounded-full border border-brand-200 flex items-center gap-1">
              Subcategory: {subcategory}
              <button onClick={() => updateURLParams({ subcategory: undefined })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1">
              Price: ₹{minPrice || '0'} - ₹{maxPrice || 'Any'}
              <button onClick={() => updateURLParams({ minPrice: undefined, maxPrice: undefined })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={() => router.push('/products')}
            className="text-xs text-rose-600 font-bold hover:underline ml-2"
          >
            Clear All Filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-1">
          <ProductFilterSidebar
            categories={categories}
            selectedCategory={category}
            selectedSubcategory={subcategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minRating={minRating}
            minDiscount={minDiscount}
            inStock={inStock}
            onFilterChange={(filters) =>
              updateURLParams({
                category: filters.category,
                subcategory: filters.subcategory,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                minRating: filters.minRating,
                minDiscount: filters.minDiscount,
                inStock: filters.inStock,
              })
            }
            onReset={() => router.push('/products')}
          />
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse p-4 border border-slate-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Products Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn&apos;t find any products matching your search query or selected filters. Try broadening your keywords or removing filters.
              </p>
              <button
                onClick={() => router.push('/products')}
                className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-brand-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-500">Loading YashodhaMart catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
