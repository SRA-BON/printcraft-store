import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import API from '../api';
import { API_ROOT } from '../config';

import {
    Clock, ChevronDown,
    MapPin, User as UserIcon,
    Package, RefreshCw, Download
} from 'lucide-react';
import { generateInvoice } from '../utils/invoiceGenerator';

const API_ORDERS = `${API_ROOT}/orders`;

function SellerOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState({ id: '', status: '', message: '' });
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_ORDERS}/seller/${user.id}`);
            setOrders(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const updateStatus = async (orderId) => {
        if (!newStatus.status) return;
        try {
            await axios.put(`${API_ORDERS}/${orderId}/status`, {
                status: newStatus.status,
                message: newStatus.message
            });
            fetchOrders();
            setNewStatus({ id: '', status: '', message: '' });
            alert('Order updated successfully!');
        } catch (error) {
            alert('Error updating status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'declined': return 'bg-red-100 text-red-700 border-red-200';
            case 'on-hold': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <Layout userType="seller"><div>Loading...</div></Layout>;

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'pending') {
            return order.status === 'pending';
        } else { // 'history' tab
            return order.status !== 'pending';
        }
    });

    return (
        <Layout userType="seller">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-4xl font-bold text-gray-800">Orders Management</h1>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => { setActiveTab('pending'); setExpandedOrder(null); }}
                            className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'pending' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            Pending Orders
                        </button>
                        <button
                            onClick={() => { setActiveTab('history'); setExpandedOrder(null); }}
                            className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'history' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            Order History
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                        <div key={order.orderId} className={`bg-white rounded-2xl shadow-lg border-2 transition-all ${expandedOrder === order.orderId ? 'border-blue-500' : 'border-gray-100 hover:border-gray-200'}`}>
                            {/* Order Header */}
                            <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-xl ${getStatusColor(order.status)} border-2`}>
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{order.orderId}</h3>
                                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    {/* ... */}
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Items</p>
                                        <p className="font-bold text-gray-800">{order.products.length} Products</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total</p>
                                        <p className="font-bold text-gray-800 text-xl">৳{order.totalPrice}</p>
                                    </div>
                                    <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase border-2 ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </div>
                                    {/* ... invoice button ... */}
                                    <button
                                        onClick={() => generateInvoice({
                                            ...order,
                                            items: order.products.map(p => ({
                                                name: p.name,
                                                quantity: p.quantity,
                                                price: p.price
                                            })),
                                            shippingAddress: {
                                                name: order.customerName,
                                                phone: order.customerPhone,
                                                address: order.deliveryLocation,
                                                city: 'Dhaka' // Fallback
                                            }
                                        }, 'seller')}
                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition"
                                        title="Download Invoice"
                                    >
                                        <Download size={24} />
                                    </button>
                                    <button
                                        onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition"
                                    >
                                        <ChevronDown size={24} className={`transform transition ${expandedOrder === order.orderId ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Order Details (Expanded) */}
                            {expandedOrder === order.orderId && (
                                <div className="p-6 pt-0 border-t">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                                        {/* Left: Customer & Delivery Info */}
                                        <div className="space-y-6">
                                            <div className="bg-gray-50 p-6 rounded-2xl">
                                                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2"><UserIcon size={18} /> Customer Details</h4>
                                                <div className="space-y-2">
                                                    <p className="flex justify-between"><span>Name:</span> <span className="font-bold">{order.customerName || 'N/A'}</span></p>
                                                    <p className="flex justify-between"><span>Phone:</span> <span className="font-bold">{order.customerPhone || 'N/A'}</span></p>
                                                    <p className="mt-4 flex gap-2">
                                                        <MapPin size={18} className="text-red-500" />
                                                        <span className="text-gray-600 font-medium">{order.deliveryLocation}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 p-6 rounded-2xl">
                                                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2"><Clock size={18} /> Update Status</h4>

                                                {order.status === 'pending' ? (
                                                    <div className="space-y-4">
                                                        <p className="text-sm text-gray-600">This order is pending your approval.</p>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await axios.put(`${API_ORDERS}/${order.orderId}/status`, {
                                                                        status: 'confirmed',
                                                                        message: 'Order Accepted by Merchant'
                                                                    });
                                                                    fetchOrders();
                                                                    alert('Order Accepted!');
                                                                } catch (e) { alert('Error accepting order'); }
                                                            }}
                                                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 shadow-lg transition"
                                                        >
                                                            Accept Order
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!window.confirm('Are you sure you want to decline?')) return;
                                                                try {
                                                                    await axios.put(`${API_ORDERS}/${order.orderId}/status`, {
                                                                        status: 'declined',
                                                                        message: 'Order Declined by Merchant'
                                                                    });
                                                                    fetchOrders();
                                                                } catch (e) { alert('Error declining order'); }
                                                            }}
                                                            className="w-full bg-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-200 transition"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <select
                                                            value={newStatus.id === order.orderId ? newStatus.status : ''}
                                                            onChange={(e) => setNewStatus({ ...newStatus, id: order.orderId, status: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">Select Action...</option>
                                                            <option value="confirmed">Confirm Order</option>
                                                            <option value="shipped">Mark as Shipped</option>
                                                            <option value="on-hold">Put on Hold</option>
                                                            <option value="delivered">Successfully Delivered</option>
                                                            <option value="declined">Decline Order</option>
                                                        </select>
                                                        <input
                                                            placeholder="Optional progress note (e.g. Printing set to start)"
                                                            value={newStatus.id === order.orderId ? newStatus.message : ''}
                                                            onChange={(e) => setNewStatus({ ...newStatus, id: order.orderId, message: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 rounded-xl"
                                                        />
                                                        <button
                                                            disabled={newStatus.id !== order.orderId || !newStatus.status}
                                                            onClick={() => updateStatus(order.orderId)}
                                                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition"
                                                        >
                                                            Update Processing Detail
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Products List & Progress */}
                                        <div className="space-y-6">
                                            <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
                                                <h4 className="font-bold text-gray-700 p-4 bg-gray-50 border-b">Ordered Products</h4>
                                                <div className="divide-y">
                                                    {order.products.map((item, idx) => (
                                                        <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                                            <div>
                                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                                <p className="text-xs text-gray-500">ID: {item.productId}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-blue-600">৳{item.price}</p>
                                                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-bold text-gray-700 flex items-center gap-2"><RefreshCw size={18} /> Processing History</h4>
                                                <div className="relative border-l-2 border-blue-100 ml-3 pl-6 space-y-4 py-2">
                                                    {order.progress?.map((step, idx) => (
                                                        <div key={idx} className="relative">
                                                            <div className="absolute -left-[31px] top-1 bg-blue-500 w-3 h-3 rounded-full border-2 border-white" />
                                                            <p className="font-bold text-gray-800 text-sm capitalize">{step.status}</p>
                                                            <p className="text-gray-500 text-xs mt-1">{step.message}</p>
                                                            <p className="text-gray-400 text-[10px] uppercase font-bold mt-1">{new Date(step.timestamp).toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-dashed">
                            <Package size={64} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-xl text-gray-400 font-bold">No {activeTab === 'pending' ? 'pending' : 'historical'} orders found matching your profile</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default SellerOrders;
