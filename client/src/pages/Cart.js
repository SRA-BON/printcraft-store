import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { API_ROOT } from '../config';
import {
  ShoppingCart, Plus, Minus, Trash2, CreditCard, MapPin,
  Calendar, Phone, Ticket, ArrowLeft
} from 'lucide-react';

const API_URL = `${API_ROOT}/users`;

function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [scheduledDelivery, setScheduledDelivery] = useState('');
  const [vouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchWalletBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchWalletBalance = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/wallet/${user.id}/balance`);
      setWalletBalance(res.data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    try {
      const res = await axios.post(`${API_ROOT}/vouchers/apply`, {
        code: voucherCode,
        userId: user.id,
        items: cart.map(item => ({
          sellerId: item.sellerId || 'admin',
          price: item.price,
          quantity: item.quantity || 1
        }))
      });
      setSelectedVoucher(res.data);
      alert(`Voucher Applied! Discount: ৳${res.data.discount}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid Voucher');
      setSelectedVoucher(null);
    }
  };

  useEffect(() => {
    if (user) {
      const userCart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]');
      setCart(userCart);
    }
  }, [user]);

  useEffect(() => {
    if (user && cart.length > 0) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/${user.id}`);
      setProfile(response.data);
      if (response.data.addresses?.length > 0) {
        const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
        setSelectedAddress(defaultAddress?._id || response.data.addresses[0]._id);
      }
      if (response.data.paymentMethods?.length > 0) {
        const defaultPayment = response.data.paymentMethods.find(pm => pm.isDefault);
        setSelectedPayment(defaultPayment?._id || response.data.paymentMethods[0]._id);
      } else {
        setSelectedPayment('cod');
      }
      setAlternativePhone(response.data.alternativePhone || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = (item.quantity || 1) + change;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const subtotal = React.useMemo(() =>
    cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
  , [cart]);
  const discount = React.useMemo(() =>
    selectedVoucher ? (selectedVoucher.discount || 0) : 0
  , [selectedVoucher]);
  const total = React.useMemo(() => subtotal - discount, [subtotal, discount]);

  const calculateSubtotal = () => subtotal;

  const calculateDiscount = () => {
    return discount;
  };

  const calculateTotal = () => {
    return total;
  };

  // Import jsPDF (add this at top of file, but since I can't overwrite imports easily here, I'll rely on global resolution or assume user added it. 
  // Wait, I should add imports properly.
  // I will replace the whole file content related to handlePlaceOrder and add imports in a separate call if needed, but replace_file_content is single block.
  // Actually, I can use multi_replace.
  // Let's stick to replacing handlePlaceOrder and assume imports are added. Wait, imports are needed. I'll use `import` at line 9.

  // Let's implement handlePlaceOrder first.
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    if (!selectedAddress) {
      alert('Please select a delivery address!');
      return;
    }
    if (!selectedPayment) {
      alert('Please select a payment method!');
      return;
    }

    const totalAmount = calculateTotal();

    if (selectedPayment === 'wallet' && walletBalance < totalAmount) {
      alert(`Insufficient Wallet Balance! You need ৳${totalAmount - walletBalance} more.`);
      return;
    }

    setLoading(true);
    try {
      let transactionId = null;

      // 1. If paying with wallet, deduct first
      if (selectedPayment === 'wallet') {
        // We'll deduct the total amount in one go for simplicity here, 
        // or per order. Better per order to link refIds, but one debit is cleaner for user.
        // Let's do it per order loop below or one big debit?
        // Let's do one debit for the whole cart to ensure atomicity-ish check.
         const payRes = await axios.post(`${API_ROOT}/wallet/${user.id}/pay`, {
           amount: totalAmount,
           orderId: `CART_${Date.now()}` // Temporary Ref
         });
         transactionId = payRes.data.transactionId;
         setWalletBalance(payRes.data.balance);
       }

      // 2. Group items by sellerId
      const ordersBySeller = cart.reduce((acc, item) => {
        const sId = item.sellerId || 'admin';
        if (!acc[sId]) acc[sId] = [];
        acc[sId].push(item);
        return acc;
      }, {});

      // 3. Create orders
      const orderPromises = Object.entries(ordersBySeller).map(async ([sellerId, items]) => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        
        // Pro-rate discount based on subtotal share (Simple approach)
        // Ratio = subtotal / cartSubtotal
        // DiscountShare = TotalDiscount * Ratio
        const ratio = subtotal / calculateSubtotal();
        const discountShare = Math.round(calculateDiscount() * ratio);
        const finalPrice = subtotal - discountShare;

        const orderData = {
          userId: user.id,
          sellerId: sellerId,
          products: items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1
          })),
          totalPrice: finalPrice > 0 ? finalPrice : 0,
          deliveryLocation: selectedAddress,
          customerName: user.name,
          customerPhone: alternativePhone || profile?.phone || 'N/A',
          paymentMethod: selectedPayment,
          isPaid: selectedPayment === 'wallet',
          transactionId: selectedPayment === 'wallet' ? transactionId : undefined
        };

        return axios.post(`${API_ROOT}/orders`, orderData);
      });

      await Promise.all(orderPromises);

      if (selectedVoucher) {
        await axios.post(`${API_ROOT}/vouchers/redeem`, {
          code: selectedVoucher.code
        });
      }

      alert('Order placed successfully!');
      setCart([]);
      localStorage.removeItem(`cart_${user.id}`);
      navigate('/dashboard/user', { state: { activeTab: 'orders' } });

    } catch (error) {
      console.error('Order placement failed:', error);
      alert('Failed to place order. ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userType="user">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart size={36} /> Shopping Cart
          </h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            <ArrowLeft size={20} /> Back to Store
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start text-center sm:text-left">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center justify-center sm:justify-start gap-4 w-full sm:w-auto">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="text-lg font-semibold">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ৳{item.price * (item.quantity || 1)}
                        </p>
                        <p className="text-sm text-gray-500">৳{item.price} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Vouchers */}
              <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Ticket size={24} /> Vouchers
                </h2>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Code" 
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 border rounded-lg font-bold uppercase dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button 
                    onClick={handleApplyVoucher}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition"
                  >
                    Apply
                  </button>
                </div>
                {selectedVoucher && (
                  <div className="mt-3 p-3 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-lg flex justify-between items-center">
                    <span className="font-bold">Code: {selectedVoucher.code}</span>
                    <span className="font-bold">-৳{selectedVoucher.discount}</span>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <MapPin size={24} /> Delivery Address
                </h2>
                {profile?.addresses?.length > 0 ? (
                  <div className="space-y-2">
                    {profile.addresses.map((address) => (
                      <label
                        key={address._id}
                        className={`flex items-start gap-2 p-3 border-2 rounded-lg cursor-pointer ${selectedAddress === address._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === address._id}
                          onChange={() => setSelectedAddress(address._id)}
                          className="mt-1 w-4 h-4"
                        />
                        <div className="flex-1">
                          {address.isDefault && (
                            <span className="inline-block mb-1 px-2 py-1 bg-green-500 text-white text-xs rounded">
                              Default
                            </span>
                          )}
                          <p className="font-semibold dark:text-gray-100">{address.street}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{address.country}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-300 text-sm mb-4">No addresses saved</p>
                )}
                <button
                  onClick={() => navigate('/dashboard/user')}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Manage Addresses
                </button>
              </div>

              {/* Scheduled Delivery */}
              <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Calendar size={24} /> Scheduled Delivery
                </h2>
                <input
                  type="date"
                  value={scheduledDelivery}
                  onChange={(e) => setScheduledDelivery(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <CreditCard size={24} /> Payment Method
                </h2>
                <div className="space-y-3">
                  {profile?.paymentMethods?.map((pm) => (
                    <label
                      key={pm._id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                        selectedPayment === pm._id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-100 hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === pm._id}
                        onChange={() => setSelectedPayment(pm._id)}
                        className="text-blue-600 w-5 h-5"
                      />
                      <div className="flex-1">
                        <p className="font-black text-gray-800 dark:text-gray-100 capitalize">{pm.provider} Personal</p>
                        <p className="text-xs text-gray-400 dark:text-gray-300 font-bold">{pm.accountNumber}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs">
                        {(pm.provider || 'PM').slice(0,2)}
                      </div>
                    </label>
                  ))}

                  {/* PrintCraft Wallet Option */}
                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedPayment === 'wallet'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-100 hover:border-purple-200'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === 'wallet'}
                      onChange={() => setSelectedPayment('wallet')}
                      className="w-5 h-5 text-purple-600"
                    />
                    <div className="flex-1">
                      <p className="font-black text-gray-800 dark:text-gray-100">Rong-Tuli Wallet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-300 font-bold">Balance: ৳{walletBalance}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-black">
                      <CreditCard size={18} />
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedPayment === 'cod'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-100 hover:border-blue-200'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === 'cod'}
                      onChange={() => setSelectedPayment('cod')}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-black text-gray-800 dark:text-gray-100">Cash on Delivery</p>
                      <p className="text-xs text-gray-400 dark:text-gray-300 font-bold">Pay when you receive</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-black">
                      <ShoppingCart size={18} />
                    </div>
                  </label>
                </div>

                {(!profile?.paymentMethods?.length) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 dark:bg-blue-900/30 dark:border-blue-900">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-bold leading-relaxed italic">
                      Tip: Link your Bkash or Nagad accounts in your dashboard for faster digital payments.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/dashboard/user')}
                  className="w-full mt-4 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  Manage Wallets
                </button>
              </div>

              {/* Alternative Phone */}
              <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Phone size={24} /> Alternative Phone
                </h2>
                <input
                  type="tel"
                  value={alternativePhone}
                  onChange={(e) => setAlternativePhone(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>৳{calculateSubtotal()}</span>
                  </div>
                  {selectedVoucher && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-৳{calculateDiscount()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">৳{calculateTotal()}</span>
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-semibold disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Cart;

