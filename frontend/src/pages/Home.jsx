import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, Select, Spinner } from "flowbite-react";
import Navbars from "../components/Navbars";
import MyCarousel from "../components/MyCarousel";
import BookCard from "../components/BookCard";

// Define the API base URL for your backend
// Using the VITE_REACT_APP_API_URL environment variable as renamed on Vercel
const API_BASE_URL =
  import.meta.env.VITE_REACT_APP_API_URL;

/**
 * Home component to display popular books with category selection
 * @returns {JSX.Element} Home page with carousel and book grid
 */
export default function Home() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("fiction");
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = !!token;

  // Log authentication state for debugging
  useEffect(() => {
    console.log("Home auth state:", { isAuthenticated, token });
  }, [isAuthenticated, token]);

  /**
   * Fetches books from Google Books API via backend
   */
  const fetchBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the dynamically set API_BASE_URL here
      const response = await axios.get(
        `${API_BASE_URL}/api/books/google-books?q=${encodeURIComponent(
          category
        )}&maxResults=12`,
        { timeout: 10000 }
      );
      setBooks(response.data.items || []);
    } catch (error) {
      console.error("Error fetching books:", error.message);
      setError("Failed to load books. Please try again.");
      toast.error("Failed to load popular books");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [category]);

  /**
   * Handles category selection change
   * @param {Object} e - Event object
   */
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  /**
   * Callback to refresh books after adding to user's list
   */
  const handleUpdateUserBooks = () => {
    fetchBooks(); // Refresh to sync added status
  };

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbars />
      <div className='pt-16'>
        <MyCarousel className='container pt-5' />
        <div className='sm:p-0 md:p-5 lg:p-20'>
          <div className='flex justify-center gap-2 items-center mb-6'>
            <h2 className='text-xl font-semibold'>Popular Books</h2>
            <Select
              value={category}
              onChange={handleCategoryChange}
              className='w-40'
              aria-label='Select book category'
            >
              <option value='fiction'>Fiction</option>
              <option value='non-fiction'>Non-Fiction</option>
              <option value='science'>Science</option>
              <option value='history'>History</option>
            </Select>
          </div>
          {!isAuthenticated && (
            <p className='text-gray-500 text-center mb-4'>
              Log in to add books to your list.
            </p>
          )}
          <div
            className='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3  lg:grid-cols-4 gap-5 px-10'
            role='grid'
            aria-label='Popular books grid'
          >
            {isLoading ? (
              <div className='text-center col-span-full' aria-live='polite'>
                <Spinner size='lg' color='blue' aria-label='Loading books' />
                <p className='text-gray-500 mt-2'>Loading books...</p>
              </div>
            ) : error ? (
              <div className='text-center col-span-full'>
                <p className='text-red-500'>{error}</p>
                <Button
                  color='blue'
                  onClick={fetchBooks}
                  className='mt-4'
                  disabled={isLoading}
                  aria-label='Retry loading books'
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        color='success'
                        size='lg'
                        aria-label='Success spinner example'
                      />
                      Retrying...
                    </>
                  ) : (
                    "Retry"
                  )}
                </Button>
              </div>
            ) : books.length > 0 ? (
              books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isAuthenticated={isAuthenticated}
                  onUpdateUserBooks={handleUpdateUserBooks}
                />
              ))
            ) : (
              <p className='text-gray-500 text-center col-span-full bg-gray-100 p-4 rounded'>
                No books found for this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
