'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/actions/menu-categories';
import type { MenuCategory } from '@/lib/db/schema';

export default function MenuCategoriesPage() {
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', icon: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        const result = await getCategories();
        if (result.success) {
            setCategories(result.categories);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setMessage({ type: 'error', text: 'Category name is required' });
            return;
        }

        setSaving(true);
        let result;

        if (editingCategory) {
            result = await updateCategory(editingCategory.id, formData);
        } else {
            result = await createCategory(formData);
        }

        if (result.success) {
            setMessage({ type: 'success', text: editingCategory ? 'Category updated!' : 'Category created!' });
            setFormData({ name: '', description: '', icon: '' });
            setShowForm(false);
            setEditingCategory(null);
            loadCategories();
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to save category' });
        }

        setSaving(false);
    };

    const handleEdit = (category: MenuCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        const result = await deleteCategory(categoryId);
        if (result.success) {
            setMessage({ type: 'success', text: 'Category deleted!' });
            loadCategories();
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to delete category' });
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', icon: '' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Menu Categories</h1>
                    <p className="text-gray-600 mt-1">Organize your menu items into categories</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
                    <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., Appetizers, Main Course, Desserts"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                placeholder="Optional description"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Icon (Emoji)
                            </label>
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., 🍕 🍔 🍰"
                                maxLength={2}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {categories.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p className="text-lg mb-2">No categories yet</p>
                        <p className="text-sm">Create your first category to organize your menu items</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <GripVertical className="text-gray-400" size={20} />
                                    {category.icon && (
                                        <span className="text-3xl">{category.icon}</span>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                                        {category.description && (
                                            <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit category"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete category"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
