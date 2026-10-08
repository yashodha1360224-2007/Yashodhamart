import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStaticProductById } from '@/data/staticData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product || !product.isActive) {
      const staticData = getStaticProductById(id);
      if (staticData) {
        return NextResponse.json(staticData);
      }
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
    });

    return NextResponse.json({ product, relatedProducts });
  } catch (error) {
    console.error("Single product API error, falling back to static:", error);
    const staticData = getStaticProductById(params.id);
    if (staticData) {
      return NextResponse.json(staticData);
    }
    return NextResponse.json({ error: "Failed to fetch product details." }, { status: 500 });
  }
}
