const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const User = require('../models/User');
const Seller = require('../models/Seller');

// Get admin profile
router.get('/:adminId', async (req, res) => {
  try {
    const admin = await Admin.findOne({ adminId: req.params.adminId }).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update admin profile
router.put('/:adminId', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updateData = { updatedAt: Date.now() };

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    const admin = await Admin.findOneAndUpdate(
      { adminId: req.params.adminId },
      updateData,
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all users (Admin only)
router.get('/:adminId/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all sellers (Admin only)
router.get('/:adminId/sellers', async (req, res) => {
  try {
    const sellers = await Seller.find().select('-password');
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:adminId/users/:userId', async (req, res) => {
  try {
    await User.findOneAndDelete({ userId: req.params.userId });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete seller (Admin only)
router.delete('/:adminId/sellers/:sellerId', async (req, res) => {
  try {
    await Seller.findOneAndDelete({ sellerId: req.params.sellerId });
    res.json({ message: 'Seller deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

