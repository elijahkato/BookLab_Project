const mongoose = require("mongoose");

// Define a schema for individual comments
// This allows each comment to have a user reference, text content, and a timestamp
const commentSchema = new mongoose.Schema({
  // Reference to the User who posted the comment
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // The actual comment text
  text: { type: String, required: true },
  // Timestamp to track when the comment was created
  createdAt: { type: Date, default: Date.now },
});

// Define the main schema for books
// This will hold all the book information and references to ratings and comments
const bookSchema = new mongoose.Schema(
  {
    // Title of the book (required)
    title: { type: String, required: true },

    // Author of the book (required)
    author: { type: String, required: true },

    // Genre of the book (required)
    genre: { type: String, required: true },

    // Optional brief description or synopsis of the book
    description: { type: String },

    // Optional URL for a book cover image
    coverImageUrl: { type: String },

    // Reference to the user who recommended the book
    recommendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Array of ratings with the rating user and their score
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        score: { type: Number, min: 1, max: 5 }, // Score is between 1 and 5
      },
    ],

    // Array of comments using the commentSchema defined above
    comments: [commentSchema],
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the Book model based on the schema
module.exports = mongoose.model("Book", bookSchema);
