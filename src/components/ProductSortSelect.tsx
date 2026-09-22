'use client';

import { ArrowUpDown } from 'lucide-react';

interface SortProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export default function ProductSortSelect({ currentSort, onSortChange }: SortProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <label className="text-slate-500 font-medium hidden sm:flex items-center gap-1">
        <ArrowUpDown className="w-3.5 h-3.5 text-brand-600" /> Sort By:
      </label>
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-sm"
      >
        <option value="popular">Popularity & Best Sellers</option>
        <option value="newest">Newest Arrivals</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Highest Customer Rating</option>
      </select>
    </div>
  );
}
