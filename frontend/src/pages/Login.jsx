import { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin({ email, password });
    if (success) {
      navigate("/"); // Redirect to Home on success
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className='max-w-md mx-auto mt-20 p-6 bg-white rounded shadow'>
      <h2 className='text-2xl font-bold mb-6 text-center'>Login to BookLab</h2>
      <form onSubmit={handleSubmit} className='space-y-4'>
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
          className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition'
        >
          Log In
        </button>
      </form>
      <p className='mt-4 text-center text-sm text-gray-600'>
        Don't have an account?{" "}
        <Link to='/register' className='text-blue-600 hover:underline'>
          Register here
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
