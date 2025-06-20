const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { q, maxResults = 30 } = req.query;
    if (!q)
      return res.status(400).json({ error: "Query parameter is required" });
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=${maxResults}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
    );
    const books = response.data.items.map((item) => ({
      id: item.id,
      title: item.volumeInfo.title,
      rating: item.volumeInfo.averageRating || "No rating",
      description: item.volumeInfo.description || "No description available",
      publishedDate: item.volumeInfo.publishedDate || "Unknown",

      author: item.volumeInfo.authors?.join(", ") || "Unknown",
      thumbnail:
        item.volumeInfo.imageLinks?.large ||
        item.volumeInfo.imageLinks?.medium ||
        item.volumeInfo.imageLinks?.small ||
        item.volumeInfo.imageLinks?.smallThumbnail ||
        item.volumeInfo.imageLinks?.cover ||
        item.volumeInfo.imageLinks?.thumbnail ||
        "https://via.placeholder.com/128x192?text=No+Cover",
    }));
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
