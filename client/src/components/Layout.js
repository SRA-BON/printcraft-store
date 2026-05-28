import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, translations } from '../contexts/ThemeContext';
import {
  Home, Info, Phone, ShoppingCart, Palette, Menu, X,
  Package, User, Store, Shield, ChevronRight, ChevronLeft,
  CreditCard, MapPin, FileText, BarChart3, Settings, LogOut,
  Sun, Moon, Facebook, Instagram, MessageCircle, Paintbrush, Languages
} from 'lucide-react';

const Layout = ({ children, userType = 'user', sideNavItems = [] }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sideNavExpanded, setSideNavExpanded] = useState(false);
  const { logout, user, isAuthenticated } = useAuth();
  const { language, toggleLanguage } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentLang = language === 'bn' ? 'bn' : 'en';
  const text = translations[currentLang];

  const getNavItems = () => {
    const baseItems = [
      { icon: Home, label: text.nav.home, path: '/' },
      { icon: Info, label: text.nav.about, path: '/about' },
      { icon: Phone, label: text.nav.contact, path: '/contact' }
    ];

    if (!isAuthenticated || !user) {
      return baseItems;
    }

    if (userType === 'customer' || userType === 'user') {
      return [
        ...baseItems,
        { icon: ShoppingCart, label: text.nav.cart, path: '/cart' },
        { icon: Palette, label: text.nav.customizations, path: '/customizations' }
      ];
    } else if (userType === 'seller' || userType === 'admin') {
      return [
        ...baseItems,
        { icon: Package, label: 'Inventory', path: '/inventory' },
        { icon: Palette, label: text.nav.customizations, path: '/customizations' }
      ];
    }
    return baseItems;
  };

  const getDefaultSideNavItems = () => {
    if (userType === 'user') {
      return [
        { icon: Package, label: 'Orders', path: '/dashboard/user/orders' },
        { icon: CreditCard, label: 'Vouchers', path: '/dashboard/user/vouchers' },
        { icon: MapPin, label: 'Addresses', path: '/dashboard/user/addresses' },
        { icon: FileText, label: 'Reports', path: '/dashboard/user/reports' },
        { icon: BarChart3, label: 'Transactions', path: '/dashboard/user/transactions' }
      ];
    } else if (userType === 'seller') {
      return [
        { icon: Package, label: 'Orders', path: '/dashboard/seller/orders' },
        { icon: Store, label: 'Products', path: '/dashboard/seller/products' },
        { icon: CreditCard, label: 'Vouchers', path: '/dashboard/seller/vouchers' },
        { icon: Palette, label: 'Designs', path: '/dashboard/seller/designs' },
        { icon: FileText, label: 'Reports', path: '/dashboard/seller/reports' },
        { icon: BarChart3, label: 'Sales Statistics', path: '/dashboard/seller/statistics' },
        { icon: CreditCard, label: 'Transactions', path: '/dashboard/seller/transactions' }
      ];
    } else if (userType === 'admin') {
      return [
        { icon: Package, label: 'Orders', path: '/dashboard/admin/orders' },
        { icon: Store, label: 'Products', path: '/dashboard/admin/products' },
        { icon: CreditCard, label: 'Vouchers', path: '/dashboard/admin/vouchers' },
        { icon: Palette, label: 'Designs', path: '/dashboard/admin/designs' },
        { icon: FileText, label: 'Reports', path: '/dashboard/admin/reports' },
        { icon: BarChart3, label: 'Sales Statistics', path: '/dashboard/admin/statistics' },
        { icon: CreditCard, label: 'Transactions', path: '/dashboard/admin/transactions' }
      ];
    }
    return [];
  };

  const navItems = getNavItems();
  const sideNav =
    isAuthenticated && user
      ? (sideNavItems.length > 0 ? sideNavItems : getDefaultSideNavItems())
      : [];
  const DashboardIcon = userType === 'user' ? User : userType === 'seller' ? Store : Shield;

  return (
    <div className="min-h-screen bg-rose-50 dark:bg-rose-950 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white/95 dark:bg-rose-950/95 backdrop-blur shadow-md border-b-2 border-rose-100 dark:border-rose-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md">
                <Paintbrush size={18} />
              </span>
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                {text.brand}
              </span>
            </button>

            <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-6">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(item.path)}
                    className={`transition flex items-center gap-2 font-medium text-sm sm:text-base ${isActive ? 'text-rose-600' : 'text-rose-800 dark:text-rose-100 hover:text-rose-500'
                      }`}
                  >
                    <Icon size={20} /> {item.label}
                  </button>
                );
              })}

              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-3 py-2 rounded-full bg-rose-100/70 dark:bg-rose-900/60 text-rose-700 dark:text-rose-50 text-xs sm:text-sm font-semibold hover:bg-rose-200/80 dark:hover:bg-rose-900/80 transition"
              >
                <Languages size={16} />
                <span>{text.languageLabel}</span>
              </button>


              {isAuthenticated && user && (
                <button
                  onClick={() => {
                    setSidebarOpen(!sidebarOpen);
                    setSideNavExpanded(false);
                  }}
                  className="ml-1 text-rose-700 hover:text-rose-500 dark:text-rose-100 transition"
                  aria-label="Open dashboard menu"
                >
                  <Menu size={22} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {isAuthenticated && user && (
        <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-rose-950 shadow-2xl transform transition-transform duration-500 z-[60] flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-rose-50 leading-none">{user?.name || 'Guest'}</h2>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">{userType}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-rose-100/70 dark:hover:bg-rose-900/70 rounded-xl transition text-gray-400 hover:text-gray-900 dark:hover:text-white"
                aria-label="Close dashboard menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-2 mb-8">
              <button
                onClick={() => {
                  const dashboardPath = `/dashboard/${userType}`;
                  navigate(dashboardPath);
                  setSidebarOpen(false);
                }}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-4 rounded-2xl hover:shadow-xl hover:shadow-rose-200 transition-all flex items-center justify-between font-bold"
              >
                <span className="flex items-center gap-3"><DashboardIcon size={20} /> {text.sidebarDashboard}</span>
                <ChevronRight size={18} />
              </button>

              <button
                onClick={() => {
                  const reportsPath = userType === 'seller' ? '/seller/reports' : userType === 'admin' ? '/admin/history' : '/dashboard/user';
                  navigate(reportsPath);
                  setSidebarOpen(false);
                }}
                className="w-full bg-rose-50 text-rose-700 px-6 py-4 rounded-2xl hover:bg-rose-100 transition-all flex items-center justify-between font-bold"
              >
                <span className="flex items-center gap-3"><FileText size={20} /> {text.sidebarReports}</span>
              </button>
            </div>

            {userType === 'seller' && (
              <button
                onClick={() => {
                  navigate('/seller/selling');
                  setSidebarOpen(false);
                }}
                className="w-full mb-4 bg-rose-50 text-rose-700 px-4 py-3 rounded-lg hover:bg-rose-100 transition flex items-center gap-2 font-semibold"
              >
                <BarChart3 size={20} /> {text.sidebarSellingDashboard}
              </button>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-rose-50">{text.sidebarQuickLinksTitle}</h3>
                <button
                  onClick={() => setSideNavExpanded(!sideNavExpanded)}
                  className="text-gray-500 hover:text-gray-700 dark:text-rose-200 dark:hover:text-white"
                  aria-label={sideNavExpanded ? 'Collapse quick links' : 'Expand quick links'}
                >
                  {sideNavExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
              </div>

              {sideNavExpanded && (
                <div className="space-y-2">
                  {sideNav.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          navigate(item.path);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center gap-2 ${isActive
                          ? 'bg-rose-100 text-rose-700'
                          : 'text-gray-700 dark:text-rose-100 hover:bg-rose-50 dark:hover:bg-rose-900'
                          }`}
                      >
                        <Icon size={18} /> {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t mt-4 pt-4">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition flex items-center gap-2"
              >
                <LogOut size={18} /> {text.sidebarLogout}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      {!['/about', '/contact'].includes(location.pathname) && (
        <header className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 dark:from-rose-900 dark:via-rose-900 dark:to-rose-900 text-white py-8 sm:py-12 text-center px-4">
          <h2 className="text-3xl sm:text-5xl font-bold mb-3">{text.headerTitle}</h2>
          <p className="text-base sm:text-xl text-white/80">{text.headerSubtitle}</p>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-16">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-3">{text.brand}</h3>
              <p className="text-gray-400">{text.footerDescription}</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">{text.footerQuickLinksTitle}</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer">{text.footerQuickLinksAbout}</li>
                <li className="hover:text-white cursor-pointer">{text.footerQuickLinksContact}</li>
                <li className="hover:text-white cursor-pointer">{text.footerQuickLinksPrivacy}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">{text.footerContactTitle}</h4>
              <p className="text-gray-400">{text.footerContactEmail}</p>
              <p className="text-gray-400">{text.footerContactPhone}</p>
              <div className="flex gap-4 mt-4">
                <a href="https://www.facebook.com/Infinley.style" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition"><Facebook size={24} /></a>
                <a href="https://www.instagram.com/infinley.style/" target="_blank" rel="noreferrer" className="hover:text-pink-500 transition"><Instagram size={24} /></a>
                <a href="https://wa.me/8801779033536" target="_blank" rel="noreferrer" className="hover:text-green-500 transition"><MessageCircle size={24} /></a>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t border-gray-800 text-gray-400">
            <p>&copy; 2024 {text.brand}. {text.footerRights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

