const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    sellerId: { type: String, required: true },
    discountAmount: { type: Number, required: true },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'fixed'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    assignedTo: [{ type: String }], // Array of User IDs
    validityStart: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    minSpend: { type: Number, default: 0 },
    usageLimit: { type: Number, default: -1 }, // -1 for unlimited
    usageCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Voucher', VoucherSchema);
