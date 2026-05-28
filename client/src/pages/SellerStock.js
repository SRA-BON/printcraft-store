import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import API from '../api';
import { API_ROOT, API_BASE_URL } from '../config';

import {
    Plus, Trash2, Edit2, Search,
    Check, X,
    Tag, Activity, Eye, EyeOff, Layers
} from 'lucide-react';

const API_PRODUCTS = `${API_ROOT}/products`;
const API_VOUCHERS = `${API_ROOT}/vouchers`;

function SellerStock() {
    const { user } = useAuth();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('products'); // products, vouchers
    const [showProductForm, setShowProductForm] = useState(false);
    const [showVoucherForm, setShowVoucherForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [storeVisibility, setStoreVisibility] = useState('public');
    const [availableCategories, setAvailableCategories] = useState(['magazine', 'book', 'album', 'canvas', 'banner', 'frame', 'poster']);

    const [productForm, setProductForm] = useState({
        id: '',
        name: '',
        description: '',
        price: '',
        color: '',
        stock: 'in-stock',
        imageUrl: '',
        category: 'magazine',
        attachedPdf: '',
        magazinePages: '', // Comma-separated URLs for additional images
        sellerId: user.id
    });

    const [voucherForm, setVoucherForm] = useState({
        code: '',
        discountAmount: '',
        discountType: 'fixed',
        validityStart: new Date().toISOString().split('T')[0],
        expiryDate: '',
        minSpend: 0,
        usageLimit: -1,
        sellerId: user.id
    });

    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        if (location.state?.category) {
            setFilterCategory(location.state.category);
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, location.state]);

    const fetchData = async () => {
        try {
            const pRes = await axios.get(`${API_PRODUCTS}/seller/${user.id}`);
            const vRes = await axios.get(`${API_VOUCHERS}/seller/${user.id}`);
            // Fetch seller profile for visibility
            const sRes = await axios.get(`${API_ROOT}/sellers/${user.id}`);
            setProducts(pRes.data);
            setVouchers(vRes.data);
            setStoreVisibility(sRes.data.storeVisibility || 'public');
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stock data:', error);
            setLoading(false);
        }
    };

    const toggleStoreVisibility = async () => {
        try {
            const newVisibility = storeVisibility === 'public' ? 'private' : 'public';
            await axios.put(`${API_ROOT}/sellers/${user.id}`, { storeVisibility: newVisibility });
            setStoreVisibility(newVisibility);
            alert(`Store is now ${newVisibility}`);
        } catch (error) {
            alert('Error updating visibility');
        }
    };

    const handleAddCategory = () => {
        const cat = prompt('Enter new category name:');
        if (cat && !availableCategories.includes(cat.toLowerCase())) {
            setAvailableCategories([...availableCategories, cat.toLowerCase()]);
            alert(`Category "${cat}" added to your local list!`);
        }
    };

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return [];
        
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
        
        try {
            setUploading(true);
            const res = await axios.post(`${API_ROOT}/upload/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploading(false);
            // Prepend server URL if needed, or assume relative path works with static serving
            return res.data.imageUrls.map(url => (url.startsWith('http') ? url : `${API_BASE_URL}${url}`));
        } catch (error) {
            console.error('Upload error:', error);
            setUploading(false);
            alert('Error uploading images');
            return [];
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            let uploadedUrls = [];
            if (selectedFiles.length > 0) {
                uploadedUrls = await handleFileUpload(selectedFiles);
            }

            // If we have uploaded files, use the first one as main image if not set
            let mainImageUrl = productForm.imageUrl;
            let additionalImages = [];

            // Existing magazine pages from textarea/input
            const existingPages = productForm.magazinePages
                ? (typeof productForm.magazinePages === 'string' ? productForm.magazinePages.split('\n') : productForm.magazinePages)
                    .map(url => url.trim()).filter(url => url.length > 0)
                : [];
            
            additionalImages = [...existingPages, ...uploadedUrls];

            // If no main image is set but we have uploads, use the first upload
            if (!mainImageUrl && uploadedUrls.length > 0) {
                mainImageUrl = uploadedUrls[0];
                // Remove the first one from additional images if it's used as main
                // But typically for magazines, all pages are in magazinePages, and main image is cover.
                // Let's keep it simple: if imageUrl is empty, use first upload.
            }

            const productData = {
                ...productForm,
                imageUrl: mainImageUrl,
                magazinePages: additionalImages
            };

            if (editingProduct) {
                await axios.put(`${API_PRODUCTS}/${editingProduct.id}`, productData);
            } else {
                // Generate a random ID if not provided
                const newId = productForm.id || `p_${Date.now()}`;
                await axios.post(API_PRODUCTS, { ...productData, id: newId });
            }
            setShowProductForm(false);
            setEditingProduct(null);
            setSelectedFiles([]);
            fetchData();
            alert('Product saved successfully!');
        } catch (error) {
            alert('Error saving product: ' + error.message);
        }
    };

    const handleVoucherSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_VOUCHERS, voucherForm);
            setShowVoucherForm(false);
            fetchData();
            alert('Voucher created successfully!');
        } catch (error) {
            alert('Error creating voucher: ' + error.message);
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await axios.delete(`${API_PRODUCTS}/${id}`);
            fetchData();
        } catch (error) {
            alert('Error deleting product');
        }
    };

    const toggleVoucherStatus = async (voucher) => {
        try {
            const newStatus = voucher.status === 'active' ? 'inactive' : 'active';
            await axios.put(`${API_VOUCHERS}/${voucher._id}/status`, { status: newStatus });
            fetchData();
        } catch (error) {
            alert('Error updating voucher');
        }
    };

    if (loading) return <Layout userType="seller"><div>Loading...</div></Layout>;

    return (
        <Layout userType="seller">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Merchant's Stock & Inventory</h1>
                    <div className="flex bg-white rounded-xl shadow p-1">
                        <button
                            onClick={() => setActiveView('products')}
                            className={`px-6 py-2 rounded-lg font-bold transition ${activeView === 'products' ? 'bg-rose-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => setActiveView('vouchers')}
                            className={`px-6 py-2 rounded-lg font-bold transition ${activeView === 'vouchers' ? 'bg-rose-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Vouchers
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 mb-8">
                    <button
                        onClick={toggleStoreVisibility}
                        className={`flex-1 p-4 rounded-2xl shadow-lg flex items-center justify-between transition ${storeVisibility === 'public' ? 'bg-white text-gray-800 border-2 border-green-500' : 'bg-gray-800 text-white border-2 border-gray-600'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${storeVisibility === 'public' ? 'bg-green-100 text-green-600' : 'bg-gray-700 text-gray-400'}`}>
                                {storeVisibility === 'public' ? <Eye size={24} /> : <EyeOff size={24} />}
                            </div>
                            <div className="text-left">
                                <p className="font-bold">Store Visibility: <span className="uppercase">{storeVisibility}</span></p>
                                <p className="text-sm opacity-70">{storeVisibility === 'public' ? 'Users can see your products' : 'Products are hidden from users'}</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition ${storeVisibility === 'public' ? 'bg-green-500' : 'bg-gray-600'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${storeVisibility === 'public' ? 'right-1' : 'left-1'}`} />
                        </div>
                    </button>

                    <button
                        onClick={handleAddCategory}
                        className="flex-1 p-4 bg-white border-2 border-dashed border-rose-400 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-rose-600 hover:bg-rose-50 transition"
                    >
                        <div className="bg-rose-100 p-3 rounded-xl"><Layers size={24} /></div>
                        <span className="font-bold text-lg">ADD CATEGORY</span>
                    </button>
                </div>

                {/* Show active filter if any */}
                {filterCategory !== 'all' && (
                    <div className="flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
                        <span className="text-gray-500 font-bold">Filtering by:</span>
                        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-bold uppercase text-sm flex items-center gap-2">
                            {filterCategory}
                            <button onClick={() => setFilterCategory('all')} className="hover:bg-rose-200 rounded-full p-0.5"><X size={14} /></button>
                        </span>
                    </div>
                )}

                {activeView === 'products' ? (
                    <>
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search your inventory..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-rose-500"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setEditingProduct(null);
                                    setProductForm({
                                        id: '', name: '', description: '', price: '',
                                        color: '', stock: 'in-stock', imageUrl: '',
                                        category: 'magazine', attachedPdf: '', magazinePages: '', sellerId: user.id
                                    });
                                    setShowProductForm(true);
                                }}
                                className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition"
                            >
                                <Plus size={20} /> Add Product
                            </button>
                        </div>

                        {showProductForm && (
                            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                                        <button onClick={() => setShowProductForm(false)} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                                    </div>
                                    <form onSubmit={handleProductSubmit} className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold mb-1">Product Name</label>
                                            <input required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Price (৳)</label>
                                            <input required type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Category</label>
                                            <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                                                {availableCategories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Color</label>
                                            <input required value={productForm.color} onChange={(e) => setProductForm({ ...productForm, color: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Stock Status</label>
                                            <select value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                                                <option value="in-stock">In Stock</option>
                                                <option value="out-of-stock">Out of Stock</option>
                                            </select>
                                        </div>
                                        
                                        {/* File Upload Section */}
                                        <div className="col-span-2 border-t pt-4 mt-2">
                                            <label className="block text-sm font-bold mb-1">Product Images</label>
                                            <div className="flex gap-4 items-start">
                                                <div className="flex-1">
                                                    <label className="block text-xs text-gray-500 mb-1">Upload Images (Local)</label>
                                                    <input 
                                                        type="file" 
                                                        multiple 
                                                        accept="image/*"
                                                        onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                                                        className="w-full px-4 py-2 border rounded-lg" 
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Select multiple files for magazine pages or product gallery.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold mb-1">Main Image URL (Optional if uploading)</label>
                                            <input value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="http://..." />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold mb-1">
                                                {productForm.category === 'magazine' || productForm.category === 'Magazine' ? 'Additional Magazine Pages (URLs)' : 'Additional Images (URLs)'}
                                            </label>
                                            <textarea
                                                value={productForm.magazinePages}
                                                onChange={(e) => setProductForm({ ...productForm, magazinePages: e.target.value })}
                                                placeholder="Enter image URLs, one per line (optional if uploading)"
                                                className="w-full px-4 py-2 border rounded-lg h-24 font-mono text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold mb-1">Description</label>
                                            <textarea required value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg h-24" />
                                        </div>
                                        <div className="col-span-2">
                                            <button type="submit" disabled={uploading} className="w-full bg-rose-500 text-white py-3 rounded-lg font-bold hover:bg-rose-600 disabled:bg-gray-400">
                                                {uploading ? 'Uploading Images...' : 'Save Product'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-gray-700">Product</th>
                                        <th className="px-6 py-4 font-bold text-gray-700">Category</th>
                                        <th className="px-6 py-4 font-bold text-gray-700">Price</th>
                                        <th className="px-6 py-4 font-bold text-gray-700">Stock</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.filter(p => filterCategory === 'all' || p.category === filterCategory)
                                        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(product => (
                                            <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={product.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                        <div>
                                                            <p className="font-bold text-gray-800">{product.name}</p>
                                                            <p className="text-xs text-gray-500">ID: {product.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 capitalize">{product.category}</td>
                                                <td className="px-6 py-4 font-bold">৳{product.price}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock === 'in-stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingProduct(product);
                                                                // Convert magazinePages array to newline-separated string for editing
                                                                const magazinePagesString = Array.isArray(product.magazinePages)
                                                                    ? product.magazinePages.join('\n')
                                                                    : '';
                                                                setProductForm({
                                                                    ...product,
                                                                    magazinePages: magazinePagesString
                                                                });
                                                                setShowProductForm(true);
                                                            }}
                                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={() => setShowVoucherForm(true)}
                                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition"
                            >
                                <Plus size={20} /> Create Voucher
                            </button>
                        </div>

                        {showVoucherForm && (
                            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">New Voucher</h2>
                                        <button onClick={() => setShowVoucherForm(false)} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                                    </div>
                                    <form onSubmit={handleVoucherSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1 text-gray-700 uppercase tracking-tighter">Voucher Code</label>
                                            <input required placeholder="SAVE20" value={voucherForm.code} onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })} className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-1 text-gray-700 uppercase tracking-tighter">Discount</label>
                                                <input required type="number" value={voucherForm.discountAmount} onChange={(e) => setVoucherForm({ ...voucherForm, discountAmount: e.target.value })} className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-1 text-gray-700 uppercase tracking-tighter">Type</label>
                                                <select value={voucherForm.discountType} onChange={(e) => setVoucherForm({ ...voucherForm, discountType: e.target.value })} className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold">
                                                    <option value="fixed">Fixed (৳)</option>
                                                    <option value="percentage">Percentage (%)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-1 text-gray-700 uppercase tracking-tighter">Start Date</label>
                                                <input type="date" value={voucherForm.validityStart} onChange={(e) => setVoucherForm({ ...voucherForm, validityStart: e.target.value })} className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-1 text-gray-700 uppercase tracking-tighter">Expiry Date</label>
                                                <input type="date" value={voucherForm.expiryDate} onChange={(e) => setVoucherForm({ ...voucherForm, expiryDate: e.target.value })} className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold text-sm" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-1 text-gray-700 uppercase tracking-tighter">Min Spend (৳)</label>
                                                <input type="number" value={voucherForm.minSpend} onChange={(e) => setVoucherForm({ ...voucherForm, minSpend: e.target.value })} className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-1 text-gray-700 uppercase tracking-tighter">Usage Limit</label>
                                                <input type="number" value={voucherForm.usageLimit} onChange={(e) => setVoucherForm({ ...voucherForm, usageLimit: e.target.value })} className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold" placeholder="-1 for ∞" />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-4 rounded-2xl font-black hover:shadow-xl transition-all mt-4">
                                            Create Advanced Voucher
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vouchers.map(voucher => (
                                <div key={voucher._id} className={`bg-white rounded-2xl shadow-lg border-2 p-6 ${voucher.status === 'active' ? 'border-purple-200' : 'border-gray-100 grayscale'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-3xl font-black text-purple-600 tracking-wider mb-1">{voucher.code}</h3>
                                            <p className="font-bold text-gray-800">
                                                {voucher.discountType === 'percentage' ? `${voucher.discountAmount}% OFF` : `৳${voucher.discountAmount} OFF`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleVoucherStatus(voucher)}
                                            className={`p-2 rounded-lg transition ${voucher.status === 'active' ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            {voucher.status === 'active' ? <Activity size={24} /> : <Check size={24} />}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                        <Tag size={16} /> Status: <span className="capitalize font-bold">{voucher.status}</span>
                                    </div>
                                    <div className="pt-4 border-t flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Created {new Date(voucher.createdAt).toLocaleDateString()}</span>
                                        <button className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}

export default SellerStock;
