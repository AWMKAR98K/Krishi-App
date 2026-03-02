const express = require("express");
const router = express.Router();
const Bid = require("../models/Bid");
const auth = require("../middleware/authMiddleware");

// POST /api/bid/:yieldId
// routes/bidRoutes.js
router.post("/:yieldId", auth, async (req, res) => {
    try {
        const { amount } = req.body;
        
        // This finds the existing bid by THIS wholesaler for THIS yield
        // If it exists, it updates the amount. If not, it creates it.
        await Bid.findOneAndUpdate(
            { yieldId: req.params.yieldId, wholesaler: req.user.id },
            { amount: amount, timestamp: new Date() },
            { upsert: true, new: true }
        );

        res.json({ message: "Your quote has been registered/updated!" });
    } catch (err) {
        res.status(500).json({ error: "Server error during bidding" });
    }
});
module.exports = router;