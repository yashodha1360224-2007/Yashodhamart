'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Registration failed.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setErrorMsg('An error occurred during registration.');
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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Your Account</h1>
        <p className="text-xs text-slate-500 font-medium">Join YashodhaMart for exclusive Indian shopping deals</p>
      </div>

      {errorMsg && (
        <div className="p-3.5 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
              required
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="rahul@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
              required
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Mobile Phone Number *</label>
          <div className="relative">
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="10-digit Indian mobile (e.g. 9876543210)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
              required
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Password *</label>
          <div className="relative">
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 8 chars, 1 uppercase, 1 lowercase & number"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
              required
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Confirm Password *</label>
          <div className="relative">
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
              required
            />
            <CheckCircle className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 pt-2"
        >
          {submitting ? 'Creating Account...' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-brand-600 hover:underline">
          Sign In Here
        </Link>
      </div>
    </div>
  );
}
