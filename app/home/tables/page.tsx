'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, QrCode, Download, RefreshCw } from 'lucide-react';
import { getTables, createTable, updateTable, deleteTable, regenerateQRCode } from '@/lib/actions/tables';
import type { Table } from '@/lib/db/schema';
import Image from 'next/image';

export default function TablesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [formData, setFormData] = useState({ tableNumber: '', seatingCapacity: 4 });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [selectedQR, setSelectedQR] = useState<Table | null>(null);

    useEffect(() => {
        loadTables();
    }, []);

    const loadTables = async () => {
        setLoading(true);
        const result = await getTables();
        if (result.success) {
            setTables(result.tables);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tableNumber.trim()) {
            setMessage({ type: 'error', text: 'Table number is required' });
            return;
        }

        setSaving(true);
        let result;

        if (editingTable) {
            result = await updateTable(editingTable.id, formData);
        } else {
            result = await createTable(formData);
        }

        if (result.success) {
            setMessage({ type: 'success', text: editingTable ? 'Table updated!' : 'Table created with QR code!' });
            setFormData({ tableNumber: '', seatingCapacity: 4 });
            setShowForm(false);
            setEditingTable(null);
            loadTables();
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to save table' });
        }

        setSaving(false);
    };

    const handleEdit = (table: Table) => {
        setEditingTable(table);
        setFormData({
            tableNumber: table.tableNumber,
            seatingCapacity: table.seatingCapacity || 4,
        });
        setShowForm(true);
    };

    const handleDelete = async (tableId: string) => {
        if (!confirm('Are you sure you want to delete this table?')) return;

        const result = await deleteTable(tableId);
        if (result.success) {
            setMessage({ type: 'success', text: 'Table deleted!' });
            loadTables();
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to delete table' });
        }
    };

    const handleRegenerateQR = async (tableId: string) => {
        const result = await regenerateQRCode(tableId);
        if (result.success) {
            setMessage({ type: 'success', text: 'QR code regenerated!' });
            loadTables();
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to regenerate QR code' });
        }
    };

    const handleDownloadQR = (table: Table) => {
        const link = document.createElement('a');
        link.href = table.qrCode;
        link.download = `table-${table.tableNumber}-qr.png`;
        link.click();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingTable(null);
        setFormData({ tableNumber: '', seatingCapacity: 4 });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading tables...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Restaurant Tables</h1>
                    <p className="text-gray-600 mt-1">Manage tables and QR codes for ordering</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus size={20} />
                    Add Table
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
                    <h2 className="text-xl font-bold mb-4">{editingTable ? 'Edit Table' : 'New Table'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Table Number *
                            </label>
                            <input
                                type="text"
                                value={formData.tableNumber}
                                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., T1, Table 1, A1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seating Capacity
                            </label>
                            <input
                                type="number"
                                value={formData.seatingCapacity}
                                onChange={(e) => setFormData({ ...formData, seatingCapacity: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                min="1"
                                max="20"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : editingTable ? 'Update Table' : 'Create Table'}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-2xl shadow-lg">
                        <p className="text-lg mb-2">No tables yet</p>
                        <p className="text-sm">Create your first table to generate QR codes</p>
                    </div>
                ) : (
                    tables.map((table) => (
                        <div
                            key={table.id}
                            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-200 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">{table.tableNumber}</h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Seats: {table.seatingCapacity} • {table.status}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(table)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit table"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(table.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete table"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                <Image
                                    src={table.qrCode}
                                    alt={`QR Code for ${table.tableNumber}`}
                                    width={200}
                                    height={200}
                                    className="mx-auto cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => setSelectedQR(table)}
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownloadQR(table)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                    <Download size={16} />
                                    Download
                                </button>
                                <button
                                    onClick={() => handleRegenerateQR(table.id)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                    title="Regenerate QR"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* QR Code Modal */}
            {selectedQR && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedQR(null)}
                >
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-4 text-center">{selectedQR.tableNumber}</h3>
                        <Image
                            src={selectedQR.qrCode}
                            alt={`QR Code for ${selectedQR.tableNumber}`}
                            width={400}
                            height={400}
                            className="mx-auto"
                        />
                        <button
                            onClick={() => handleDownloadQR(selectedQR)}
                            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                            Download QR Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
