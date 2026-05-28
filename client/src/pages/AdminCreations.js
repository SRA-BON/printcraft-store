import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Palette, Download, Trash2, Search, FileJson, RefreshCw, Layers } from 'lucide-react';
import API from '../api';
import { API_ROOT } from '../config';

function AdminCreations() {
    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCreations();
    }, []);

    const fetchCreations = async () => {
        try {
            const response = await axios.get(`${API_ROOT}/creations`);
            setCreations(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching creations:', error);
            setLoading(false);
        }
    };

    const deleteCreation = async (id) => {
        if (!window.confirm('Are you sure you want to delete this creation?')) return;
        try {
            await axios.delete(`${API_ROOT}/creations/${id}`);
            fetchCreations();
        } catch (error) {
            alert('Error deleting creation');
        }
    };

    const downloadCreation = (creation) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(creation));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `creation_${creation.id}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    if (loading) return <Layout userType="admin"><div>Loading...</div></Layout>;

    const filteredCreations = creations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout userType="admin">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                            <Palette className="text-purple-600" size={40} /> User Creations
                        </h1>
                        <p className="text-gray-500 font-medium">Manage and audit all user-customized products and designs.</p>
                    </div>
                    <button
                        onClick={fetchCreations}
                        className="bg-white border-2 border-gray-100 p-3 rounded-xl hover:bg-gray-50 transition shadow-sm"
                    >
                        <RefreshCw size={24} className="text-gray-600" />
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <Layers size={18} /> {filteredCreations.length} Creations Found
                        </div>
                    </div>

                    {filteredCreations.length === 0 ? (
                        <div className="py-20 text-center opacity-40">
                            <Palette size={80} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-2xl font-black">No Creations Found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {filteredCreations.map(creation => (
                                <div key={creation._id} className="bg-gray-50 rounded-2xl p-6 border border-transparent hover:border-purple-200 transition-all group">
                                    <div className="flex gap-4 mb-6">
                                        <img src={creation.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover shadow-md" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 leading-tight mb-1">{creation.name}</h3>
                                            <span className="text-xs font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded-md">{creation.category}</span>
                                            <p className="text-xs text-gray-400 mt-2">ID: {creation.id}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => downloadCreation(creation)}
                                            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-100 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            <Download size={18} /> Download Data
                                        </button>
                                        <div className="flex gap-2">
                                            <button className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-100 py-3 rounded-xl font-bold text-blue-600 hover:bg-blue-50 transition">
                                                <FileJson size={18} /> View Meta
                                            </button>
                                            <button
                                                onClick={() => deleteCreation(creation._id)}
                                                className="p-3 bg-white border-2 border-gray-100 rounded-xl text-red-500 hover:bg-red-50 transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default AdminCreations;
