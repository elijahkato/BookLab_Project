import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "../store/authSlice";
import { toast } from "react-toastify";

/**
 * Navbar component with responsive design, collapsing all items except logo and search on mobile/tablet,
 * with search bar fixed beside logo on medium screens and category links redirecting to search page
 * @returns {JSX.Element} Navbar with search, auth buttons, and navigation links
 */
export default function Navbars() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username } = useSelector((state) => state.auth);
  const isAuthenticated = !!username;
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage mobile menu open/close

  // Log auth state and navigation for debugging
  useEffect(() => {
    console.log("Navbar auth state:", { isAuthenticated, username });
  }, [isAuthenticated, username]);

  const handleLogout = () => {
    dispatch(clearAuth());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log("Search initiated:", searchTerm);
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsMenuOpen(false); // Close menu after search
    } else {
      toast.error("Please enter a search term");
    }
  };

  const handleCategoryClick = (category) => {
    console.log(`Category link clicked: /search?query=${category}`);
    navigate(`/search?query=${encodeURIComponent(category)}`);
    setIsMenuOpen(false); // Close menu after category click
  };

  const NavLink = ({ to, onClick, children }) => {
    // MODIFIED: Added md:text-sm to shrink text from medium screens up,
    // and lg:text-base to return to default size on large screens.
    const commonClasses =
      "block py-2 px-3 text-white hover:text-blue-300 md:p-0 md:text-sm lg:text-base";
    const activeClasses = "text-blue-300 font-semibold";
    const isActive = to && window.location.pathname === to;

    if (to) {
      return (
        <Link
          to={to}
          onClick={() => setIsMenuOpen(false)}
          className={`${commonClasses} ${isActive ? activeClasses : ""}`}
        >
          {children}
        </Link>
      );
    } else {
      return (
        <button
          onClick={() => {
            onClick();
            setIsMenuOpen(false);
          }}
          className={`${commonClasses} text-left w-full`}
        >
          {children}
        </button>
      );
    }
  };

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-blue-800 shadow-lg'>
      <div className='container mx-auto px-4 py-3 flex flex-wrap items-center justify-between'>
        {/* Logo (left) */}
        <Link to='/' className='flex items-center flex-shrink-0'>
          <span className='self-center text-xl font-semibold whitespace-nowrap text-white'>
            BOOKLAB
          </span>
        </Link>

        {/* Mobile Menu Toggle (right on mobile, hidden on larger screens) */}
        <div className='flex items-center space-x-3 md:hidden'>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type='button'
            className='inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
            aria-controls='navbar-links'
            aria-expanded={isMenuOpen}
          >
            <span className='sr-only'>Open main menu</span>
            <svg
              className='w-5 h-5'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 17 14'
            >
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M1 1h15M1 7h15M1 13h15'
              />
            </svg>
          </button>
        </div>

        {/* Collapsible Content */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } w-full md:block md:w-auto md:flex md:items-center md:ml-auto mt-4 md:mt-0`}
          id='navbar-links'
        >
          {/* Navigation Links and Auth Buttons (Extreme Right on Larger Screens) */}
          <ul className='flex flex-col md:flex-row md:space-x-8 md:mt-0 md:border-0 rounded-lg bg-blue-700 md:bg-transparent p-4 md:p-0'>
            <li>
              <NavLink to='/'>New Books</NavLink>
            </li>
            <li>
              <NavLink onClick={() => handleCategoryClick("fiction")}>
                Fiction
              </NavLink>
            </li>
            <li>
              <NavLink onClick={() => handleCategoryClick("non-fiction")}>
                Non-Fiction
              </NavLink>
            </li>
            {isAuthenticated && (
              <li>
                <NavLink to='/my-books'>My Books</NavLink>
              </li>
            )}
            {/* Auth buttons for mobile only, shown inside collapsible menu */}
            <li className='md:hidden'>
              {isAuthenticated ? (
                <div className='flex flex-col items-start gap-2 mt-4 pt-4 border-t border-blue-600'>
                  <span className='text-white text-sm truncate max-w-[120px]'>
                    Welcome, {username}!
                  </span>
                  <div className='flex items-center gap-2'>
                    <img
                      src='/images/avatar.png'
                      alt='Profile'
                      className='w-8 h-8 rounded-full border border-white'
                    />
                    <button
                      onClick={handleLogout}
                      className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200 text-sm' // MODIFIED: Added text-sm
                      aria-label='Log out'
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-start gap-2 mt-4 pt-4 border-t border-blue-600'>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 text-sm' // MODIFIED: Added text-sm
                    aria-label='Sign in'
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate("/register");
                      setIsMenuOpen(false);
                    }}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 text-sm' // MODIFIED: Added text-sm
                    aria-label='Sign up'
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </li>
          </ul>

          {/* Search Bar (below links on mobile, in middle on larger screens) */}
          <div className='flex-grow flex justify-center w-full md:w-auto md:ml-0 mt-4 md:mt-0'>
            <form
              onSubmit={handleSearch}
              className='flex items-center gap-2 max-w-lg w-full px-4'
            >
              <input
                type='text'
                placeholder='Search by title, author, or genre'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-blue-100 text-sm' // MODIFIED: Added text-sm
                aria-label='Search books'
              />
              <button
                type='submit'
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 text-sm' // MODIFIED: Added text-sm
                aria-label='Search'
              >
                Search
              </button>
            </form>
          </div>

          {/* Auth buttons for larger screens (pushed to the right) */}
          <div className='hidden md:flex items-center gap-2 md:ml-8'>
            {isAuthenticated ? (
              <div className='flex items-center gap-2'>
                <span className='text-white md:text-sm truncate max-w-[120px]'>
                  Welcome, {username}!
                </span>
                <img
                  src='/images/avatar.png'
                  alt='Profile'
                  className='w-8 h-8 rounded-full border border-white'
                />
                <button
                  onClick={handleLogout}
                  className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200 md:text-sm' // MODIFIED: Added md:text-sm
                  aria-label='Log out'
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => navigate("/login")}
                  className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 md:text-sm' // MODIFIED: Added md:text-sm
                  aria-label='Sign in'
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 md:text-sm' // MODIFIED: Added md:text-sm
                  aria-label='Sign up'
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
