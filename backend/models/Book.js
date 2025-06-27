const mongoose = require("mongoose");

// Sub-schema for individual comments
const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  username: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Main schema for books
const bookSchema = new mongoose.Schema(
  {
    googleVolumeId: { type: String, unique: true, sparse: true },

    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String },
    description: { type: String },
    coverImageUrl: { type: String },
    publisher: { type: String },
    publishedDate: { type: String },
    thumbnail: { type: String },

    recommendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    ratings: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        username: String,
        score: { type: Number, min: 1, max: 5 },
      },
    ],

    comments: [commentSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to calculate average rating
bookSchema.virtual("averageRating").get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.score, 0);
  return sum / this.ratings.length;
});

const bookModel = mongoose.model("Book", bookSchema);
module.exports = bookModel;
