'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import QuantitySelector from '@/components/QuantitySelector';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  discountPercent: number;
  effectivePrice: number;
  quantity: number;
  maxStock: number;
  image: string;
  itemSubtotal: number;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setSubtotal(data.subtotal || 0);
        setDeliveryFee(data.deliveryFee || 0);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (cartItemId: string, newQty: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity: newQty }),
      });
      if (res.ok) {
        fetchCart();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update quantity.');
      }
    } catch {
      alert('Error updating cart.');
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCart();
      }
    } catch {
      alert('Error removing item.');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading your shopping cart...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-brand-600 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore thousands of top-rated fashion, tech, home, and grocery items on YashodhaMart and add your favorites to cart!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs rounded-xl shadow-md transition"
        >
          Start Shopping Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-brand-600" /> Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Review items before proceeding to checkout</p>
        </div>
        <Link href="/products" className="text-xs font-bold text-brand-600 hover:underline">
          + Add More Items
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                <div className="space-y-1">
                  <Link href={`/products/${item.productId}`} className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-brand-600">
                    {item.name}
                  </Link>
                  <div className="flex items-baseline gap-2">
                    <span className="font-black text-slate-900 text-sm">
                      ₹{item.effectivePrice.toLocaleString('en-IN')}
                    </span>
                    {item.discountPercent > 0 && (
                      <span className="text-[11px] text-slate-400 line-through">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <QuantitySelector
                  quantity={item.quantity}
                  maxStock={item.maxStock}
                  onChange={(newQty) => handleUpdateQuantity(item.id, newQty)}
                />

                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 block">
                    ₹{item.itemSubtotal.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4 sticky top-24">
          <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
            Price Details & Summary
          </h3>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
              <span className="font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Delivery Charges</span>
              {deliveryFee === 0 ? (
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  FREE Delivery
                </span>
              ) : (
                <span className="font-bold">₹{deliveryFee}</span>
              )}
            </div>

            {subtotal < 500 && subtotal > 0 && (
              <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 p-2 rounded-xl border border-amber-200">
                Add ₹{(500 - subtotal).toLocaleString('en-IN')} more to unlock FREE Express Delivery!
              </p>
            )}

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-black text-sm text-slate-900">Total Payable</span>
              <span className="font-black text-xl text-brand-600">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-[11px] text-slate-500 space-y-1">
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Safe & Secure Checkout
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-brand-500" /> Cash on Delivery available at checkout
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
