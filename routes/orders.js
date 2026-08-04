const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('buyer'), async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.status !== 'approved') {
      return res.status(400).json({ message: 'Product not available' });
    }
    const order = await Order.create({
      buyer: req.user.id,
      product: product._id,
      artisan: product.artisan,
      quantity: quantity || 1,
      totalAmount: product.price * (quantity || 1),
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/mine', protect, authorize('buyer'), async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('product', 'title price imageUrl')
      .populate('artisan', 'name');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/received', protect, authorize('artisan'), async (req, res) => {
  try {
    const orders = await Order.find({ artisan: req.user.id })
      .populate('product', 'title price imageUrl')
      .populate('buyer', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('product', 'title price')
      .populate('buyer', 'name email')
      .populate('artisan', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id/status', protect, authorize('artisan'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.artisan.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;