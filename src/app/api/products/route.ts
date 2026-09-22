import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q')?.trim() || '';
    const categorySlug = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const minDiscount = searchParams.get('minDiscount') ? parseFloat(searchParams.get('minDiscount')!) : undefined;
    const inStockOnly = searchParams.get('inStock') === 'true';
    const sortBy = searchParams.get('sort') || 'popular';
    const isFeatured = searchParams.get('featured') === 'true';
    const isNewArrival = searchParams.get('newArrival') === 'true';

    const where: any = {
      isActive: true,
    };

    if (isFeatured) where.isFeatured = true;
    if (isNewArrival) where.isNewArrival = true;

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { category: { name: { contains: query } } },
      ];
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && !isNaN(minPrice)) where.price.gte = minPrice;
      if (maxPrice !== undefined && !isNaN(maxPrice)) where.price.lte = maxPrice;
    }

    if (minRating !== undefined && !isNaN(minRating)) {
      where.rating = { gte: minRating };
    }

    if (minDiscount !== undefined && !isNaN(minDiscount)) {
      where.discountPercent = { gte: minDiscount };
    }

    if (inStockOnly) {
      where.stock = { gt: 0 };
    }

    let orderBy: any = { reviewCount: 'desc' };
    if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
    else if (sortBy === 'price-asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price-desc') orderBy = { price: 'desc' };
    else if (sortBy === 'rating') orderBy = { rating: 'desc' };

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      products,
      categories,
      total: products.length,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}
