const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ["farmer", "wholesaler", "admin"], required: true },
  
  // ADD THESE FIELDS HERE:
  companyName: { type: String }, 
  companyId: { type: String },
  
  isApproved: { type: Boolean, default: false },
  isElite: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);