import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Access denied. Admin authorization required.' }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    const categories = await prisma.category.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { slug: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : undefined,
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        subcategories: {
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { products: true, subcategoryProducts: true },
            },
          },
        },
        _count: {
          select: { products: true, subcategoryProducts: true, subcategories: true },
        },
      },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Admin categories GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve categories.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Access denied.' }, { status: 403 });

  try {
    const body = await request.json();
    const { name, description, image, parentId, isActive = true } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    let slug = body.slug?.trim()
      ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Ensure slug uniqueness
    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        image: image?.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
        parentId: parentId || null,
        isActive: Boolean(isActive),
      },
      include: {
        parent: true,
        _count: { select: { products: true, subcategories: true } },
      },
    });

    return NextResponse.json(
      { message: 'Category created successfully!', category: newCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin category POST error:', error);
    return NextResponse.json({ error: 'Failed to create category.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Access denied.' }, { status: 403 });

  try {
    const body = await request.json();
    const { id, name, slug, description, image, parentId, isActive } = body;

    if (!id) return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Category not found.' }, { status: 404 });

    let finalSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const slugClash = await prisma.category.findFirst({
        where: { slug: sanitizedSlug, NOT: { id } },
      });
      finalSlug = slugClash ? `${sanitizedSlug}-${Date.now().toString().slice(-4)}` : sanitizedSlug;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name?.trim() ?? existing.name,
        slug: finalSlug,
        description: description !== undefined ? description?.trim() || null : existing.description,
        image: image !== undefined ? image?.trim() || null : existing.image,
        parentId: parentId !== undefined ? parentId || null : existing.parentId,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
      include: {
        parent: true,
        _count: { select: { products: true, subcategories: true } },
      },
    });

    return NextResponse.json({ message: 'Category updated successfully!', category: updated });
  } catch (error) {
    console.error('Admin category PUT error:', error);
    return NextResponse.json({ error: 'Failed to update category.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Access denied.' }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, subcategoryProducts: true, subcategories: true },
        },
      },
    });

    if (!category) return NextResponse.json({ error: 'Category not found.' }, { status: 404 });

    const totalAssociatedProducts =
      category._count.products + category._count.subcategoryProducts;

    // Check if directly associated with products
    if (totalAssociatedProducts > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${category.name}". It is associated with ${totalAssociatedProducts} product(s). Please deactivate the category or reassign its products first.`,
        },
        { status: 400 }
      );
    }

    // Check if it has subcategories
    if (category._count.subcategories > 0) {
      // Check if any subcategory has products
      const subcategoryProducts = await prisma.product.count({
        where: {
          category: { parentId: id },
        },
      });

      if (subcategoryProducts > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete "${category.name}". Its subcategories contain ${subcategoryProducts} active product(s). Deactivate the category instead.`,
          },
          { status: 400 }
        );
      }
    }

    // Safe to delete
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: `Category "${category.name}" was safely removed.` });
  } catch (error) {
    console.error('Admin category DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete category.' }, { status: 500 });
  }
}
