'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  ShieldCheck,
  Store
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error("Admin logout error:", error);
    }
  };

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Product Management', href: '/admin/products', icon: Package },
    { name: 'Order Pipeline', href: '/admin/orders', icon: ShoppingBag },
    { name: 'User Management', href: '/admin/users', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
            Y
          </div>
          <div>
            <h2 className="font-bold text-white text-base tracking-tight flex items-center gap-1">
              Yashodha<span className="text-brand-500">Admin</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Control Panel
            </span>
          </div>
        </div>

        {/* Admin Nav Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <Store className="w-4 h-4 text-brand-400" /> View Live Storefront
        </Link>

        <button
          onClick={handleAdminLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition text-left"
        >
          <LogOut className="w-4 h-4" /> Logout Admin
        </button>

        <div className="pt-2 text-center text-[10px] text-slate-600">
          YashodhaMart Enterprise v1.0
        </div>
      </div>
    </aside>
  );
}
