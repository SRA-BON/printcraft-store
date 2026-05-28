import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, MessageCircle } from 'lucide-react';
import API from '../api';
function ContactUs() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for contacting us! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-gray-900 dark:text-rose-50 mb-4">Contact Our Team</h1>
                    <p className="text-xl text-gray-600 dark:text-rose-100 max-w-2xl mx-auto">
                        Have questions about a custom order? Need technical support?
                        We're here to help you every step of the way.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-rose-950 rounded-3xl p-8 shadow-lg border-2 border-transparent hover:border-rose-500 transition-all">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-rose-50">Get in Touch</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-rose-50">Email Us</p>
                                        <p className="text-gray-500 dark:text-rose-100/80">support@printcraft.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-rose-50">Call Us</p>
                                        <p className="text-gray-500 dark:text-rose-100/80">+880 1779 033536</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-pink-100 p-3 rounded-xl text-pink-600">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-rose-50">Visit Us</p>
                                        <p className="text-gray-500 dark:text-rose-100/80">Dhaka, Bangladesh</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-10 border-t border-gray-200 dark:border-rose-900">
                                <h3 className="font-bold text-gray-700 dark:text-rose-50 mb-4">Follow Socials</h3>
                                <div className="flex gap-4">
                                    <a href="https://www.facebook.com/Infinley.style" target="_blank" rel="noreferrer" className="bg-rose-600 text-white p-3 rounded-xl hover:scale-110 transition shrink-0"><Facebook size={20} /></a>
                                    <a href="https://www.instagram.com/infinley.style/" target="_blank" rel="noreferrer" className="bg-pink-600 text-white p-3 rounded-xl hover:scale-110 transition shrink-0"><Instagram size={20} /></a>
                                    <a href="https://wa.me/8801779033536" target="_blank" rel="noreferrer" className="bg-green-600 text-white p-3 rounded-xl hover:scale-110 transition shrink-0"><MessageCircle size={20} /></a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-rose-950 rounded-3xl p-10 shadow-xl">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-rose-50 mb-8">Send a Message</h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-rose-100 mb-2 uppercase tracking-wider">Your Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-rose-950 border-2 border-transparent rounded-2xl focus:bg-white dark:focus:bg-rose-900 focus:border-rose-500 transition-all outline-none dark:text-rose-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-rose-100 mb-2 uppercase tracking-wider">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-rose-950 border-2 border-transparent rounded-2xl focus:bg-white dark:focus:bg-rose-900 focus:border-rose-500 transition-all outline-none dark:text-rose-50"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-rose-100 mb-2 uppercase tracking-wider">Subject</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="How can we help?"
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-rose-950 border-2 border-transparent rounded-2xl focus:bg-white dark:focus:bg-rose-900 focus:border-rose-500 transition-all outline-none dark:text-rose-50"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-rose-100 mb-2 uppercase tracking-wider">Message</label>
                                    <textarea
                                        required
                                        rows="5"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Tell us more about your inquiry..."
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-rose-950 border-2 border-transparent rounded-2xl focus:bg-white dark:focus:bg-rose-900 focus:border-rose-500 transition-all outline-none dark:text-rose-50"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-rose-200 flex items-center justify-center gap-2">
                                        <Send size={24} /> Submit Inquiry
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default ContactUs;
