import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });

  try {
    const { addressId, paymentMethod = 'COD' } = await request.json();

    if (!addressId) {
      return NextResponse.json({ error: "Shipping address is required." }, { status: 400 });
    }

    const shippingAddress = await prisma.address.findUnique({
      where: { id: addressId, userId: session.userId },
    });

    if (!shippingAddress) {
      return NextResponse.json({ error: "Selected shipping address not found." }, { status: 404 });
    }

    // Get current cart items
    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Your shopping cart is empty." }, { status: 400 });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return NextResponse.json(
          {
            error: `Stock check failed for "${item.product.name}". Only ${item.product.stock} units available, but ${item.quantity} were requested.`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    let totalAmount = 0;
    let discountAmount = 0;

    const orderItemsData = cart.items.map((item) => {
      const originalItemTotal = item.product.price * item.quantity;
      const effectiveUnitPrice = Math.round(
        item.product.price * (1 - item.product.discountPercent / 100)
      );
      const effectiveItemTotal = effectiveUnitPrice * item.quantity;

      totalAmount += originalItemTotal;
      discountAmount += originalItemTotal - effectiveItemTotal;

      const productImages = JSON.parse(item.product.images);

      return {
        productId: item.productId,
        productName: item.product.name,
        productImage: productImages[0] || '',
        price: effectiveUnitPrice,
        quantity: item.quantity,
        totalPrice: effectiveItemTotal,
      };
    });

    const subtotal = totalAmount - discountAmount;
    const deliveryFee = subtotal > 500 ? 0 : 49;
    const finalAmount = subtotal + deliveryFee;

    const orderNumber = `YM-ORD-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

    // Create Order and clear cart within transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          totalAmount,
          discountAmount,
          deliveryFee,
          finalAmount,
          paymentMethod,
          paymentStatus: paymentMethod === 'ONLINE_DEMO' ? 'PAID' : 'PENDING',
          orderStatus: 'Pending',
          shippingAddress: JSON.stringify(shippingAddress),
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Reduce Product Stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // 3. Clear Cart Items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return NextResponse.json({
      message: "Order placed successfully!",
      order,
    }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to place order. Please try again." }, { status: 500 });
  }
}
