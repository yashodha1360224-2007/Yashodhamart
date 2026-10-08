'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminSidebar from '@/components/AdminSidebar';
import { ShoppingBag, Search, Filter, CheckCircle2, Clock, Truck, AlertTriangle } from 'lucide-react';

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
  transactionReference?: string | null;
  paidAt?: string | null;
  orderStatus: string;
  shippingAddress: string;
  createdAt: string;
  user: { name: string; email: string; phone: string };
  items: OrderItem[];
}

const statusOptions = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const paymentStatusOptions = ['PENDING', 'CONFIRMATION_SUBMITTED', 'PAID', 'FAILED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin orders:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update order status.');
      } else {
        fetchOrders();
      }
    } catch {
      alert('Error updating order status.');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentStatus: newPaymentStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update payment status.');
      } else {
        fetchOrders();
      }
    } catch {
      alert('Error updating payment status.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-brand-600" /> Admin Order Pipeline Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">Monitor shipments, update fulfillment status & manage customer orders</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, user name, or email..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">All Order Statuses</option>
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading order pipeline...</div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const shipping = JSON.parse(ord.shippingAddress || '{}');
              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black font-mono text-slate-900">
                          Order #{ord.orderNumber}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          ord.paymentMethod === 'QR_DEMO'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {ord.paymentMethod === 'QR_DEMO' ? '📱 QR Demo' : '💵 COD'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Placed by <strong className="text-slate-800">{ord.user?.name}</strong> ({ord.user?.email}) on {new Date(ord.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-black text-slate-900 text-sm">
                        ₹{ord.finalAmount.toLocaleString('en-IN')}
                      </span>

                      {/* Payment Status Dropdown */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pay:</span>
                        <select
                          value={ord.paymentStatus}
                          onChange={(e) => handleUpdatePaymentStatus(ord.id, e.target.value)}
                          className={`font-black px-2.5 py-1.5 rounded-xl border text-[11px] cursor-pointer ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : ord.paymentStatus === 'CONFIRMATION_SUBMITTED'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : ord.paymentStatus === 'FAILED'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                          }`}
                        >
                          {paymentStatusOptions.map((ps) => (
                            <option key={ps} value={ps}>
                              {ps === 'CONFIRMATION_SUBMITTED' ? 'DEMO SUBMITTED' : ps}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Order Status Selector Dropdown */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Fulfillment:</span>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                          className={`font-black px-2.5 py-1.5 rounded-xl border text-[11px] cursor-pointer ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-sky-50 text-sky-900 border-sky-300'
                          }`}
                        >
                          {statusOptions.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-2">
                      <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                        Ordered Items ({ord.items.length})
                      </span>
                      {ord.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                            <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 line-clamp-1">{item.productName}</span>
                            <span className="text-slate-500 text-[11px]">₹{item.price} × {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                      <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                        Shipping & Payment Details
                      </span>
                      <p className="font-bold text-slate-800">{shipping.fullName} ({shipping.phone})</p>
                      <p className="text-slate-600 text-[11px]">
                        {shipping.houseBuilding}, {shipping.street}, {shipping.area}, {shipping.city}, {shipping.state} - {shipping.pincode}
                      </p>
                      <div className="pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Method:</span>
                          <span className="font-bold text-slate-800">
                            {ord.paymentMethod === 'QR_DEMO' ? 'QR Code / UPI Demo Payment' : 'Cash on Delivery'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Payment Status:</span>
                          <span className={`font-black ${
                            ord.paymentStatus === 'PAID' ? 'text-emerald-700' :
                            ord.paymentStatus === 'CONFIRMATION_SUBMITTED' ? 'text-purple-700' : 'text-amber-700'
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </div>
                        {ord.transactionReference && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Ref / UTR:</span>
                            <span className="font-mono font-bold text-slate-800">{ord.transactionReference}</span>
                          </div>
                        )}
                        {ord.paidAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Paid Timestamp:</span>
                            <span className="text-slate-600">{new Date(ord.paidAt).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
