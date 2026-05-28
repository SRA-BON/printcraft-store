const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

// Recipe Showcase with the 5 uploaded images
const recipeShowcase = {
    id: 'recipe-showcase-v2',
    sellerId: 'SELLER-001', // SRABON MONDAL's seller ID
    name: 'Recipe Showcase Magazine',
    description: 'A stunning collection of family recipes featuring beautiful food photography, detailed cooking instructions, and culinary inspiration for home chefs',
    price: 450,
    color: 'multi',
    stock: 'in-stock',
    imageUrl: '/magazines/recipe-showcase/page1.png', // Cover image
    category: 'Magazine',
    magazinePages: [
        '/magazines/recipe-showcase/page1.png',  // Lamb Chop recipe
        '/magazines/recipe-showcase/page2.png',  // Food collage
        '/magazines/recipe-showcase/page3.png',  // Asian dishes
        '/magazines/recipe-showcase/page4.jpg',  // Family Recipes title
        '/magazines/recipe-showcase/page5.png'   // Quick Tip
    ],
    metadata: {
        shopName: 'SRABON MONDAL',
        dimensions: '8.5" x 11"',
        pages: 5,
        theme: 'Culinary Arts',
        material: 'Premium Glossy Paper'
    }
};

async function createRecipeShowcase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Upsert the product
        await Product.updateOne(
            { id: recipeShowcase.id },
            { $set: recipeShowcase },
            { upsert: true }
        );

        console.log('\n🎉 Recipe Showcase Magazine Created Successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📖 Name: ${recipeShowcase.name}`);
        console.log(`💰 Price: ৳${recipeShowcase.price}`);
        console.log(`📄 Pages: ${recipeShowcase.magazinePages.length}`);
        console.log(`🏪 Seller: ${recipeShowcase.metadata.shopName}`);
        console.log(`📁 Category: ${recipeShowcase.category}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating Recipe Showcase:', error);
        process.exit(1);
    }
}

createRecipeShowcase();
