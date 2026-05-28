const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: true,
        unique: true,
        default: () => `REP-${Date.now()}`
    },
    userId: { type: String, required: true },
    sellerId: { type: String, required: true },
    orderId: { type: String },
    type: {
        type: String,
        required: true,
        enum: ['Not Similar Product', 'Damaged Product', 'Reduced Quality', 'Over-priced', 'Other']
    },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Responded'],
        default: 'Pending'
    },
    response: { type: String, default: '' },
    responses: [
        {
            message: { type: String, required: true },
            responderId: { type: String },
            responderType: {
                type: String,
                enum: ['seller', 'admin', 'user', 'system'],
                default: 'seller'
            },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
