const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Book = require("../models/Book");

const router = express.Router();

// Search Google Books
router.get("/google-books", async (req, res) => {
  try {
    const { q = "fiction", startIndex = 0, maxResults = 10 } = req.query;
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (!apiKey) throw new Error("Google Books API key is missing");

    // Check cache first
    const cachedBooks = await Book.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
        { genre: { $regex: q, $options: "i" } },
      ],
    })
      .skip(Number(startIndex))
      .limit(Number(maxResults));
    if (cachedBooks.length >= maxResults) {
      return res.status(200).json({
        items: cachedBooks.map((book) => ({
          id: book.googleVolumeId,
          volumeInfo: {
            title: book.title,
            authors: book.author.split(", "),
            publisher: book.publisher,
            publishedDate: book.publishedDate,
            description: book.description,
            categories: book.genre.split(", "),
            imageLinks: { thumbnail: book.thumbnail },
          },
        })),
        totalItems: await Book.countDocuments({
          $or: [
            { title: { $regex: q, $options: "i" } },
            { author: { $regex: q, $options: "i" } },
            { genre: { $regex: q, $options: "i" } },
          ],
        }),
      });
    }

    // Fetch from Google Books
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        q
      )}&startIndex=${startIndex}&maxResults=${maxResults}&key=${apiKey}`,
      { timeout: 10000 }
    );
    const books = response.data.items || [];
    for (const item of books) {
      const googleVolumeId = item.id;
      const v = item.volumeInfo;
      await Book.findOneAndUpdate(
        { googleVolumeId },
        {
          googleVolumeId,
          title: v.title || "Untitled",
          author: v.authors ? v.authors.join(", ") : "Unknown",
          publisher: v.publisher || "",
          publishedDate: v.publishedDate || "",
          thumbnail: v.imageLinks?.thumbnail || "",
          genre: v.categories ? v.categories.join(", ") : "",
          description: v.description || "",
        },
        { upsert: true }
      );
    }
    res.status(200).json({
      items: books,
      totalItems: response.data.totalItems || 0,
    });
  } catch (error) {
    console.error("Error fetching books from Google:", error.message);
    res.status(503).json({ error: "Google Books API unavailable" });
  }
});

// Save/Add Book or Recommendation
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
      genre,
      rating,
      comment,
    } = req.body;

    if (!googleVolumeId || !title || !author) {
      return res
        .status(400)
        .json({ error: "Google Volume ID, title, and author are required" });
    }

    let book = await Book.findOne({ googleVolumeId });
    if (
      !book ||
      !publisher ||
      !publishedDate ||
      !thumbnail ||
      !description ||
      !genre
    ) {
      try {
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        if (!apiKey) throw new Error("Google Books API key is missing");
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes/${googleVolumeId}?key=${apiKey}`,
          { timeout: 10000 }
        );
        const v = response.data.volumeInfo;
        title = v.title || title;
        author = v.authors ? v.authors.join(", ") : author;
        publisher = v.publisher || publisher || "";
        publishedDate = v.publishedDate || publishedDate || "";
        thumbnail = v.imageLinks?.thumbnail || thumbnail || "";
        genre = v.categories ? v.categories.join(", ") : genre || "";
        description = v.description || description || "";
        book = await Book.findOneAndUpdate(
          { googleVolumeId },
          {
            googleVolumeId,
            title,
            author,
            publisher,
            publishedDate,
            thumbnail,
            genre,
            description,
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error("Error fetching Google Books data:", error.message);
        if (!book) {
          book = new Book({
            googleVolumeId,
            title,
            author,
            publisher: publisher || "",
            publishedDate: publishedDate || "",
            thumbnail: thumbnail || "",
            genre: genre || "",
            description: description || "",
          });
        }
      }
    }

    if (rating || comment) {
      if (rating) {
        if (rating < 1 || rating > 5) {
          return res
            .status(400)
            .json({ error: "Rating must be between 1 and 5" });
        }
        const existingRating = book.ratings.find(
          (r) => r.userId.toString() === req.user.userId
        );
        if (existingRating) existingRating.rating = rating;
        else
          book.ratings.push({
            userId: req.user.userId,
            username: user.username,
            rating,
          });
      }

      if (comment) {
        book.comments.push({
          userId: req.user.userId,
          username: user.username,
          comment,
        });
      }

      if (book.ratings.length > 0) {
        const totalRating = book.ratings.reduce((sum, r) => sum + r.rating, 0);
        book.averageRating = totalRating / book.ratings.length;
      }

      await book.save();
    }

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
          ? [{ username: user.username, rating, userId: req.user.userId }]
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
            rating,
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
    if (!googleVolumeId) throw new Error("Invalid Google Volume ID");

    let googleResponse = null;
    let book = await Book.findOne({ googleVolumeId });

    try {
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      if (!apiKey) throw new Error("Google Books API key is missing");
      googleResponse = await axios.get(
        `https://www.googleapis.com/books/v1/volumes/${googleVolumeId}?key=${apiKey}`,
        { timeout: 10000 }
      );
      const v = googleResponse.data.volumeInfo;
      book = await Book.findOneAndUpdate(
        { googleVolumeId },
        {
          googleVolumeId,
          title: v.title || book?.title || "Untitled",
          author: v.authors ? v.authors.join(", ") : book?.author || "Unknown",
          publisher: v.publisher || book?.publisher || "",
          publishedDate: v.publishedDate || book?.publishedDate || "",
          thumbnail: v.imageLinks?.thumbnail || book?.thumbnail || "",
          genre: v.categories ? v.categories.join(", ") : book?.genre || "",
          description: v.description || book?.description || "",
          averageRating: book?.averageRating || 0,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(
        "Google Books API error:",
        error.response?.status || error.message
      );
      if (!book) {
        return res
          .status(503)
          .json({
            error: "Google Books API unavailable and no local data found",
          });
      }
    }

    let user = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.userId);
      } catch (error) {
        console.error("Invalid token:", error.message);
      }
    }

    const responseData = googleResponse
      ? {
          ...googleResponse.data,
          volumeInfo: {
            ...googleResponse.data.volumeInfo,
            imageLinks: googleResponse.data.volumeInfo?.imageLinks || {
              thumbnail: book?.thumbnail || "",
            },
          },
          comments: book?.comments || [],
          ratings: book?.ratings || [],
          averageRating: book?.averageRating || 0,
          isAdded: user
            ? user.myBooks.some((b) => b.googleVolumeId === googleVolumeId)
            : false,
        }
      : {
          id: googleVolumeId,
          volumeInfo: {
            title: book?.title || "Untitled",
            authors: book?.author ? book.author.split(", ") : ["Unknown"],
            publisher: book?.publisher || "",
            publishedDate: book?.publishedDate || "",
            description: book?.description || "",
            categories: book?.genre ? book.genre.split(", ") : [],
            imageLinks: { thumbnail: book?.thumbnail || "" },
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
    const user = await User.findById(req.user.userId).select("myBooks");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user.myBooks || []);
  } catch (error) {
    console.error("Error fetching user books:", error.message);
    res.status(500).json({ error: "Error fetching user books" });
  }
});

// Remove Book
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
