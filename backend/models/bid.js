const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  yieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Yield",
    required: true
  },
  wholesaler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Bid", bidSchema);
