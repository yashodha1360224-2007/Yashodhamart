import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const upiId = process.env.PAYMENT_UPI_ID || 'demo-yashodhamart@okhdfcbank';
  const merchantName = 'YashodhaMart Superstore';

  return NextResponse.json({
    upiId,
    merchantName,
    isDemoMode: true,
    supportedMethods: ['COD', 'QR_DEMO'],
  });
}
