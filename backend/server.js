// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import your routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require('./routes/bookRoutes'); // if you have it

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// Mount routes
app.use("/api/users", userRoutes);
app.use('/api/books', bookRoutes); // mount other routes as needed

// Test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
