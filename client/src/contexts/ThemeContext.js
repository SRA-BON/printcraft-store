import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const translations = {
    en: {
        brand: 'Rong-Tuli',
        nav: {
            home: 'Home',
            about: 'About',
            contact: 'Contact Us',
            store: 'Store',
            cart: 'Cart',
            customizations: 'Customizations',
            loginCta: 'Login / Signup',
            dashboard: 'Dashboard',
            login: 'Login'
        },
        headerTitle: 'Welcome to Rong-Tuli',
        headerSubtitle: 'Customize and print your memories with professional quality',
        languageLabel: 'EN',
        home: {
            recommended: 'Recommended for You',
            chooseCategory: 'Choose Your Product Category',
            exploreStore: 'Explore Store',
            ourPortfolio: 'Our Portfolio',
            viewProducts: 'View Products',
            searchPlaceholder: 'Searching for something specific?',
            filters: 'Filters',
            resetFilters: 'Reset Filters',
            noProducts: 'No products found'
        },
        categories: {
            album: 'Photo Album',
            banner: 'Banner',
            magazine: 'Magazine',
            book: 'Book',
            canvas: 'Canvas',
            frame: 'Photo Frame'
        },
        footerDescription: 'Your trusted partner for custom printing solutions',
        footerQuickLinksTitle: 'Quick Links',
        footerQuickLinksAbout: 'About Us',
        footerQuickLinksContact: 'Contact',
        footerQuickLinksPrivacy: 'Privacy Policy',
        footerContactTitle: 'Contact',
        footerContactEmail: 'Email: support@printcraft.com',
        footerContactPhone: 'Phone: +880-1234-567890',
        footerRights: 'All rights reserved.',
        sidebarQuickLinksTitle: 'Quick Links',
        sidebarLogout: 'Logout',
        sidebarDashboard: 'Dashboard',
        sidebarReports: 'My Reports',
        sidebarSellingDashboard: 'Selling Dashboard'
    },
    bn: {
        brand: 'রং-তুলি',
        nav: {
            home: 'হোম',
            about: 'আমাদের সম্পর্কে',
            contact: 'যোগাযোগ',
            store: 'স্টোর',
            cart: 'কার্ট',
            customizations: 'কাস্টমাইজেশন',
            loginCta: 'লগইন / সাইনআপ',
            dashboard: 'ড্যাশবোর্ড',
            login: 'লগইন'
        },
        headerTitle: 'স্বাগত রং-তুলি তে',
        headerSubtitle: 'পেশাদার মানের সাথে আপনার স্মৃতি প্রিন্ট এবং কাস্টমাইজ করুন',
        languageLabel: 'বাংলা',
        home: {
            recommended: 'আপনার জন্য প্রস্তাবিত',
            chooseCategory: 'পণ্যের বিভাগ নির্বাচন করুন',
            exploreStore: 'স্টোর দেখুন',
            ourPortfolio: 'আমাদের পোর্টফোলিও',
            viewProducts: 'পণ্য দেখুন',
            searchPlaceholder: 'কিছু নির্দিষ্ট খুঁজছেন?',
            filters: 'ফিল্টার',
            resetFilters: 'ফিল্টার মুছুন',
            noProducts: 'কোন পণ্য পাওয়া যায়নি'
        },
        categories: {
            album: 'ফটো অ্যালবাম',
            banner: 'ব্যানার',
            magazine: 'ম্যাগাজিন',
            book: 'বই',
            canvas: 'ক্যানভাস',
            frame: 'ফটো ফ্রেম'
        },
        footerDescription: 'কাস্টম প্রিন্টিং সমাধানে আপনার বিশ্বস্ত সঙ্গী',
        footerQuickLinksTitle: 'দ্রুত লিঙ্ক',
        footerQuickLinksAbout: 'আমাদের সম্পর্কে',
        footerQuickLinksContact: 'যোগাযোগ',
        footerQuickLinksPrivacy: 'প্রাইভেসি পলিসি',
        footerContactTitle: 'যোগাযোগ',
        footerContactEmail: 'ইমেইল: support@printcraft.com',
        footerContactPhone: 'ফোন: +880-1234-567890',
        footerRights: 'সর্বস্বত্ব সংরক্ষিত।',
        sidebarQuickLinksTitle: 'দ্রুত লিঙ্ক',
        sidebarLogout: 'লগআউট',
        sidebarDashboard: 'ড্যাশবোর্ড',
        sidebarReports: 'আমার রিপোর্ট',
        sidebarSellingDashboard: 'বিক্রয় ড্যাশবোর্ড'
    }
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Always enforce dark mode
    const isDarkMode = true;

    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('language');
        return savedLanguage === 'bn' ? 'bn' : 'en';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }, []);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const toggleLanguage = () => setLanguage(prev => (prev === 'en' ? 'bn' : 'en'));

    return (
        <ThemeContext.Provider value={{ isDarkMode, language, toggleLanguage }}>
            {children}
        </ThemeContext.Provider>
    );
};
