'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, CheckCircle, AlertCircle } from 'lucide-react';

interface ProductProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPercent: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string; // JSON string array
  category?: { name: string; slug: string };
}

export default function ProductCard({ product }: { product: ProductProps }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartMsg, setCartMsg] = useState<string | null>(null);

  const images = JSON.parse(product.images || '[]');
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';

  const effectivePrice = Math.round(product.price * (1 - product.discountPercent / 100));

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingCart(true);
    setCartMsg(null);

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to add item to cart.');
      } else {
        setCartMsg('Added to Cart!');
        setTimeout(() => setCartMsg(null), 2000);
      }
    } catch {
      alert('An error occurred. Please log in first.');
    } finally {
      setLoadingCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsWishlisted(data.inWishlist);
      } else {
        alert(data.error || 'Please log in to manage your wishlist.');
      }
    } catch {
      alert('An error occurred while updating wishlist.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
            {product.discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 shadow-md transition-all hover:scale-110"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
            }`}
          />
        </button>

        {/* Stock Status Pill */}
        {product.stock <= 0 ? (
          <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" /> Out of Stock
          </span>
        ) : product.stock < 5 ? (
          <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            Only {product.stock} left!
          </span>
        ) : null}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category Name */}
          {product.category && (
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block mb-1">
              {product.category.name}
            </span>
          )}

          {/* Product Title */}
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-brand-600 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Star Rating */}
          <div className="flex items-center gap-1 text-xs mb-2">
            <div className="flex items-center bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded text-[11px]">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
              {product.rating.toFixed(1)}
            </div>
            <span className="text-slate-400 text-[11px]">({product.reviewCount})</span>
          </div>

          {/* Price Breakdown */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-slate-900">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </span>
            {product.discountPercent > 0 && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Add to Cart Action */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || loadingCart}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : cartMsg
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 hover:bg-brand-600 text-white shadow-sm hover:shadow-md'
            }`}
          >
            {cartMsg ? (
              <>
                <CheckCircle className="w-4 h-4" /> {cartMsg}
              </>
            ) : loadingCart ? (
              <span>Adding...</span>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
