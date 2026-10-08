import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStaticProducts } from '@/data/staticData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q')?.trim() || '';
    const categorySlug = searchParams.get('category') || '';
    const subcategorySlug = searchParams.get('subcategory') || '';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const minDiscount = searchParams.get('minDiscount') ? parseFloat(searchParams.get('minDiscount')!) : undefined;
    const inStockOnly = searchParams.get('inStock') === 'true';
    const sortBy = searchParams.get('sort') || 'popular';
    const isFeatured = searchParams.get('featured') === 'true';
    const isNewArrival = searchParams.get('newArrival') === 'true';

    const andConditions: any[] = [{ isActive: true }];

    if (isFeatured) andConditions.push({ isFeatured: true });
    if (isNewArrival) andConditions.push({ isNewArrival: true });

    if (query) {
      andConditions.push({
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } },
          { subcategory: { name: { contains: query } } },
        ],
      });
    }

    if (subcategorySlug) {
      andConditions.push({
        subcategory: { slug: subcategorySlug },
      });
    } else if (categorySlug) {
      andConditions.push({
        OR: [
          { category: { slug: categorySlug } },
          { subcategory: { slug: categorySlug } },
          { subcategory: { parent: { slug: categorySlug } } },
        ],
      });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceCondition: any = {};
      if (minPrice !== undefined && !isNaN(minPrice)) priceCondition.gte = minPrice;
      if (maxPrice !== undefined && !isNaN(maxPrice)) priceCondition.lte = maxPrice;
      andConditions.push({ price: priceCondition });
    }

    if (minRating !== undefined && !isNaN(minRating)) {
      andConditions.push({ rating: { gte: minRating } });
    }

    if (minDiscount !== undefined && !isNaN(minDiscount)) {
      andConditions.push({ discountPercent: { gte: minDiscount } });
    }

    if (inStockOnly) {
      andConditions.push({ stock: { gt: 0 } });
    }

    const where = { AND: andConditions };

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
          subcategory: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.category.findMany({
        where: { parentId: null, isActive: true },
        include: {
          subcategories: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    if (products.length === 0) {
      const staticResult = getStaticProducts({
        q: query,
        category: categorySlug,
        subcategory: subcategorySlug,
        minPrice,
        maxPrice,
        minRating,
        minDiscount,
        inStockOnly,
        sortBy,
        isFeatured,
        isNewArrival,
      });
      return NextResponse.json(staticResult);
    }

    return NextResponse.json({
      products,
      categories,
      total: products.length,
    });
  } catch (error) {
    console.error('Fetch products error, falling back to static:', error);
    try {
      const { searchParams } = new URL(request.url);
      const staticResult = getStaticProducts({
        q: searchParams.get('q')?.trim() || '',
        category: searchParams.get('category') || '',
        subcategory: searchParams.get('subcategory') || '',
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice'),
        minRating: searchParams.get('minRating'),
        minDiscount: searchParams.get('minDiscount'),
        inStockOnly: searchParams.get('inStock') === 'true',
        sortBy: searchParams.get('sort') || 'popular',
      });
      return NextResponse.json(staticResult);
    } catch (fallbackError) {
      return NextResponse.json({ products: [], categories: [], total: 0 });
    }
  }
}
