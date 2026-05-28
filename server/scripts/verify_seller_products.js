const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Seller = require('../models/Seller');

const TARGET_SELLER_ID = '6951bd6d490122524c2f2205';

async function verifyData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Check if Seller Exists
        const seller = await Seller.findOne({ sellerId: TARGET_SELLER_ID });
        if (seller) {
            console.log(`✅ Seller Found: ${seller.name}`);
            console.log(`   Internal _id: ${seller._id}`);
            console.log(`   Custom sellerId: ${seller.sellerId}`);
        } else {
            console.error(`❌ Seller NOT FOUND with ID: ${TARGET_SELLER_ID}`);
            // Try to find by _id just in case
            try {
                const sellerById = await Seller.findById(TARGET_SELLER_ID);
                if (sellerById) console.log(`   (But found by _id: ${sellerById.name})`);
            } catch (e) { }
        }

        // 2. Count Products with this sellerId
        const count = await Product.countDocuments({ sellerId: TARGET_SELLER_ID });
        console.log(`📊 Products with sellerId='${TARGET_SELLER_ID}': ${count}`);

        // 3. Show a sample product
        if (count > 0) {
            const sample = await Product.findOne({ sellerId: TARGET_SELLER_ID });
            console.log('🔎 Sample Product:', {
                id: sample.id,
                name: sample.name,
                sellerId: sample.sellerId,
                metadata: sample.metadata
            });
        }

    } catch (error) {
        console.error('❌ Error verifying data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

verifyData();
