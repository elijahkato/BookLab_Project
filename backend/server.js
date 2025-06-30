// server.js

// Load environment variables from .env file into process.env
require("dotenv").config();

// Import necessary modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Middleware for enabling CORS

// Import your application's route modules
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");

// Initialize the Express application
const app = express();

// --- START CORS CONFIGURATION ---
// This array defines the exact origins (domains) that are allowed to
// make requests to your backend API. This is crucial for security.
const allowedOrigins = [
  "http://localhost:5173", // This is typically your local Vite development server URL
  "http://localhost:3000", // This is often used for local Create React App or other local setups

  // ** IMPORTANT: Add your Vercel frontend URL(s) here **
  // The error message indicated 'https://book-lab-project.vercel.app' was blocked.
  // Ensure this URL is added EXACTLY as it appears in the browser's origin.
  // Note: Vercel production domains typically DO NOT have a trailing slash.
  "https://book-lab-project.vercel.app", // Your deployed Vercel frontend URL - Removed trailing slash based on common Vercel behavior and error message.
  // If you have Vercel preview deployments (e.g., branch-specific deployments),
  // you might need to add those URLs too. For example:
  // "https://booklab-frontend-git-main-yourusername.vercel.app",
  // "https://booklab-frontend.vercel.app", // If you set up a custom domain or different Vercel project name
];

// Configure CORS options
const corsOptions = {
  // The 'origin' function dynamically checks if the incoming request's origin
  // is allowed. This is more flexible than just a static string.
  origin: function (origin, callback) {
    // If the 'origin' is undefined (e.g., for requests from the same origin,
    // or non-browser tools like Postman/curl), or if it's found in our
    // 'allowedOrigins' list, then allow the request.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the origin
    } else {
      // If the origin is not in the allowed list, reject the request with a CORS error.
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  // Explicitly specify which HTTP methods are allowed for cross-origin requests.
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  // Explicitly specify which headers are allowed from cross-origin requests.
  // 'Content-Type' is essential for sending JSON, 'Authorization' is crucial for JWTs.
  allowedHeaders: ["Content-Type", "Authorization"],
  // 'credentials: true' allows the browser to send cookies and HTTP authentication
  // (like Authorization headers) with cross-origin requests. This is important
  // when using JWTs in the Authorization header.
  credentials: true,
};

// Apply the configured CORS middleware to all incoming requests.
app.use(cors(corsOptions));
// --- END CORS CONFIGURATION ---

// Middleware to parse incoming JSON request bodies.
// This allows you to access request body data via `req.body`.
app.use(express.json());

// Establish connection to MongoDB using the URI from environment variables.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected")) // Log success on connection
  .catch((error) => console.error("❌ MongoDB connection error:", error)); // Log error if connection fails

// Mount your route modules to specific base paths.
// All user-related API endpoints will start with /api/users
app.use("/api/users", userRoutes);
// All book-related API endpoints will start with /api/books
app.use("/api/books", bookRoutes);

// A simple test route for the root URL to confirm the backend is running.
app.get("/", (req, res) => {
  res.send("✅ Backend is running.");
});

// Define the port the server will listen on.
// It uses the PORT environment variable (set by Render) or defaults to 3000 for local development.
const PORT = process.env.PORT || 3000;

// Start the server and listen for incoming requests on the specified port.
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
