import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
    const body = await request.json();
    const {
      addressId,
      paymentMethod = 'COD',
      transactionReference,
      paymentConfirmationSubmitted = false,
    } = body;

    if (!addressId) {
      return NextResponse.json({ error: "Shipping address is required." }, { status: 400 });
    }

    const shippingAddress = await prisma.address.findUnique({
      where: { id: addressId, userId: session.userId },
    });

    if (!shippingAddress) {
      return NextResponse.json({ error: "Selected shipping address not found." }, { status: 404 });
    }

    // 1. Fetch cart from database
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

    // 2. Fetch fresh product details & validate stock for all items
    for (const item of cart.items) {
      const freshProduct = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!freshProduct || !freshProduct.isActive) {
        return NextResponse.json(
          { error: `Item "${item.product.name}" is currently unavailable.` },
          { status: 400 }
        );
      }

      if (item.quantity > freshProduct.stock) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${freshProduct.name}". Only ${freshProduct.stock} units available, but ${item.quantity} requested.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Server-side calculation of subtotal, discount, and total
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

      let productImages: string[] = [];
      try {
        productImages = JSON.parse(item.product.images);
      } catch {
        productImages = [];
      }

      return {
        productId: item.productId,
        productName: item.product.name,
        productImage: productImages[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        price: effectiveUnitPrice,
        quantity: item.quantity,
        totalPrice: effectiveItemTotal,
      };
    });

    const subtotal = totalAmount - discountAmount;
    const deliveryFee = subtotal > 500 ? 0 : 49;
    const finalAmount = subtotal + deliveryFee;

    const orderNumber = `YM-ORD-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

    // Normalize payment method
    const normalizedMethod =
      paymentMethod === 'QR_DEMO' || paymentMethod === 'ONLINE_DEMO' ? 'QR_DEMO' : 'COD';

    let initialPaymentStatus = 'PENDING';
    let initialOrderStatus = 'Pending';
    let finalTxnRef: string | null = null;
    let paidAtTimestamp: Date | null = null;

    if (normalizedMethod === 'QR_DEMO') {
      finalTxnRef = transactionReference || `UPI-DEMO-${Date.now().toString().slice(-6)}`;
      initialPaymentStatus = paymentConfirmationSubmitted ? 'CONFIRMATION_SUBMITTED' : 'PAID';
      initialOrderStatus = 'Confirmed';
      paidAtTimestamp = new Date();
    }

    // Execute atomic transaction for order, stock decrement, and cart clearing
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
          paymentMethod: normalizedMethod,
          paymentStatus: initialPaymentStatus,
          orderStatus: initialOrderStatus,
          transactionReference: finalTxnRef,
          paidAt: paidAtTimestamp,
          shippingAddress: JSON.stringify(shippingAddress),
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Decrement Product Stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // 3. Clear Purchased Cart Items
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
