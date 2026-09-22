import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ items: [] });
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const items = wishlist?.items.map((i) => ({
    id: i.id,
    productId: i.productId,
    product: i.product,
  })) || [];

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in to manage your wishlist." }, { status: 401 });
  }

  try {
    const { productId } = await request.json();

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.userId },
      });
    }

    const existing = await prisma.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });

    if (existing) {
      // Remove from wishlist (toggle behavior)
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ message: "Removed from wishlist.", inWishlist: false });
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return NextResponse.json({ message: "Added to wishlist.", inWishlist: true });
  } catch (error) {
    console.error("Wishlist error:", error);
    return NextResponse.json({ error: "Failed to update wishlist." }, { status: 500 });
  }
}
