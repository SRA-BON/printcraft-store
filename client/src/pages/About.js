import React from 'react';
import Layout from '../components/Layout';
import { Target, Users, Award, ShieldCheck } from 'lucide-react';
import API from '../api';

function About() {
    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-gray-900 dark:text-rose-50 mb-4">About Rong-Tuli</h1>
                    <p className="text-xl text-gray-600 dark:text-rose-100 max-w-3xl mx-auto">
                        Your premier destination for high-quality, custom printing. We bring your digital creations to life with stunning clarity and precision.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    <div className="p-8 bg-white dark:bg-rose-950 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
                        <div className="bg-rose-100 w-16 h-16 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6">
                            <Target size={32} />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-rose-50">Our Mission</h3>
                        <p className="text-gray-500 dark:text-rose-100/80">To make professional printing accessible and easy for everyone, everywhere.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-rose-950 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
                        <div className="bg-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center text-pink-600 mx-auto mb-6">
                            <Users size={32} />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-rose-50">Our Team</h3>
                        <p className="text-gray-500 dark:text-rose-100/80">A passionate group of designers and tech enthusiasts dedicated to your success.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-rose-950 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
                        <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-6">
                            <Award size={32} />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-rose-50">Quality Focus</h3>
                        <p className="text-gray-500 dark:text-rose-100/80">We use only premium materials and the latest printing equipment for crisp results.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-rose-950 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
                        <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-rose-50">Guaranteed</h3>
                        <p className="text-gray-500 dark:text-rose-100/80">Your satisfaction is our priority. We guarantee perfect prints every single time.</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-12 text-white overflow-hidden relative">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">A Story of Innovation</h2>
                        <p className="text-rose-50 text-lg mb-6 leading-relaxed max-w-4xl">
                            Founded in 2024, Rong-Tuli emerged from a simple idea: that everyone should be
                            able to turn their digital memories into physical masterpieces without the hassle of
                            traditional print shops. Today, we serve thousands of customers, helping them create
                            everything from personalized photo albums to large-scale business banners.
                        </p>
                        <button className="bg-white text-rose-600 px-8 py-3 rounded-xl font-bold hover:bg-rose-50 transition">
                            Learn More
                        </button>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10">
                        <Target size={300} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default About;
