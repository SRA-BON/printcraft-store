const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Sign up - User
router.post('/signup/user', async (req, res) => {
    try {
        const { name, email, phone, password, age, deliveryLocation } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            phone,
            password,
            age,
            deliveryLocation: deliveryLocation || ''
        });

        await user.save();

        // Generate token
        const token = jwt.sign({ userId: user.userId, userType: 'customer' }, JWT_SECRET);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                userId: user.userId,
                username: user.username,
                name: user.name,
                email: user.email,
                userType: 'customer'
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Sign up - Seller
router.post('/signup/seller', async (req, res) => {
    try {
        const { name, email, phone, password, age, productTypes } = req.body;

        // Check if seller exists
        const existingSeller = await Seller.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({ message: 'Seller already exists' });
        }

        // Create new seller
        const seller = new Seller({
            name,
            email,
            phone,
            password,
            age,
            productTypes: productTypes || []
        });

        await seller.save();

        // Generate token
        const token = jwt.sign({ sellerId: seller.sellerId, userType: 'seller' }, JWT_SECRET);

        res.status(201).json({
            message: 'Seller created successfully',
            token,
            seller: {
                sellerId: seller.sellerId,
                name: seller.name,
                email: seller.email,
                userType: 'seller'
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login - User
router.post('/login/user', async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or username

        // Find user by email or username
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user.userId, userType: 'customer' }, JWT_SECRET);

        res.json({
            message: 'Login successful',
            token,
            user: {
                userId: user.userId,
                username: user.username,
                name: user.name,
                email: user.email,
                userType: 'customer'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login - Seller
router.post('/login/seller', async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or sellerId

        // Find seller by email or sellerId
        const seller = await Seller.findOne({
            $or: [{ email: identifier }, { sellerId: identifier }]
        });

        if (!seller) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await seller.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ sellerId: seller.sellerId, userType: 'seller' }, JWT_SECRET);

        res.json({
            message: 'Login successful',
            token,
            seller: {
                sellerId: seller.sellerId,
                name: seller.name,
                email: seller.email,
                userType: 'seller'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login - Admin
router.post('/login/admin', async (req, res) => {
    try {
        const { adminId, password } = req.body;

        // Find admin by adminId
        const admin = await Admin.findOne({ adminId });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ adminId: admin.adminId, userType: 'admin' }, JWT_SECRET);

        res.json({
            message: 'Login successful',
            token,
            admin: {
                adminId: admin.adminId,
                name: admin.name,
                email: admin.email,
                userType: 'admin'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/oauth/google', async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ message: 'Google token is required' });
        }
        if (!googleClient) {
            return res.status(500).json({ message: 'Google OAuth is not configured on the server' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name || email;

        if (!email) {
            return res.status(400).json({ message: 'Google account does not have a public email' });
        }

        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (!user) {
            user = new User({
                name,
                email,
                phone: 'N/A',
                password: Math.random().toString(36).slice(2),
                age: 18,
                deliveryLocation: '',
                authProvider: 'google',
                googleId
            });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.authProvider = user.authProvider || 'google';
            await user.save();
        }

        const token = jwt.sign({ userId: user.userId, userType: 'customer' }, JWT_SECRET);

        res.json({
            message: 'Login successful',
            token,
            user: {
                userId: user.userId,
                username: user.username,
                name: user.name,
                email: user.email,
                userType: 'customer'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/oauth/facebook', async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ message: 'Facebook access token is required' });
        }

        const fbResponse = await axios.get('https://graph.facebook.com/me', {
            params: {
                access_token: accessToken,
                fields: 'id,name,email'
            }
        });

        const facebookId = fbResponse.data.id;
        const email = fbResponse.data.email;
        const name = fbResponse.data.name || email;

        if (!email) {
            return res.status(400).json({ message: 'Facebook account does not have a public email' });
        }

        let user = await User.findOne({
            $or: [{ facebookId }, { email }]
        });

        if (!user) {
            user = new User({
                name,
                email,
                phone: 'N/A',
                password: Math.random().toString(36).slice(2),
                age: 18,
                deliveryLocation: '',
                authProvider: 'facebook',
                facebookId
            });
            await user.save();
        } else if (!user.facebookId) {
            user.facebookId = facebookId;
            user.authProvider = user.authProvider || 'facebook';
            await user.save();
        }

        const token = jwt.sign({ userId: user.userId, userType: 'customer' }, JWT_SECRET);

        res.json({
            message: 'Login successful',
            token,
            user: {
                userId: user.userId,
                username: user.username,
                name: user.name,
                email: user.email,
                userType: 'customer'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

