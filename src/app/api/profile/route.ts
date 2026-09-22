import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateName, validatePhone, validatePassword } from '@/lib/validations';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'update_info') {
      const { name, phone } = body;

      const nameErr = validateName(name);
      if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });

      const phoneErr = validatePhone(phone);
      if (phoneErr) return NextResponse.json({ error: phoneErr }, { status: 400 });

      const updated = await prisma.user.update({
        where: { id: session.userId },
        data: {
          name: name.trim(),
          phone: phone.trim(),
        },
        select: { id: true, name: true, email: true, phone: true, role: true },
      });

      return NextResponse.json({ message: "Profile updated successfully.", user: updated });
    }

    if (action === 'change_password') {
      const { currentPassword, newPassword, confirmNewPassword } = body;

      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required." }, { status: 400 });
      }

      const passErr = validatePassword(newPassword);
      if (passErr) return NextResponse.json({ error: passErr }, { status: 400 });

      if (newPassword !== confirmNewPassword) {
        return NextResponse.json({ error: "New password and confirm password do not match." }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: session.userId },
        data: { passwordHash },
      });

      return NextResponse.json({ message: "Password updated successfully." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
