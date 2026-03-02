const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // 1. Get header value
  const authHeader = req.header("Authorization");

  // 2. Check if header exists
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // 3. Handle the "Bearer " prefix
    // This turns "Bearer eyJhbG..." into just "eyJhbG..."
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token format is 'Bearer <token>'" });
    }

    // 4. Verify using the EXACT same key as the login route
    const decoded = jwt.verify(token, "SECRET_KEY");

    // 5. Add user data (id, role) to the request object
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token. Please login again." });
  }
};