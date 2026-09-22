import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const { userId, isActive } = await request.json();

    if (!userId) return NextResponse.json({ error: "User ID required." }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: Boolean(isActive) },
      select: { id: true, name: true, email: true, isActive: true },
    });

    return NextResponse.json({
      message: `User account ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
      user: updated,
    });
  } catch (error) {
    console.error("Admin toggle user status error:", error);
    return NextResponse.json({ error: "Failed to update user status." }, { status: 500 });
  }
}
