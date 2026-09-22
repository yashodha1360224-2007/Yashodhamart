import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in to leave a review." }, { status: 401 });
  }

  try {
    const { productId, rating, comment } = await request.json();

    if (!productId || !rating || !comment?.trim()) {
      return NextResponse.json({ error: "Product ID, rating, and review text are required." }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5 stars." }, { status: 400 });
    }

    // Verify user has purchased this product and order status is Delivered
    const purchasedOrder = await prisma.order.findFirst({
      where: {
        userId: session.userId,
        orderStatus: 'Delivered',
        items: {
          some: { productId },
        },
      },
    });

    if (!purchasedOrder) {
      return NextResponse.json(
        { error: "Only verified buyers who have received this product can write a review." },
        { status: 403 }
      );
    }

    // Check duplicate review
    const existingReview = await prisma.review.findFirst({
      where: { userId: session.userId, productId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already submitted a review for this product." },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: session.userId,
        productId,
        rating: Math.round(rating),
        comment: comment.trim(),
      },
    });

    // Recalculate average product rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productId },
    });

    const avgRating =
      allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ message: "Thank you! Your review has been published.", review }, { status: 201 });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
