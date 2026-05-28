const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

const magazineProducts = [
    {
        id: 'm1',
        sellerId: 'SELLER-001', // Replace with actual seller ID
        name: 'Fashion Weekly Magazine',
        description: 'Latest fashion trends and styles for the modern reader',
        price: 299,
        color: 'red',
        stock: 'in-stock',
        imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
        category: 'Magazine',
        metadata: {
            shopName: 'SRABON MONDAL',
            dimensions: '8.5" x 11"',
            pages: 48
        }
    },
    {
        id: 'm2',
        sellerId: 'SELLER-001',
        name: 'Tech Today Magazine',
        description: 'Technology news, reviews, and insights',
        price: 349,
        color: 'blue',
        stock: 'in-stock',
        imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
        category: 'Magazine',
        metadata: {
            shopName: 'SRABON MONDAL',
            dimensions: '8.5" x 11"',
            pages: 52
        }
    },
    {
        id: 'm3',
        sellerId: 'SELLER-001',
        name: 'Business Insider Magazine',
        description: 'Business and finance insights for entrepreneurs',
        price: 399,
        color: 'black',
        stock: 'in-stock',
        imageUrl: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400',
        category: 'Magazine',
        metadata: {
            shopName: 'SRABON MONDAL',
            dimensions: '8.5" x 11"',
            pages: 64
        }
    },
    {
        id: 'm4',
        sellerId: 'SELLER-001',
        name: 'Travel Explorer Magazine',
        description: 'Explore destinations worldwide with stunning photography',
        price: 279,
        color: 'green',
        stock: 'in-stock',
        imageUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400',
        category: 'Magazine',
        metadata: {
            shopName: 'SRABON MONDAL',
            dimensions: '8.5" x 11"',
            pages: 56
        }
    },
    {
        id: 'm5',
        sellerId: 'SELLER-001',
        name: 'Gourmet Gazette',
        description: 'Culinary arts, recipes, and food culture',
        price: 320,
        color: 'yellow',
        stock: 'in-stock',
        imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
        category: 'Magazine',
        metadata: {
            shopName: 'SRABON MONDAL',
            dimensions: '8.5" x 11"',
            pages: 44
        }
    }
];

async function seedMagazines() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Upsert magazine products (update if exists, insert if not)
        for (const mag of magazineProducts) {
            await Product.updateOne(
                { id: mag.id },
                { $set: mag },
                { upsert: true }
            );
            console.log(`Upserted magazine: ${mag.name}`);
        }

        console.log(`Successfully processed ${magazineProducts.length} magazine products`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding magazines:', error);
        process.exit(1);
    }
}

seedMagazines();
