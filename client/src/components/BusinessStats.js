import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar
} from 'recharts';
import { TrendingUp, Users, DollarSign, Package } from 'lucide-react';

const COLORS = ['#fb7185', '#f97373', '#fecaca', '#f97316', '#facc15', '#fb7185'];

function BusinessStats({ data = [] }) {
    // Mock data if none provided
    const pieData = [
        { name: 'Magazines', value: 400 },
        { name: 'Books', value: 300 },
        { name: 'Albums', value: 300 },
        { name: 'Canvas', value: 200 },
        { name: 'Banners', value: 150 },
    ];

    const monthlyData = [
        { month: 'Jan', sales: 45, mrp: 24000, interest: 120 },
        { month: 'Feb', sales: 52, mrp: 28000, interest: 150 },
        { month: 'Mar', sales: 48, mrp: 26000, interest: 140 },
        { month: 'Apr', sales: 61, mrp: 32000, interest: 180 },
        { month: 'May', sales: 55, mrp: 30000, interest: 170 },
        { month: 'Jun', sales: 67, mrp: 36000, interest: 210 },
        { month: 'Jul', sales: 72, mrp: 40000, interest: 230 },
        { month: 'Aug', sales: 68, mrp: 38000, interest: 220 },
        { month: 'Sep', sales: 75, mrp: 42000, interest: 250 },
        { month: 'Oct', sales: 82, mrp: 46000, interest: 280 },
        { month: 'Nov', sales: 95, mrp: 54000, interest: 320 },
        { month: 'Dec', sales: 110, mrp: 62000, interest: 380 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: '৳434,000', icon: DollarSign, color: 'text-rose-700', bg: 'bg-rose-100' },
                    { label: 'Total Sales', value: '810', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Active Users', value: '2.4k', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50' },
                    { label: 'Products', value: '156', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-50 flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Line Chart: Sales Growth */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
                    <h3 className="text-2xl font-black mb-6 text-gray-800 flex items-center gap-2">
                        <TrendingUp className="text-rose-500" /> Sales vs Month
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="sales" stroke="#fb7185" strokeWidth={4} dot={{ r: 6, fill: '#fb7185', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Interests */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
                    <h3 className="text-2xl font-black mb-6 text-gray-800 flex items-center gap-2">
                        <Users className="text-purple-500" /> Customer Interest Points
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart: MRPs vs Month */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 lg:col-span-2">
                    <h3 className="text-2xl font-black mb-6 text-gray-800 flex items-center gap-2">
                        <DollarSign className="text-rose-500" /> Revenue (MRP) vs Month
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc', radius: 10 }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="mrp" fill="#fb7185" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BusinessStats;
