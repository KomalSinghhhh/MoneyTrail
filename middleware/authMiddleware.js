const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log('Auth headers:', req.headers); // Debug log
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    console.error("Access denied. No token provided.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // Format: "Bearer <token>"
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  console.log('Extracted token:', token); // Debug log

  try {
    const decoded = jwt.verify(token, 'test-secret-key');
    console.log('Decoded token:', decoded); // Debug log
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error); // Debug log
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
