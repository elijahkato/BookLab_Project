import { Card, Button } from "flowbite-react";
import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import BookDetails from "../pages/BookDetails";
import { useNavigate } from "react-router";

function BookCard({ book }) {
  const navigate = useNavigate();
  const description =
    book?.volumeInfo?.description || "No description available.";
  const truncatedDescription =
    description.length > 100 ? `${description.slice(0, 100)}...` : description;

  const ratingValue = Number(book.rating) || 0;
  const renderRating = (rating) => {
    if (!rating) return "No rating";
    const stars = Math.round(rating); // round to nearest int
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };

  const [isAdded, setIsAdded] = useState(false);

  // Get token & auth status from Redux
  const token = useSelector((state) => state.auth.token); // token from auth slice
  const isAuthenticated = !!token;

  const handleAddBook = async () => {
    try {
      const payload = {
        googleVolumeId: book.id,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors
          ? book.volumeInfo.authors.join(", ")
          : "Unknown",
        publisher: book.volumeInfo.publisher,
        publishedDate: book.volumeInfo.publishedDate,
        thumbnail: book.volumeInfo.imageLinks?.thumbnail,
      };
      await axios.post("http://localhost:3000/api/books/add", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdded(true); // Toggle UI
    } catch (error) {
      console.error("Error saving book:", error.message);
      alert(error.response?.data?.error || "Error saving book. Please log in.");
    }
  };

  return (
    <Card className=''>
      <img
        src={
          book?.volumeInfo?.imageLinks?.thumbnail ||
          "https://via.placeholder.com/200x300?text=No+Cover"
        }
        alt={`${book?.volumeInfo?.title} cover`}
        className='w-full h-48 object-cover mb-4 rounded-lg'
      />

      <h5 className='text-xl font-semibold tracking-tight text-gray-900 dark:text-white truncate'>
        {book?.volumeInfo?.title || "Untitled"}
      </h5>
      <p className='text-sm text-gray-700 dark:text-gray-400'>
        by {book?.volumeInfo?.authors?.join(", ") || "Unknown"}
      </p>
      <p className='text-sm text-yellow-500'>
        Rating: {renderRating(ratingValue)}
      </p>
      <p className='text-sm text-gray-600 dark:text-gray-400'>
        Published: {book.volumeInfo?.publishedDate || "N/A"}
      </p>
      <p className='text-sm text-gray-700 dark:text-gray-400 mb-2'>
        {truncatedDescription}
      </p>

      <p className='text-sm text-gray-700 dark:text-gray-400'>
        Genre: {book?.volumeInfo?.categories?.join(", ") || "Unknown"}
      </p>

      <Button
        color='blue'
        className='mt-2'
        onClick={() => navigate(`/books/${book.id}`)}
      >
        View Details
      </Button>
    </Card>
  );
}

export default BookCard;
