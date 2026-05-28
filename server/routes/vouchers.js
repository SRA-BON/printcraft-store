const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');

router.get('/', async (req, res) => {
    try {
        const vouchers = await Voucher.find();
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Seller creates voucher
router.post('/', async (req, res) => {
    try {
        const voucher = new Voucher(req.body);
        await voucher.save();
        res.status(201).json({ message: 'Voucher created successfully', voucher });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Seller views their vouchers
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const vouchers = await Voucher.find({ sellerId: req.params.sellerId });
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Seller updates voucher status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const voucher = await Voucher.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
        res.json({ message: `Voucher is now ${status}`, voucher });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin views all vouchers
router.get('/admin/all', async (req, res) => {
    try {
        const vouchers = await Voucher.find();
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Apply/Validate Voucher
router.post('/apply', async (req, res) => {
    try {
        const { code, items = [], userId } = req.body;
        const voucher = await Voucher.findOne({ code, status: 'active' });

        if (!voucher) {
            return res.status(404).json({ message: 'Invalid or inactive voucher code' });
        }

        if (voucher.expiryDate && new Date() > new Date(voucher.expiryDate)) {
            return res.status(400).json({ message: 'Voucher has expired' });
        }

        if (voucher.usageLimit !== -1 && voucher.usageCount >= voucher.usageLimit) {
            return res.status(400).json({ message: 'Voucher usage limit reached' });
        }

        const cartSubtotal = items.reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);
        const sellerSubtotal = items
            .filter(it => (it.sellerId || 'admin') === voucher.sellerId)
            .reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);

        const isAssignedToUser = Array.isArray(voucher.assignedTo) && voucher.assignedTo.includes(userId);
        const baseAmount = isAssignedToUser ? cartSubtotal : sellerSubtotal;

        if (baseAmount <= 0) {
            return res.status(400).json({ message: 'Voucher not applicable to selected items' });
        }

        if (baseAmount < voucher.minSpend) {
            return res.status(400).json({ message: `Minimum spend of ৳${voucher.minSpend} required` });
        }

        let discount = 0;
        if (voucher.discountType === 'percentage') {
            discount = (baseAmount * voucher.discountAmount) / 100;
        } else {
            discount = voucher.discountAmount;
        }

        if (discount > baseAmount) discount = baseAmount;

        res.json({
            valid: true,
            discount: Math.round(discount),
            voucherId: voucher._id,
            code: voucher.code,
            appliesToSellerId: isAssignedToUser ? null : voucher.sellerId
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Redeem Voucher (Increment Usage)
router.post('/redeem', async (req, res) => {
    try {
        const { code } = req.body;
        const voucher = await Voucher.findOne({ code });

        if (!voucher) return res.status(404).json({ message: 'Voucher not found' });

        if (voucher.usageLimit !== -1 && voucher.usageCount >= voucher.usageLimit) {
            return res.status(400).json({ message: 'Voucher usage limit reached' });
        }

        voucher.usageCount += 1;
        await voucher.save();

        res.json({ message: 'Voucher redeemed successfully', usageCount: voucher.usageCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
