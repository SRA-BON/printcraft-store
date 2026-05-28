import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import API from '../api';
import { API_ROOT } from '../config';

import {
    AlertTriangle, MessageSquare, Send, CheckCircle,
    Clock, ShieldAlert
} from 'lucide-react';

const API_REPORTS = `${API_ROOT}/reports`;

function SellerReports() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // pending, responded
    const [responseText, setResponseText] = useState({ id: '', text: '' });

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchReports = async () => {
        try {
            const res = await axios.get(`${API_REPORTS}/seller/${user.id}`);
            setReports(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setLoading(false);
        }
    };

    const handleResponse = async (reportId) => {
        try {
            await axios.put(`${API_REPORTS}/${reportId}/respond`, {
                response: responseText.text
            });
            fetchReports();
            setResponseText({ id: '', text: '' });
            alert('Response sent to customer!');
        } catch (error) {
            alert('Error sending response');
        }
    };

    const filteredReports = reports.filter(r =>
        activeTab === 'pending' ? r.status === 'Pending' : r.status === 'Responded'
    );

    if (loading) return <Layout userType="seller"><div>Loading...</div></Layout>;

    return (
        <Layout userType="seller">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Customer Reports & Grievances</h1>
                    <div className="flex bg-white rounded-xl shadow p-1">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-2 rounded-lg font-bold transition flex items-center gap-2 ${activeTab === 'pending' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <ShieldAlert size={18} /> Pending {reports.filter(r => r.status === 'Pending').length > 0 && `(${reports.filter(r => r.status === 'Pending').length})`}
                        </button>
                        <button
                            onClick={() => setActiveTab('responded')}
                            className={`px-6 py-2 rounded-lg font-bold transition flex items-center gap-2 ${activeTab === 'responded' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <CheckCircle size={18} /> Responded
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredReports.length > 0 ? filteredReports.map(report => (
                        <div key={report.reportId} className={`bg-white rounded-2xl shadow-lg border-l-8 overflow-hidden transition-all hover:scale-[1.01] ${report.status === 'Pending' ? 'border-red-500 shadow-red-100' : 'border-green-500 shadow-green-100'}`}>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Report ID: {report.reportId}</span>
                                        <h3 className="text-xl font-bold text-gray-800 mt-1">{report.type}</h3>
                                    </div>
                                    <div className={`p-2 rounded-lg ${report.status === 'Pending' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        <AlertTriangle size={24} />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl mb-6 italic text-gray-700">
                                    "{report.description}"
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 font-medium">
                                    <div className="flex items-center gap-1"><Clock size={16} /> {new Date(report.createdAt).toLocaleString()}</div>
                                    <div className="flex items-center gap-1"><MessageSquare size={16} /> User: {report.userId}</div>
                                    {report.orderId && <div className="flex items-center gap-1 font-bold text-blue-600">Order: {report.orderId}</div>}
                                </div>

                                {report.status === 'Pending' ? (
                                    <div className="space-y-4 pt-4 border-t">
                                        <h4 className="font-bold text-gray-700 flex items-center gap-2"><Send size={18} /> Your Response</h4>
                                        <textarea
                                            placeholder="Type your resolution or response here..."
                                            value={responseText.id === report.reportId ? responseText.text : ''}
                                            onChange={(e) => setResponseText({ id: report.reportId, text: e.target.value })}
                                            className="w-full px-4 py-3 border-2 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 transition-all border-gray-100 focus:border-blue-200"
                                        />
                                        <button
                                            disabled={responseText.id !== report.reportId || !responseText.text}
                                            onClick={() => handleResponse(report.reportId)}
                                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition shadow-lg shadow-blue-100"
                                        >
                                            Send Response
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t-2 border-dashed border-green-100">
                                        <div className="bg-green-50 p-4 rounded-xl border-2 border-green-100">
                                            <p className="text-xs font-black text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <CheckCircle size={14} /> Resolved Response
                                            </p>
                                            <p className="text-green-800 font-medium">"{report.response}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="lg:col-span-2 text-center py-20 bg-white rounded-3xl border-4 border-dashed border-gray-100">
                            <Clock size={64} className="mx-auto text-gray-100 mb-4" />
                            <p className="text-2xl font-bold text-gray-300">No {activeTab} reports at the moment</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default SellerReports;
