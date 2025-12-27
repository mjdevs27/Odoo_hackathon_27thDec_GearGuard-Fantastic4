import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Loader2, X, Save } from 'lucide-react';
import axios from 'axios';
import DashboardNavbar from '../../components/DashboardNavbar';

interface EquipmentCategory {
    id: string;
    name: string;
    responsible: string;
    responsible_id: string | null;
    company: string;
}

interface User {
    id: string;
    name: string;
}

const EquipmentCategoriesPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<EquipmentCategory[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<EquipmentCategory | null>(null);
    const [formData, setFormData] = useState({ name: '', responsible_id: '', company: 'XYZ' });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch categories and users from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/categories'),
                    axios.get('http://localhost:5000/api/categories/users')
                ]);
                setCategories(catRes.data);
                setUsers(usersRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setCategories([]);
                setUsers([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handle delete
    const handleDelete = async (ids: string[]) => {
        if (!confirm(`Delete ${ids.length} category(s)?`)) return;

        try {
            await Promise.all(ids.map(id =>
                axios.delete(`http://localhost:5000/api/categories/${id}`)
            ));
            setCategories(prev => prev.filter(cat => !ids.includes(cat.id)));
            setSelectedIds([]);
        } catch (error) {
            console.error('Error deleting categories:', error);
            alert('Failed to delete category');
        }
    };

    // Toggle selection
    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    // Open modal for new/edit
    const openModal = (category?: EquipmentCategory) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                responsible_id: category.responsible_id || '',
                company: category.company
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', responsible_id: '', company: 'XYZ' });
        }
        setShowModal(true);
    };

    // Save category
    const handleSave = async () => {
        if (!formData.name) {
            alert('Please enter a category name');
            return;
        }

        setIsSaving(true);
        try {
            if (editingCategory) {
                const res = await axios.put(`http://localhost:5000/api/categories/${editingCategory.id}`, formData);
                setCategories(prev => prev.map(cat =>
                    cat.id === editingCategory.id ? res.data : cat
                ));
            } else {
                const res = await axios.post('http://localhost:5000/api/categories', formData);
                setCategories(prev => [...prev, res.data]);
            }
            setShowModal(false);
        } catch (error: any) {
            console.error('Error saving category:', error);
            alert(error.response?.data?.error || 'Failed to save category');
        } finally {
            setIsSaving(false);
        }
    };

    // Filter categories
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.responsible.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <DashboardNavbar />

            {/* Main Content */}
            <div className="p-8">
                {/* Table Container */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    {/* Table Header Controls */}
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* New Button */}
                            <button
                                onClick={() => openModal()}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New
                            </button>

                            {/* Equipment Categories Label */}
                            <div className="flex items-center gap-2">
                                <div className="w-0.5 h-5 bg-slate-800 rounded-full"></div>
                                <h2 className="text-base font-medium text-slate-900">Equipment Categories</h2>
                            </div>
                        </div>

                        {/* Search & Actions */}
                        <div className="flex items-center gap-3">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={() => handleDelete(selectedIds)}
                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete ({selectedIds.length})
                                </button>
                            )}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-6 py-3 text-left w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                                            onChange={() => {
                                                if (selectedIds.length === filteredCategories.length) {
                                                    setSelectedIds([]);
                                                } else {
                                                    setSelectedIds(filteredCategories.map(cat => cat.id));
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700 italic">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Responsible</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Company</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700 w-20">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No categories found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((cat) => (
                                        <tr
                                            key={cat.id}
                                            className="hover:bg-blue-50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(cat.id)}
                                                    onChange={() => toggleSelection(cat.id)}
                                                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                                />
                                            </td>
                                            <td
                                                className="px-6 py-4 cursor-pointer"
                                                onClick={() => openModal(cat)}
                                            >
                                                <span className="text-sm text-blue-600 hover:underline font-medium">
                                                    {cat.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-700">{cat.responsible || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-700">{cat.company}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openModal(cat)}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete([cat.id])}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Showing {filteredCategories.length} of {categories.length} categories</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">
                                {editingCategory ? 'Edit Category' : 'New Equipment Category'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Computers, Monitors..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-blue-500 outline-none"
                                />
                            </div>

                            {/* Responsible */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Responsible</label>
                                <select
                                    value={formData.responsible_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, responsible_id: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-blue-500 outline-none"
                                >
                                    <option value="">Select responsible person...</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-sm text-slate-700 mb-2">Company</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    readOnly
                                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentCategoriesPage;
