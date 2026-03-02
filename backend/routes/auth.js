const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

router.get("/me", auth, async (req, res) => {
  try {
    // req.user comes from your authMiddleware
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, role, companyName, companyId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      companyName: role === "wholesaler" ? companyName : undefined,
      companyId: role === "wholesaler" ? companyId : undefined,
      isApproved: false // Requirements: Wait for author confirmation
    });

    await user.save();
    res.json({ message: "Signup successful. Please wait for Admin approval." });
  } catch (err) {
    res.status(500).json({ error: "Server error during signup" });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Check Requirements: Admin Validation
    if (!user.isApproved) {
      return res.status(403).json({ error: "Your account is pending admin approval." });
    }

    // Generate Token (Must use same "SECRET_KEY" as middleware)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
});

module.exports = router;