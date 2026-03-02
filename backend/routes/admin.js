const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

/**
 * Get all users (for admin)
 */
router.get("/users", auth, admin, async (req, res) => {
  const users = await User.find({ role: { $ne: "admin" } });
  res.json(users);
});

/**
 * Approve or reject user
 */
router.put("/approve/:id", auth, admin, async (req, res) => {
  const { isApproved } = req.body;

  await User.findByIdAndUpdate(req.params.id, {
    isApproved
  });

  res.json({ message: "User approval updated" });
});

/**
 * Mark wholesaler as elite
 */
router.put("/elite/:id", auth, admin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    isElite: true
  });

  res.json({ message: "Wholesaler marked as elite" });
});

module.exports = router;
