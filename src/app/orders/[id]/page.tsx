'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Package, CheckCircle2, Truck, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
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
  discountAmount: number;
  deliveryFee: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  transactionReference?: string | null;
  paidAt?: string | null;
  shippingAddress: string; // JSON snapshot
  createdAt: string;
  items: OrderItem[];
}

const statusSteps = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order? Item stock will be restored.')) return;
    setCancelling(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to cancel order.');
      } else {
        alert('Order cancelled successfully.');
        fetchOrderDetail();
      }
    } catch {
      alert('An error occurred.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Fetching order tracking details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <Link href="/orders" className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow inline-block">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const shipping = JSON.parse(order.shippingAddress || '{}');
  const currentStepIdx = statusSteps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600">
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
              Order Receipt & Status
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Total Amount</span>
            <span className="text-2xl font-black text-slate-900">
              ₹{order.finalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Order Status Pipeline Visualizer */}
        {!isCancelled ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-600" /> Order Tracking Pipeline
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {statusSteps.map((stepName, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div
                    key={stepName}
                    className={`p-2.5 rounded-xl border text-center text-[11px] font-bold transition ${
                      isCurrent
                        ? 'bg-brand-600 text-white border-brand-600 shadow'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-current" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    {stepName}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" /> This order has been cancelled and stock returned.
          </div>
        )}

        {/* Products List */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Ordered Products</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 line-clamp-1">{item.productName}</span>
                    <span className="text-slate-500">Unit Price: ₹{item.price.toLocaleString('en-IN')} × {item.quantity}</span>
                  </div>
                </div>
                <span className="font-black text-slate-900">₹{item.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Address & Payment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block mb-1">Delivery Address</span>
            <p className="font-semibold text-slate-800">{shipping.fullName} ({shipping.phone})</p>
            <p className="text-slate-600">
              {shipping.houseBuilding}, {shipping.street}, {shipping.area}, {shipping.city}, {shipping.state} - {shipping.pincode}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block mb-1">Payment & Billing</span>
            <p className="text-slate-700">
              Method: <strong>{order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'QR Demo Payment (UPI)'}</strong>
            </p>
            <p className="text-slate-700">
              Payment Status: <strong className={order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-blue-700'}>{order.paymentStatus}</strong>
            </p>
            {order.transactionReference && (
              <p className="text-slate-700 font-mono text-[11px]">
                Reference / UTR: <strong className="text-slate-900">{order.transactionReference}</strong>
              </p>
            )}
            {order.paidAt && (
              <p className="text-slate-500 text-[11px]">
                Paid At: {new Date(order.paidAt).toLocaleString('en-IN')}
              </p>
            )}
            <p className="text-slate-500 pt-0.5">Delivery Fee: {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</p>
          </div>
        </div>

        {/* Cancel Order Action */}
        {!isCancelled && order.orderStatus !== 'Delivered' && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel This Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
