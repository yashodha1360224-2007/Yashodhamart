import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { validateEmail, validatePhone, validatePassword, validateName } from '@/lib/validations';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, confirmPassword } = body;

    const nameErr = validateName(name);
    if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });

    const emailErr = validateEmail(email);
    if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });

    const phoneErr = validatePhone(phone);
    if (phoneErr) return NextResponse.json({ error: phoneErr }, { status: 400 });

    const passErr = validatePassword(password);
    if (passErr) return NextResponse.json({ error: passErr }, { status: 400 });

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Password and Confirm Password do not match." }, { status: 400 });
    }

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please login instead." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        passwordHash,
        role: 'USER',
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });

    await createSession({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: 'USER',
    });

    return NextResponse.json(
      {
        message: "Registration successful! Welcome to YashodhaMart.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please login instead." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred during registration. Please try again.",
        details: process.env.NODE_ENV !== 'production' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}
