'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid email or password.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setErrorMsg('An error occurred during login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl">
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl indian-gradient flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md">
          Y
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back to YashodhaMart</h1>
        <p className="text-xs text-slate-500 font-medium">Log in to manage orders, wishlist & addresses</p>
      </div>

      {errorMsg && (
        <div className="p-3.5 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Demo Credentials Helper Box */}
      <div className="p-4 mb-6 rounded-2xl bg-brand-50/60 border border-brand-200 text-xs text-brand-900 space-y-1">
        <span className="font-bold flex items-center gap-1 text-brand-700">
          <ShieldCheck className="w-4 h-4" /> Demo User Login:
        </span>
        <p className="font-mono text-[11px]">Email: <strong>user@yashodhamart.com</strong></p>
        <p className="font-mono text-[11px]">Password: <strong>User12345!</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
              required
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Password *</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
              required
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
            />
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? 'Authenticating...' : 'Sign In to YashodhaMart'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
        Don&apos;t have an account yet?{' '}
        <Link href="/register" className="font-bold text-brand-600 hover:underline">
          Register New Account
        </Link>
      </div>
    </div>
  );
}
