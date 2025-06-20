// and includes a route for managing books. The server listens on a specified port.
// The MongoDB connection string is stored in an environment variable.
// and it includes a route for managing books.
// The server listens on a specified port, and the MongoDB connection string is stored in an
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bookRoutes = require("./routes/books");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/books", bookRoutes);

const PORT = 5001; // Changed to 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// This code sets up an Express server that connects to a MongoDB database.
// It uses dotenv to manage environment variables, cors for cross-origin resource sharing,
