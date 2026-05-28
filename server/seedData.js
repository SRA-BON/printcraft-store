require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const demoProducts = [
  // Magazine products
  { id: 'm1', name: 'Fashion Weekly Magazine', description: 'Latest fashion trends', price: 299, color: 'red', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', category: 'magazine', lastModified: new Date('2024-12-15') },
  { id: 'm2', name: 'Tech Today Magazine', description: 'Technology news', price: 349, color: 'blue', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400', category: 'magazine', lastModified: new Date('2024-12-18') },

  // Book products
  { id: 'b1', name: 'Photo Memory Book', description: 'Preserve memories', price: 599, color: 'white', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', category: 'book', lastModified: new Date('2024-12-18') },
  { id: 'b2', name: 'Wedding Album Book', description: 'Premium wedding book', price: 899, color: 'red', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', category: 'book', lastModified: new Date('2024-12-19') },

  // Album products
  { id: 'a1', name: 'Classic Photo Album', description: 'Timeless preservation', price: 799, color: 'black', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400', category: 'album', lastModified: new Date('2024-12-19') },
  { id: 'a2', name: 'Modern Photo Album', description: 'Contemporary design', price: 849, color: 'white', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=400', category: 'album', lastModified: new Date('2024-12-18') },

  // Canvas products
  { id: 'c1', name: 'Portrait Canvas Print', description: 'High-quality canvas', price: 1499, color: 'white', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1578926078211-e90a9c88c0eb?w=400', category: 'canvas', lastModified: new Date('2024-12-19') },
  { id: 'c2', name: 'Landscape Canvas Print', description: 'Scenic landscape', price: 1299, color: 'blue', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400', category: 'canvas', lastModified: new Date('2024-12-18') },

  // Banner products
  { id: 'bn1', name: 'Birthday Banner', description: 'Celebrate birthdays', price: 499, color: 'red', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400', category: 'banner', lastModified: new Date('2024-12-19') },
  { id: 'bn2', name: 'Wedding Banner', description: 'Elegant decoration', price: 699, color: 'white', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', category: 'banner', lastModified: new Date('2024-12-18') },

  // Frame products
  { id: 'f1', name: 'Classic Wooden Frame', description: 'Traditional frame', price: 399, color: 'black', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400', category: 'frame', lastModified: new Date('2024-12-19') },
  { id: 'f2', name: 'Modern Metal Frame', description: 'Sleek metal design', price: 449, color: 'grey', stock: 'in-stock', imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400', category: 'frame', lastModified: new Date('2024-12-18') },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    await Product.insertMany(demoProducts);
    console.log('✅ Demo products added successfully!');
    console.log(`📦 Added ${demoProducts.length} products`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();