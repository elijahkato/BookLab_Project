// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]; // Extract the token after "Bearer"
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) return res.status(401).json({ error: "Invalid token" });

    req.user = decoded; // Save decoded payload
    next();
  });
};
