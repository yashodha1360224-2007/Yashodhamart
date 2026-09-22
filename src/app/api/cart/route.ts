import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ items: [], subtotal: 0, total: 0 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.userId },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!cart) {
    return NextResponse.json({ items: [], subtotal: 0, total: 0 });
  }

  const items = cart.items.map((item) => {
    const effectivePrice = Math.round(
      item.product.price * (1 - item.product.discountPercent / 100)
    );
    return {
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      discountPercent: item.product.discountPercent,
      effectivePrice,
      quantity: item.quantity,
      maxStock: item.product.stock,
      image: JSON.parse(item.product.images)[0] || '',
      itemSubtotal: effectivePrice * item.quantity,
    };
  });

  const subtotal = items.reduce((acc, i) => acc + i.itemSubtotal, 0);
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 49;
  const total = subtotal + deliveryFee;

  return NextResponse.json({ items, subtotal, deliveryFee, total });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in to add items to your cart." }, { status: 401 });
  }

  try {
    const { productId, quantity = 1 } = await request.json();

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not available." }, { status: 404 });
    }

    if (product.stock < 1) {
      return NextResponse.json({ error: "Sorry, this product is currently out of stock." }, { status: 400 });
    }

    let cart = await prisma.cart.findUnique({ where: { userId: session.userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: session.userId } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    const newQuantity = (existingItem?.quantity || 0) + quantity;

    if (newQuantity > product.stock) {
      return NextResponse.json(
        { error: `Cannot add more. Only ${product.stock} units available in stock.` },
        { status: 400 }
      );
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: newQuantity,
        },
      });
    }

    return NextResponse.json({ message: "Item added to shopping cart successfully." });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Failed to add item to cart." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { cartItemId, quantity } = await request.json();

    if (quantity < 1) {
      return NextResponse.json({ error: "Quantity must be at least 1." }, { status: 400 });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    });

    if (!item) return NextResponse.json({ error: "Cart item not found." }, { status: 404 });

    if (quantity > item.product.stock) {
      return NextResponse.json(
        { error: `Maximum stock available is ${item.product.stock} units.` },
        { status: 400 }
      );
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return NextResponse.json({ message: "Quantity updated." });
  } catch (error) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json({ error: "Failed to update quantity." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('id');

    if (!cartItemId) return NextResponse.json({ error: "Item ID required." }, { status: 400 });

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ message: "Item removed from cart." });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove item." }, { status: 500 });
  }
}
