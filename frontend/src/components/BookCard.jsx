import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { clearAuth } from "../store/authSlice";

// --- Custom Button Component (Replaces Flowbite Button) ---
// You might want to move this to a separate file like components/CustomButton.jsx
const CustomButton = ({
  color,
  onClick,
  children,
  className = "",
  ...props
}) => {
  const baseClasses =
    "px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 text-sm font-medium";

  let colorClasses = "";
  if (color === "blue") {
    colorClasses =
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400";
  } else if (color === "red") {
    colorClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400";
  } else {
    // Default to a neutral style if color is not specified or recognized
    colorClasses =
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400";
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${colorClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Custom Spinner Component (Replaces Flowbite Spinner) ---
// You might want to move this to a separate file like components/CustomSpinner.jsx
const CustomSpinner = ({
  size = "md",
  color = "blue",
  className = "",
  ...props
}) => {
  let spinnerSize = "w-6 h-6";
  if (size === "sm") spinnerSize = "w-4 h-4";
  if (size === "lg") spinnerSize = "w-8 h-8";

  let spinnerColor = "border-blue-500";
  if (color === "gray") spinnerColor = "border-gray-500"; // Add other colors as needed

  return (
    <div
      className={`animate-spin rounded-full border-2 border-t-2 border-solid ${spinnerSize} ${spinnerColor} border-t-transparent ${className}`}
      role='status'
      {...props}
    >
      <span className='sr-only'>Loading...</span>
    </div>
  );
};

/**
 * BookCard component to display a book with add/remove and view details functionality
 * @param {Object} props - Component props
 * @param {Object} props.book - Book data from Google Books API
 * @param {boolean} props.isAuthenticated - Whether the user is logged in
 * @param {Function} [props.onUpdateUserBooks] - Callback to update user books
 */
function BookCard({ book, isAuthenticated, onUpdateUserBooks }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Description with truncation
  const description =
    book?.volumeInfo?.description || "No description available.";
  const truncatedDescription =
    description.length > 100 ? `${description.slice(0, 100)}...` : description;

  // Check if book is in user's list on mount with minimum spinner delay
  useEffect(() => {
    const checkBookStatus = async () => {
      if (!isAuthenticated) {
        setIsAdded(false);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [response] = await Promise.all([
          axios.get(`http://localhost:3000/api/books/${book.id}`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
        if (!response.data || response.data.error) {
          throw new Error("Invalid book data");
        }
        setIsAdded(response.data.isAdded || false);
        console.log(
          `Book ${book.id} added status:`,
          response.data.isAdded || false
        );
      } catch (error) {
        console.error("Error checking book status:", error.message);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          dispatch(clearAuth());
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkBookStatus();
  }, [book.id, isAuthenticated, token, dispatch, navigate]);

  const handleAddBook = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in to add books to your list");
      navigate("/login");
      return;
    }
    try {
      const payload = {
        googleVolumeId: book.id,
        title: book.volumeInfo.title || "Untitled",
        author: book.volumeInfo.authors
          ? book.volumeInfo.authors.join(", ")
          : "Unknown",
        publisher: book.volumeInfo.publisher || "",
        publishedDate: book.volumeInfo.publishedDate || "",
        thumbnail: book.volumeInfo.imageLinks?.thumbnail || "",
        description: book.volumeInfo.description || "",
        genre: book.volumeInfo.categories
          ? book.volumeInfo.categories.join(", ")
          : "",
      };
      await axios.post("http://localhost:3000/api/books/add", payload, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setIsAdded(true);
      toast.success(`${book.volumeInfo.title} added to your list!`);
      if (onUpdateUserBooks) onUpdateUserBooks();
    } catch (error) {
      console.error("Error saving book:", error.message);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        dispatch(clearAuth());
        navigate("/login");
      } else {
        toast.error(error.response?.data?.error || "Failed to add book");
      }
    }
  };

  const handleRemoveBook = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/books/${book.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setIsAdded(false);
      toast.success(`${book.volumeInfo.title} removed from your list`);
      if (onUpdateUserBooks) onUpdateUserBooks();
    } catch (error) {
      console.error("Error removing book:", error.message);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        dispatch(clearAuth());
        navigate("/login");
      } else {
        toast.error(error.response?.data?.error || "Failed to remove book");
      }
    }
  };

  return (
    <div
      role='article'
      // Replaced Flowbite Card with a div, styled with Tailwind for card appearance
      // Added background, border, shadow, padding, and dark mode styles
      className='w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto h-full flex flex-col justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700'
    >
      <img
        src={
          book?.volumeInfo?.imageLinks?.thumbnail ||
          "https://via.placeholder.com/200x300?text=No+Cover"
        }
        alt={`Cover of ${book?.volumeInfo?.title || "Untitled"}`}
        className='w-full h-60 object-cover mb-2 rounded-md' // Added rounded-md for image corners
      />
      <h5 className='text-xl font-semibold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 truncate mb-1'>
        {book?.volumeInfo?.title || "Untitled"}
      </h5>
      <p className='text-sm text-gray-700 dark:text-gray-400 mb-1'>
        <span className='text-cyan-600 font-semibold'>Author:</span>{" "}
        {book?.volumeInfo?.authors?.join(", ") || "Unknown"}
      </p>
      <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
        <span className='text-cyan-600 font-semibold'>Published:</span>{" "}
        {book.volumeInfo?.publishedDate || "N/A"}
      </p>
      <p className='text-sm text-gray-700 dark:text-gray-400 mb-2'>
        {truncatedDescription}
      </p>
      <p className='text-sm text-gray-700 dark:text-gray-400 mb-4'>
        <span className='text-cyan-600 font-semibold'>Genre:</span>{" "}
        {book?.volumeInfo?.categories?.join(", ") || "Unknown"}
      </p>

      {/* Replaced Flowbite Spinner with CustomSpinner */}
      {isLoading ? (
        <div
          className='flex flex-col gap-2 mb-4 mt-auto items-center'
          aria-live='polite'
        >
          <CustomSpinner
            size='md'
            color='blue'
            aria-label='Loading book status'
          />
        </div>
      ) : (
        <div className='flex flex-col gap-2 mt-auto'>
          {/* Replaced Flowbite Button with CustomButton */}
          <CustomButton
            color='blue'
            className='cursor-pointer'
            onClick={() => navigate(`/books/${book.id}`)}
            aria-label={`View details for ${
              book?.volumeInfo?.title || "Untitled"
            }`}
          >
            View Details
          </CustomButton>
          {isAuthenticated && (
            // Replaced Flowbite Button with CustomButton
            <CustomButton
              color={isAdded ? "red" : "blue"}
              className='cursor-pointer'
              onClick={isAdded ? handleRemoveBook : handleAddBook}
              aria-label={
                isAdded
                  ? `Remove ${
                      book?.volumeInfo?.title || "Untitled"
                    } from my list`
                  : `Add ${book?.volumeInfo?.title || "Untitled"} to my list`
              }
            >
              {isAdded ? "Remove from My List ❌" : "Add to My List"}
            </CustomButton>
          )}
        </div>
      )}
    </div>
  );
}

export default BookCard;
