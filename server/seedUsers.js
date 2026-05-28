require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Seller = require('./models/Seller');
const Admin = require('./models/Admin');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Connected to MongoDB');

        // Clear existing data to fix the double-hashing issue
        await User.deleteMany({});
        await Seller.deleteMany({});
        await Admin.deleteMany({});
        console.log('🗑️  Cleared existing users, sellers, and admins');

        // Create Test User
        // Pass PLAIN text password. Model pre-save hook will hash it.
        const testUser = new User({
            userId: 'USER-TEST-001',
            username: 'testuser',
            name: 'Test User',
            email: 'user@test.com',
            phone: '1234567890',
            password: 'user123',
            age: 25,
            deliveryLocation: 'Dhaka, Bangladesh'
        });

        await testUser.save();
        console.log('✅ Test User created!');
        console.log('   Email: user@test.com');
        console.log('   Password: user123');
        console.log('   User ID: USER-TEST-001');
        console.log('   Username: testuser');


        // Create Test Seller
        const testSeller = new Seller({
            sellerId: 'SELLER-TEST-001',
            name: 'Test Seller',
            email: 'seller@test.com',
            phone: '0987654321',
            password: 'seller123',
            age: 30,
            productTypes: ['magazine', 'book', 'album', 'canvas', 'banner', 'frame'],
            merchantName: 'Test Merchant Store',
            officeLocation: 'Chittagong, Bangladesh',
            storeName: 'Test Print Store',
            contacts: {
                email: 'seller@test.com',
                phone: '0987654321',
                alternatePhone: '0987654322'
            }
        });

        await testSeller.save();
        console.log('✅ Test Seller created!');
        console.log('   Email: seller@test.com');
        console.log('   Password: seller123');
        console.log('   Seller ID: SELLER-TEST-001');

        // Create Test Admin
        const testAdmin = new Admin({
            adminId: 'ADMIN-001',
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'admin123',
            adminSince: new Date('2024-01-01')
        });

        await testAdmin.save();
        console.log('✅ Test Admin created!');
        console.log('   Admin ID: ADMIN-001');
        console.log('   Password: admin123');

        console.log('\n📋 LOGIN CREDENTIALS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 USER:');
        console.log('   Email/Username: user@test.com or testuser');
        console.log('   Password: user123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🏪 SELLER:');
        console.log('   Email/Seller ID: seller@test.com or SELLER-TEST-001');
        console.log('   Password: seller123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🛡️  ADMIN:');
        console.log('   Admin ID: ADMIN-001');
        console.log('   Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
