import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-toastify";
import { Button, Spinner, TextInput } from "flowbite-react";
import { clearAuth } from "../store/authSlice";
import BookCard from "../components/BookCard";
import Navbars from "../components/Navbars";

// Define the API base URL for your backend
// Vite requires environment variables to be prefixed with VITE_
// So, if your Vercel env var is REACT_APP_API_URL, access it as VITE_REACT_APP_API_URL
// Or, rename your Vercel env var to VITE_API_URL and use import.meta.env.VITE_API_URL
const API_BASE_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

/**
 * SearchPage component for searching books by title, author, genre, or category
 * with top padding to prevent navbar overlap, 5 cards per row on large screens,
 * and search button always inline with input
 * @returns {JSX.Element} Search page with search form, book grid, and pagination
 */
function SearchPage() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [userBooks, setUserBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const maxResults = 15;
  const { token } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Log authentication state, query, and grid layout for debugging
  useEffect(() => {
    console.log("SearchPage auth state:", { isAuthenticated, token });
    console.log("Search query:", searchParams.get("query"));
    console.log("Grid layout:", {
      mobile: "1 col",
      sm: "2 cols",
      md: "3 cols",
      lg: "5 cols",
    });
  }, [isAuthenticated, token, searchParams]);

  // Get initial query and page from URL
  useEffect(() => {
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    setSearchQuery(query);
    setCurrentPage(page);
    if (query) fetchBooks(query, page);
  }, [searchParams]);

  // Fetch user books if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUserBooks([]);
      return;
    }
    const fetchUserBooks = async () => {
      try {
        setIsLoading(true);
        // Use API_BASE_URL here
        const res = await axios.get(`${API_BASE_URL}/api/books/me`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        setUserBooks(res.data || []);
      } catch (error) {
        console.error("Error fetching user books:", error.message);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          dispatch(clearAuth());
          navigate("/login");
        }
        // Skip toast for guests or other errors
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserBooks();
  }, [isAuthenticated, token, dispatch, navigate]);

  const fetchBooks = async (query, page) => {
    try {
      setIsLoading(true);
      const startIndex = (page - 1) * maxResults;
      // Use API_BASE_URL here
      const res = await axios.get(
        `${API_BASE_URL}/api/books/google-books?q=${encodeURIComponent(
          query
        )}&startIndex=${startIndex}&maxResults=${maxResults}`,
        { timeout: 10000 }
      );
      setBooks(res.data.items || []);
      setTotalItems(res.data.totalItems || 0);
    } catch (error) {
      console.error("Error fetching books:", error.message);
      toast.error(
        error.code === "ECONNABORTED"
          ? "Search request timed out. Please try again."
          : "Failed to load books. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserBooks = async () => {
    if (!isAuthenticated) {
      console.log("Skipping updateUserBooks for guest");
      return;
    }
    try {
      // Use API_BASE_URL here
      const res = await axios.get(`${API_BASE_URL}/api/books/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setUserBooks(res.data || []);
    } catch (error) {
      console.error("Error updating user books:", error.message);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        dispatch(clearAuth());
        navigate("/login");
      }
      // Skip toast for guests or other errors
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1);
      setSearchParams({ query: searchQuery.trim(), page: "1" });
      fetchBooks(searchQuery.trim(), 1);
    } else {
      toast.error("Please enter a search term");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalItems / maxResults)) {
      setCurrentPage(newPage);
      setSearchParams({ query: searchQuery, page: newPage.toString() });
      fetchBooks(searchQuery, newPage);
    }
  };

  return (
    <>
      <Navbars />
      <div className='container mx-auto p-4 pt-16'>
        <h2 className='text-2xl font-bold mb-4 text-center'>Search Books</h2>
        <form
          onSubmit={handleSearch}
          className='mb-8 flex flex-nowrap gap-2 w-full max-w-md mx-auto'
        >
          <TextInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search by title, author, or genre...'
            className='w-full max-w-[300px]'
            aria-label='Search books on page'
          />
          <Button
            type='submit'
            disabled={isLoading}
            className='min-w-[100px] hover:bg-blue-600'
            aria-label='Search books'
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </form>
        {isLoading ? (
          <div className='text-gray-600 text-center'>
            <Spinner size='xl' color='info' aria-label='Loading books' />
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
              {books.length > 0 ? (
                books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isAdded={
                      isAuthenticated &&
                      userBooks.some((b) => b.googleVolumeId === book.id)
                    }
                    onUpdateUserBooks={updateUserBooks}
                  />
                ))
              ) : (
                <p className='text-gray-600 text-center'>
                  No books found. Try a different search.
                </p>
              )}
            </div>
            {books.length > 0 && (
              <div className='flex justify-center mt-6 gap-4'>
                <Button
                  color='gray'
                  disabled={currentPage === 1 || isLoading}
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label='Previous page'
                >
                  Previous
                </Button>
                <span className='self-center'>
                  Page {currentPage} of{" "}
                  {Math.ceil(totalItems / maxResults) || 1}
                </span>
                <Button
                  color='gray'
                  disabled={
                    currentPage >= Math.ceil(totalItems / maxResults) ||
                    isLoading
                  }
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-label='Next page'
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default SearchPage;
