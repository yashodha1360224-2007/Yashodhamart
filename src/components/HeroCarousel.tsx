'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Zap } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Yashodha Grand Indian Shopping Festival',
    subtitle: 'Up to 50% OFF on Top Ethnic Wear, Electronics & Home Appliances',
    badge: 'FESTIVE SPECIAL',
    ctaText: 'Shop Grand Offers',
    ctaLink: '/products',
    bgGradient: 'from-orange-600 via-amber-600 to-rose-700',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 2,
    title: 'Next-Gen Electronics & Smart Gadgets',
    subtitle: 'Laptops, Wireless ANC Headphones, TWS Earbuds & Fast Power Banks',
    badge: 'TECH UNLEASHED',
    ctaText: 'Explore Electronics',
    ctaLink: '/products?category=electronics',
    bgGradient: 'from-indigo-900 via-slate-900 to-blue-900',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 3,
    title: 'Pure Cotton Ethnic Kurta & Apparel',
    subtitle: 'Handcrafted floral prints, comfortable fit & traditional elegance',
    badge: 'NEW FASHION ARRIVALS',
    ctaText: 'Browse Fashion',
    ctaLink: '/products?category=fashion',
    bgGradient: 'from-emerald-800 via-teal-900 to-slate-900',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl my-6">
      <div className={`relative min-h-[380px] sm:min-h-[440px] w-full bg-gradient-to-r ${slide.bgGradient} flex items-center transition-all duration-700`}>
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-25 mix-blend-overlay">
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        {/* Banner Content Container */}
        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-12 text-white z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {slide.badge}
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              {slide.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-100 max-w-lg font-medium leading-relaxed">
              {slide.subtitle}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href={slide.ctaLink}
                className="px-6 py-3.5 bg-white text-slate-900 hover:bg-brand-500 hover:text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group"
              >
                <ShoppingBag className="w-4 h-4 text-brand-600 group-hover:text-white" /> {slide.ctaText}
              </Link>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <Zap className="w-4 h-4 fill-amber-300" /> Limited Time Price Drops
              </div>
            </div>
          </div>

          {/* Banner Hero Image Card */}
          <div className="hidden md:flex justify-center">
            <div className="relative w-72 h-72 lg:w-80 lg:h-80 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/30 text-white hover:bg-black/60 transition backdrop-blur-md z-20"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/30 text-white hover:bg-black/60 transition backdrop-blur-md z-20"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/40'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
