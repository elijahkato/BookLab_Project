import { useState, useEffect } from "react";
import axios from "axios";
import Navbars from "../components/Navbars";
import MyCarousel from "../components/MyCarousel";
import BookCard from "../components/BookCard";

function App() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("bestsellers");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/books/search?q=${searchQuery}&maxResults=20`
        );
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, [searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbars onSearch={handleSearch} />
      <div className='pt-16'>
        <MyCarousel />
        <div className='p-4'>
          <p className='text-gray-700 mb-6'>
            Explore our collection of {books.length} books below the carousel.
          </p>
          <div className='flex w-full flex-col'>
            <div className='card bg-base-300 rounded-box grid h-20 place-items-center'>
             
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1'>
            {books.length > 0 ? (
              books.map((book) => <BookCard key={book.id} book={book} />)
            ) : (
              <p className='text-gray-500'>
                No books found. Try a different search!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
