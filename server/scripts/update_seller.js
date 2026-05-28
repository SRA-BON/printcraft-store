const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const SELLER_ID = '6951bd6d490122524c2f2205';
const SELLER_NAME = 'SRABON MONDAL';

async function assignProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const result = await Product.updateMany(
            {},
            {
                $set: {
                    sellerId: SELLER_ID,
                    "metadata.shopName": SELLER_NAME, // Assuming shopName is preferred for display
                    "metadata.sellerName": SELLER_NAME
                }
            }
        );

        console.log(`✅ Successfully updated ${result.modifiedCount} products.`);
        console.log(`Matched ${result.matchedCount} products.`);

    } catch (error) {
        console.error('❌ Error updating products:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

assignProducts();
