'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  FolderTree,
  ChevronRight,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Package
} from 'lucide-react';

interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  parentId: string | null;
  _count?: {
    products: number;
    subcategoryProducts: number;
  };
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  parentId: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  subcategories?: SubcategoryItem[];
  _count: {
    products: number;
    subcategoryProducts: number;
    subcategories: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | SubcategoryItem | null>(null);
  const [isSubcategoryMode, setIsSubcategoryMode] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/admin/categories?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // Separate parent categories (parentId === null)
        const parents = (data.categories || []).filter((c: CategoryItem) => !c.parentId);
        setCategories(parents);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleExpand = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setIsSubcategoryMode(false);
    setSelectedParentId('');
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
      isActive: true,
    });
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowModal(true);
  };

  const handleOpenAddSubcategory = (parentId: string) => {
    setEditingCategory(null);
    setIsSubcategoryMode(true);
    setSelectedParentId(parentId);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      isActive: true,
    });
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (cat: CategoryItem | SubcategoryItem) => {
    setEditingCategory(cat);
    setIsSubcategoryMode(Boolean(cat.parentId));
    setSelectedParentId(cat.parentId || '');
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive,
    });
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowModal(true);
  };

  const handleToggleStatus = async (cat: CategoryItem | SubcategoryItem) => {
    const newStatus = !cat.isActive;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.id,
          isActive: newStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update category status.');
      } else {
        fetchCategories();
      }
    } catch {
      alert('Error updating category status.');
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem | SubcategoryItem) => {
    const isParent = !cat.parentId;
    const confirmMessage = isParent
      ? `Are you sure you want to delete major category "${cat.name}"? If products are linked, deletion will be safely prevented.`
      : `Are you sure you want to delete subcategory "${cat.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${cat.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Could not delete category.');
      } else {
        alert(data.message || 'Category deleted successfully.');
        fetchCategories();
      }
    } catch {
      alert('Error deleting category.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const isEdit = Boolean(editingCategory?.id);
      const url = '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...(isEdit && { id: editingCategory?.id }),
        name: formData.name,
        slug: formData.slug || undefined,
        description: formData.description,
        image: formData.image,
        parentId: isSubcategoryMode ? selectedParentId : null,
        isActive: formData.isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save category.');
      } else {
        setShowModal(false);
        fetchCategories();
      }
    } catch {
      setErrorMsg('An unexpected error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-brand-600" /> Admin Category Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Create, organize department hierarchies, configure subcategories, and manage catalog statuses
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddCategory}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Major Category
            </button>
          </div>
        </div>

        {/* Search & Stats Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories or subcategories..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
            <span>
              Total Major Categories: <strong className="text-slate-900 font-bold">{categories.length}</strong>
            </span>
            <span>•</span>
            <span>
              Total Subcategories:{' '}
              <strong className="text-slate-900 font-bold">
                {categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0)}
              </strong>
            </span>
          </div>
        </div>

        {/* Category Hierarchy List */}
        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading category hierarchy...
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
            <FolderTree className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No categories found</h3>
            <p className="text-xs text-slate-500">Get started by creating your first major department.</p>
            <button
              onClick={handleOpenAddCategory}
              className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow"
            >
              + Create Category
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => {
              const isExpanded = Boolean(expandedCategories[cat.id]);
              const subcats = cat.subcategories || [];

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition"
                >
                  {/* Category Header Row */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleExpand(cat.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition"
                        title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-brand-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>

                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-200 flex-shrink-0">
                        {cat.image ? (
                          <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-sm">
                            {cat.name[0]}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-sm">{cat.name}</h3>
                          <span className="text-[10px] font-mono text-slate-400">/{cat.slug}</span>
                          {cat.isActive ? (
                            <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="text-slate-500 bg-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-lg mt-0.5">
                          {cat.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-4 text-xs w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-3 text-slate-500">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-bold text-slate-700">
                          {subcats.length} Subcategories
                        </span>
                        <span className="bg-brand-50 px-2.5 py-1 rounded-lg font-bold text-brand-700 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {cat._count.products + cat._count.subcategoryProducts} Products
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenAddSubcategory(cat.id)}
                          className="px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
                          title="Add Subcategory under this department"
                        >
                          <Plus className="w-3.5 h-3.5" /> Subcategory
                        </button>

                        <button
                          onClick={() => handleToggleStatus(cat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                          title={cat.isActive ? 'Deactivate category' : 'Activate category'}
                        >
                          {cat.isActive ? (
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-400" />
                          )}
                        </button>

                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subcategories Drawer */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50/30 space-y-2 border-t border-slate-100">
                      {subcats.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400">
                          No subcategories added yet.{' '}
                          <button
                            onClick={() => handleOpenAddSubcategory(cat.id)}
                            className="text-brand-600 font-bold hover:underline"
                          >
                            + Add first subcategory
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {subcats.map((sub) => (
                            <div
                              key={sub.id}
                              className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs hover:border-brand-300 transition"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900">{sub.name}</span>
                                  {sub.isActive ? (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-300" title="Inactive" />
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 block">/{sub.slug}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleStatus(sub)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700"
                                  title={sub.isActive ? 'Deactivate subcategory' : 'Activate subcategory'}
                                >
                                  {sub.isActive ? (
                                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <ToggleLeft className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(sub)}
                                  className="p-1 rounded text-brand-600 hover:bg-brand-50"
                                  title="Edit subcategory"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(sub)}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50"
                                  title="Delete subcategory"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add / Edit Category Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-slate-900 mb-1">
                {editingCategory
                  ? `Edit ${isSubcategoryMode ? 'Subcategory' : 'Category'}`
                  : `Add New ${isSubcategoryMode ? 'Subcategory' : 'Major Category'}`}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {isSubcategoryMode
                  ? 'Define sub-department taxonomy under a major parent category'
                  : 'Add a top-level department to YashodhaMart catalog'}
              </p>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Parent Category Selector if Subcategory */}
                {isSubcategoryMode && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Parent Category *</label>
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      required
                    >
                      <option value="">Select Parent Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: formData.slug ? formData.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      });
                    }}
                    placeholder="e.g. Grocery, Spices & Masala"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. grocery, spices-masala (auto-generated if empty)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono text-xs"
                  />
                </div>

                {!isSubcategoryMode && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief department overview for customers..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300"
                  />
                  <label htmlFor="isActiveToggle" className="font-bold text-slate-700 cursor-pointer">
                    Active & visible in customer store
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
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
                    {submitting ? 'Saving...' : 'Save Category'}
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
