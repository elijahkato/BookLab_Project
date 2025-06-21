// src/components/BookList.jsx
import { useState, useEffect, useContext } from "react";
import BookCard from "./BookCard";
import { Spinner } from "flowbite-react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

function BookList({ apiUrl, useUserData = false }) {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        let response;
        if (useUserData && user) {
          response = await axios.get("/api/liked-books", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setBooks(response.data.books || []);
          setLikedBooks(new Set(response.data.books.map((book) => book.id)));
        } else {
          response = await fetch(
            apiUrl ||
              "https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=relevance&maxResults=20"
          );
          if (!response.ok) throw new Error("Failed to fetch books");
          const data = await response.json();
          setBooks(data.items || []);
          if (user) {
            const likedResponse = await axios.get("/api/liked-books", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            setLikedBooks(
              new Set(likedResponse.data.books.map((book) => book.id))
            );
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchBooks();
  }, [apiUrl, useUserData, user]);

  const handleLikeToggle = (bookId, isLiked) => {
    setLikedBooks((prev) => {
      const newSet = new Set(prev);
      if (isLiked) newSet.add(bookId);
      else newSet.delete(bookId);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className='text-center py-8'>
        <Spinner size='xl' />
        <p className='mt-2'>Loading books...</p>
      </div>
    );
  }

  if (error) {
    return <div className='text-center py-8 text-red-500'>Error: {error}</div>;
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4'>
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          isLiked={likedBooks.has(book.id)}
          onLikeToggle={handleLikeToggle}
        />
      ))}
    </div>
  );
}

export default BookList;
