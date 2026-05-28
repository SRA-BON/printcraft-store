import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import API from '../api';
import { API_ROOT } from '../config';
import {
    Download, Trash2, History, MessageSquare,
    ShoppingBag, AlertTriangle, DollarSign,
    Search, FileJson, RefreshCw
} from 'lucide-react';

const API_BASE = API_ROOT;

function AdminHistory() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // orders, reports, chats, transactions
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            if (activeTab === 'orders') endpoint = `${API_BASE}/orders/admin/all`;
            else if (activeTab === 'reports') endpoint = `${API_BASE}/reports/admin/all`;
            else if (activeTab === 'vouchers') endpoint = `${API_BASE}/vouchers/admin/all`;

            const res = await axios.get(endpoint);
            setData(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching history:', error);
            setData([]);
            setLoading(false);
        }
    };

    const deleteItem = async (id, type) => {
        if (!window.confirm('Delete this history record?')) return;
        try {
            let endpoint = '';
            if (type === 'orders') endpoint = `${API_BASE}/orders/${id}`;
            else if (type === 'reports') endpoint = `${API_BASE}/reports/${id}`;

            await axios.delete(endpoint);
            fetchHistory();
        } catch (error) {
            alert('Error deleting record');
        }
    };

    const downloadCSV = () => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => {
            return Object.values(item).map(val => {
                if (typeof val === 'object') return '"' + JSON.stringify(val).replace(/"/g, '""') + '"';
                return '"' + String(val).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');

        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${activeTab}_history_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${activeTab}_history_${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.removeChild(downloadAnchorNode);
    };

    return (
        <Layout userType="admin">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                        <History size={40} className="text-gray-400" /> Administrative History Logs
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={downloadJSON}
                            className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition"
                        >
                            <FileJson size={18} /> Export JSON
                        </button>
                        <button
                            onClick={downloadCSV}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                        >
                            <Download size={18} /> Download CSV
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border">
                    {[
                        { id: 'orders', label: 'All Orders', icon: ShoppingBag, color: 'text-blue-600' },
                        { id: 'reports', label: 'Report Logs', icon: AlertTriangle, color: 'text-red-600' },
                        { id: 'vouchers', label: 'Voucher History', icon: History, color: 'text-purple-600' },
                        { id: 'chats', label: 'Chat History', icon: MessageSquare, color: 'text-green-600' },
                        { id: 'transactions', label: 'Transactions', icon: DollarSign, color: 'text-emerald-600' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-4 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${activeTab === tab.id
                                    ? 'bg-gray-100 shadow-inner translate-y-0.5'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon size={20} className={tab.color} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={`Search in ${activeTab} history...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 border-gray-100"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
                        <RefreshCw className="mx-auto text-blue-500 animate-spin mb-4" size={48} />
                        <p className="text-xl font-bold text-gray-400">Synchronizing database logs...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-[10px] text-gray-400 text-center">No.</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-[10px] text-gray-400">Log Details</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-[10px] text-gray-400">User / Merchant</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-[10px] text-gray-400">Date/Time</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-[10px] text-gray-400 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length > 0 ? data.map((item, idx) => (
                                        <tr key={idx} className="border-b hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 text-center font-bold text-gray-300">{idx + 1}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-800">{item.orderId || item.reportId || item.code || 'N/A'}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{item.status || item.type || 'Log entry'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-700">{item.userId || item.email || 'System'}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black">{item.sellerId ? `Merchant: ${item.sellerId}` : 'Customer Entry'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-gray-600">{new Date(item.createdAt || item.timestamp).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-gray-400">{new Date(item.createdAt || item.timestamp).toLocaleTimeString()}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => deleteItem(item.orderId || item.reportId || item._id, activeTab)}
                                                    className="p-2 text-red-100 group-hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center font-bold text-gray-300 italic">No history records found in this category</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default AdminHistory;
