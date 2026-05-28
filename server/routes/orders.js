const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/', async (req, res) => {
    try {
        const order = new Order(req.body);
        order.progress = [{ status: 'pending', message: 'Order placed successfully' }];
        await order.save();
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/ask-price', async (req, res) => {
    try {
        const {
            userId,
            sellerId,
            designName,
            designImageUrl,
            customizationData,
            notes
        } = req.body;

        if (!userId || !sellerId || !designName || !designImageUrl) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const productId = customizationData && customizationData.id
            ? customizationData.id
            : `CUSTOM-${Date.now()}`;

        const order = new Order({
            userId,
            sellerId,
            products: [
                {
                    productId,
                    name: designName,
                    price: 0,
                    quantity: 1
                }
            ],
            totalPrice: 0,
            status: 'pending',
            isQuote: true,
            quotePrice: null,
            quoteStatus: 'pending',
            meta: {
                designImageUrl,
                customizationData,
                notes
            },
            deliveryLocation: 'To be decided',
            customerName: customizationData && customizationData.customerName ? customizationData.customerName : '',
            customerPhone: customizationData && customizationData.customerPhone ? customizationData.customerPhone : '',
            paymentMethod: 'cod',
            isPaid: false
        });

        order.progress = [
            {
                status: 'pending',
                message: 'Ask-price request created'
            }
        ];

        await order.save();

        res.status(201).json({ message: 'Ask-price request submitted', order });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// User views their orders
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Seller views their orders
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const orders = await Order.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:orderId/status', async (req, res) => {
    try {
        const { status, message } = req.body;
        const order = await Order.findOne({ orderId: req.params.orderId });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        order.progress.push({ status, message: message || `Status updated to ${status}` });

        await order.save();

        const Notification = require('../models/Notification');
        await Notification.create({
            userId: order.userId,
            type: 'order_update',
            message: `Your Order #${order.orderId} status has been updated to ${status.toUpperCase()}. ${message ? `Note: ${message}` : ''}`,
            metadata: { orderId: order.orderId }
        });

        res.json({ message: 'Order updated', order });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:orderId/quote', async (req, res) => {
    try {
        const { price, message } = req.body;

        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ message: 'Valid price is required' });
        }

        const order = await Order.findOne({ orderId: req.params.orderId, isQuote: true });

        if (!order) {
            return res.status(404).json({ message: 'Ask-price request not found' });
        }

        order.quotePrice = price;
        order.quoteStatus = 'priced';
        order.totalPrice = price;
        order.progress.push({
            status: 'priced',
            message: message && message.trim().length > 0 ? message : `Seller provided price ${price}`
        });

        await order.save();

        const Notification = require('../models/Notification');
        await Notification.create({
            userId: order.userId,
            type: 'quote_update',
            message: `Seller has provided a price for your custom design request.`,
            metadata: { orderId: order.orderId, price }
        });

        res.json({ message: 'Quote price updated', order });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin views all orders
router.get('/admin/all', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin deletes order
router.delete('/:orderId', async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({ orderId: req.params.orderId });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
