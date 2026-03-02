const mongoose = require("mongoose");

const yieldSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  cropType: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  minPrice: {
    type: Number,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  fullAddress: {
    type: String,
    required: true
  },
  isPlatformFeePaid: { 
    type: Boolean, 
    required: true,
    default: false },
    paidAt: {
      type: Date
    },
  image: {
    type: String,
    required: true
  },
  video: {
    type: String,
    required: true
  },
  auctionEndTime: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
},
 { timestamps: true });

module.exports = mongoose.model("Yield", yieldSchema);
