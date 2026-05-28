import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import API from '../api';
import { API_ROOT } from '../config';

import {
  User, Lock, MapPin, CreditCard, Shield, Camera, Edit, Save, X,
  Plus, Trash2, Check, Phone, Mail, Calendar, Key, FileText, Download,
  Package, ShoppingBag, ShoppingCart, Bell,
  Wallet, Send, History, ArrowUpRight, ArrowDownLeft, Star, Activity, Ticket // Added missing icons
} from 'lucide-react';
import { generateInvoice } from '../utils/invoiceGenerator';

const API_URL = `${API_ROOT}/users`;

function UserDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    alternativePhone: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [reports, setReports] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: 'Other',
    description: '',
    sellerId: '',
    orderId: ''
  });
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    type: 'mobile',
    provider: 'bkash',
    regionCode: '+880',
    accountNumber: '',
    isDefault: false
  });

  const fetchVouchers = async () => {
    try {
      const response = await axios.get(`${API_ROOT}/vouchers`);
      const allVouchers = response.data;
      const now = new Date();
      const validVouchers = allVouchers.filter(v => {
        const isExpired = v.expiryDate && new Date(v.expiryDate) < now;
        const isStarted = !v.validityStart || new Date(v.validityStart) <= now;
        const isAssigned = !v.assignedTo || v.assignedTo.length === 0 || v.assignedTo.includes(user.id);
        return !isExpired && isStarted && isAssigned && v.status === 'active';
      });
      setVouchers(validVouchers);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const fetchWallet = async () => {
    try {
      const bRes = await axios.get(`${API_ROOT}/wallet/${user.id}/balance`);
      const hRes = await axios.get(`${API_ROOT}/wallet/${user.id}/history`);
      setWallet({
        balance: bRes.data.balance,
        transactions: hRes.data
      });
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ROOT}/wallet/${user.id}/add-funds`, {
        amount: addFundsAmount,
        paymentMethod: 'Bank Transfer' // Simplified for now
      });
      alert('Funds added successfully!');
      setAddFundsAmount('');
      setShowAddFunds(false);
      fetchWallet();
      fetchProfile(); // Update user balance in profile if needed
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding funds');
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchReports();
      fetchVouchers();
      fetchOrders();
      fetchWallet();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/${user.id}`);
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        phone: response.data.phone,
        alternativePhone: response.data.alternativePhone || '',
        password: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_ROOT}/orders/user/${user.id}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const [notifications, setNotifications] = useState([]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_ROOT}/reports/user/${user.id}`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/notifications/user/${user.id}`);
      setNotifications(res.data);
    } catch (err) { console.error('Error fetching notifications:', err); }
  };

  useEffect(() => {
    if (user) {
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'reports') fetchReports();
      if (activeTab === 'notifications') fetchNotifications();
    }
  }, [user, activeTab]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ROOT}/reports`, {
        ...reportForm,
        userId: user.id
      });
      setSuccess('Report submitted successfully!');
      setShowReportForm(false);
      setReportForm({ type: 'Other', description: '', sellerId: '', orderId: '' });
      fetchReports();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to submit report');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    try {
      setError('');
      await axios.put(`${API_URL}/${user.id}`, {
        name: formData.name,
        phone: formData.phone,
        alternativePhone: formData.alternativePhone
      });
      setSuccess('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    try {
      setError('');
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      await axios.put(`${API_URL}/${user.id}`, { password: formData.newPassword });
      setSuccess('Password changed successfully!');
      setShowPasswordForm(false);
      setFormData({ ...formData, password: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleAddAddress = async () => {
    try {
      await axios.post(`${API_URL}/${user.id}/addresses`, addressForm);
      setSuccess('Address added successfully!');
      setShowAddressForm(false);
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add address');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      await axios.put(`${API_URL}/${user.id}/addresses/${editingAddress._id}`, addressForm);
      setSuccess('Address updated successfully!');
      setEditingAddress(null);
      setShowAddressForm(false);
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await axios.delete(`${API_URL}/${user.id}/addresses/${addressId}`);
      setSuccess('Address deleted!');
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete address');
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    try {
      const fullNumber = `${paymentForm.regionCode}${paymentForm.accountNumber}`;
      await axios.post(`${API_URL}/${user.id}/payment-methods`, {
        ...paymentForm,
        accountNumber: fullNumber
      });
      setSuccess('Payment method added successfully!');
      setShowPaymentForm(false);
      setPaymentForm({
        type: 'mobile',
        provider: 'bkash',
        regionCode: '+880',
        accountNumber: '',
        isDefault: false
      });
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add payment method');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    if (!window.confirm('Delete this payment method?')) return;
    try {
      await axios.delete(`${API_URL}/${user.id}/payment-methods/${methodId}`);
      setSuccess('Payment method deleted!');
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete payment method');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await axios.put(`${API_URL}/${user.id}/addresses/${addressId}/default`);
      setSuccess('Default address updated!');
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to set default address');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    try {
      await axios.put(`${API_URL}/${user.id}/profile-image`, { profileImage: imageUrl });
      setSuccess('Profile image updated!');
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update profile image');
    }
  };

  if (loading) return <Layout userType="user"><div className="text-center py-20 font-bold">Loading...</div></Layout>;

  return (
    <Layout userType="user">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
        {success && <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>}

        <h1 className="text-4xl font-black text-gray-900 mb-8">User Dashboard</h1>

        <div className="flex gap-2 mb-8 border-b pb-1 overflow-x-auto">
          {['profile', 'orders', 'notifications', 'addresses', 'reports', 'vouchers', 'digital-wallet'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-black capitalize transition-all rounded-t-2xl ${activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'digital-wallet' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
                  <Wallet size={32} className="text-blue-600" /> Digital Wallet
                </h2>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 mb-8 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-blue-200 font-bold mb-1">Available Balance</p>
                    <h3 className="text-5xl font-black mb-6">৳{wallet.balance.toLocaleString()}</h3>
                    
                    {!showAddFunds ? (
                      <button 
                        onClick={() => setShowAddFunds(true)}
                        className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg"
                      >
                        <Plus size={20} /> Add Funds
                      </button>
                    ) : (
                      <form onSubmit={handleAddFunds} className="flex gap-4 items-center animate-fade-in">
                        <input
                          type="number"
                          value={addFundsAmount}
                          onChange={(e) => setAddFundsAmount(e.target.value)}
                          placeholder="Amount"
                          className="px-4 py-3 rounded-xl text-gray-800 font-bold w-40 outline-none"
                          min="1"
                          required
                        />
                        <button type="submit" className="bg-green-400 text-green-900 px-6 py-3 rounded-xl font-bold hover:bg-green-300 transition">
                          Confirm
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setShowAddFunds(false)}
                          className="bg-white/20 text-white px-4 py-3 rounded-xl font-bold hover:bg-white/30 transition"
                        >
                          Cancel
                        </button>
                      </form>
                    )}
                  </div>
                  
                  {/* Decorative circles */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-0 right-20 w-32 h-32 bg-indigo-500/30 rounded-full blur-xl" />
                </div>

                <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                  <History size={24} /> Transaction History
                </h3>

                {wallet.transactions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-gray-400 font-bold">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wallet.transactions.map((txn) => (
                      <div key={txn._id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:shadow-md transition bg-gray-50/50">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {txn.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{txn.description}</p>
                            {txn.referenceId && (
                              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Ref: {txn.referenceId}</p>
                            )}
                            <p className="text-xs text-gray-500 font-bold">{new Date(txn.date).toLocaleDateString()} • {new Date(txn.date).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <span className={`text-xl font-black ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.type === 'credit' ? '+' : '-'}৳{txn.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                    <User size={32} className="text-blue-600" /> My Profile
                  </h2>
                  {!editing && (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-200 transition-all">
                      <Edit size={20} /> Edit Profile
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-start gap-10">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-blue-100 shadow-lg">
                      {profile?.profileImage ? (
                        <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <User size={64} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-blue-300">
                      <Camera size={20} />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="flex-1 w-full space-y-6">
                    {editing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold" />
                          </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                          <button onClick={handleSave} className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition">Save Changes</button>
                          <button onClick={() => { setEditing(false); fetchProfile(); }} className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-xs font-black text-blue-600 uppercase mb-1">Full Name</p>
                          <p className="text-xl font-black text-gray-800">{profile?.name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-blue-600 uppercase mb-1">Email Address</p>
                          <p className="text-xl font-black text-gray-800">{profile?.email}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-blue-600 uppercase mb-1">Phone Number</p>
                          <p className="text-xl font-black text-gray-800">{profile?.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-blue-600 uppercase mb-1">Username</p>
                          <p className="text-xl font-black text-gray-800">@{profile?.username}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-black text-gray-800 mb-10 flex items-center gap-3">
                  <ShoppingBag size={32} className="text-blue-600" /> Order History
                </h2>
                {orders.length === 0 ? (
                  <div className="text-center py-20 opacity-20">
                    <Package size={80} className="mx-auto mb-4" />
                    <p className="text-2xl font-black">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map(order => (
                      <div key={order._id || order.orderId} className="group border-2 border-gray-50 rounded-[2rem] p-8 hover:border-blue-200 transition-all hover:shadow-2xl hover:shadow-blue-50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                          <div>
                            <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-widest">ORDER #{order.orderId}</p>
                            <p className="text-3xl font-black text-gray-900">৳{order.totalPrice}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest 
                              ${order.status === 'delivered' ? 'bg-green-100 text-green-700'
                                : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                              {order.status}
                            </span>
                            <button
                              onClick={() => generateInvoice(order, 'customer')}
                              className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-100"
                              title="Download Invoice"
                            >
                              <Download size={24} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mb-6">
                          {order.products && order.products.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 border border-gray-100">
                              {item.name} <span className="text-blue-600">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-400 font-bold flex items-center gap-2">
                          <Calendar size={16} /> Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                    <MapPin size={32} className="text-blue-600" /> My Addresses
                  </h2>
                  <button onClick={() => {
                    setShowAddressForm(true);
                    setEditingAddress(null);
                    setAddressForm({ street: '', city: '', state: '', zipCode: '', country: '', isDefault: false });
                  }} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center gap-2">
                    <Plus size={20} /> Add New
                  </button>
                </div>

                {showAddressForm && (
                  <div className="mb-10 p-8 bg-blue-50 rounded-[2rem] border-2 border-blue-100 animate-in slide-in-from-top duration-500">
                    <h3 className="text-xl font-black text-blue-900 mb-6">{editingAddress ? 'Edit Address' : 'New Delivery Point'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-black text-blue-700 mb-2 uppercase">Street Address</label>
                        <input type="text" name="street" value={addressForm.street} onChange={handleAddressChange} className="w-full px-5 py-4 bg-white rounded-2xl outline-none font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-blue-700 mb-2 uppercase">City</label>
                        <input type="text" name="city" value={addressForm.city} onChange={handleAddressChange} className="w-full px-5 py-4 bg-white rounded-2xl outline-none font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-blue-700 mb-2 uppercase">State / Province</label>
                        <input type="text" name="state" value={addressForm.state} onChange={handleAddressChange} className="w-full px-5 py-4 bg-white rounded-2xl outline-none font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-blue-700 mb-2 uppercase">Postal Code</label>
                        <input type="text" name="zipCode" value={addressForm.zipCode} onChange={handleAddressChange} className="w-full px-5 py-4 bg-white rounded-2xl outline-none font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-blue-700 mb-2 uppercase">Country</label>
                        <input type="text" name="country" value={addressForm.country} onChange={handleAddressChange} className="w-full px-5 py-4 bg-white rounded-2xl outline-none font-bold" />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                      <button onClick={editingAddress ? handleUpdateAddress : handleAddAddress} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black transition">Save Address</button>
                      <button onClick={() => setShowAddressForm(false)} className="px-8 py-4 bg-white text-gray-500 rounded-2xl font-black transition">Discard</button>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {profile?.addresses?.map(addr => (
                    <div key={addr._id} className={`p-8 rounded-[2rem] border-2 transition-all ${addr.isDefault ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 bg-white hover:border-blue-100'}`}>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          {addr.isDefault && <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Default Point</span>}
                          <p className="text-xl font-black text-gray-800">{addr.street}</p>
                          <p className="text-gray-500 font-bold">{addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">{addr.country}</p>
                        </div>
                        <div className="flex gap-2">
                          {!addr.isDefault && <button onClick={() => handleSetDefaultAddress(addr._id)} className="p-3 bg-white text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Check size={20} /></button>}
                          <button onClick={() => { setEditingAddress(addr); setAddressForm(addr); setShowAddressForm(true); }} className="p-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Edit size={20} /></button>
                          <button onClick={() => handleDeleteAddress(addr._id)} className="p-3 bg-white text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={20} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                    <FileText size={32} className="text-red-600" /> Support Issues
                  </h2>
                  <button onClick={() => setShowReportForm(true)} className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all">Submit Issue</button>
                </div>

                {showReportForm && (
                  <form onSubmit={handleReportSubmit} className="mb-10 p-8 bg-red-50 rounded-[2rem] border-2 border-red-100 space-y-6">
                    <div>
                      <label className="block text-xs font-black text-red-700 mb-2 uppercase">Type of Issue</label>
                      <select value={reportForm.type} onChange={e => setReportForm({ ...reportForm, type: e.target.value })} className="w-full px-5 py-4 bg-white rounded-2xl outline-none font-bold">
                        <option>Not Similar Product</option>
                        <option>Damaged Product</option>
                        <option>Reduced Quality</option>
                        <option>Over-priced</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-red-700 mb-2 uppercase">Merchant ID</label>
                      <input required value={reportForm.sellerId} onChange={e => setReportForm({ ...reportForm, sellerId: e.target.value })} className="w-full px-5 py-4 bg-white rounded-2xl outline-none font-bold" placeholder="e.g. MERCHANT-001" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-red-700 mb-2 uppercase">Detailed Description</label>
                      <textarea required value={reportForm.description} onChange={e => setReportForm({ ...reportForm, description: e.target.value })} className="w-full px-5 py-4 bg-white rounded-2xl outline-none font-bold h-32" />
                    </div>
                    <div className="flex gap-4">
                      <button type="submit" className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black">Submit Report</button>
                      <button type="button" onClick={() => setShowReportForm(false)} className="px-8 py-4 bg-white text-gray-500 rounded-2xl font-black">Cancel</button>
                    </div>
                  </form>
                )}

                <div className="space-y-6">
                  {reports.map(rep => (
                    <div key={rep._id} className="p-8 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-red-100 transition-all">
                      <div className="flex justify-between mb-4">
                        <p className="text-lg font-black text-gray-800">{rep.type}</p>
                        <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${rep.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{rep.status}</span>
                      </div>
                      <p className="text-gray-500 font-bold mb-4">To: {rep.sellerId}</p>
                      <p className="text-gray-700 leading-relaxed italic mb-4">"{rep.description}"</p>
                      {rep.response && (
                        <div className="mt-4 p-5 bg-green-50 rounded-2xl border border-green-100">
                          <p className="text-xs font-black text-green-700 uppercase mb-2">Merchant Response:</p>
                          <p className="text-gray-800 font-bold">{rep.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'vouchers' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">Voucher Wallet</h2>
                  <div className="px-6 py-2 bg-blue-100 text-blue-700 rounded-full font-black text-sm">
                    {vouchers.length} Total
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vouchers.map(v => (
                    <div key={v._id} className="relative group overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-[2rem] border-2 border-dashed border-blue-200 hover:border-blue-500 transition-all">
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-lg">
                            {v.code}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                              {v.discountType === 'percentage' ? `${v.discountAmount}%` : `৳${v.discountAmount}`}
                            </p>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase">Discount</p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-6">
                          <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Min Spend: <span className="text-gray-800 dark:text-gray-100 font-bold">৳{v.minSpend}</span></p>
                          <p className="text-xs text-gray-400 dark:text-gray-300 font-bold uppercase">Expires: {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : 'Never'}</p>
                        </div>
                        <button
                          className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(v.code);
                            alert('Code copied to clipboard!');
                          }}
                        >
                          Copy Code
                        </button>
                      </div>
                    </div>
                  ))}
                  {vouchers.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <Ticket size={48} className="mx-auto text-gray-300 dark:text-gray-500 mb-4" />
                      <p className="text-gray-500 dark:text-gray-300 font-bold">No active vouchers found for you.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-black text-gray-800 mb-10 flex items-center gap-3">
                  <Bell size={32} className="text-yellow-500" /> Notifications
                </h2>
                <div className="space-y-4">
                  {notifications.length > 0 ? notifications.map(notif => (
                    <div key={notif._id} className={`p-6 rounded-2xl border-2 transition-all ${notif.isRead ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex gap-4">
                        <div className="mt-1">
                          <div className={`w-3 h-3 rounded-full ${notif.isRead ? 'bg-gray-300' : 'bg-blue-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{notif.message}</p>
                          <p className="text-xs text-gray-400 font-bold mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 text-gray-400 font-bold opacity-50 flex flex-col items-center">
                      <Bell size={48} className="mb-4" />
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'digital-wallet' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <CreditCard size={160} />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                      <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <Wallet size={40} className="text-blue-400" /> Digital Wallet
                      </h2>
                      <p className="text-blue-200 font-bold uppercase tracking-widest text-xs">Manage your linked payment accounts</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-8 py-6 rounded-[2rem] border border-white/10">
                      <p className="text-xs font-black text-blue-200 uppercase mb-1 tracking-widest">Available Balance</p>
                      <p className="text-5xl font-black">৳ {profile?.balance?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6 relative z-10">
                      <h3 className="text-xl font-black uppercase tracking-widest border-b border-white/10 pb-4 flex items-center gap-2">
                        <Shield size={20} className="text-green-400" /> Saved Payment Methods
                      </h3>
                      {profile?.paymentMethods?.length > 0 ? (
                        <div className="space-y-4">
                          {profile.paymentMethods.map(pm => (
                            <div key={pm._id} className="flex justify-between items-center p-6 bg-white/10 rounded-[2rem] border border-white/5 group/pm hover:bg-white/20 transition-all">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm shadow-xl ${pm.provider === 'bkash' ? 'bg-[#e2136e]' : 'bg-[#f7941d]'}`}>
                                  {pm.provider === 'bkash' ? 'bK' : 'ನ'}
                                </div>
                                <div>
                                  <p className="text-lg font-black uppercase flex items-center gap-3">
                                    {pm.provider} Wallet
                                    {pm.isDefault && <span className="text-[10px] bg-blue-500 text-white px-3 py-1 rounded-full font-black uppercase">Default</span>}
                                  </p>
                                  <p className="text-sm text-blue-100 font-bold tracking-wider">{pm.accountNumber}</p>
                                </div>
                              </div>
                              <button onClick={() => handleDeletePaymentMethod(pm._id)} className="opacity-0 group-hover/pm:opacity-100 p-3 bg-red-500/20 hover:bg-red-500 text-red-100 rounded-xl transition-all">
                                <Trash2 size={20} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10">
                          <CreditCard size={48} className="mx-auto text-white/20 mb-4" />
                          <p className="text-blue-200 font-bold">No wallets linked yet.</p>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10">
                      <div className="bg-white/10 p-8 rounded-[2.5rem] border border-white/20 backdrop-blur-xl">
                        <h3 className="text-xl font-black uppercase text-blue-200 mb-8 border-b border-white/10 pb-4">Add New Wallet</h3>

                        <form onSubmit={handleAddPaymentMethod} className="space-y-6">
                          <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase text-blue-300 ml-2">Select Provider</label>
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                type="button"
                                onClick={() => setPaymentForm({ ...paymentForm, provider: 'bkash' })}
                                className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${paymentForm.provider === 'bkash' ? 'bg-[#e2136e] border-white text-white shadow-2xl scale-105' : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}`}
                              >
                                bKash
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentForm({ ...paymentForm, provider: 'nagad' })}
                                className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${paymentForm.provider === 'nagad' ? 'bg-[#f7941d] border-white text-white shadow-2xl scale-105' : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}`}
                              >
                                Nagad
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase text-blue-300 ml-2">Account Number</label>
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={paymentForm.regionCode}
                                onChange={e => setPaymentForm({ ...paymentForm, regionCode: e.target.value })}
                                className="w-20 bg-white/10 border border-white/10 rounded-2xl px-2 py-4 outline-none text-center font-bold focus:border-white/40"
                                placeholder="+880"
                              />
                              <input
                                required
                                type="tel"
                                value={paymentForm.accountNumber}
                                onChange={e => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                                className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-6 py-4 outline-none font-bold focus:border-white/40"
                                placeholder="017XXXXXXXX"
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-3 cursor-pointer group/chk ml-2">
                            <input
                              type="checkbox"
                              checked={paymentForm.isDefault}
                              onChange={e => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                              className="w-5 h-5 rounded-lg border-white/20 bg-white/10 accent-blue-500 cursor-pointer"
                            />
                            <span className="text-[10px] font-black text-blue-200 uppercase group-hover/chk:text-white transition-colors">Set as Default Method</span>
                          </label>

                          <button type="submit" className="w-full bg-blue-600 py-5 rounded-[1.5rem] font-black text-base hover:bg-blue-500 shadow-xl transition-all active:scale-95">Save Digital Wallet</button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><Shield className="text-blue-500" /> Account Security</h3>
              <div className="space-y-6">
                <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="w-full flex justify-between items-center p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all font-bold">
                  <span className="flex items-center gap-3"><Lock size={20} /> Update Password</span>
                  <ChevronRight size={20} />
                </button>
                {showPasswordForm && (
                  <div className="p-5 bg-white/5 rounded-2xl space-y-4 animate-in fade-in duration-300">
                    <input type="password" placeholder="New Password" value={formData.newPassword} onChange={e => setFormData({ ...formData, newPassword: e.target.value })} className="w-full bg-white/10 border-none rounded-xl px-4 py-3 outline-none" />
                    <input type="password" placeholder="Confirm" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full bg-white/10 border-none rounded-xl px-4 py-3 outline-none" />
                    <button onClick={handlePasswordChange} className="w-full bg-blue-600 py-3 rounded-xl font-black">Save Password</button>
                  </div>
                )}
              </div>
            </div>



            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-gray-800"><Activity className="text-green-600" /> Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800">New Registration</p>
                    <p className="text-[10px] text-gray-400 font-black">28 DEC 2025</p>
                  </div>
                  <span className="text-green-600 font-black">+ 5 Points</span>
                </div>
                <p className="text-center text-xs text-gray-400 font-bold py-4">No recent financial transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const ChevronRight = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default UserDashboard;
