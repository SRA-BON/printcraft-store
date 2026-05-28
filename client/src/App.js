import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import axios from 'axios';
import {
  ShoppingCart, Home, Info, Phone, Palette, Package, X, Search, Filter,
  BookOpen, Image, Frame, Newspaper, LayoutTemplate, User,
  CheckCircle, Shield, History, LayoutDashboard, Settings,
  Star, ArrowLeft, Eye, Paintbrush, Languages, LogOut
} from 'lucide-react';
import { useTheme, translations } from './contexts/ThemeContext';
import { API_ROOT } from './config';

const API_URL = `${API_ROOT}/products`;

const demoProducts = {
  magazine: [
    { id: 'm1', name: 'Fashion Weekly Magazine', description: 'Latest fashion trends and styles', price: 299, color: 'red', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', lastModified: '2024-12-15' },
    { id: 'm2', name: 'Tech Today Magazine', description: 'Technology news and reviews', price: 349, color: 'blue', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400', lastModified: '2024-12-18' },
    { id: 'm3', name: 'Business Insider Magazine', description: 'Business and finance insights', price: 399, color: 'black', stock: 'out-of-stock', imageUrl: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400', lastModified: '2024-12-10' },
    { id: 'm4', name: 'Travel Explorer Magazine', description: 'Explore destinations worldwide', price: 279, color: 'green', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400', lastModified: '2024-12-19' },
    { id: 'm5', name: 'Gourmet Gazette', description: 'Culinary arts and recipes', price: 320, color: 'yellow', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400', lastModified: '2024-12-25' },
  ],
  book: [
    { id: 'b1', name: 'Photo Memory Book', description: 'Preserve your precious memories', price: 599, color: 'white', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', lastModified: '2024-12-18' },
    { id: 'b2', name: 'Wedding Album Book', description: 'Premium wedding photo book', price: 899, color: 'red', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', lastModified: '2024-12-19' },
    { id: 'b3', name: 'Travel Journal Book', description: 'Document your adventures', price: 499, color: 'blue', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400', lastModified: '2024-12-14' },
    { id: 'b4', name: 'Baby Memory Book', description: 'First year memories', price: 699, color: 'yellow', stock: 'out-of-stock', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', lastModified: '2024-12-12' },
    { id: 'b5', name: 'Personalized Recipe Book', description: 'Your family secrets in print', price: 550, color: 'brown', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1512418490979-92798ccc13fb?w=400', lastModified: '2024-12-26' },
  ],
  album: [
    { id: 'a1', name: 'Classic Photo Album', description: 'Timeless photo preservation', price: 799, color: 'black', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400', lastModified: '2024-12-19' },
    { id: 'a2', name: 'Modern Photo Album', description: 'Contemporary design album', price: 849, color: 'white', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=400', lastModified: '2024-12-18' },
    { id: 'a3', name: 'Vintage Photo Album', description: 'Retro style photo collection', price: 699, color: 'orange', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400', lastModified: '2024-12-16' },
    { id: 'a4', name: 'Luxury Photo Album', description: 'Premium quality album', price: 1299, color: 'red', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400', lastModified: '2024-12-20' },
    { id: 'a5', name: 'Baby Steps Album', description: 'Milestones captured', price: 899, color: 'pink', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1511250151838-8d26be70104c?w=400', lastModified: '2024-12-27' },
  ],
  canvas: [
    { id: 'c1', name: 'Portrait Canvas Print', description: 'High-quality portrait canvas', price: 1499, color: 'white', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1578926078211-e90a9c88c0eb?w=400', lastModified: '2024-12-19' },
    { id: 'c2', name: 'Landscape Canvas Print', description: 'Scenic landscape canvas', price: 1299, color: 'blue', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400', lastModified: '2024-12-18' },
    { id: 'c3', name: 'Abstract Canvas Art', description: 'Modern abstract design', price: 1699, color: 'red', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400', lastModified: '2024-12-20' },
    { id: 'c4', name: 'Family Canvas Print', description: 'Custom family portrait canvas', price: 1799, color: 'black', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400', lastModified: '2024-12-17' },
    { id: 'c5', name: 'Oil Style Canvas', description: 'Digital oil painting effect', price: 2100, color: 'multi', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400', lastModified: '2024-12-28' },
  ],
  banner: [
    { id: 'bn1', name: 'Birthday Banner', description: 'Celebrate special birthdays', price: 499, color: 'red', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400', lastModified: '2024-12-19' },
    { id: 'bn2', name: 'Wedding Banner', description: 'Elegant wedding decoration', price: 699, color: 'white', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', lastModified: '2024-12-18' },
    { id: 'bn3', name: 'Business Banner', description: 'Professional business signage', price: 899, color: 'blue', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400', lastModified: '2024-12-20' },
    { id: 'bn4', name: 'Event Banner', description: 'Custom event banner', price: 799, color: 'green', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400', lastModified: '2024-12-17' },
    { id: 'bn5', name: 'Grand Opening Banner', description: 'Launch your store in style', price: 950, color: 'red', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400', lastModified: '2024-12-29' },
  ],
  frame: [
    { id: 'f1', name: 'Classic Wooden Frame', description: 'Traditional wooden photo frame', price: 399, color: 'black', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400', lastModified: '2024-12-19' },
    { id: 'f2', name: 'Modern Metal Frame', description: 'Sleek metal frame design', price: 449, color: 'grey', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400', lastModified: '2024-12-18' },
    { id: 'f3', name: 'Vintage Gold Frame', description: 'Ornate vintage style frame', price: 699, color: 'yellow', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400', lastModified: '2024-12-20' },
    { id: 'f4', name: 'Minimalist White Frame', description: 'Clean minimalist design', price: 349, color: 'white', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1551732998-9c63fbff1d6b?w=400', lastModified: '2024-12-17' },
    { id: 'f5', name: 'Acrylic Frame', description: 'Modern floating look', price: 750, color: 'transparent', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', lastModified: '2024-12-29' },
  ],
};

const categoryImages = {
  album: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800',
  banner: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
  magazine: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800',
  book: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
  canvas: 'https://images.unsplash.com/photo-1578926078211-e90a9c88c0eb?w=800',
  frame: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800',
};

function App() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage } = useTheme();
  const currentLang = language === 'bn' ? 'bn' : 'en';
  const uiText = translations[currentLang];
  const [currentPage, setCurrentPage] = useState('landing');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [customColor, setCustomColor] = useState('#000000');
  const [products, setProducts] = useState(demoProducts);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    availability: 'all',
    color: 'all',
    sortBy: 'none'
  });

  const categories = [
    { id: 'album', name: uiText.categories.album, icon: Image, gradient: 'from-pink-400 to-rose-500' },
    { id: 'banner', name: uiText.categories.banner, icon: LayoutTemplate, gradient: 'from-orange-400 to-amber-500' },
    { id: 'magazine', name: uiText.categories.magazine, icon: Newspaper, gradient: 'from-yellow-400 to-orange-400' },
    { id: 'book', name: uiText.categories.book, icon: BookOpen, gradient: 'from-gray-400 to-slate-500' },
    { id: 'canvas', name: uiText.categories.canvas, icon: Palette, gradient: 'from-red-400 to-pink-500' },
    { id: 'frame', name: uiText.categories.frame, icon: Frame, gradient: 'from-amber-400 to-yellow-500' },
  ];

  const colorOptions = ['black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'grey', 'transparent'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) {
      const userCart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]');
      setCart(userCart);
    } else {
      setCart([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  const fetchProducts = async () => {
    try {
      const [productsRes, sellersRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(`${API_ROOT}/sellers`),
      ]);

      const publicSellers = sellersRes.data
        .filter(s => s.storeVisibility !== 'private')
        .map(s => s.sellerId);

      const filteredData = productsRes.data.filter(p => !p.sellerId || publicSellers.includes(p.sellerId));

      const grouped = filteredData.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
      }, {});
      setProducts(grouped);
      setLoading(false);
      console.log('✅ Products loaded and filtered by visibility');
    } catch (error) {
      console.error('⚠️ MongoDB not available or error fetching:', error.message);
      setProducts(demoProducts);
      setLoading(false);
    }
  };

  const addToCart = React.useCallback((product) => {
    if (!isAuthenticated || !user) {
      alert('Please login to add items to your cart.');
      navigate('/login');
      return;
    }

    const isOutOfStock = product.stock === 'out-of-stock' || product.stock === 0;
    if (isOutOfStock) {
      alert('This product is currently out of stock.');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updatedCart);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedCart));
    alert(`${product.name} added to cart!`);
  }, [cart, user, isAuthenticated, navigate]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  const getFilteredProducts = (categoryId) => {
    let productList = products[categoryId] || [];

    if (searchQuery) {
      productList = productList.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.availability !== 'all') {
      productList = productList.filter(p => p.stock === filters.availability);
    }

    if (filters.color !== 'all') {
      if (filters.color === 'custom') {
        // Custom color filter - could be enhanced to match hex colors
        // For now, we'll skip custom color filtering or implement a color matching algorithm
        // This is a placeholder for future enhancement
      } else {
        productList = productList.filter(p => p.color === filters.color);
      }
    }

    if (filters.sortBy === 'price-high') {
      productList = [...productList].sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'price-low') {
      productList = [...productList].sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'name') {
      productList = [...productList].sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'modified') {
      productList = [...productList].sort((a, b) => {
        try {
          return new Date(b.lastModified) - new Date(a.lastModified);
        } catch (error) {
          return 0;
        }
      });
    } else if (filters.sortBy === 'none') {
      // Default: Personalized sorting
      const interests = JSON.parse(localStorage.getItem('printcraft_interests') || '{}');
      productList = [...productList].sort((a, b) => {
        const scoreA = interests[a.category] || 0;
        const scoreB = interests[b.category] || 0;
        return scoreB - scoreA;
      });
    }

    return productList;
  };

  const getRecommendations = () => {
    const interests = JSON.parse(localStorage.getItem('printcraft_interests') || '{}');
    if (Object.keys(interests).length === 0) return [];

    let allProducts = Object.values(products).flat();
    return allProducts
      .sort((a, b) => (interests[b.category] || 0) - (interests[a.category] || 0))
      .slice(0, 3);
  };

  const SideNav = () => {
    if (!isAuthenticated || !user) return null;

    return (
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 bg-white/90 dark:bg-rose-950/90 border border-rose-100 dark:border-rose-900 rounded-3xl shadow-xl p-3">
        <button
          onClick={() => setCurrentPage('landing')}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-50 hover:bg-rose-200 dark:hover:bg-rose-800 transition"
        >
          <Home size={20} />
        </button>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-600 text-white hover:bg-rose-700 transition"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  };

  const NavBar = ({ isLanding = false }) => (
    <nav className="bg-rose-50/90 dark:bg-rose-950/90 backdrop-blur shadow-md border-b-2 border-rose-100 dark:border-rose-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center gap-3">
          <button
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md">
            <Paintbrush size={18} />
          </span>
          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              {uiText.brand}
          </span>
          </button>

          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <button onClick={() => setCurrentPage('landing')} className="text-rose-700 dark:text-rose-100 hover:text-rose-500 transition flex items-center gap-2 font-medium">
              <Home size={20} /> {uiText.nav.home}
            </button>
            <button onClick={() => navigate('/about')} className="text-rose-700 dark:text-rose-100 hover:text-rose-500 transition flex items-center gap-2 font-medium text-sm sm:text-base">
              <Info size={20} /> {uiText.nav.about}
            </button>
            <button onClick={() => navigate('/contact')} className="text-rose-700 dark:text-rose-100 hover:text-rose-500 transition flex items-center gap-2 font-medium text-sm sm:text-base">
              <Phone size={20} /> {uiText.nav.contact}
            </button>
            {!isLanding && (
              <button onClick={() => setCurrentPage('landing')} className="text-rose-700 dark:text-rose-100 hover:text-rose-500 transition flex items-center gap-2 font-medium text-sm sm:text-base">
                <Package size={20} /> {uiText.nav.store}
              </button>
            )}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-2 rounded-full bg-rose-100/80 dark:bg-rose-900/60 text-rose-700 dark:text-rose-50 text-xs sm:text-sm font-semibold hover:bg-rose-200/90 dark:hover:bg-rose-900/80 transition"
            >
              <Languages size={16} />
              <span>{uiText.languageLabel}</span>
            </button>
            {isLanding && !isAuthenticated && (
              <button
                onClick={() => navigate('/login')}
                className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-sm sm:text-base hover:shadow-lg hover:shadow-rose-200/80 transition flex items-center gap-2"
              >
                <User size={18} /> {uiText.nav.loginCta}
              </button>
            )}
            {!isLanding && isAuthenticated && user && (
              <button
                onClick={() => navigate('/cart')}
                className="text-rose-700 dark:text-rose-100 hover:text-rose-500 transition flex items-center gap-2 font-medium text-sm sm:text-base relative"
              >
                <ShoppingCart size={20} /> {uiText.nav.cart}
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                  </span>
                )}
              </button>
            )}

            {!isLanding && isAuthenticated && user && (
              <button
                onClick={() => navigate('/customizations')}
                className="text-rose-700 dark:text-rose-100 hover:text-rose-500 transition flex items-center gap-2 font-medium text-sm sm:text-base"
              >
                <Palette size={20} /> {uiText.nav.customizations}
              </button>
            )}

            {!isLanding && isAuthenticated && user && (
              <button
                onClick={() => {
                  if (user.userType === 'customer') {
                    navigate('/dashboard/user');
                  } else if (user.userType === 'seller') {
                    navigate('/dashboard/seller');
                  } else if (user.userType === 'admin') {
                    navigate('/dashboard/admin');
                  }
                }}
                className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 sm:px-4 py-2 rounded-full hover:shadow-lg hover:shadow-rose-200/80 transition flex items-center gap-2 text-sm sm:text-base"
              >
                <User size={20} /> {uiText.nav.dashboard}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
  const Header = () => {
    const [offsetY, setOffsetY] = useState(0);
    const handleScroll = () => setOffsetY(window.scrollY);

    useEffect(() => {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
      <header className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-800 via-rose-900 to-pink-950" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div 
          className="max-w-7xl mx-auto px-6 relative z-10 text-center transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${Math.min(offsetY * 0.4, 250)}px)`, opacity: Math.max(1 - offsetY / 600, 0) }}
        >
          <h1 className="text-4xl sm:text-7xl font-black text-white mb-6 tracking-tighter leading-none animate-[slideDown_1s_ease-out]">
            CRAFT THE <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">UNEXPECTED</span>
          </h1>
          <p className="text-base sm:text-xl text-rose-100 max-w-2xl mx-auto mb-10 font-bold leading-relaxed">
            Premium print solutions for visionaries. Isolation tested, quality guaranteed, local artisan crafts delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button onClick={() => setCurrentPage('store')} className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-rose-900 rounded-3xl font-black text-base sm:text-lg hover:shadow-2xl hover:shadow-rose-500/50 transition-all transform hover:-translate-y-1">
              {uiText.home.exploreStore}
            </button>
            <button className="px-8 sm:px-10 py-4 sm:py-5 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-3xl font-black text-base sm:text-lg hover:bg-white/20 transition-all">
              {uiText.home.ourPortfolio}
            </button>
          </div>
        </div>
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[120%] h-48 bg-rose-950 rounded-[100%] border-t-8 border-white/5" />
      </header>
    );
  };


  const Footer = () => (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3">{uiText.brand}</h3>
            <p className="text-gray-400">{uiText.footerDescription}</p>
          </div>
          <div>
            <h4 className="font-bold mb-3">{uiText.footerQuickLinksTitle}</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-white cursor-pointer">{uiText.footerQuickLinksAbout}</li>
              <li className="hover:text-white cursor-pointer">{uiText.footerQuickLinksContact}</li>
              <li className="hover:text-white cursor-pointer">{uiText.footerQuickLinksPrivacy}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">{uiText.footerContactTitle}</h4>
            <p className="text-gray-400">{uiText.footerContactEmail}</p>
            <p className="text-gray-400">{uiText.footerContactPhone}</p>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-gray-800 text-gray-400">
          <p>&copy; 2024 {uiText.brand}. {uiText.footerRights}</p>
        </div>
      </div>
    </footer>
  );

  const FilterPanel = () => (
    <div className={`${showFilters ? 'block' : 'hidden'} bg-white dark:bg-rose-950 border-2 border-rose-100 dark:border-rose-900 rounded-xl p-6 shadow-2xl mb-6`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl text-gray-800 dark:text-rose-50">{uiText.home.filters}</h3>
        <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700 dark:text-rose-200 dark:hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block font-semibold mb-2 text-gray-700 dark:text-rose-50">Availability</label>
          <select
            value={filters.availability}
            onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            className="w-full border-2 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 dark:bg-rose-950 dark:text-rose-50"
          >
            <option value="all">All</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-700 dark:text-rose-50">Color</label>
          <select
            value={filters.color}
            onChange={(e) => setFilters({ ...filters, color: e.target.value })}
            className="w-full border-2 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 dark:bg-rose-950 dark:text-rose-50"
          >
            <option value="all">All Colors</option>
            {colorOptions.map(color => (
              <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
            ))}
            <option value="custom">Custom Color Picker</option>
          </select>
          {filters.color === 'custom' && (
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="mt-2 w-full h-12 rounded-lg border-2 border-rose-200 dark:border-rose-800 cursor-pointer bg-white dark:bg-rose-900"
            />
          )}
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-700 dark:text-rose-50">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="w-full border-2 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 dark:bg-rose-950 dark:text-rose-50"
          >
            <option value="none">None</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="name">Name</option>
            <option value="modified">Last Modified</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setFilters({ availability: 'all', color: 'all', sortBy: 'none' });
              setSearchQuery(''); // Reset search query as well
            }}
            className="w-full bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 transition font-semibold"
          >
            {uiText.home.resetFilters}
          </button>
        </div>
      </div>
    </div>
  );

  const ProductCard = ({ product }) => (
    <div
      className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 group border border-gray-100 dark:border-gray-700"
      onMouseEnter={() => setHoveredProduct(product.id)}
      onMouseLeave={() => setHoveredProduct(null)}
    >
      <div className="relative h-72 overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {hoveredProduct === product.id && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 transition-all duration-300">
            <h3 className="text-white font-black text-2xl mb-3 text-center">{product.name}</h3>
            <p className="text-gray-200 text-center text-sm line-clamp-3">{product.description}</p>
          </div>
        )}
        <span className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${product.stock === 'in-stock' ? 'bg-green-500 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg'}`}>
          {product.stock === 'in-stock' ? 'In Stock' : 'Out of Stock'}
        </span>
        {user && user.userType !== 'customer' && (
          <span className="absolute top-4 left-4 px-4 py-1.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-900 uppercase tracking-widest border-2 border-white shadow-lg">
            View-Only Mode
          </span>
        )}
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-black text-xl text-gray-800 dark:text-gray-100 mb-1">{product.name}</h3>
            <p className="text-gray-400 dark:text-gray-300 text-xs font-bold uppercase tracking-tighter">Category: {product.category}</p>
            {product.metadata?.shopName && (
              <p className="text-rose-500 dark:text-rose-300 text-[10px] font-black uppercase tracking-widest mt-1">
                Store: {product.metadata.shopName}
              </p>
            )}
          </div>
          <span className="text-3xl font-black text-rose-600">৳{product.price}</span>
        </div>

        <div className="flex gap-3 mt-6">
          {(!user || user.userType === 'customer') ? (
            <>
              <button
                onClick={() => navigate(`/product/${product.id}`)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-4 rounded-2xl font-black hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
              >
                <Eye size={20} /> View
              </button>
              <button
                onClick={() => addToCart(product)}
                disabled={product.stock === 'out-of-stock'}
                className={`flex-[2] py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${product.stock === 'in-stock'
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate(`/product/${product.id}`)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-4 rounded-2xl font-black hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
              >
                <Eye size={20} /> View Details
              </button>
              <button
                onClick={() => navigate(user.userType === 'seller' ? '/seller/stock' : '/admin/creations')}
                className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                <Settings size={20} /> Manage
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-rose-950">
        <NavBar isLanding={true} />
        <SideNav />
        <Header />

        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Recommendations Section */}
          {getRecommendations().length > 0 && (
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                  <Star size={28} />
                </div>
                <h2 className="text-3xl font-black text-gray-800">{uiText.home.recommended}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getRecommendations().map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8 border-b-2 border-gray-100" />
            </div>
          )}

          <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-900 tracking-tight">{uiText.home.chooseCategory}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(loading ? Array.from({ length: categories.length }) : categories).map((item, index) => {
              const cat = loading ? categories[index] : item;
              if (!cat) return null;
              if (loading) {
                return (
                  <div
                    key={`skeleton-${index}`}
                    className="relative rounded-[3rem] p-1 overflow-hidden bg-white/60 dark:bg-rose-950/70 border-4 border-transparent"
                  >
                    <div className="relative bg-gray-100 dark:bg-rose-900 p-10 rounded-[2.8rem] text-center animate-pulse">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-200 dark:bg-rose-800" />
                      <div className="h-6 w-32 mx-auto mb-3 rounded-full bg-gray-200 dark:bg-rose-800" />
                      <div className="h-4 w-24 mx-auto rounded-full bg-gray-100 dark:bg-rose-900" />
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    if (user && user.userType === 'seller') {
                      navigate('/seller/stock', { state: { category: cat.id } });
                    } else {
                      setFilters({ ...filters, category: cat.id });
                      setCurrentPage(cat.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`relative group cursor-pointer transition-all duration-500 overflow-hidden rounded-[3rem] p-1 ${hoveredCategory === cat.id ? 'scale-105 -translate-y-2 shadow-2xl shadow-rose-200' : ''}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-20 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative bg-white p-10 rounded-[2.8rem] text-center border-4 border-transparent group-hover:bg-transparent transition-colors duration-500">
                    <cat.icon
                      size={48}
                      className={`mx-auto mb-6 transition-all duration-500 ${hoveredCategory === cat.id ? 'text-white scale-110 rotate-6' : 'text-gray-800'}`}
                    />
                    <h3 className={`text-xl font-black transition-colors duration-500 ${hoveredCategory === cat.id ? 'text-white' : 'text-gray-800'}`}>
                      {cat.name}
                    </h3>
                    <p className={`text-xs mt-2 font-bold tracking-widest uppercase transition-colors duration-500 ${hoveredCategory === cat.id ? 'text-white/80' : 'text-gray-400'}`}>
                      {uiText.home.viewProducts}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  const category = categories.find(c => c.id === currentPage) || categories[0];
  const productList = getFilteredProducts(currentPage === 'store' ? 'all' : currentPage);

  return (
    <div className="min-h-screen bg-rose-50 dark:bg-rose-950 flex flex-col">
      <NavBar />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-black text-gray-900 leading-none">
            {currentPage === 'store' ? 'All Products' : `${category.name} Collection`}
          </h2>
          <button
            onClick={() => setCurrentPage('landing')}
            className="group flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-2xl font-black hover:bg-gray-100 transition-all shadow-lg"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input
              type="text"
              placeholder={uiText.home.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white dark:bg-rose-900 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-rose-500/20 text-xl font-bold shadow-xl shadow-rose-100/60 dark:shadow-rose-900/60 text-gray-900 dark:text-rose-50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-10 py-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-[2rem] font-black flex items-center gap-3 shadow-xl shadow-rose-200/60 hover:scale-105 transition-all active:scale-95"
          >
            <Filter size={24} /> Filters
          </button>
        </div>

        <FilterPanel />

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : productList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {productList.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] shadow-xl border-2 border-dashed border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={48} className="text-gray-300" />
            </div>
            <p className="text-3xl font-black text-gray-800 mb-4">{uiText.home.noProducts}</p>
            <p className="text-gray-400 font-bold mb-10 max-w-md mx-auto">Try adjusting your filters or search keywords.</p>
            <button
              onClick={() => {
                setFilters({ availability: 'all', color: 'all', sortBy: 'none' });
                setSearchQuery('');
              }}
              className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-lg"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
