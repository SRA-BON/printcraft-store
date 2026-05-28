const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, enum: ['order_update', 'promotion', 'system'], default: 'order_update' },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    metadata: {
        orderId: String,
        link: String
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
