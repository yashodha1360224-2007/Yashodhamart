import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './db';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'yashodha_mart_super_secret_jwt_key_2026_college_project_secure_session'
);

export interface UserSessionPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name: string;
}

const COOKIE_NAME = 'ym_session';

export async function createSession(payload: UserSessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Store user session in database Session table (User relation)
  if (payload.role !== 'ADMIN') {
    await prisma.session.create({
      data: {
        userId: payload.userId,
        token,
        expiresAt,
      },
    });
  }

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return token;
}

export async function getSession(): Promise<UserSessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    const payload = verified.payload as unknown as UserSessionPayload;

    if (payload.role === 'ADMIN') {
      const admin = await prisma.admin.findUnique({
        where: { id: payload.userId },
      });
      if (!admin) return null;
      return payload;
    }

    // Verify token exists in database session table
    const dbSession = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!dbSession || dbSession.expiresAt < new Date()) {
      return null;
    }

    if (!dbSession.user.isActive) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    try {
      await prisma.session.delete({ where: { token } });
    } catch {
      // Ignore if missing
    }
  }

  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<UserSessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return null;
  }
  return session;
}
