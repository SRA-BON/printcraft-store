import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import MagazineViewer from './MagazineViewer';
import axios from 'axios';
import { ShoppingCart, ArrowLeft, Package, Store, Tag, BookOpen } from 'lucide-react';
import API from '../api';
import { API_ROOT } from '../config';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMagazineViewer, setShowMagazineViewer] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const isOutOfStock = (p) => {
        if (!p) return false;
        if (p.stock === 'out-of-stock') return true;
        if (p.stock === 0 || p.stock === '0') return true;
        return false;
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`${API_ROOT}/products/${id}`);
            setProduct(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product:', error);
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (isOutOfStock(product)) {
            alert('This product is currently out of stock.');
            return;
        }
        const cart = JSON.parse(localStorage.getItem(`cart_${user?.id || 'guest'}`) || '[]');
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }

        localStorage.setItem(`cart_${user?.id || 'guest'}`, JSON.stringify(cart));
        alert(`Added ${quantity} ${product.name} to cart!`);
    };

    if (loading) {
        return (
            <Layout userType={user?.userType || 'user'}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-2xl font-bold text-gray-400">Loading...</div>
                </div>
            </Layout>
        );
    }

    if (!product) {
        return (
            <Layout userType={user?.userType || 'user'}>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <Package size={64} className="text-gray-300 mb-4" />
                    <div className="text-2xl font-bold text-gray-400">Product not found</div>
                    <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">
                        Back to Store
                    </button>
                </div>
            </Layout>
        );
    }

    // If product is a Magazine, show full magazine viewer directly
    if (product.category === 'Magazine') {
        return (
            <Layout userType={user?.userType || 'user'}>
                <MagazineViewer
                    product={product}
                    onClose={() => navigate(-1)}
                    showAddToCart={user?.userType === 'customer' && !isOutOfStock(product)}
                    onAddToCart={handleAddToCart}
                />
            </Layout>
        );
    }

    // For non-magazine products, show standard detail page
    return (
        <Layout userType={user?.userType || 'user'}>
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold mb-8 transition"
                >
                    <ArrowLeft size={20} /> Back to Products
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Image Carousel */}
                    <div className="relative group">
                        {(() => {
                            // Combine main image with additional images
                            const allImages = [product.imageUrl || product.image];
                            if (product.magazinePages && product.magazinePages.length > 0) {
                                allImages.push(...product.magazinePages);
                            }

                            return (
                                <>
                                    {/* Main Image Display */}
                                    <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-2xl border-4 border-gray-50 relative">
                                        <img
                                            src={allImages[currentImageIndex]}
                                            alt={`${product.name} - Image ${currentImageIndex + 1}`}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />

                                        {/* Navigation Arrows (only show if multiple images) */}
                                        {allImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + allImages.length) % allImages.length)}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition"
                                                >
                                                    <ArrowLeft size={24} className="text-gray-800" />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % allImages.length)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition"
                                                >
                                                    <ArrowLeft size={24} className="text-gray-800 rotate-180" />
                                                </button>

                                                {/* Image Counter */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold">
                                                    {currentImageIndex + 1} / {allImages.length}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Thumbnail Gallery (only show if multiple images) */}
                                    {allImages.length > 1 && (
                                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                            {allImages.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-4 transition ${idx === currentImageIndex
                                                            ? 'border-blue-600 shadow-lg'
                                                            : 'border-gray-200 hover:border-gray-400'
                                                        }`}
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`Thumbnail ${idx + 1}`}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col justify-center space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider">
                                    {product.category}
                                </span>
                                {product.metadata?.shopName && (
                                    <span className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                                        <Store size={16} /> {product.metadata.shopName}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-5xl font-black text-gray-900 mb-4">{product.name}</h1>
                            <div className="flex items-baseline gap-4">
                                <p className="text-6xl font-black text-blue-600">৳{product.price}</p>
                                {!isOutOfStock(product) ? (
                                    <span className="text-green-600 font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                                        In Stock
                                    </span>
                                ) : (
                                    <span className="text-red-600 font-bold">Out of Stock</span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                            <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                                <Tag size={20} className="text-blue-600" /> Description
                            </h3>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                {product.description || 'This is a premium quality product from Rong-Tuli. Perfect for your printing needs with professional-grade materials and stunning design.'}
                            </p>
                        </div>

                        {/* Specifications */}
                        {product.metadata && (
                            <div className="grid grid-cols-2 gap-4">
                                {product.metadata.dimensions && (
                                    <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                                        <p className="text-xs font-black text-gray-400 uppercase mb-1">Dimensions</p>
                                        <p className="font-bold text-gray-800">{product.metadata.dimensions}</p>
                                    </div>
                                )}
                                {product.metadata.material && (
                                    <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                                        <p className="text-xs font-black text-gray-400 uppercase mb-1">Material</p>
                                        <p className="font-bold text-gray-800">{product.metadata.material}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Add to Cart Section */}
                        {user?.userType !== 'seller' && user?.userType !== 'admin' && (
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-stretch items-center w-full pt-6 border-t-2 border-gray-100">
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                                    <label className="text-sm font-black text-gray-600 uppercase">Qty:</label>
                                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-black transition"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-16 text-center font-bold outline-none"
                                            min="1"
                                        />
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-black transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock(product)}
                                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition"
                                >
                                    <ShoppingCart size={24} /> Add to Cart
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default ProductDetail;
