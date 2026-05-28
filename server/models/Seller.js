const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SellerSchema = new mongoose.Schema({
    sellerId: {
        type: String,
        required: true,
        unique: true,
        default: () => `SELLER-${Date.now()}`
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    productTypes: [{
        type: String,
        enum: ['magazine', 'book', 'album', 'canvas', 'banner', 'frame', 'poster']
    }],
    sellerSince: { type: Date, default: Date.now },
    // Profile Information
    merchantName: { type: String, default: '' },
    officeLocation: { type: String, default: '' },
    contacts: {
        email: String,
        phone: String,
        alternatePhone: String
    },
    // Store Information
    storeName: { type: String, default: '' },
    storeVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    // Security
    twoStepVerification: { type: Boolean, default: false },
    onlineTransactions: { type: Boolean, default: true },
    // Payment
    paymentMethods: [{
        methodId: String,
        type: String,
        details: mongoose.Schema.Types.Mixed,
        isDefault: Boolean
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    userType: { type: String, default: 'seller' }
});

// Hash password before saving
SellerSchema.pre('save', async function () {
    // 1. If password is not modified, simply return (exit the function)
    if (!this.isModified('password')) {
        return;
    }
    // 2. Otherwise, hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // No need to call next(); Mongoose knows you are done when the function finishes.
});


// Compare password method
SellerSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Seller = mongoose.model('Seller', SellerSchema);
module.exports = Seller;

