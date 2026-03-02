const express = require("express");
const router = express.Router();
const Yield = require("../models/Yield");
const Bid = require("../models/Bid");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// 1. FARMER: UPLOAD YIELD
router.post("/create", auth, upload.fields([{ name: 'image' }, { name: 'video' }]), async (req, res) => {
    try {
        const { cropType, unit, minPrice, state, district, fullAddress } = req.body;
        const newYield = new Yield({
            farmer: req.user.id,
            cropType,
            unit,
            minPrice,
            state,
            district,
            fullAddress,
            image: req.files['image'][0].path,
            video: req.files['video'][0].path,
            auctionEndTime: new Date(Date.now() + 3 * 60 * 1000) // 3 mins for testing
        });
        await newYield.save();
        res.status(201).json({ message: "Yield created successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. WHOLESALER: VIEW ALL AVAILABLE YIELDS
// backend/routes/yieldRoutes.js

router.get("/with-bidders", auth, async (req, res) => {
  try {
    // TEMPORARY: Find ALL active yields regardless of time
    const yields = await Yield.find({ 
      isActive: true 
    }).populate("farmer", "name phone");

    const result = await Promise.all(
      yields.map(async (y) => {
        const bidCount = await Bid.countDocuments({ yieldId: y._id });
        const userBid = await Bid.findOne({ yieldId: y._id, wholesaler: req.user.id });
        
        return { 
            ...y.toObject(), 
            bidCount,
            hasUserBidded: !!userBid,
            myBidAmount: userBid ? userBid.amount : null 
        };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch yields" });
  }
});

// 3. FARMER: MY DASHBOARD (Cleaned up from being nested)
router.get("/my-yields", auth, async (req, res) => {
    try {
        const yields = await Yield.find({ farmer: req.user.id });
        const yieldsWithCount = await Promise.all(yields.map(async (y) => {
            const count = await Bid.countDocuments({ yieldId: y._id });
            return { ...y.toObject(), bidderCount: count };
        }));
        res.json(yieldsWithCount);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch your yields" });
    }
});

// 4. POST-AUCTION: DECLARE WINNER
router.get("/result/:yieldId", auth, async (req, res) => {
    try {
        const y = await Yield.findById(req.params.yieldId).populate("farmer", "name phone");
        const auctionEndTime = new Date(y.auctionEndTime);
        const now = new Date();

        if (now < auctionEndTime) return res.json({ status: "active" });

        const winnerBid = await Bid.findOne({ yieldId: y._id })
            .sort({ amount: -1, createdAt: 1 }) 
            .populate("wholesaler", "name email");

        if (!winnerBid) return res.json({ status: "ended", winner: null });

        const tenHoursLater = new Date(auctionEndTime.getTime() + 10 * 60 * 60 * 1000);
        const isExpired = (now > tenHoursLater && !y.isPlatformFeePaid);
        const isUserWinner = winnerBid.wholesaler._id.toString() === req.user.id;

        res.json({
            status: isExpired ? "expired" : "ended",
            isWinner: isUserWinner,
            winnerName: winnerBid.wholesaler.name,
            quotedPrice: winnerBid.amount,
            platformFee: (winnerBid.amount * 0.01).toFixed(2),
            isPaid: y.isPlatformFeePaid,
            farmerData: y.isPlatformFeePaid ? {
                phone: y.farmer.phone,
                address: y.fullAddress,
                support: "9999999999"
            } : null
        });
    } catch (err) {
        res.status(500).json({ error: "Result error" });
    }
});

router.post("/verify-payment/:yieldId", auth, async (req, res) => {
    try {
        const { paymentId } = req.body; // In real life, verify with Razorpay API here
        
        const yieldItem = await Yield.findById(req.params.yieldId);
        if (!yieldItem) return res.status(404).json({ message: "Yield not found" });

        yieldItem.isPlatformFeePaid = true;
        yieldItem.paidAt = new Date();
        // You can also store the paymentId in the database for your records
        
        await yieldItem.save();
        res.json({ message: "Payment verified and details unlocked!" });
    } catch (err) {
        res.status(500).json({ message: "Verification failed" });
    }
});

router.delete("/delete/:id", auth, async (req, res) => {
    try {
        // 1. Find the yield first
        const yieldItem = await Yield.findById(req.params.id);

        // 2. Check if it exists
        if (!yieldItem) {
            return res.status(404).json({ message: "Yield not found" });
        }

        // 3. Security check: Ensure the logged-in user is the owner
        if (yieldItem.farmer.toString() !== req.user.id) {
            return res.status(401).json({ message: "User not authorized to delete this" });
        }

        // 4. Check for existing bids using yieldItem._id (FIXED HERE)
        const bidCount = await Bid.countDocuments({ yieldId: yieldItem._id });
        if (bidCount > 0) {
            return res.status(400).json({ message: "Cannot delete yield after bidding has started!" });
        }

        // 5. Proceed to delete
        await yieldItem.deleteOne();
        res.json({ message: "Yield removed successfully" });
        
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: "Server error during deletion" });
    }
});

module.exports = router;
