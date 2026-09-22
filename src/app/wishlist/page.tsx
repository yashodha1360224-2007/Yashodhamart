'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    discountPercent: number;
    stock: number;
    rating: number;
    images: string;
    category?: { name: string };
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) fetchWishlist();
    } catch {
      alert('Error removing item.');
    }
  };

  const handleMoveToCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        await handleRemoveFromWishlist(productId);
        alert('Moved item to shopping cart!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to move to cart.');
      }
    } catch {
      alert('Error moving item to cart.');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading your saved wishlist...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Wishlist is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Save your favorite products to buy later or share with friends! Click the heart icon on any product to save it.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs rounded-xl shadow-md transition"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> My Saved Wishlist ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Quickly move items into your shopping cart</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => {
          const images = JSON.parse(item.product.images || '[]');
          const mainImage = images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';
          const effectivePrice = Math.round(item.product.price * (1 - item.product.discountPercent / 100));

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-slate-100">
                <Image src={mainImage} alt={item.product.name} fill className="object-cover" />
                <button
                  onClick={() => handleRemoveFromWishlist(item.product.id)}
                  className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-slate-500 hover:text-rose-600 transition shadow"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <Link href={`/products/${item.product.id}`} className="font-bold text-slate-900 text-xs line-clamp-2 hover:text-brand-600">
                    {item.product.name}
                  </Link>
                  <div className="flex items-baseline gap-2">
                    <span className="font-black text-slate-900 text-sm">
                      ₹{effectivePrice.toLocaleString('en-IN')}
                    </span>
                    {item.product.discountPercent > 0 && (
                      <span className="text-[11px] text-slate-400 line-through">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleMoveToCart(item.product.id)}
                  disabled={item.product.stock <= 0}
                  className="w-full py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
