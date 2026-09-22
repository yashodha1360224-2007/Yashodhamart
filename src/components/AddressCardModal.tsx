'use client';

import { useState } from 'react';
import { X, MapPin } from 'lucide-react';

interface AddressData {
  id?: string;
  fullName: string;
  phone: string;
  houseBuilding: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface ModalProps {
  initialAddress?: AddressData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddressCardModal({ initialAddress, onClose, onSuccess }: ModalProps) {
  const [formData, setFormData] = useState<AddressData>({
    fullName: initialAddress?.fullName || '',
    phone: initialAddress?.phone || '',
    houseBuilding: initialAddress?.houseBuilding || '',
    street: initialAddress?.street || '',
    area: initialAddress?.area || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    pincode: initialAddress?.pincode || '',
    isDefault: initialAddress?.isDefault || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setApiError(null);
    setErrors({});

    try {
      const isEdit = Boolean(initialAddress?.id);
      const url = '/api/addresses';
      const method = isEdit ? 'PUT' : 'POST';
      const bodyPayload = isEdit ? { id: initialAddress?.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setApiError(data.error || 'Failed to save address.');
        }
      } else {
        onSuccess();
        onClose();
      }
    } catch {
      setApiError('An error occurred while saving the address.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialAddress?.id ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>
            <p className="text-xs text-slate-500">Ensure accurate location details for fast shipping</p>
          </div>
        </div>

        {apiError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Receiver's full name"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              {errors.fullName && <span className="text-rose-600 text-[10px] mt-0.5 block">{errors.fullName}</span>}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mobile Phone Number *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              {errors.phone && <span className="text-rose-600 text-[10px] mt-0.5 block">{errors.phone}</span>}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Flat / House No. / Building Name *</label>
            <input
              type="text"
              value={formData.houseBuilding}
              onChange={(e) => setFormData({ ...formData, houseBuilding: e.target.value })}
              placeholder="Flat 402, Sunshine Apartments"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            {errors.houseBuilding && <span className="text-rose-600 text-[10px] mt-0.5 block">{errors.houseBuilding}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Street / Road Name *</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="MG Road"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              {errors.street && <span className="text-rose-600 text-[10px] mt-0.5 block">{errors.street}</span>}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Area / Locality *</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Indiranagar"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              {errors.area && <span className="text-rose-600 text-[10px] mt-0.5 block">{errors.area}</span>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Bengaluru"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              {errors.city && <span className="text-rose-600 text-[10px] mt-0.5 block">{errors.city}</span>}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Karnataka"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              {errors.state && <span className="text-rose-600 text-[10px] mt-0.5 block">{errors.state}</span>}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">PIN Code *</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="560038"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              {errors.pincode && <span className="text-rose-600 text-[10px] mt-0.5 block">{errors.pincode}</span>}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
              />
              Set as Default Shipping Address
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
