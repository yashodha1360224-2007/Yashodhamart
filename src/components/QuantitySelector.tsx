'use client';

import { Plus, Minus } from 'lucide-react';

interface QuantityProps {
  quantity: number;
  maxStock: number;
  onChange: (newQty: number) => void;
  disabled?: boolean;
}

export default function QuantitySelector({
  quantity,
  maxStock,
  onChange,
  disabled = false,
}: QuantityProps) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxStock) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || quantity <= 1}
          className="px-3 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="px-4 py-2 text-xs font-bold text-slate-900 min-w-[36px] text-center bg-white border-x border-slate-200">
          {quantity}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || quantity >= maxStock}
          className="px-3 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition"
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {quantity >= maxStock && maxStock > 0 && (
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
          Max Stock Limit
        </span>
      )}
    </div>
  );
}
