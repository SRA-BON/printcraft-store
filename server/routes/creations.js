const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Reusing Product model for customizations

router.get('/', async (req, res) => {
    try {
        // Find products that have customizations/metadata
        const creations = await Product.find({
            $or: [
                { 'metadata.customized': true },
                { attachedPdf: { $ne: '' } }
            ]
        });
        res.json(creations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Creation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const creations = await Product.find({
            'metadata.customized': true,
            'metadata.designData.userId': req.params.userId
        });
        res.json(creations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
