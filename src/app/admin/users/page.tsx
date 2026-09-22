'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Users, Search, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update user status.');
      }
    } catch {
      alert('Error updating user status.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-600" /> Admin User Account Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">View registered customers & manage account active states</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name, email, or mobile number..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading user accounts...</div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone Number</th>
                  <th className="p-3">Total Orders</th>
                  <th className="p-3">Registered Date</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center">
                          {usr.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{usr.name}</span>
                      </div>
                    </td>

                    <td className="p-3 font-semibold text-slate-700">{usr.email}</td>

                    <td className="p-3 text-slate-600 font-mono">{usr.phone}</td>

                    <td className="p-3 font-extrabold text-slate-900">{usr._count.orders} orders</td>

                    <td className="p-3 text-slate-500">{new Date(usr.createdAt).toLocaleDateString('en-IN')}</td>

                    <td className="p-3">
                      {usr.isActive ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                          <XCircle className="w-3.5 h-3.5" /> Deactivated
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(usr.id, usr.isActive)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                          usr.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {usr.isActive ? 'Deactivate Account' : 'Activate Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
