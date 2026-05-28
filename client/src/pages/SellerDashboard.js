import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import API from '../api';
import { API_ROOT } from '../config';

import {
  Store, Lock, Shield, CreditCard, Edit, Save, X,
  Phone, Mail, Calendar, Key, Building, Eye, EyeOff,
  Activity, Check, Plus // Added missing icons
} from 'lucide-react';

const API_URL = `${API_ROOT}/sellers`;

function SellerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    merchantName: '',
    officeLocation: '',
    storeName: '',
    storeVisibility: 'public',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [contacts, setContacts] = useState({
    email: '',
    phone: '',
    alternatePhone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/${user.id}`);
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        phone: response.data.phone,
        merchantName: response.data.merchantName || '',
        officeLocation: response.data.officeLocation || '',
        storeName: response.data.storeName || '',
        storeVisibility: response.data.storeVisibility || 'public',
        password: '',
        newPassword: '',
        confirmPassword: ''
      });
      setContacts(response.data.contacts || { email: '', phone: '', alternatePhone: '' });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContactsChange = (e) => {
    setContacts({ ...contacts, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setError('');
      const updateData = {
        ...formData,
        contacts
      };
      delete updateData.password;
      delete updateData.newPassword;
      delete updateData.confirmPassword;

      await axios.put(`${API_URL}/${user.id}`, updateData);
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
      if (formData.newPassword.length < 8) {
        setError('Password must be at least 8 characters');
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

  if (loading) {
    return (
      <Layout userType="seller">
        <div className="text-center py-20">
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType="seller">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded dark:bg-green-900 dark:border-green-700 dark:text-green-100">
            {success}
          </div>
        )}

        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">Merchant Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {['profile', 'store', 'security', 'payment'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize transition ${activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Store size={24} /> Profile Information
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit size={18} /> Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Merchant Name</label>
                    <input
                      type="text"
                      name="merchantName"
                      value={formData.merchantName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Office Location</label>
                    <input
                      type="text"
                      name="officeLocation"
                      value={formData.officeLocation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4 dark:text-gray-100">Contacts</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={contacts.email}
                        onChange={handleContactsChange}
                        className="w-full px-4 py-2 border-2 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={contacts.phone}
                        onChange={handleContactsChange}
                        className="w-full px-4 py-2 border-2 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alternate Phone</label>
                      <input
                        type="tel"
                        name="alternatePhone"
                        value={contacts.alternatePhone}
                        onChange={handleContactsChange}
                        className="w-full px-4 py-2 border-2 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Save size={18} /> Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    <X size={18} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Merchant Name</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <Building size={18} /> {profile?.merchantName || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Merchant ID</p>
                    <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <Key size={18} /> {profile?.sellerId}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Cannot be changed</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Office Location</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{profile?.officeLocation || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Merchant Since</p>
                    <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <Calendar size={18} /> {new Date(profile?.sellerSince).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Cannot be changed</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4 dark:text-gray-100">Contacts</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Email</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Mail size={18} /> {profile?.contacts?.email || profile?.email || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Phone</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Phone size={18} /> {profile?.contacts?.phone || profile?.phone || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Alternate Phone</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Phone size={18} /> {profile?.contacts?.alternatePhone || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Store size={24} /> Store Information
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit size={18} /> Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Store Visibility</label>
                  <select
                    name="storeVisibility"
                    value={formData.storeVisibility}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Save size={18} /> Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    <X size={18} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Store Name</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{profile?.storeName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Store Visibility</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 capitalize">
                    {profile?.storeVisibility === 'public' ? <Eye size={18} /> : <EyeOff size={18} />}
                    {profile?.storeVisibility || 'public'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Product Types</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile?.productTypes?.map((type, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize dark:bg-blue-900 dark:text-blue-100">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Shield size={24} /> Security
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Merchant ID</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                  {profile?.sellerId}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Cannot be changed</p>
              </div>

              <div>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <span className="flex items-center gap-2">
                    <Lock size={18} /> Change Password
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">→</span>
                </button>

                {showPasswordForm && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border-2 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border-2 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={profile?.twoStepVerification || false}
                    onChange={(e) => {
                      axios.put(`${API_URL}/${user.id}`, { twoStepVerification: e.target.checked });
                      fetchProfile();
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Two-Step Verification</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={profile?.onlineTransactions || false}
                    onChange={(e) => {
                      axios.put(`${API_URL}/${user.id}`, { onlineTransactions: e.target.checked });
                      fetchProfile();
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Enable Online Transactions</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                  <Building size={200} />
                </div>
                <h3 className="text-2xl font-black mb-10 flex items-center gap-3 relative z-10">
                  <CreditCard className="text-purple-300" /> Revenue Wallet
                </h3>
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10 font-black">
                  <div>
                    <p className="text-xs text-purple-200 uppercase tracking-widest mb-2">Total Earnings</p>
                    <p className="text-6xl">৳ 12,450.00</p>
                  </div>
                  <button className="px-10 py-5 bg-white text-purple-800 rounded-2xl hover:bg-gray-100 transition-all shadow-xl font-black text-xl">
                    Withdraw
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-gray-800 dark:text-gray-100">
                  <Activity size={24} className="text-blue-600" /> Payout History
                </h3>
                <div className="space-y-4">
                  {[
                    { id: 'W-001', date: '25 Dec 2025', amount: '5,000.00', status: 'Completed', via: 'bK' },
                    { id: 'W-002', date: '18 Dec 2025', amount: '2,500.00', status: 'Processing', via: 'N' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-blue-200 dark:hover:border-blue-400 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xs ${item.via === 'bK' ? 'bg-[#e2136e]' : 'bg-[#f7941d]'}`}>
                          {item.via}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-100">Payout #{item.id}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase dark:text-gray-400">{item.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900 dark:text-gray-100">৳{item.amount}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Completed' ? 'text-green-500' : 'text-blue-500'}`}>{item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-black mb-6 text-gray-800 dark:text-gray-100">Payment Accounts</h3>
                <div className="space-y-4">
                  <div className="p-4 border-2 border-blue-50 rounded-2xl flex items-center gap-4 bg-blue-50/20 dark:bg-blue-900/20 dark:border-blue-900/30">
                    <div className="w-10 h-10 bg-[#e2136e] rounded-xl flex items-center justify-center text-white font-black text-[10px]">bK</div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-800 dark:text-gray-100">017****536</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase dark:text-gray-400">Primary Account</p>
                    </div>
                    <Check className="text-green-500" size={16} />
                  </div>
                  <button className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 dark:text-gray-300 font-black text-sm hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2">
                    <Plus size={16} /> Link New Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SellerDashboard;

