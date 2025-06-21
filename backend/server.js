// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import the book routes
const bookRoutes = require("./routes/BookRoute");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Mount the books router at /api/books
app.use("/api/books", bookRoutes);

// Test route to confirm server is working
app.get("/", (req, res) => res.send("✅ Backend is working!"));

// Start the server
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
