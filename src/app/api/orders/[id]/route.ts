import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      userId: session.role === 'ADMIN' ? undefined : session.userId,
    },
    include: {
      items: true,
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({ order });
}

// Cancel Order
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: session.role === 'ADMIN' ? undefined : session.userId,
      },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
      return NextResponse.json(
        { error: `Orders with status "${order.orderStatus}" cannot be cancelled.` },
        { status: 400 }
      );
    }

    // Cancel order and restore stock
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: 'Cancelled',
        },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }
    });

    return NextResponse.json({ message: "Order cancelled successfully and stock restored." });
  } catch (error) {
    console.error("Order cancellation error:", error);
    return NextResponse.json({ error: "Failed to cancel order." }, { status: 500 });
  }
}
