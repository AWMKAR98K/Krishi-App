const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  uniqueCode: { type: String, unique: true }, // The 6-digit receipt number
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  paymentType: { type: String, enum: ['Razorpay', 'COD'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);