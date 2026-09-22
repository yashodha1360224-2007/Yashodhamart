import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Access denied. Admin authorization required." }, { status: 403 });
  }

  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      ordersRevenue,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: 'Pending' } }),
      prisma.order.count({ where: { orderStatus: 'Delivered' } }),
      prisma.order.aggregate({
        where: { orderStatus: { not: 'Cancelled' } },
        _sum: { finalAmount: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    const totalRevenue = ordersRevenue._sum.finalAmount || 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin dashboard statistics." }, { status: 500 });
  }
}
