const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sellerId: { type: String, required: true }, // Added for multi-seller support
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  color: { type: String, required: true },
  stock: { type: String, enum: ['in-stock', 'out-of-stock'], default: 'in-stock' },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  attachedPdf: { type: String, default: '' }, // Added for Module 2 Member 2
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // Added for Module 2 Member 2
  magazinePages: { type: [String], default: [] }, // Array of image URLs for magazines/product gallery
  lastModified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);