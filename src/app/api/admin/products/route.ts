import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const products = await prisma.product.findMany({
    include: { category: true, subcategory: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const body = await request.json();
    const { name, description, price, discountPercent, stock, categoryId, subcategoryId, images, isFeatured, isNewArrival } = body;

    if (!name?.trim() || !description?.trim() || !price || !categoryId || !images) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description.trim(),
        price: parseFloat(price),
        discountPercent: parseFloat(discountPercent || 0),
        stock: parseInt(stock || 0),
        categoryId,
        subcategoryId: subcategoryId || null,
        images: typeof images === 'string' ? images : JSON.stringify(images),
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        isActive: true,
      },
    });

    return NextResponse.json({ message: "Product added successfully!", product }, { status: 201 });
  } catch (error) {
    console.error("Admin add product error:", error);
    return NextResponse.json({ error: "Failed to add product." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const body = await request.json();
    const { id, name, description, price, discountPercent, stock, categoryId, subcategoryId, images, isFeatured, isNewArrival, isActive } = body;

    if (!id) return NextResponse.json({ error: "Product ID required." }, { status: 400 });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name?.trim(),
        description: description?.trim(),
        price: parseFloat(price),
        discountPercent: parseFloat(discountPercent || 0),
        stock: parseInt(stock || 0),
        categoryId,
        subcategoryId: subcategoryId !== undefined ? (subcategoryId || null) : undefined,
        images: typeof images === 'string' ? images : JSON.stringify(images),
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ message: "Product updated successfully!", product: updated });
  } catch (error) {
    console.error("Admin edit product error:", error);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Product ID required." }, { status: 400 });

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
