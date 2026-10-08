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
    const { orderId, orderStatus, paymentStatus } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    const validPaymentStatuses = ['PENDING', 'CONFIRMATION_SUBMITTED', 'PAID', 'FAILED'];

    const updateData: any = {};
    if (orderStatus) {
      if (!validStatuses.includes(orderStatus)) {
        return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
      }
      updateData.orderStatus = orderStatus;
      if (orderStatus === 'Delivered') {
        updateData.paymentStatus = 'PAID';
        updateData.paidAt = new Date();
      }
    }

    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
      }
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === 'PAID') {
        updateData.paidAt = new Date();
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No update fields provided." }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({ message: "Order updated successfully.", order: updated });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
