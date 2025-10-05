const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  status: { type: String, default: 'pending' }, // pending | paid | shipped | delivered
  // --- payments (simulation) ---
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  paymentRef: String,          // e.g. TXN123
  paymentMethod: { type: String, default: 'SIMULATED' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
