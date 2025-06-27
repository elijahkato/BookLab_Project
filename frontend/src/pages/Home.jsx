// src/pages/Home.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import Navbars from "../components/Navbars";
import MyCarousel from "../components/MyCarousel";
import BookCard from "../components/BookCard";

export default function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/books/google-books"
        ); // Default (no q param)
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbars />
      <div className='pt-16'>
        <MyCarousel />
        <div className='p-4'>
          <h2 className='text-xl font-semibold mb-6'>Popular Books</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-10'>
            {books.length > 0 ? (
              books.map((book) => <BookCard key={book.id} book={book} />)
            ) : (
              <p className='text-gray-500'>Loading books...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
