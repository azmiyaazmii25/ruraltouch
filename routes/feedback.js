const express = require('express');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('buyer'), async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your order' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only review delivered orders' });
    }
    const feedback = await Feedback.create({
      buyer: req.user.id, product: order.product, order: order._id, rating, comment,
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const feedback = await Feedback.find({ product: req.params.productId }).populate('buyer', 'name');
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('buyer', 'name').populate('product', 'title');
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;