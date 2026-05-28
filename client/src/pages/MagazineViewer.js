import React, { forwardRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ShoppingCart } from 'lucide-react';
import API from '../api';
const Page = forwardRef((props, ref) => {
    return (
        <div className="page bg-white dark:bg-gray-800 shadow-lg overflow-hidden h-full border border-gray-100 dark:border-gray-700" ref={ref}>
            <div className="page-content h-full relative">
                {props.children}
                <div className="absolute bottom-4 w-full text-center text-xs text-gray-400 dark:text-gray-500 font-bold">
                    - {props.number} -
                </div>
            </div>
        </div>
    );
});

function MagazineViewer({ product, onClose, showAddToCart = false, onAddToCart }) {
    const [zoom, setZoom] = useState(1);

    return (
        <div className="fixed inset-0 z-50 bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
            {/* Toolbar */}
            <div className="absolute top-4 right-4 flex gap-4 z-50">
                <button
                    onClick={onClose}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="absolute top-4 left-4 text-white">
                <h2 className="text-2xl font-black">{product.name}</h2>
                <p className="text-gray-400 font-bold">Interactive Preview</p>
            </div>

            {/* Book Container with Zoom */}
            <div className={`transition-transform duration-300 transform scale-${Math.round(zoom * 100)}`} style={{ transform: `scale(${zoom})` }}>
                <HTMLFlipBook
                    width={400}
                    height={550}
                    size="fixed"
                    minWidth={315}
                    maxWidth={400}
                    minHeight={400}
                    maxHeight={550}
                    maxShadowOpacity={0.5}
                    showCover={true}
                    mobileScrollSupport={true}
                    className="shadow-2xl"
                >
                    {/* Render pages from magazinePages array if available, otherwise show placeholders */}
                    {product.magazinePages && product.magazinePages.length > 0 ? (
                        // Real magazine pages from uploaded images
                        product.magazinePages.map((pageUrl, index) => (
                            <Page key={index} number={index + 1}>
                                <div className="h-full w-full">
                                    <img
                                        src={pageUrl}
                                        alt={`Page ${index + 1}`}
                                        loading="lazy"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </Page>
                        ))
                    ) : (
                        // Placeholder pages (original design)
                        <>
                            {/* Cover Page */}
                            <Page number={1}>
                                <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                                    <img src={product.imageUrl || product.image} alt="Cover" loading="lazy" className="w-full h-3/4 object-cover shadow-lg rounded mb-4" />
                                    <h1 className="text-2xl font-black text-center text-gray-800 dark:text-gray-100 uppercase">{product.name}</h1>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-300 mt-2">Designed by {product.metadata?.shopName || 'Rong-Tuli'}</p>
                                </div>
                            </Page>

                            {/* Table of Contents */}
                            <Page number={2}>
                                <div className="p-8 h-full bg-white dark:bg-gray-800">
                                    <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 border-b-2 border-black dark:border-gray-300 pb-2 mb-6">CONTENTS</h2>
                                    <ul className="space-y-4">
                                        <li className="flex justify-between font-bold text-gray-600 dark:text-gray-300 border-b border-dashed pb-1"><span>Introduction</span> <span>03</span></li>
                                        <li className="flex justify-between font-bold text-gray-600 dark:text-gray-300 border-b border-dashed pb-1"><span>Summer Trends</span> <span>05</span></li>
                                        <li className="flex justify-between font-bold text-gray-600 dark:text-gray-300 border-b border-dashed pb-1"><span>New Arrivals</span> <span>08</span></li>
                                        <li className="flex justify-between font-bold text-gray-600 dark:text-gray-300 border-b border-dashed pb-1"><span>Modern Art</span> <span>12</span></li>
                                        <li className="flex justify-between font-bold text-gray-600 dark:text-gray-300 border-b border-dashed pb-1"><span>Exclusive Interview</span> <span>15</span></li>
                                    </ul>
                                    <div className="absolute bottom-10 left-8 right-8">
                                        <p className="text-justify text-xs text-gray-400 dark:text-gray-300 font-serif leading-relaxed">
                                            Welcome to the latest edition. Explore the vibrant world of print and design crafted specifically for enthusiasts like you.
                                        </p>
                                    </div>
                                </div>
                            </Page>

                            {/* Content Page 1 */}
                            <Page number={3}>
                                <div className="h-full bg-gray-800 text-white p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-bl-[100px] opacity-20" />
                                    <h3 className="text-3xl font-black mb-4 uppercase leading-none">Summer<br /><span className="text-yellow-500">Vibes</span></h3>
                                    <div className="h-40 bg-gray-700 mb-4 rounded-lg animate-pulse" /> {/* Placeholder Image */}
                                    <p className="text-sm font-medium text-gray-300 leading-relaxed column-count-2">
                                        Discover the heat of the season with our exclusive collection. From bold colors to subtle pastels, we have everything you need to stand out.
                                        <br /><br />
                                        Fashion is not just about clothes, it's about expression. Let your style speak volumes this summer.
                                    </p>
                                </div>
                            </Page>

                            {/* Content Page 2 */}
                            <Page number={4}>
                                <div className="h-full p-6">
                                    <div className="border-4 border-black dark:border-gray-300 h-full p-4 relative">
                                        <h3 className="text-4xl font-black text-center mt-10 mb-8 tracking-widest uppercase">Minimal</h3>
                                        <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 mb-6 flex items-center justify-center">
                                            <span className="text-gray-400 dark:text-gray-300 font-bold uppercase">Fashion Shot</span>
                                        </div>
                                        <p className="text-center font-serif italic text-gray-600 dark:text-gray-300">"Simplicity is the ultimate sophistication."</p>
                                    </div>
                                </div>
                            </Page>

                            {/* Content Page 3 */}
                            <Page number={5}>
                                <div className="h-full bg-yellow-400 p-8 flex flex-col justify-center">
                                    <h2 className="text-5xl font-black text-white mix-blend-overlay mb-4">SALE</h2>
                                    <p className="text-xl font-bold text-gray-900 mb-8">Get 50% Off on Premium Templates</p>
                                    <div className="bg-white p-4 rounded-lg shadow-lg rotate-2 transform hover:rotate-0 transition">
                                        <p className="font-black text-center text-gray-800 text-lg">Use Code: SUMMER25</p>
                                    </div>
                                </div>
                            </Page>

                            {/* Back Cover */}
                            <Page number={6}>
                                <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
                                    <h2 className="text-3xl font-black tracking-widest mb-4">RONG-TULI</h2>
                                    <p className="text-gray-400 text-sm mb-12">www.rong-tuli.com</p>
                                    <div className="w-24 h-24 bg-white qr-placeholder mb-4" /> {/* QR Placeholder */}
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">© 2025 All Rights Reserved</p>
                                </div>
                            </Page>
                        </>
                    )}
                </HTMLFlipBook>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 items-center">
                <div className="flex gap-4 bg-white/10 backdrop-blur rounded-full p-2">
                    <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))} className="p-3 hover:bg-white/20 text-white rounded-full transition"><ZoomOut size={20} /></button>
                    <span className="flex items-center text-white font-bold text-sm w-12 justify-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(1.5, z + 0.2))} className="p-3 hover:bg-white/20 text-white rounded-full transition"><ZoomIn size={20} /></button>
                </div>

                {showAddToCart && onAddToCart && (
                    <button
                        onClick={() => {
                            onAddToCart();
                            alert(`Added ${product.name} to cart!`);
                        }}
                        className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full font-black hover:bg-blue-700 transition shadow-2xl"
                    >
                        <ShoppingCart size={24} /> Add to Cart
                    </button>
                )}
            </div>
        </div>
    );
}

export default MagazineViewer;
