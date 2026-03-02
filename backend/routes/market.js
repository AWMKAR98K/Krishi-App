const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

// --- SELLER ROUTES ---

// 1. Add Product to Sell (Needs Author Confirmation via isApproved)
router.post('/add-product', async (req, res) => {
    try {
        const { name, image, price, type, category, sellerName, phone, location } = req.body;
        const newProduct = new Product({
            name, image, price, type, category, sellerName, 
            sellerPhone: phone, location,
            isApproved: false // Wait for author confirmation
        });
        await newProduct.save();
        res.status(201).json({ message: "Product added! Waiting for admin approval." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Check Orders (Seller Dashboard)
router.get('/seller/orders/all', async (req, res) => {
    try {
        // This MUST populate 'productId' so the wholesaler can see the Name (Mango, etc.)
        const orders = await Order.find().populate('productId');
        console.log("Sending orders to Wholesaler:", orders.length);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Verify Unique Number (The "Green Tick" Logic)
router.post('/verify-order', async (req, res) => {
    const { orderId, inputCode } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (order.uniqueCode === inputCode) {
            order.status = 'Completed';
            await order.save();
            res.json({ success: true, message: "Order Completed! ✅" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Unique Number" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- FARMER ROUTES ---

// 4. Get All Approved Products (Marketplace View)
// In backend/routes/market.js
router.get('/products', async (req, res) => {
    try {
        // This finds products that are approved as EITHER true (boolean) OR "true" (string)
        const products = await Product.find({ 
            $or: [ { isApproved: true }, { isApproved: "true" } ] 
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Place Order (Generate Unique Receipt Number)
router.post('/place-order', async (req, res) => {
    try {
        const { farmerId, productId, paymentType } = req.body;
        
        // Generate a 6-digit unique alphanumeric code
        const receiptNumber = Math.random().toString(36).substring(2, 8).toUpperCase();

        const newOrder = new Order({
            farmerId,
            productId,
            uniqueCode: receiptNumber,
            paymentType, // Razorpay or COD
            status: 'Pending'
        });

        await newOrder.save();
        res.status(201).json({ 
            message: "Order placed successfully!", 
            uniqueCode: receiptNumber // This is what the farmer shows on delivery
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;