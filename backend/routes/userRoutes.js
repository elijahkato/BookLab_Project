const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * Register a new user
 * Expects: firstName, lastName, dateOfBirth, username, email, password in req.body
 * Checks if user already exists by email or username
 * Hashes password in User model pre-save hook
 * Returns 201 status, token, and username on success
 */
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, username, email, password } =
      req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        error:
          existingUser.email === email
            ? "Email already exists"
            : "Username already exists",
      });
    }

    // Create new user instance
    const newUser = new User({
      firstName,
      lastName,
      dateOfBirth,
      username,
      email,
      password, // Hashed by pre-save hook
    });

    // Save user to DB
    await newUser.save();

    // Create JWT token with 30-minute expiration
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1800s", // 30 minutes
    });

    // Respond with token and username
    res.status(201).json({ token, username: newUser.username });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ error: "Server error during registration" });
  }
});

/**
 * Login existing user
 * Expects: email, password in req.body
 * Verifies user exists and password matches
 * Issues JWT token signed with secret from environment variables
 * Returns token and user info on success
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Compare entered password with hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Create JWT token with 30-minute expiration
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1800s", // 30 minutes
    });

    // Respond with token and user info
    res.status(200).json({ token, username: user.username, email: user.email });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

module.exports = router;
