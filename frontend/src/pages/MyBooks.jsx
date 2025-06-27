// src/pages/MyBooks.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router";
import NavBars from "../components/Navbars";

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMyBooks = async () => {
      const res = await fetch("/api/books/my-books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBooks(data);
    };
    fetchMyBooks();
  }, [token]);

  const updateRating = async (id, rating) => {
    await fetch(`/api/books/my-books/${id}/rating`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating }),
    });
  };

  const updateComment = async (id, comment) => {
    await fetch(`/api/books/my-books/${id}/comment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ comment }),
    });
  };

  const removeBook = async (id) => {
    await fetch(`/api/books/my-books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setBooks((prev) => prev.filter((b) => b._id !== id));
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <NavBars />
      <div className='p-4 max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-4'>My Books</h1>

        <input
          placeholder='Search my books…'
          className='w-full p-2 border mb-4'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredBooks.length === 0 ? (
          <div className='text-center text-gray-500'>No books found.</div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2'>
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                className='bg-white border rounded p-4 flex gap-4 shadow-sm'
              >
                {book.thumbnail && (
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className='w-24 h-32 object-cover rounded'
                  />
                )}
                <div className='flex-1'>
                  <h2 className='font-semibold text-lg'>{book.title}</h2>
                  <p className='text-sm text-gray-600'>by {book.author}</p>

                  <div className='mt-2'>
                    <label className='block text-sm'>Your Rating</label>
                    <input
                      type='number'
                      min={1}
                      max={5}
                      className='w-16 border p-1'
                      defaultValue={
                        book.ratings.find(
                          (r) => r.userId === localStorage.getItem("userId")
                        )?.rating || ""
                      }
                      onBlur={(e) => updateRating(book._id, e.target.value)}
                    />
                  </div>

                  <div className='mt-2'>
                    <label className='block text-sm'>Your Comment</label>
                    <textarea
                      className='w-full border p-1'
                      defaultValue={
                        book.comments.find(
                          (c) => c.userId === localStorage.getItem("userId")
                        )?.comment || ""
                      }
                      onBlur={(e) => updateComment(book._id, e.target.value)}
                    />
                  </div>

                  <Link
                    to={`/books/${book._id}`}
                    className='text-blue-500 text-sm mt-2 block'
                  >
                    More Details
                  </Link>

                  <button
                    onClick={() => removeBook(book._id)}
                    className='text-red-500 text-sm mt-2'
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
