import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import API from '../api';
import { API_ROOT } from '../config';
import {
  Shield, Lock, Edit, Save, X, Users, Store, Trash2,
  Mail, Calendar, Key, BarChart2
} from 'lucide-react';
import BusinessStats from '../components/BusinessStats';

const API_URL = `${API_ROOT}/admins`;

function AdminDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allSellers, setAllSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'sellers') fetchSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/${user.id}`);
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
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

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/${user.id}/users`);
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await axios.get(`${API_URL}/${user.id}/sellers`);
      setAllSellers(response.data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setError('');
      const updateData = {
        name: formData.name,
        email: formData.email
      };

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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/${user.id}/users/${userId}`);
      setSuccess('User deleted successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  const handleDeleteSeller = async (sellerId) => {
    if (!window.confirm('Are you sure you want to delete this seller?')) return;
    try {
      await axios.delete(`${API_URL}/${user.id}/sellers/${sellerId}`);
      setSuccess('Merchant deleted successfully!');
      fetchSellers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete seller');
    }
  };

  if (loading) {
    return (
      <Layout userType="admin">
        <div className="text-center py-20">
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType="admin">
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

        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {['profile', 'statistics', 'users', 'sellers'].map((tab) => {
            const label = tab === 'sellers' ? 'merchants' : tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition ${activeTab === tab
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Shield size={24} /> Admin Profile
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
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
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Admin ID</p>
                    <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <Key size={18} /> {profile?.adminId}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Cannot be changed</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Admin Since</p>
                    <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <Calendar size={18} /> {new Date(profile?.adminSince).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Cannot be changed</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Name</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{profile?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Email</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <Mail size={18} /> {profile?.email}
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Lock size={18} /> Change Password
                    </span>
                    <span className="text-purple-600 dark:text-purple-400">→</span>
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
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Update Password
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Users size={24} /> All Users
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4">User ID</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900 dark:border-gray-700">
                      <td className="py-3 px-4 dark:text-gray-300">{u.userId}</td>
                      <td className="py-3 px-4 dark:text-gray-300">{u.name}</td>
                      <td className="py-3 px-4 dark:text-gray-300">{u.email}</td>
                      <td className="py-3 px-4 dark:text-gray-300">{u.phone}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteUser(u.userId)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sellers Tab */}
        {activeTab === 'sellers' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Store size={24} /> All Merchants
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4">Merchant ID</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Store Name</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allSellers.map((s) => (
                    <tr key={s._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900 dark:border-gray-700">
                      <td className="py-3 px-4 dark:text-gray-300">{s.sellerId}</td>
                      <td className="py-3 px-4 dark:text-gray-300">{s.name}</td>
                      <td className="py-3 px-4 dark:text-gray-300">{s.email}</td>
                      <td className="py-3 px-4 dark:text-gray-300">{s.storeName || 'Not set'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteSeller(s.sellerId)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AdminDashboard;

