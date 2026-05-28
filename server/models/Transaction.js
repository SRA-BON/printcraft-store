const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    transactionId: { type: String, default: () => `txn_${Date.now()}` },
    userId: { type: String, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true }, // e.g., "Added funds", "Purchase Order #123"
    referenceId: { type: String }, // Order ID or Payment Gateway Ref
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
