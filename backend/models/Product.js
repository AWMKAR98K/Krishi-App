const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Seeds', 'Equipments', 'Fertilizers', 'Manure', 'Hybrid Crops'], required: true },
  image: String, 
  price: Number,
  type: { type: String, enum: ['Purchasing', 'Borrowing'], default: 'Purchasing' },
  sellerName: String,
  sellerPhone: String,
  location: String,
  isApproved: { type: Boolean, default: false } 
});

module.exports = mongoose.model('Product', productSchema);