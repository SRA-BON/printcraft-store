const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const addressSchema = new mongoose.Schema({
    addressId: { type: String, default: () => `addr_${Date.now()}` },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        default: () => `USER-${Date.now()}`
    },
    username: {
        type: String,
        required: true,
        unique: true,
        default: () => `user_${Date.now()}`
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    addresses: [addressSchema],
    deliveryLocation: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    twoStepVerification: { type: Boolean, default: false },
    paymentMethods: [{
        methodId: { type: String, default: () => `pm_${Date.now()}` },
        type: { type: String, enum: ['card', 'bank', 'mobile'], default: 'mobile' },
        provider: String, // 'bkash', 'nagad', 'visa', etc.
        accountNumber: String,
        details: mongoose.Schema.Types.Mixed,
        isDefault: { type: Boolean, default: false }
    }],
    alternativePhone: { type: String, default: '' },
    bkashNumber: { type: String, default: '' },
    nagadNumber: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    userType: { type: String, default: 'customer' },
    balance: { type: Number, default: 0 },
    storeVisibility: { type: Boolean, default: true },
    authProvider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
    googleId: { type: String },
    facebookId: { type: String }

});


// Hash password before saving
UserSchema.pre('save', async function () {
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
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
