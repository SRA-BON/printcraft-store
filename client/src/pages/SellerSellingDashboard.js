import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import API from '../api';
import { API_ROOT } from '../config';

import {
    Package, BarChart3, Clock, ChevronRight,
    TrendingUp, ShoppingBag, AlertCircle
} from 'lucide-react';
import axios from 'axios';

function SellerSellingDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProducts: 0,
        pendingOrders: 0,
        totalSales: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchDashboardStats = async () => {
        try {
            // In a real app, you'd have a single endpoint for this
            // For now, let's just simulate some data or fetch count
            const productsRes = await axios.get(`${API_ROOT}/products/seller/${user.id}`);
            const ordersRes = await axios.get(`${API_ROOT}/orders/seller/${user.id}`);

            setStats({
                totalProducts: productsRes.data.length,
                pendingOrders: ordersRes.data.filter(o => o.status === 'pending').length,
                totalSales: ordersRes.data.filter(o => o.status === 'delivered').reduce((acc, curr) => acc + curr.totalPrice, 0)
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setLoading(false);
        }
    };

    if (loading) return <Layout userType="seller"><div className="text-center py-20">Loading...</div></Layout>;

    return (
        <Layout userType="seller">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-rose-50 mb-8">Selling Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Section 1: Stock */}
                    <div className="bg-white dark:bg-rose-950 rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all border border-rose-50 dark:border-rose-900">
                        <div className="p-8">
                            <div className="bg-rose-100 w-16 h-16 rounded-2xl flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
                                <Package size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-rose-50 mb-2">Merchant's Stock</h2>
                            <p className="text-gray-600 dark:text-rose-200 mb-6">Manage your products, updates, and inventory details.</p>
                            <div className="flex items-center justify-between py-4 border-t border-b mb-6">
                                <span className="text-gray-500 dark:text-rose-200">Total Products</span>
                                <span className="text-2xl font-bold text-rose-600">{stats.totalProducts}</span>
                            </div>
                            <button
                                onClick={() => navigate('/seller/stock')}
                                className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition"
                            >
                                Go to Stock <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Section 2: Statistics */}
                    <div className="bg-white dark:bg-rose-950 rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all border border-rose-50 dark:border-rose-900">
                        <div className="p-8">
                            <div className="bg-rose-100 w-16 h-16 rounded-2xl flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-rose-50 mb-2">Selling Statistics</h2>
                            <p className="text-gray-600 dark:text-rose-200 mb-6">Analyze your sales performance, interest points, and trends.</p>
                            <div className="flex items-center justify-between py-4 border-t border-b mb-6">
                                <span className="text-gray-500 dark:text-rose-200">Total Revenue</span>
                                <span className="text-2xl font-bold text-rose-600">৳{stats.totalSales}</span>
                            </div>
                            <button
                                onClick={() => navigate('/seller/statistics')}
                                className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition"
                            >
                                View Statistics <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Section 3: Pending Orders */}
                    <div className="bg-white dark:bg-rose-950 rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all border border-rose-50 dark:border-rose-900">
                        <div className="p-8">
                            <div className="bg-rose-100 w-16 h-16 rounded-2xl flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
                                <Clock size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-rose-50 mb-2">Pending Orders</h2>
                            <p className="text-gray-600 dark:text-rose-200 mb-6">Confirm or decline new orders and update processing details.</p>
                            <div className="flex items-center justify-between py-4 border-t border-b mb-6">
                                <span className="text-gray-500 dark:text-rose-200">Active Pending</span>
                                <span className="text-2xl font-bold text-rose-600">{stats.pendingOrders}</span>
                            </div>
                            <button
                                onClick={() => navigate('/seller/orders')}
                                className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition"
                            >
                                Manage Orders <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Summary Hooks (Module 4) */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-2xl p-8 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-rose-100 font-medium mb-1">Recent Achievement</p>
                                <h3 className="text-2xl font-bold mb-4">You've reached {stats.totalProducts} products!</h3>
                                <div className="flex items-center gap-2 text-sm bg-white/20 w-fit px-3 py-1 rounded-full">
                                    <TrendingUp size={16} /> +12% growth this month
                                </div>
                            </div>
                            <ShoppingBag size={48} className="opacity-40" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-rose-950 border-2 border-rose-100 dark:border-rose-900 rounded-2xl p-8">
                        <div className="flex gap-4">
                            <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-rose-50 mb-1">Quick Action Required</h3>
                                <p className="text-gray-600 dark:text-rose-200 mb-4">You have {stats.pendingOrders} pending orders that need confirmation to maintain your merchant rating.</p>
                                <button
                                    onClick={() => navigate('/seller/orders')}
                                    className="text-rose-600 font-bold hover:underline"
                                >
                                    Respond now →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default SellerSellingDashboard;
