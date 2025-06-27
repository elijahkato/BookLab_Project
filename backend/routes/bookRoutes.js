const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Book = require("../models/Book");

const router = express.Router();

// Fetch from Google Books
router.get("/google-books", async (req, res) => {
  try {
    const { q = "fiction", maxResults = 20 } = req.query;
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (!apiKey) throw new Error("Google Books API key is missing");
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        q
      )}&maxResults=${maxResults}&key=${apiKey}`
    );
    res.status(200).json(response.data.items || []);
  } catch (error) {
    console.error("Error fetching books from Google:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching books from Google Books API" });
  }
});

// Save/Add Book or Comment/Rating
router.post("/add", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let {
      googleVolumeId,
      title,
      author,
      publisher,
      publishedDate,
      thumbnail,
      description,
      rating,
      genre,
      comment,
    } = req.body;

    // Fetch book data from Google if not fully provided
    if (googleVolumeId && (!title || !author)) {
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      if (!apiKey) throw new Error("Google Books API key is missing");
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes/${googleVolumeId}?key=${apiKey}`
      );
      const v = response.data.volumeInfo;
      title = v.title || "Untitled";
      author = v.authors ? v.authors.join(", ") : "Unknown";
      publisher = v.publisher || "";
      publishedDate = v.publishedDate || "";
      thumbnail =
        v.imageLinks?.large ||
        v.imageLinks?.medium ||
        v.imageLinks?.thumbnail ||
        "";
      genre = v.categories ? v.categories.join(", ") : "";
      description = v.description || "";
    }

    if (!title || !author) {
      return res.status(400).json({ error: "Title and author are required" });
    }

    // Save to global Book collection only for comments or ratings
    let book = await Book.findOne({ googleVolumeId });
    if (comment || rating) {
      if (!book) {
        book = new Book({
          googleVolumeId,
          title,
          author,
          publisher,
          publishedDate,
          thumbnail,
          genre,
          description,
        });
      }

      // Add or update rating
      if (rating) {
        const existingRating = book.ratings.find(
          (r) => r.userId.toString() === req.user.userId
        );
        if (existingRating) existingRating.score = rating;
        else
          book.ratings.push({
            userId: req.user.userId,
            username: user.username,
            score: rating,
          });
      }

      // Add comment
      if (comment) {
        book.comments.push({
          userId: req.user.userId,
          username: user.username,
          comment,
        });
      }

      await book.save();
    }

    // Save to user's myBooks only if explicitly adding or commenting/rating
    let myBook = user.myBooks.find((b) => b.googleVolumeId === googleVolumeId);

    if (!myBook) {
      user.myBooks.push({
        googleVolumeId,
        title,
        author,
        publisher: publisher || "",
        publishedDate: publishedDate || "",
        thumbnail: thumbnail || "",
        description: description || "",
        genre: genre || "",
        ratings: rating
          ? [
              {
                username: user.username,
                rating: rating,
                userId: req.user.userId,
              },
            ]
          : [],
        comments: comment
          ? [{ username: user.username, comment, userId: req.user.userId }]
          : [],
      });
    } else {
      if (comment) {
        myBook.comments.push({
          userId: req.user.userId,
          username: user.username,
          comment,
        });
      }
      if (rating) {
        const existingUserRating = myBook.ratings.find(
          (r) => r.userId.toString() === req.user.userId
        );
        if (existingUserRating) existingUserRating.rating = rating;
        else
          myBook.ratings.push({
            username: user.username,
            rating: rating,
            userId: req.user.userId,
          });
      }
      if (genre) myBook.genre = genre;
      if (description && !comment) myBook.description = description;
    }

    await user.save();

    res
      .status(201)
      .json({
        message: "Book saved successfully",
        book: myBook || { googleVolumeId, title, author },
      });
  } catch (error) {
    console.error("Error saving book:", error.message);
    res.status(500).json({ error: `Error saving book: ${error.message}` });
  }
});

// Get Book Details
router.get("/:googleVolumeId", async (req, res) => {
  try {
    const googleVolumeId = req.params.googleVolumeId;
    const promises = [
      axios.get(
        `https://www.googleapis.com/books/v1/volumes/${googleVolumeId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
      ),
      Book.findOne({ googleVolumeId }),
    ];

    // If authenticated, fetch user to check myBooks
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        promises.push(User.findById(decoded.userId));
      } catch (error) {
        console.error("Invalid token:", error.message);
        promises.push(Promise.resolve(null));
      }
    } else {
      promises.push(Promise.resolve(null));
    }

    const [googleResponse, book, user] = await Promise.all(promises);

    const imageLinks = googleResponse.data.volumeInfo?.imageLinks || {};
    const thumbnail =
      imageLinks.large || imageLinks.medium || imageLinks.thumbnail || "";

    const responseData = {
      ...googleResponse.data,
      volumeInfo: {
        ...googleResponse.data.volumeInfo,
        imageLinks: { ...imageLinks, thumbnail },
      },
      comments: book?.comments || [],
      ratings: book?.ratings || [],
      averageRating: book?.averageRating || 0,
      isAdded: user
        ? user.myBooks.some((b) => b.googleVolumeId === googleVolumeId)
        : false,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching book details:", error.message);
    res
      .status(500)
      .json({ error: `Error fetching book details: ${error.message}` });
  }
});

// Get User's Saved Books
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.status(200).json(user.myBooks || []);
  } catch (error) {
    console.error("Error fetching user books:", error.message);
    res.status(500).json({ error: "Error fetching user books" });
  }
});

// Remove Book From User's List
router.delete("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const index = user.myBooks.findIndex(
      (b) => b.googleVolumeId === req.params.id
    );
    if (index === -1)
      return res.status(404).json({ error: "Book not found in your list" });

    user.myBooks.splice(index, 1);
    await user.save();

    res.status(200).json({ message: "Book removed successfully" });
  } catch (error) {
    console.error("Error removing book:", error.message);
    res.status(500).json({ error: "Error removing book" });
  }
});

module.exports = router;
