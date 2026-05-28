import React from 'react';
import Layout from '../components/Layout';
import BusinessStats from '../components/BusinessStats';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import API from '../api';

function SellerStatistics() {
    return (
        <Layout userType="seller">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                            <BarChart3 className="text-purple-600" size={40} /> Business Performance
                        </h1>
                        <p className="text-gray-500 font-medium">Detailed analytics and performance metrics for your store.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl text-purple-700 font-bold border border-purple-100">
                        <Calendar size={20} /> Year 2024
                    </div>
                </div>

                <BusinessStats />

                <div className="mt-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="bg-white/20 p-6 rounded-3xl">
                            <TrendingUp size={48} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-black mb-2">Growth Acceleration Recommendation</h2>
                            <p className="text-lg opacity-80 leading-relaxed">Based on your recent data, your "Photo Albums" category is seeing a 25% increase in customer interest. Consider adding more variations to this category to maximize revenue.</p>
                        </div>
                        <button className="bg-white text-purple-700 px-8 py-4 rounded-2xl font-black hover:bg-purple-50 transition shadow-xl whitespace-nowrap">
                            Apply Strategy
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default SellerStatistics;
