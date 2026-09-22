'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminSidebar from '@/components/AdminSidebar';
import { Package, Plus, Edit, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  stock: number;
  categoryId: string;
  images: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  category?: Category;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPercent: '0',
    stock: '10',
    categoryId: '',
    imageUrl: '',
    isFeatured: false,
    isNewArrival: false,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProductsAndCategories = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/products'),
      ]);

      if (prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(pData.products || []);
      }

      if (catRes.ok) {
        const cData = await catRes.json();
        setCategories(cData.categories || []);
        if (cData.categories && cData.categories.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: cData.categories[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin products:', error);
    } finally {
      setLoading(false);
    }
  }, [formData.categoryId]);

  useEffect(() => {
    fetchProductsAndCategories();
  }, [fetchProductsAndCategories]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPercent: '0',
      stock: '10',
      categoryId: categories[0]?.id || '',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      isFeatured: false,
      isNewArrival: true,
      isActive: true,
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    const imgs = JSON.parse(prod.images || '[]');
    setFormData({
      name: prod.name,
      description: prod.description,
      price: String(prod.price),
      discountPercent: String(prod.discountPercent),
      stock: String(prod.stock),
      categoryId: prod.categoryId,
      imageUrl: imgs[0] || '',
      isFeatured: prod.isFeatured,
      isNewArrival: prod.isNewArrival,
      isActive: prod.isActive,
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const isEdit = Boolean(editingProduct?.id);
      const url = '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...(isEdit && { id: editingProduct?.id }),
        name: formData.name,
        description: formData.description,
        price: formData.price,
        discountPercent: formData.discountPercent,
        stock: formData.stock,
        categoryId: formData.categoryId,
        images: JSON.stringify([formData.imageUrl]),
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isActive: formData.isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save product.');
      } else {
        setShowModal(false);
        fetchProductsAndCategories();
      }
    } catch {
      setErrorMsg('An error occurred while saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProductsAndCategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product.');
      }
    } catch {
      alert('Error deleting product.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-600" /> Admin Product Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">Add, edit pricing, update stock & manage catalog items</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading catalog management...</div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => {
                  const imgs = JSON.parse(prod.images || '[]');
                  const mainImg = imgs[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                            <Image src={mainImg} alt={prod.name} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">{prod.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {prod.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-semibold text-slate-700">{prod.category?.name || 'General'}</td>

                      <td className="p-3 font-black text-slate-900">₹{prod.price.toLocaleString('en-IN')}</td>

                      <td className="p-3 font-bold text-rose-600">{prod.discountPercent}% OFF</td>

                      <td className="p-3">
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          prod.stock > 10 ? 'bg-emerald-50 text-emerald-700' : prod.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {prod.stock} units
                        </span>
                      </td>

                      <td className="p-3">
                        {prod.isActive ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded w-max">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add / Edit Product Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 mb-4">
                {editingProduct ? 'Edit Product Catalog Item' : 'Add New Product to Catalog'}
              </h3>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Image URL *</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Original Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Discount %</label>
                    <input
                      type="number"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Available Stock *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Description *</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300"
                    />
                    Featured Deal
                  </label>

                  <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300"
                    />
                    New Arrival
                  </label>

                  <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300"
                    />
                    Active Listing
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
