const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

// This tells the backend to allow requests from your specific GitHub site

const app = express();

// Remove the specific origin for a moment to test
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cors());
app.use(express.json());

// 1. Import Routes
const yieldRoutes = require("./routes/yieldRoutes");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const bidRoutes = require("./routes/bidRoutes");
const marketRoutes = require('./routes/market');



// 2. Middleware

app.use("/api/bid", bidRoutes);
app.use('/api/market', marketRoutes);

// 3. Static File Serving
// This serves your HTML, CSS, and JS from the frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));
// This serves your uploaded crop images/videos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 4. API Route Mounting
// Note: Frontend should call http://localhost:5000/api/yield/...
app.use("/api/yield", yieldRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// 5. Root Route (Serves the landing page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// 6. Database Connection
// This defines the variable so the error disappears
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://atharvmerz_db_user:krishi123@clustere.emtbvrf.mongodb.net/KrishiDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Database Connected Successfully!"))
  .catch(err => console.log("❌ Connection Error:", err));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    // 7. Start Server (ONLY ONCE)
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });