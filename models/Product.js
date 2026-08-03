const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['craft', 'mehendi', 'tailoring', 'makeup', 'other'],
    default: 'other',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  stock: {
    type: Number,
    default: 1,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);