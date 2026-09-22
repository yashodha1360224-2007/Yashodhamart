import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateAddress } from '@/lib/validations';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ addresses: [] });

  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const errors = validateAddress(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed.", errors }, { status: 400 });
    }

    // Check existing count to make default if first address
    const existingCount = await prisma.address.count({
      where: { userId: session.userId },
    });

    const isDefault = existingCount === 0 || body.isDefault === true;

    if (isDefault && existingCount > 0) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: session.userId,
        fullName: body.fullName.trim(),
        phone: body.phone.trim(),
        houseBuilding: body.houseBuilding.trim(),
        street: body.street.trim(),
        area: body.area.trim(),
        city: body.city.trim(),
        state: body.state.trim(),
        pincode: body.pincode.trim(),
        isDefault,
      },
    });

    return NextResponse.json({ message: "Address added successfully.", address: newAddress }, { status: 201 });
  } catch (error) {
    console.error("Address POST error:", error);
    return NextResponse.json({ error: "Failed to create address." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: "Address ID required." }, { status: 400 });

    const errors = validateAddress(data);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed.", errors }, { status: 400 });
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id, userId: session.userId },
      data: {
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        houseBuilding: data.houseBuilding.trim(),
        street: data.street.trim(),
        area: data.area.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        pincode: data.pincode.trim(),
        isDefault: data.isDefault,
      },
    });

    return NextResponse.json({ message: "Address updated successfully.", address: updated });
  } catch (error) {
    console.error("Address PUT error:", error);
    return NextResponse.json({ error: "Failed to update address." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Address ID required." }, { status: 400 });

    await prisma.address.delete({
      where: { id, userId: session.userId },
    });

    return NextResponse.json({ message: "Address deleted." });
  } catch (error) {
    console.error("Address DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete address." }, { status: 500 });
  }
}
