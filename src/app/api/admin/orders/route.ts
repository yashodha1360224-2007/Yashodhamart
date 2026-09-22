import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const where: any = {};
  if (status) where.orderStatus = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const { orderId, orderStatus } = await request.json();

    if (!orderId || !orderStatus) {
      return NextResponse.json({ error: "Order ID and new status are required." }, { status: 400 });
    }

    const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus,
        paymentStatus: orderStatus === 'Delivered' ? 'PAID' : undefined,
      },
    });

    return NextResponse.json({ message: `Order status updated to "${orderStatus}".`, order: updated });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
