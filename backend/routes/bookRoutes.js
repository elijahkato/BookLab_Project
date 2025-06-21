// routes/bookRoutes.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// @route GET /api/books/search?query=someQuery
// @desc Search for books on the Google Books API
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const googleApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}`;
    const response = await axios.get(googleApiUrl);

    const books =
      response.data.items?.map((item) => {
        const info = item.volumeInfo;
        return {
          title: info.title,
          authors: info.authors,
          thumbnail: info.imageLinks?.thumbnail,
          description: info.description,
          publishedDate: info.publishedDate || "Unknown",
          publisher: info.publisher || "Unknown",
          infoLink: info.infoLink,
        };
      }) || [];

    res.status(200).json(books); // Return simplified book info
  } catch (error) {
    res.status(500).json({ error: error.message }); // Error handling
  }
});

module.exports = router;
