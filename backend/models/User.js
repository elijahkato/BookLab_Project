// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const commentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { _id: false }
);

const ratingSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }
);

const myBookSchema = new mongoose.Schema(
  {
    googleVolumeId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    thumbnail: { type: String },
    publishedDate: { type: String },
    description: { type: String, default: "" },
    genre: { type: String, default: "" },
    ratings: { type: [ratingSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    myBooks: { type: [myBookSchema], default: [] },
  },
  { timestamps: true }
);

// Password hashing before save
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Password validation helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
