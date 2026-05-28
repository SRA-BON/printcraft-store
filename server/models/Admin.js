const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        unique: true
        // No default - manually created
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    adminSince: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    userType: { type: String, default: 'admin' }
});

// Hash password before saving
AdminSchema.pre('save', async function () {
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
AdminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;

