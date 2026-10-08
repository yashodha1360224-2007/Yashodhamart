'use client';

import { useState, useEffect } from 'react';
import { Filter, RotateCcw, Star, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: Subcategory[];
}

interface FilterProps {
  categories: Category[];
  selectedCategory: string;
  selectedSubcategory?: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  minDiscount: string;
  inStock: boolean;
  onFilterChange: (filters: {
    category: string;
    subcategory?: string;
    minPrice: string;
    maxPrice: string;
    minRating: string;
    minDiscount: string;
    inStock: boolean;
  }) => void;
  onReset: () => void;
}

export default function ProductFilterSidebar({
  categories,
  selectedCategory,
  selectedSubcategory = '',
  minPrice,
  maxPrice,
  minRating,
  minDiscount,
  inStock,
  onFilterChange,
  onReset,
}: FilterProps) {
  const [cat, setCat] = useState(selectedCategory);
  const [subCat, setSubCat] = useState(selectedSubcategory);
  const [minP, setMinP] = useState(minPrice);
  const [maxP, setMaxP] = useState(maxPrice);
  const [rating, setRating] = useState(minRating);
  const [discount, setDiscount] = useState(minDiscount);
  const [stock, setStock] = useState(inStock);

  useEffect(() => {
    setCat(selectedCategory);
    setSubCat(selectedSubcategory);
  }, [selectedCategory, selectedSubcategory]);

  const applyFilters = () => {
    onFilterChange({
      category: cat,
      subcategory: subCat,
      minPrice: minP,
      maxPrice: maxP,
      minRating: rating,
      minDiscount: discount,
      inStock: stock,
    });
  };

  const handleReset = () => {
    setCat('');
    setSubCat('');
    setMinP('');
    setMaxP('');
    setRating('');
    setDiscount('');
    setStock(false);
    onReset();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" /> Filter Products
        </h3>
        <button
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 font-medium transition"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Category & Subcategory Filter */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Departments
        </h4>
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1 text-xs">
          <button
            onClick={() => {
              setCat('');
              setSubCat('');
              onFilterChange({
                category: '',
                subcategory: '',
                minPrice: minP,
                maxPrice: maxP,
                minRating: rating,
                minDiscount: discount,
                inStock: stock,
              });
            }}
            className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-medium transition ${
              cat === '' ? 'bg-brand-50 text-brand-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Departments</span>
            {cat === '' && <Check className="w-3.5 h-3.5" />}
          </button>

          {categories.map((c) => {
            const isCatActive = cat === c.slug;
            const hasSubcats = c.subcategories && c.subcategories.length > 0;

            return (
              <div key={c.id} className="space-y-0.5">
                <button
                  onClick={() => {
                    const newCat = isCatActive && !subCat ? '' : c.slug;
                    setCat(newCat);
                    setSubCat('');
                    onFilterChange({
                      category: newCat,
                      subcategory: '',
                      minPrice: minP,
                      maxPrice: maxP,
                      minRating: rating,
                      minDiscount: discount,
                      inStock: stock,
                    });
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-medium transition ${
                    isCatActive
                      ? 'bg-brand-50 text-brand-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="line-clamp-1">{c.name}</span>
                  {isCatActive && !subCat && <Check className="w-3.5 h-3.5" />}
                </button>

                {/* Subcategories if category active */}
                {isCatActive && hasSubcats && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-brand-200 ml-3">
                    {c.subcategories?.map((sub) => {
                      const isSubActive = subCat === sub.slug;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            const newSub = isSubActive ? '' : sub.slug;
                            setSubCat(newSub);
                            onFilterChange({
                              category: c.slug,
                              subcategory: newSub,
                              minPrice: minP,
                              maxPrice: maxP,
                              minRating: rating,
                              minDiscount: discount,
                              inStock: stock,
                            });
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition ${
                            isSubActive
                              ? 'bg-brand-100 text-brand-800 font-bold'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <span className="line-clamp-1">{sub.name}</span>
                          {isSubActive && <Check className="w-3 h-3 text-brand-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Price Range (₹)
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Min Price</label>
            <input
              type="number"
              placeholder="e.g. 100"
              value={minP}
              onChange={(e) => setMinP(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Max Price</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={maxP}
              onChange={(e) => setMaxP(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Customer Rating
        </h4>
        <div className="space-y-1 text-xs">
          {['4', '3', '2'].map((r) => (
            <button
              key={r}
              onClick={() => {
                const newR = rating === r ? '' : r;
                setRating(newR);
                onFilterChange({
                  category: cat,
                  subcategory: subCat,
                  minPrice: minP,
                  maxPrice: maxP,
                  minRating: newR,
                  minDiscount: discount,
                  inStock: stock,
                });
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium transition ${
                rating === r
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span className="ml-1 font-bold">{r}★ & above</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Discount % */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Discount Offers
        </h4>
        <div className="space-y-1 text-xs">
          {['10', '25', '40'].map((d) => (
            <button
              key={d}
              onClick={() => {
                const newD = discount === d ? '' : d;
                setDiscount(newD);
                onFilterChange({
                  category: cat,
                  subcategory: subCat,
                  minPrice: minP,
                  maxPrice: maxP,
                  minRating: rating,
                  minDiscount: newD,
                  inStock: stock,
                });
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition ${
                discount === d
                  ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d}% or more discount
            </button>
          ))}
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={stock}
            onChange={(e) => {
              setStock(e.target.checked);
              onFilterChange({
                category: cat,
                subcategory: subCat,
                minPrice: minP,
                maxPrice: maxP,
                minRating: rating,
                minDiscount: discount,
                inStock: e.target.checked,
              });
            }}
            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
          />
          Exclude Out of Stock Items
        </label>
      </div>

      {/* Apply Filter Button */}
      <button
        onClick={applyFilters}
        className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition"
      >
        Apply Price Range Filter
      </button>
    </div>
  );
}
