'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  transactionReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading your order history...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No Orders Placed Yet</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You haven&apos;t placed any orders with YashodhaMart yet. Explore our fresh collection across 20 departments!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs rounded-xl shadow-md transition"
        >
          Browse Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'Shipped':
      case 'Out for Delivery':
        return (
          <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> {status}
          </span>
        );
      case 'Cancelled':
        return (
          <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'Confirmed':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      default:
        return (
          <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (status: string, method: string) => {
    if (status === 'PAID') {
      return (
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Paid
        </span>
      );
    }
    if (status === 'CONFIRMATION_SUBMITTED') {
      return (
        <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
          <Clock className="w-3 h-3" /> Demo Confirmation Submitted
        </span>
      );
    }
    if (status === 'FAILED') {
      return (
        <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Failed
        </span>
      );
    }
    return (
      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
        <Clock className="w-3 h-3" /> Pending ({method === 'COD' ? 'Pay on Delivery' : 'Awaiting Payment'})
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Package className="w-6 h-6 text-brand-600" /> My Orders ({orders.length})
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Track fulfillment status, view payment receipts, and download order details
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isQR = order.paymentMethod === 'QR_DEMO';
          const methodDisplay = isQR ? 'QR Demo Payment' : 'Cash on Delivery';
          const totalQty = order.items.reduce((acc, it) => acc + it.quantity, 0);

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 font-mono">
                      Order #{order.orderNumber}
                    </span>
                    {getOrderStatusBadge(order.orderStatus)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total ({totalQty} items)</span>
                    <span className="text-base font-black text-slate-900">
                      ₹{order.finalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Summary Row */}
              <div className="flex items-center gap-4 overflow-x-auto py-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 flex-shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                    </div>
                    <div className="text-xs max-w-[160px]">
                      <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                      <span className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity} × ₹{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment & Action Bottom Bar */}
              <div className="pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs border-t border-slate-100 gap-2">
                <div className="flex flex-wrap items-center gap-2 text-slate-600">
                  <span className="flex items-center gap-1 font-semibold">
                    {isQR ? <QrCode className="w-3.5 h-3.5 text-brand-600" /> : <CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
                    Payment: <strong className="text-slate-900">{methodDisplay}</strong>
                  </span>
                  <span>•</span>
                  {getPaymentBadge(order.paymentStatus, order.paymentMethod)}
                  {order.transactionReference && (
                    <>
                      <span>•</span>
                      <span className="text-[10px] font-mono text-slate-500">Ref: {order.transactionReference}</span>
                    </>
                  )}
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline whitespace-nowrap"
                >
                  View Order Details & Status →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
