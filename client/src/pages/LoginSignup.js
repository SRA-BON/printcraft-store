import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { User, Store, Shield, Mail, Lock, Phone, Calendar, MapPin } from 'lucide-react';
import API from '../api';
import { API_ROOT } from '../config';

const API_URL = `${API_ROOT}/auth`;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID;

const productTypes = ['magazine', 'book', 'album', 'canvas', 'banner', 'frame', 'poster'];

function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('user'); // user, seller, admin
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    age: '',
    deliveryLocation: '',
    productTypes: [],
    adminId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (GOOGLE_CLIENT_ID && !document.getElementById('google-client-script')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-client-script';
      document.body.appendChild(script);
    }

    if (FACEBOOK_APP_ID && !document.getElementById('facebook-jssdk')) {
      window.fbAsyncInit = function () {
        if (window.FB) {
          window.FB.init({
            appId: FACEBOOK_APP_ID,
            cookie: true,
            xfbml: false,
            version: 'v18.0'
          });
        }
      };

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'productTypes') {
      const checked = e.target.checked;
      setFormData(prev => ({
        ...prev,
        productTypes: checked
          ? [...prev.productTypes, value]
          : prev.productTypes.filter(t => t !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    if (!GOOGLE_CLIENT_ID) {
      setError('Google login is not configured');
      return;
    }
    if (
      typeof window === 'undefined' ||
      !window.google ||
      !window.google.accounts ||
      !window.google.accounts.id
    ) {
      setError('Google login is not available right now');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          setLoading(true);
          const idToken = response.credential;
          const res = await axios.post(`${API_URL}/oauth/google`, { idToken });
          const userData = res.data.user;
          login(userData, res.data.token);
          navigate('/dashboard/user');
        } catch (error) {
          setError(error.response?.data?.message || 'Google login failed');
        } finally {
          setLoading(false);
        }
      }
    });

    window.google.accounts.id.prompt();
  };

  const handleFacebookLogin = () => {
    setError('');
    if (!FACEBOOK_APP_ID) {
      setError('Facebook login is not configured');
      return;
    }
    if (typeof window === 'undefined' || !window.FB) {
      setError('Facebook login is not available right now');
      return;
    }

    setLoading(true);
    window.FB.login(
      async (response) => {
        if (response.authResponse) {
          try {
            const accessToken = response.authResponse.accessToken;
            const res = await axios.post(`${API_URL}/oauth/facebook`, { accessToken });
            const userData = res.data.user;
            login(userData, res.data.token);
            navigate('/dashboard/user');
          } catch (error) {
            setError(error.response?.data?.message || 'Facebook login failed');
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
          setError('Facebook login was cancelled');
        }
      },
      { scope: 'email' }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        let endpoint = '';
        let payload = {};

        if (userType === 'user') {
          endpoint = '/login/user';
          payload = { identifier: formData.email, password: formData.password };
        } else if (userType === 'seller') {
          endpoint = '/login/seller';
          payload = { identifier: formData.email, password: formData.password };
        } else if (userType === 'admin') {
          endpoint = '/login/admin';
          payload = { adminId: formData.adminId, password: formData.password };
        }

        const response = await axios.post(`${API_URL}${endpoint}`, payload);
        const userData = response.data.user || response.data.seller || response.data.admin;
        login(userData, response.data.token);

        // Navigate to appropriate dashboard
        if (userType === 'user') {
          navigate('/dashboard/user');
        } else if (userType === 'seller') {
          navigate('/seller/selling');
        } else if (userType === 'admin') {
          navigate('/dashboard/admin');
        }
      } else {
        // Signup
        if (userType === 'user') {
          const response = await axios.post(`${API_URL}/signup/user`, {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            age: parseInt(formData.age),
            deliveryLocation: formData.deliveryLocation
          });
          const userData = response.data.user;
          login(userData, response.data.token);
          navigate('/dashboard/user');
        } else if (userType === 'seller') {
          const response = await axios.post(`${API_URL}/signup/seller`, {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            age: parseInt(formData.age),
            productTypes: formData.productTypes
          });
          const sellerData = response.data.seller;
          login(sellerData, response.data.token);
          navigate('/seller/selling');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-rose-950 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-rose-950 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white py-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Rong-Tuli</h1>
          <p className="text-rose-100">{isLogin ? 'Welcome Back!' : 'Create your account'}</p>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 font-semibold transition ${isLogin ? 'bg-rose-50 text-rose-600 border-b-2 border-rose-600' : 'text-gray-600 dark:text-rose-200'}`}
          >
            Login
          </button>
          {userType !== 'admin' && (
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 font-semibold transition ${!isLogin ? 'bg-rose-50 text-rose-600 border-b-2 border-rose-600' : 'text-gray-600 dark:text-rose-200'}`}
            >
              Sign Up
            </button>
          )}
        </div>

        {isLogin && (
          <div className="p-4 border-b bg-rose-50 dark:bg-rose-900/40">
            <div className="flex gap-2">
              <button
                onClick={() => setUserType('user')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${userType === 'user' ? 'bg-rose-600 text-white' : 'bg-white dark:bg-rose-950 text-gray-700 dark:text-rose-100 hover:bg-gray-100 dark:hover:bg-rose-900'
                  }`}
              >
                <User size={16} className="inline mr-2" /> User
              </button>
              <button
                onClick={() => setUserType('seller')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${userType === 'seller' ? 'bg-rose-400 text-white' : 'bg-white dark:bg-rose-950 text-gray-700 dark:text-rose-100 hover:bg-gray-100 dark:hover:bg-rose-900'
                  }`}
              >
                <Store size={16} className="inline mr-2" /> Merchant
              </button>
              <button
                onClick={() => setUserType('admin')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${userType === 'admin' ? 'bg-gray-900 text-white' : 'bg-white dark:bg-rose-950 text-gray-700 dark:text-rose-100 hover:bg-gray-100 dark:hover:bg-rose-900'
                  }`}
              >
                <Shield size={16} className="inline mr-2" /> Admin
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUserType('user')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${userType === 'user' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-rose-900 dark:text-rose-100'
                      }`}
                  >
                    <User size={16} className="inline mr-2" /> User
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('seller')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${userType === 'seller' ? 'bg-rose-400 text-white' : 'bg-gray-100 text-gray-700 dark:bg-rose-900 dark:text-rose-100'
                      }`}
                  >
                    <Store size={16} className="inline mr-2" /> Merchant
                  </button>
                </div>
              </div>
            </>
          )}

          {isLogin && userType === 'admin' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin ID
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="adminId"
                  value={formData.adminId}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter Admin ID"
                />
              </div>
            </div>
          )}

          {(!isLogin || userType !== 'admin') && (
            <>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-rose-950 dark:text-rose-50"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {isLogin && userType === 'user' ? 'Email or Username' : isLogin && userType === 'seller' ? 'Email or Merchant ID' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-rose-950 dark:text-rose-50"
                    placeholder={isLogin ? (userType === 'user' ? 'Email or Username' : 'Email or Merchant ID') : 'Enter your email'}
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-rose-950 dark:text-rose-50"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Age
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        min="18"
                        className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-rose-950 dark:text-rose-50"
                        placeholder="Enter your age"
                      />
                    </div>
                  </div>

                  {userType === 'user' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Location (Optional)
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                          type="text"
                          name="deliveryLocation"
                          value={formData.deliveryLocation}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-rose-950 dark:text-rose-50"
                          placeholder="Enter delivery location"
                        />
                      </div>
                    </div>
                  )}

                  {userType === 'seller' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Types (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 gap-2 border-2 rounded-lg p-3">
                        {productTypes.map(type => (
                          <label key={type} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="productTypes"
                              value={type}
                              checked={formData.productTypes.includes(type)}
                              onChange={handleChange}
                              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                            />
                            <span className="text-sm capitalize">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-rose-950 dark:text-rose-50"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-rose-200/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>

          {userType === 'user' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200 dark:bg-rose-800" />
                <span className="text-xs text-gray-500 dark:text-rose-200">
                  Or continue with
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-rose-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-rose-800 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-rose-50 bg-white dark:bg-rose-950 hover:bg-gray-50 dark:hover:bg-rose-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-rose-800 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-rose-50 bg-white dark:bg-rose-950 hover:bg-gray-50 dark:hover:bg-rose-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue with Facebook
                </button>
              </div>
            </div>
          )}

          {isLogin && userType !== 'admin' && (
            <p className="text-center text-sm text-gray-600 dark:text-rose-100">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-rose-600 hover:underline font-semibold"
              >
                Sign up here
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginSignup;

