const express = require('express');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public: all approved products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' }).populate('artisan', 'name email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Artisan: own products (any status)
router.get('/mine', protect, authorize('artisan'), async (req, res) => {
  try {
    const products = await Product.find({ artisan: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: pending products
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const products = await Product.find({ status: 'pending' }).populate('artisan', 'name email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Public: single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('artisan', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Artisan: create product
router.post('/', protect, authorize('artisan'), async (req, res) => {
  try {
    const { title, description, price, category, imageUrl, stock } = req.body;
    const product = await Product.create({
      title, description, price, category, imageUrl, stock,
      artisan: req.user.id,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Artisan: edit own product
router.put('/:id', protect, authorize('artisan'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.artisan.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }
    Object.assign(product, req.body);
    product.status = 'pending';
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Artisan: delete own product
router.delete('/:id', protect, authorize('artisan'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.artisan.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: approve/reject
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.status = status;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Artisan: upload a product image, get back a URL
router.post('/upload', protect, authorize('artisan'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ imageUrl: req.file.path });
});

module.exports = router;