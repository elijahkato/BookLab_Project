// src/pages/ProfilePage.jsx
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user profile if you have a profile endpoint
    const username = localStorage.getItem("username"); // or call a /me endpoint
    const userId = localStorage.getItem("userId");
    setUser({ username, userId }); // dummy example
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/"); // back to home
  };

  return (
    <div className='p-4 max-w-2xl mx-auto mt-16 text-center'>
      <h1 className='text-3xl font-bold mb-2'>Your Dashboard</h1>
      {user && (
        <p className='text-sm text-gray-600 mb-4'>Welcome, {user.username}!</p>
      )}

      <div className='grid grid-cols-1 gap-4'>
        <button
          onClick={() => navigate("/my-books")}
          className='bg-blue-500 text-white px-4 py-2 rounded'
        >
          View My Books
        </button>
        <button
          onClick={() => navigate("/add-book")}
          className='bg-green-500 text-white px-4 py-2 rounded'
        >
          Add a Book
        </button>
        <button
          onClick={() => navigate("/search")}
          className='bg-yellow-500 text-white px-4 py-2 rounded'
        >
          Search Books
        </button>
        <button
          onClick={handleLogout}
          className='bg-red-500 text-white px-4 py-2 rounded'
        >
          Logout
        </button>
      </div>
    </div>
  );
}
