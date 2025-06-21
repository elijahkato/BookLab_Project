// Import Axios to help make HTTP requests
const axios = require("axios");

// @route GET /api/books/search?query=someQuery
// @desc Search for books on the Google Books API
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query; // Get search query from URL params
    if (!query) return res.status(400).json({ error: "Query is required" });

    // Call the public Google Books API
    const googleApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}`;
    const response = await axios.get(googleApiUrl);

    // Simplify the response — just return the books array
    const books =
      response.data.items?.map((item) => ({
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        thumbnail: item.volumeInfo.imageLinks?.thumbnail,
        description: item.volumeInfo.description,
        infoLink: item.volumeInfo.infoLink,
      })) || [];

    res.status(200).json(books); // Return simplified results
  } catch (error) {
    res.status(500).json({ error: error.message }); // Error handling
  }
});
