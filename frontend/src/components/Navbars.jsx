import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

export default function Navbars() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get auth info
  const username = useSelector((state) => state.auth.username);
  const isAuthenticated = !!username;

  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // Redirect to home
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate(`/search?query=${searchTerm}`);
  };

  return (
    <Navbar fluid className='fixed top-0 left-0 right-0 z-50 bg-blue-500'>
      <NavbarBrand as={Link} to='/'>
        <span className='self-center mx-2 whitespace-nowrap text-xl font-semibold text-white'>
          BOOKLAB
        </span>
      </NavbarBrand>

      <div className='flex md:order-2 gap-2 items-center'>
        <form onSubmit={handleSearch} className='flex gap-1'>
          <TextInput
            placeholder='Search'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button size='xs' type='submit'>
            Go
          </Button>
        </form>

        {isAuthenticated ? (
          <div className='flex items-center gap-2'>
            <span className='text-white'>Welcome, {username}!</span>
            <img
              src='/images/avatar.png'
              alt='Profile'
              className='w-8 h-8 rounded-full border border-white'
            />
            <Button color='gray' size='xs' onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <div className='flex gap-2'>
            <Button size='xs' onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button size='xs' onClick={() => navigate("/register")}>
              Sign Up
            </Button>
          </div>
        )}
        <NavbarToggle />
      </div>

      <NavbarCollapse>
        <NavbarLink as={Link} to='/' active>
          New Books
        </NavbarLink>
        <NavbarLink as={Link} to='/recommendations'>
          Recommendations
        </NavbarLink>
        <NavbarLink as={Link} to='/fiction'>
          Fiction
        </NavbarLink>
        <NavbarLink as={Link} to='/non-fiction'>
          Non-Fiction
        </NavbarLink>
        {isAuthenticated && (
          <NavbarLink as={Link} to='/my-books'>
            My Books
          </NavbarLink>
        )}
      </NavbarCollapse>
    </Navbar>
  );
}
