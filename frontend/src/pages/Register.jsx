import { useState } from "react";
import { Link, useNavigate } from "react-router"; // Fixed import
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice"; // Adjust path to your authSlice
import axios from "axios";
import { toast } from "react-toastify";

// Define the API base URL for your backend
// Vite requires environment variables to be prefixed with VITE_
// So, if your Vercel env var is REACT_APP_API_URL, access it as VITE_REACT_APP_API_URL
// Or, rename your Vercel env var to VITE_API_URL and use import.meta.env.VITE_API_URL
const API_BASE_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the dynamically set API_BASE_URL here
      const res = await axios.post(
        `${API_BASE_URL}/api/users/register`,
        {
          firstName,
          lastName,
          dateOfBirth,
          username,
          email,
          password,
        },
        { timeout: 5000 }
      );

      if (res.status === 201) {
        const { token, username } = res.data;
        dispatch(setCredentials({ token, username }));
        localStorage.setItem("token", token); // Store token for persistence
        toast.success(`Welcome, ${username}! Registration successful!`);
        navigate("/login"); // Redirect to login or "/" for auto-login
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data?.error || error.message
      );
      toast.error(
        error.response?.data?.error || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className='max-w-md mx-auto mt-20 p-6 bg-white rounded shadow'>
      <h2 className='text-2xl font-bold mb-6 text-center'>
        Register for BookLab
      </h2>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <label className='block mb-1 font-medium' htmlFor='firstName'>
              First Name
            </label>
            <input
              id='firstName'
              type='text'
              required
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder='John'
            />
          </div>
          <div className='flex-1'>
            <label className='block mb-1 font-medium' htmlFor='lastName'>
              Last Name
            </label>
            <input
              id='lastName'
              type='text'
              required
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder='Doe'
            />
          </div>
        </div>

        <div>
          <label className='block mb-1 font-medium' htmlFor='dateOfBirth'>
            Date of Birth
          </label>
          <input
            id='dateOfBirth'
            type='date'
            required
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <div>
          <label className='block mb-1 font-medium' htmlFor='username'>
            Username
          </label>
          <input
            id='username'
            type='text'
            required
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='johndoe123'
          />
        </div>

        <div>
          <label className='block mb-1 font-medium' htmlFor='email'>
            Email
          </label>
          <input
            id='email'
            type='email'
            required
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='you@example.com'
          />
        </div>

        <div>
          <label className='block mb-1 font-medium' htmlFor='password'>
            Password
          </label>
          <input
            id='password'
            type='password'
            required
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Your password'
          />
        </div>

        <button
          type='submit'
          className='w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition'
        >
          Register
        </button>
      </form>

      <p className='mt-4 text-center text-sm text-gray-600'>
        Already have an account?{" "}
        <Link to='/login' className='text-blue-600 hover:underline'>
          Login here
        </Link>
      </p>

      <p className='mt-2 text-center text-sm text-gray-600'>
        <Link to='/' className='text-blue-600 hover:underline'>
          Back to Home
        </Link>
      </p>
    </div>
  );
}
