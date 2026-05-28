const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Seller = require('../models/Seller');

const magazineImages = [
    '/magazines/recipe-showcase/page1.png',
    '/magazines/recipe-showcase/page2.png',
    '/magazines/recipe-showcase/page3.png',
    '/magazines/recipe-showcase/page4.jpg', // Note: page4 is jpg
    '/magazines/recipe-showcase/page5.png'
];

async function createMagazine() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the seller
        const sellerName = 'SRABON MONDAL';
        let seller = await Seller.findOne({ name: sellerName });

        if (!seller) {
            console.log(`Seller '${sellerName}' not found. Searching for any seller...`);
            seller = await Seller.findOne();
            if (seller) {
                console.log(`Using fallback seller: ${seller.name} (${seller.id})`);
            } else {
                console.error('No sellers found in the database. Cannot create product.');
                process.exit(1);
            }
        } else {
            console.log(`Found seller: ${seller.name} (${seller.id})`);
        }

        const newProduct = {
            id: `mag_${Date.now()}`,
            sellerId: seller.id,
            name: 'Recipe Showcase Magazine',
            description: 'A beautiful collection of recipes and culinary delights. Features stunning photography and easy-to-follow instructions.',
            price: 450,
            color: 'Multicolor',
            stock: 'in-stock',
            imageUrl: magazineImages[0], // Cover image
            category: 'Magazine',
            magazinePages: magazineImages,
            metadata: {
                shopName: seller.shopName || seller.name,
                dimensions: 'A4',
                pages: 5,
                material: 'Glossy Paper'
            }
        };

        const product = new Product(newProduct);
        await product.save();

        console.log('Successfully created Magazine product:');
        console.log(JSON.stringify(newProduct, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error creating magazine:', error);
        process.exit(1);
    }
}

createMagazine();
