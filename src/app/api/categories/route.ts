import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStaticCategories } from '@/data/staticData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    if (slug) {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          parent: true,
          subcategories: {
            where: includeInactive ? undefined : { isActive: true },
            orderBy: { name: 'asc' },
            include: {
              _count: { select: { products: true } },
            },
          },
          _count: { select: { products: true } },
        },
      });

      if (!category) {
        const staticCat = getStaticCategories(slug);
        if (staticCat) return NextResponse.json({ category: staticCat });
        return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
      }

      return NextResponse.json({ category });
    }

    // Return parent categories with their subcategories
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        subcategories: {
          where: includeInactive ? undefined : { isActive: true },
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });

    if (categories.length === 0) {
      return NextResponse.json({ categories: getStaticCategories() });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Fetch categories error, falling back to static:', error);
    try {
      const { searchParams } = new URL(request.url);
      const slug = searchParams.get('slug');
      if (slug) {
        const staticCat = getStaticCategories(slug);
        if (staticCat) return NextResponse.json({ category: staticCat });
        return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
      }
      return NextResponse.json({ categories: getStaticCategories() });
    } catch (fallbackError) {
      return NextResponse.json({ error: 'Failed to fetch categories.' }, { status: 500 });
    }
  }
}
