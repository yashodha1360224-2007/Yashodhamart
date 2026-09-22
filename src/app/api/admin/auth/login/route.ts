import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { validateEmail } from '@/lib/validations';
import { createSession, clearSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const emailErr = validateEmail(email);
    if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });

    if (!password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    await createSession({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'ADMIN',
    });

    return NextResponse.json({
      message: "Admin login successful.",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during admin authentication." },
      { status: 500 }
    );
  }
}
