import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-hot-toast";

export default function RegisterForm({ onRegister }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDob] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onRegister({
      firstName,
      lastName,
      dateOfBirth,
      username,
      email,
      password,
    });
    if (success) {
      toast.success("Registration successful! Redirecting...");
      navigate("/login"); // Redirect to Login after registration
    } else {
      toast.error("Registration failed. Please try again.");
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
          <label className='block mb-1 font-medium' htmlFor='dob'>
            Date of Birth
          </label>
          <input
            id='dateOfBirth'
            type='date'
            required
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={dateOfBirth}
            onChange={(e) => setDob(e.target.value)}
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
