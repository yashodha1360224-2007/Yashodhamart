'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@yashodhamart.com');
  const [password, setPassword] = useState('Admin12345!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid admin credentials.');
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setErrorMsg('An error occurred during admin authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-200">
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg">
            Y
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-500" /> Admin Portal Login
          </h1>
          <p className="text-xs text-slate-400">YashodhaMart Enterprise Management Console</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 mb-6 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-4 mb-6 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-slate-300 space-y-1">
          <span className="font-bold text-brand-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Demo Admin Credentials:
          </span>
          <p className="font-mono text-[11px]">Email: <strong>admin@yashodhamart.com</strong></p>
          <p className="font-mono text-[11px]">Password: <strong>Admin12345!</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Admin Email Address *</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Admin Password *</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 pt-2"
          >
            {submitting ? 'Verifying...' : 'Access Admin Dashboard'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
