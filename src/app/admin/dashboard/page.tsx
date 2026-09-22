'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard Overview</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time KPIs, sales metrics & order pipeline monitoring</p>
        </div>

        {loading || !stats ? (
          <div className="py-12 text-center text-slate-500">Loading dashboard analytics...</div>
        ) : (
          <>
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Revenue</span>
                  <span className="text-2xl font-black text-slate-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Orders</span>
                  <span className="text-2xl font-black text-slate-900">{stats.totalOrders}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Customers</span>
                  <span className="text-2xl font-black text-slate-900">{stats.totalUsers}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Products</span>
                  <span className="text-2xl font-black text-slate-900">{stats.totalProducts}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center font-bold">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pending Orders</span>
                  <span className="text-2xl font-black text-amber-600">{stats.pendingOrders}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Delivered Orders</span>
                  <span className="text-2xl font-black text-emerald-600">{stats.deliveredOrders}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base">Recent Orders Pipeline</h3>
                <Link href="/admin/orders" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
                  View All Orders <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase">
                    <tr>
                      <th className="p-3">Order Number</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{ord.user?.name}</span>
                          <span className="text-[10px] text-slate-400">{ord.user?.email}</span>
                        </td>
                        <td className="p-3 font-black text-slate-900">₹{ord.finalAmount.toLocaleString('en-IN')}</td>
                        <td className="p-3 font-semibold text-slate-700">{ord.paymentMethod} ({ord.paymentStatus})</td>
                        <td className="p-3 font-bold text-brand-600">{ord.orderStatus}</td>
                        <td className="p-3 text-slate-500">{new Date(ord.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
