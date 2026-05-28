const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get Wallet Balance
router.get('/:userId/balance', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Funds (Mock Payment)
router.post('/:userId/add-funds', async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;
        const numAmount = Number(amount);
        
        if (numAmount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        const user = await User.findOne({ userId: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update Balance
        user.balance += numAmount;
        await user.save();

        // Create Transaction Record
        const transaction = new Transaction({
            userId: req.params.userId,
            type: 'credit',
            amount: numAmount,
            description: `Added funds via ${paymentMethod || 'Bank Transfer'}`,
            referenceId: `ref_${Date.now()}`
        });
        await transaction.save();

        res.json({ message: 'Funds added successfully', balance: user.balance, transaction });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Transaction History
router.get('/:userId/history', async (req, res) => {
    try {
        const history = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Process Payment from Wallet
router.post('/:userId/pay', async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        const numAmount = Number(amount);

        const user = await User.findOne({ userId: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.balance < numAmount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        user.balance -= numAmount;
        await user.save();

        const transaction = new Transaction({
            userId: req.params.userId,
            type: 'debit',
            amount: numAmount,
            description: `Payment for Order #${orderId}`,
            referenceId: orderId
        });
        await transaction.save();

        res.json({ message: 'Payment successful', balance: user.balance, transactionId: transaction.transactionId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
