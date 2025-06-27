import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query") || "";
    setQuery(q);
    if (q) searchBooks(q);
  }, [location]);

  const searchBooks = async (q) => {
    try {
      setError(null);
      const res = await fetch(`/api/books/search?query=${q}`);
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const addToMyBooks = async (book) => {
    try {
      await fetch(`/api/books/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(book),
      });
      alert(`Added "${book.title}" to My Books`);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className='p-4 max-w-4xl mx-auto mt-16'>
      <h1 className='text-2xl font-bold mb-4'>Search Books</h1>

      <form
        className='flex gap-2 mb-4'
        onSubmit={(e) => {
          e.preventDefault();
          searchBooks(query);
        }}
      >
        <input
          className='flex-1 border p-2'
          placeholder='Search by title, author, genre…'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className='bg-blue-500 text-white px-4 py-2 rounded'
          type='submit'
        >
          Search
        </button>
      </form>

      {error && <div className='text-red-500 mb-2'>{error}</div>}

      <div className='grid gap-4 md:grid-cols-2'>
        {books.map((book) => (
          <div key={book.title} className='border p-4 flex gap-4'>
            {book.thumbnail && (
              <img
                src={book.thumbnail}
                alt={book.title}
                className='w-24 h-32 object-cover rounded'
              />
            )}
            <div className='flex-1'>
              <h2 className='font-semibold'>{book.title}</h2>
              <p className='text-sm text-gray-600'>
                by {book.authors?.join(", ")}
              </p>
              <button
                onClick={() => addToMyBooks(book)}
                className='bg-green-500 text-white px-3 py-1 mt-2 rounded text-sm'
              >
                Save to My Books
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
