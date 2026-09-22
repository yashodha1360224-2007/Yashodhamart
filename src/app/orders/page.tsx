'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowRight, Clock, CheckCircle2, Truck, AlertTriangle } from 'lucide-react';

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
      <div className="py-12 text-center text-slate-500">
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
          You haven&apos;t placed any orders with YashodhaMart yet. Explore our fresh collection and start shopping today!
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      case 'Shipped':
      case 'Out for Delivery':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {status}</span>;
      case 'Cancelled':
        return <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Package className="w-6 h-6 text-brand-600" /> My Orders ({orders.length})
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Track shipment pipeline and view order receipts</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition space-y-4"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-900 font-mono">Order {order.orderNumber}</span>
                <p className="text-[11px] text-slate-400">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(order.orderStatus)}
                <span className="text-sm font-black text-slate-900">
                  ₹{order.finalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Items Summary Row */}
            <div className="flex items-center gap-4 overflow-x-auto py-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div className="text-xs max-w-[150px]">
                    <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                    <span className="text-[10px] text-slate-500">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100">
              <span className="text-slate-500">
                Payment: <strong className="text-slate-800">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</strong>
              </span>

              <Link
                href={`/orders/${order.id}`}
                className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
              >
                View Order Details & Status →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
