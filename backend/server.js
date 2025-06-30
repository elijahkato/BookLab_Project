// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import your routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");

const app = express();

// --- START CORS CONFIGURATION ---
const allowedOrigins = [
  "http://localhost:5173", // Your local frontend development URL (Vite default)
  "http://localhost:3000", // Your local frontend development URL (Create React App default)
  // ** IMPORTANT: Add your Vercel frontend URL(s) here **
  // You can find this in your Vercel dashboard for your deployed frontend project.
  "https://book-lab-project.vercel.app/",
  // Add any other Vercel preview/production domains if they differ
  // e.g., "https://booklab-frontend-git-main-yourusername.vercel.app"
  // e.g., "https://booklab-frontend.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin requests)
    // or if the origin is in our allowed list.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Explicitly allow common HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Explicitly allow these headers (Authorization is crucial for JWT)
  credentials: true, // Allow cookies and authorization headers to be sent across origins
};

app.use(cors(corsOptions)); // Apply the configured CORS options
// --- END CORS CONFIGURATION ---

app.use(express.json()); // For parsing application/json

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// Mount routes
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
