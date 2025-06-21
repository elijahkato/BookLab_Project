
require("dotenv").config(); // Load environment variables from .env file
const express = require("express"); // Import Express.js
const mongoose = require("mongoose"); // Import Mongoose for MongoDB
const cors = require("cors"); // Enable CORS for frontend requests

// Initialize the Express application
const app = express();

// Enable CORS so the frontend can talk to this backend
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Load the MongoDB connection string and port from environment variables
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB using Mongoose
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully")) // Log success
  .catch((error) => console.error("❌ MongoDB connection error:", error)); // Log any errors

// Test route to make sure server is working
app.get("/", (req, res) => {
  res.send("✅ Book Recommendation API is running...");
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
