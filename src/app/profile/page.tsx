'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AddressCardModal from '@/components/AddressCardModal';
import {
  User,
  MapPin,
  Lock,
  Package,
  Heart,
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  houseBuilding: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'password'>('info');
  const [user, setUser] = useState<UserData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit info state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [infoErr, setInfoErr] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);

  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const fetchProfileData = useCallback(async () => {
    try {
      const [profRes, addrRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/addresses'),
      ]);

      if (profRes.ok) {
        const pData = await profRes.json();
        setUser(pData.user);
        if (pData.user) {
          setName(pData.user.name);
          setPhone(pData.user.phone);
        }
      }

      if (addrRes.ok) {
        const aData = await addrRes.json();
        setAddresses(aData.addresses || []);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMsg(null);
    setInfoErr(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_info', name, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setInfoErr(data.error || 'Failed to update info.');
      } else {
        setInfoMsg(data.message);
        setUser(data.user);
      }
    } catch {
      setInfoErr('An error occurred while updating profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    setPassErr(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassErr(data.error || 'Failed to update password.');
      } else {
        setPassMsg(data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch {
      setPassErr('An error occurred.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchProfileData();
    } catch {
      alert('Failed to delete address.');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading your user profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Please Log In</h2>
        <p className="text-xs text-slate-500">Log in to access your YashodhaMart profile and addresses.</p>
        <Link href="/login" className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow inline-block">
          Go to Login Page
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h1>
            <p className="text-xs text-slate-500 font-medium">{user.email} • {user.phone}</p>
          </div>
        </div>

        {/* Quick Nav Pills */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <Link href="/orders" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1.5">
            <Package className="w-4 h-4 text-brand-600" /> My Orders
          </Link>
          <Link href="/wishlist" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" /> Wishlist
          </Link>
          <Link href="/cart" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-slate-700" /> Cart
          </Link>
        </div>
      </div>

      {/* Main Tabbed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Tab Selector Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm space-y-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition ${
              activeTab === 'info' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" /> Personal Information
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition ${
              activeTab === 'addresses' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4" /> Saved Addresses ({addresses.length})
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition ${
              activeTab === 'password' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Lock className="w-4 h-4" /> Change Password
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="md:col-span-3">
          {activeTab === 'info' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Edit Profile Information
              </h3>

              {infoMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {infoMsg}
                </div>
              )}

              {infoErr && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {infoErr}
                </div>
              )}

              <form onSubmit={handleUpdateInfo} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address (Read-Only)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow transition"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900">
                  Manage Saved Shipping Addresses
                </h3>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No saved addresses found. Click &quot;Add Address&quot; to save a shipping location.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl border border-slate-200 space-y-2 relative bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-brand-600 text-white px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-700">{addr.phone}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {addr.houseBuilding}, {addr.street}, {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>

                      <div className="flex items-center gap-3 pt-2 border-t border-slate-200 text-xs">
                        <button
                          onClick={() => {
                            setEditingAddress(addr);
                            setShowAddressModal(true);
                          }}
                          className="font-bold text-brand-600 hover:underline"
                        >
                          Edit Address
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="font-bold text-rose-600 hover:underline flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Security & Password Change
              </h3>

              {passMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {passMsg}
                </div>
              )}

              {passErr && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {passErr}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Password *</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Password *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow transition"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <AddressCardModal
          initialAddress={editingAddress}
          onClose={() => setShowAddressModal(false)}
          onSuccess={fetchProfileData}
        />
      )}
    </div>
  );
}
