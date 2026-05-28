const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { name, phone, password, alternativePhone, bkashNumber, nagadNumber } = req.body;
    const updateData = { updatedAt: Date.now() };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (password) updateData.password = password;
    if (alternativePhone !== undefined) updateData.alternativePhone = alternativePhone;
    if (bkashNumber !== undefined) updateData.bkashNumber = bkashNumber;
    if (nagadNumber !== undefined) updateData.nagadNumber = nagadNumber;

    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add address
router.post('/:userId/addresses', async (req, res) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;

    // If this is set as default, unset all other defaults first
    if (isDefault) {
      await User.updateOne(
        { userId: req.params.userId },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      {
        $push: {
          addresses: {
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault || false
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.addresses[user.addresses.length - 1]);
  } catch (error) {
    console.error('Add address error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update address
router.put('/:userId/addresses/:addressId', async (req, res) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;

    if (isDefault) {
      await User.updateOne(
        { userId: req.params.userId },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const user = await User.findOneAndUpdate(
      {
        userId: req.params.userId,
        "addresses._id": req.params.addressId
      },
      {
        $set: {
          "addresses.$": {
            _id: req.params.addressId,
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault || false
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User/Address not found' });
    }

    const address = user.addresses.id(req.params.addressId);
    res.json(address);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete address
router.delete('/:userId/addresses/:addressId', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { $pull: { addresses: { _id: req.params.addressId } } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Set default address
router.put('/:userId/addresses/:addressId/default', async (req, res) => {
  try {
    await User.updateOne(
      { userId: req.params.userId },
      { $set: { "addresses.$[].isDefault": false } }
    );

    const user = await User.findOneAndUpdate(
      {
        userId: req.params.userId,
        "addresses._id": req.params.addressId
      },
      { $set: { "addresses.$.isDefault": true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User/Address not found' });
    }

    res.json({ message: 'Default address updated' });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update profile image
router.put('/:userId/profile-image', async (req, res) => {
  try {
    const { profileImage } = req.body;
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { profileImage, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add payment method
router.post('/:userId/payment-methods', async (req, res) => {
  try {
    const { type, provider, accountNumber, details, isDefault } = req.body;
    console.log('--- ADD PAYMENT METHOD START ---');
    console.log('Target User ID:', req.params.userId);
    console.log('Request Body:', req.body);

    // Check if user exists first
    const existingUser = await User.findOne({ userId: req.params.userId });
    if (!existingUser) {
      console.log('❌ PRE-CHECK FAILED: User not found in DB for ID:', req.params.userId);
      return res.status(404).json({ message: 'User not found (pre-check)' });
    }
    console.log('✅ User found (pre-check):', existingUser._id);

    // If this is set as default, unset others
    if (isDefault) {
      console.log('Setting as default, cleaning up old defaults...');
      await User.updateOne(
        { userId: req.params.userId },
        { $set: { "paymentMethods.$[].isDefault": false } }
      );
    }

    const updateData = {
      $push: {
        paymentMethods: {
          type,
          provider,
          accountNumber,
          details,
          isDefault: isDefault || false
        }
      }
    };

    // Synchronize with legacy fields
    if (provider === 'bkash') {
      updateData.$set = { bkashNumber: accountNumber };
    } else if (provider === 'nagad') {
      updateData.$set = { nagadNumber: accountNumber };
    }

    console.log('Executing findOneAndUpdate...');
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log('❌ UPDATE FAILED: User not found during update for ID:', req.params.userId);
      return res.status(404).json({ message: 'User not found (update)' });
    }

    console.log('✅ Payment method added successfully.');
    res.json(user.paymentMethods[user.paymentMethods.length - 1]);
  } catch (error) {
    console.error('❌ CRITICAL ERROR in Add Payment Method:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete payment method
router.delete('/:userId/payment-methods/:methodId', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { $pull: { paymentMethods: { _id: req.params.methodId } } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Payment method deleted' });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

