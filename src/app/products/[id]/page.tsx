'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import QuantitySelector from '@/components/QuantitySelector';
import ReviewSection from '@/components/ReviewSection';
import ProductCard from '@/components/ProductCard';
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: { name: string };
  }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  const [cartMsg, setCartMsg] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const fetchProductDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center text-slate-500">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for may have been removed or is temporarily unavailable.</p>
        <button
          onClick={() => router.push('/products')}
          className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const images: string[] = JSON.parse(product.images || '[]');
  const mainImage = images[selectedImageIndex] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';
  const effectivePrice = Math.round(product.price * (1 - product.discountPercent / 100));
  const totalSavings = Math.round(product.price * (product.discountPercent / 100));

  const handleAddToCart = async () => {
    setAddingCart(true);
    setCartMsg(null);

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to add item to cart.');
      } else {
        setCartMsg('Added to Cart!');
        setTimeout(() => setCartMsg(null), 2500);
      }
    } catch {
      alert('An error occurred. Please log in first.');
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (res.ok) {
        router.push('/checkout');
      } else {
        const data = await res.json();
        alert(data.error || 'Please log in to proceed to checkout.');
      }
    } catch {
      alert('An error occurred.');
    }
  };

  const handleToggleWishlist = async () => {
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
      alert('Failed to update wishlist.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link href="/" className="hover:text-brand-600 transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-brand-600 transition">
          Categories
        </Link>
        <span>/</span>
        <Link href={`/categories/${product.category.slug}`} className="hover:text-brand-600 transition">
          {product.category.name}
        </Link>
        {product.subcategory && (
          <>
            <span>/</span>
            <Link
              href={`/categories/${product.category.slug}?subcategory=${product.subcategory.slug}`}
              className="hover:text-brand-600 transition text-brand-600 font-bold"
            >
              {product.subcategory.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-900 font-bold line-clamp-1 max-w-[250px]">{product.name}</span>
      </nav>

      {/* Product Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImageIndex === idx ? 'border-brand-600 ring-2 ring-brand-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            {/* Category */}
            <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest block">
              {product.category.name}
            </span>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center bg-amber-50 text-amber-800 font-bold px-2 py-1 rounded-lg border border-amber-200">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                {product.rating.toFixed(1)} / 5.0
              </div>
              <span className="text-slate-500 font-medium">
                ({product.reviewCount} verified customer reviews)
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  ₹{effectivePrice.toLocaleString('en-IN')}
                </span>
                {product.discountPercent > 0 && (
                  <span className="text-sm text-slate-400 line-through">
                    M.R.P.: ₹{product.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {product.discountPercent > 0 && (
                <p className="text-xs font-bold text-emerald-700">
                  You save ₹{totalSavings.toLocaleString('en-IN')} ({product.discountPercent}% Instant Savings)
                </p>
              )}
              <p className="text-[11px] text-slate-500">Inclusive of all taxes & free shipping above ₹500</p>
            </div>

            {/* Stock Availability */}
            <div>
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle className="w-4 h-4" /> In Stock ({product.stock} units available)
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                  <AlertCircle className="w-4 h-4" /> Out of Stock - Check back soon!
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 block">Select Quantity:</label>
                <QuantitySelector
                  quantity={quantity}
                  maxStock={product.stock}
                  onChange={setQuantity}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || addingCart}
                className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  product.stock <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : cartMsg
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {cartMsg ? (
                  <>
                    <CheckCircle className="w-5 h-5" /> {cartMsg}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" /> Add to Shopping Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Zap className="w-5 h-5 fill-white" /> Buy Now
              </button>
            </div>

            <button
              onClick={handleToggleWishlist}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-rose-400 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
              {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Seller Trust Perks */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-600">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-brand-600" />
              <span className="font-semibold">Fast Shipping</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">100% Genuine</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">7-Day Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Product Description & Specifications</h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {/* Product Reviews Section */}
      <ReviewSection
        productId={product.id}
        reviews={product.reviews}
        rating={product.rating}
        reviewCount={product.reviewCount}
        onReviewSubmitted={fetchProductDetail}
      />

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Similar Products in {product.category.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
