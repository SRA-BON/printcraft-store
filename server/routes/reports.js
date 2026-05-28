const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// User submits report
router.post('/', async (req, res) => {
    try {
        const { userId, sellerId, orderId, type, description } = req.body;
        const report = new Report({ userId, sellerId, orderId, type, description });
        await report.save();
        res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// User views their own reports
router.get('/user/:userId', async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Seller views their reports
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const reports = await Report.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Seller responds to report
router.put('/:reportId/respond', async (req, res) => {
    try {
        const { response, responderId, responderType } = req.body;
        if (!response || typeof response !== 'string' || !response.trim()) {
            return res.status(400).json({ message: 'Response text is required' });
        }

        const report = await Report.findOne({ reportId: req.params.reportId });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.responses.push({
            message: response,
            responderId: responderId || null,
            responderType: responderType || 'seller'
        });
        report.response = response;
        report.status = 'Responded';

        await report.save();

        res.json({ message: 'Response added', report });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin views all reports
router.get('/admin/all', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin deletes report
router.delete('/:reportId', async (req, res) => {
    try {
        const report = await Report.findOneAndDelete({ reportId: req.params.reportId });
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
