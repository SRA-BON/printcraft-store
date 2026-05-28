const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        default: () => `ORD-${Date.now()}`
    },
    userId: { type: String, required: true },
    sellerId: { type: String, required: true },
    products: [{
        productId: { type: String, required: true },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 }
    }],
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'declined', 'on-hold', 'shipped', 'delivered'],
        default: 'pending'
    },
    isQuote: { type: Boolean, default: false },
    quotePrice: { type: Number },
    quoteStatus: {
        type: String,
        enum: ['pending', 'priced', 'accepted', 'rejected'],
        default: 'pending'
    },
    meta: { type: mongoose.Schema.Types.Mixed },
    progress: [{
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    deliveryLocation: { type: String, required: true },
    customerName: String,
    customerPhone: String,
    paymentMethod: { type: String, default: 'cod' },
    isPaid: { type: Boolean, default: false },
    transactionId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
