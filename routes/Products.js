const express = require('express');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/products
// Public: get all APPROVED products (for buyers browsing)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' }).populate('artisan', 'name email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route GET /api/products/mine
// Artisan: get their own products (any status)
router.get('/mine', protect, authorize('artisan'), async (req, res) => {
  try {
    const products = await Product.find({ artisan: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route GET /api/products/pending
// Admin: get all pending products awaiting approval
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const products = await Product.find({ status: 'pending' }).populate('artisan', 'name email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route GET /api/products/:id
// Public: get single product detail
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('artisan', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route POST /api/products
// Artisan: create a new product listing
router.post('/', protect, authorize('artisan'), async (req, res) => {
  try {
    const { title, description, price, category, imageUrl, stock } = req.body;

    const product = await Product.create({
      title,
      description,
      price,
      category,
      imageUrl,
      stock,
      artisan: req.user.id,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route PUT /api/products/:id
// Artisan: edit their own product
router.put('/:id', protect, authorize('artisan'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.artisan.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    Object.assign(product, req.body);
    // If they edit it, send it back for re-approval
    product.status = 'pending';
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route DELETE /api/products/:id
// Artisan: delete their own product
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

// @route PUT /api/products/:id/approve
// Admin: approve or reject a product
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
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

module.exports = router;