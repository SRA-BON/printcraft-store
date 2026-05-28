const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Seller = require('../models/Seller');

const WRONG_SELLER_ID = '6951bd6d490122524c2f2205';

async function fixSellerIds() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find the Seller by the Mongo ID to get the correct custom 'sellerId'
        // Note: The previous script output didn't show the sellerId, so we query carefully.

        // Attempt to find by _id (if the provided ID was a valid ObjectId hex)
        // OR just find matching name/metadata if we are unsure.
        // The previous script said: "Seller Found: SRABON MONDAL" when searching by { sellerId: ... }.
        // Wait, verify_seller_products.js searched by `sellerId: TARGET_SELLER_ID`.
        // It found specific seller "SRABON MONDAL".
        // This implies that '6951bd6d490122524c2f2205' IS stored in the `sellerId` field of the Seller document?

        // Let's look at the Seller Document again.
        const seller = await Seller.findOne({
            $or: [
                { _id: new mongoose.Types.ObjectId(WRONG_SELLER_ID) }, // If valid hex
                { sellerId: WRONG_SELLER_ID }
            ]
        }).catch(e => Seller.findOne({ sellerId: WRONG_SELLER_ID })); // Fallback if cast error

        if (!seller) {
            console.error("❌ Critical: Could not find the seller by the ID provided.");
            return;
        }

        console.log(`✅ Found Seller: ${seller.name}`);
        console.log(`   Mongo _id: ${seller._id}`);
        console.log(`   Custom sellerId: ${seller.sellerId}`);

        // Determine the CORRECT ID to use for products.
        // The Auth system uses `seller.sellerId`.
        const correctSellerId = seller.sellerId;

        if (!correctSellerId) {
            console.error("❌ Critical: Seller has no custom sellerId!");
            return;
        }

        if (correctSellerId === WRONG_SELLER_ID) {
            console.log("⚠️ The current ID IS the custom sellerId? Then why did it fail?");
            console.log("Maybe the user logged in using a diff account?");
        } else {
            console.log(`🔄 Mismatch Detected!`);
            console.log(`   Products have: ${WRONG_SELLER_ID}`);
            console.log(`   Auth expects:  ${correctSellerId}`);

            const result = await Product.updateMany(
                { sellerId: WRONG_SELLER_ID },
                { $set: { sellerId: correctSellerId } }
            );
            console.log(`✅ Updated ${result.modifiedCount} products to use ID: ${correctSellerId}`);
        }

    } catch (error) {
        console.error('❌ Error fixing IDs:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

fixSellerIds();
