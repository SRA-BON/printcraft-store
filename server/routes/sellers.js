const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');

// Get all sellers
router.get('/', async (req, res) => {
  try {
    const sellers = await Seller.find().select('-password');
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller profile
router.get('/:sellerId', async (req, res) => {
  try {
    const seller = await Seller.findOne({ sellerId: req.params.sellerId }).select('-password');
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update seller profile
router.put('/:sellerId', async (req, res) => {
  try {
    const updateData = { updatedAt: Date.now() };
    const allowedFields = ['name', 'phone', 'password', 'merchantName', 'officeLocation',
      'contacts', 'storeName', 'storeVisibility', 'twoStepVerification',
      'onlineTransactions'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const seller = await Seller.findOneAndUpdate(
      { sellerId: req.params.sellerId },
      updateData,
      { new: true }
    ).select('-password');

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.json(seller);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

