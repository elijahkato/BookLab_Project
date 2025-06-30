import { useState, useEffect } from "react";
 import { useParams } from "react-router";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Navbars from "../components/Navbars";
import parse from "html-react-parser";
import { Button } from "flowbite-react";

export default function BookDetails() {
  const { id } = useParams();
  const token =
    useSelector((state) => state.auth.token) || localStorage.getItem("token");
  const isAuthenticated = !!token;

  const [book, setBook] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddedToList, setIsAddedToList] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setLoading(false);
        toast.error("No book ID provided");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:3000/api/books/${id}`, {
          headers: isAuthenticated ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.data || res.data.error) {
          throw new Error("Invalid book data");
        }
        setBook(res.data);
        setIsAddedToList(res.data.isAdded || false);
      } catch (error) {
        console.error("Error fetching book:", error);
        toast.error(
          error.response?.data?.error || "Error fetching book details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, isAuthenticated, token]);

  const handleAddToMyList = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/books/add",
        {
          googleVolumeId: id,
          title: book.volumeInfo?.title || "Untitled",
          author: book.volumeInfo?.authors?.join(", ") || "Unknown",
          publisher: book.volumeInfo?.publisher || "",
          publishedDate: book.volumeInfo?.publishedDate || "",
          thumbnail: book.volumeInfo?.imageLinks?.thumbnail || "",
          genre: book.volumeInfo?.categories?.join(", ") || "",
          description: book.volumeInfo?.description || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${book.volumeInfo.title} added to your list!`);
      setIsAddedToList(true);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error saving book");
    }
  };

  const handleRemoveFromList = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${book.volumeInfo.title} removed from your list`);
      setIsAddedToList(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error removing book");
    }
  };

  const handleAddCommentAndRating = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && newRating === 0) {
      return toast.error("Please enter a comment or rating");
    }
    try {
      await axios.post(
        "http://localhost:3000/api/books/add",
        {
          googleVolumeId: id,
          title: book.volumeInfo?.title || "Untitled",
          author: book.volumeInfo?.authors?.join(", ") || "Unknown",
          publisher: book.volumeInfo?.publisher || "",
          publishedDate: book.volumeInfo?.publishedDate || "",
          thumbnail: book.volumeInfo?.imageLinks?.thumbnail || "",
          genre: book.volumeInfo?.categories?.join(", ") || "",
          description: book.volumeInfo?.description || "",
          rating: newRating,
          comment: newComment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Your rating and comment were saved!");
      setNewRating(0);
      setNewComment("");
      const updated = await axios.get(`http://localhost:3000/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBook({ ...updated.data, comments: updated.data.comments || [] });
      setIsAddedToList(updated.data.isAdded || false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error saving comment/rating");
    }
  };

  if (loading) {
    return (
      <>
        <Navbars />
        <div className='p-4 text-center'>Loading book details...</div>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Navbars />
        <div className='p-4 text-center text-red-500'>Book not found</div>
      </>
    );
  }

  const volume = book.volumeInfo || book;

  return (
    <>
      <Navbars />
      <div className='p-6 max-w-4xl mx-auto mt-24 bg-white shadow rounded'>
        <div className='flex flex-col md:flex-row gap-6'>
          <img
            src={
             volume?.imageLinks?.thumbnail ||
              "https://via.placeholder.com/200x300?text=No+Cover"
            }
            className='w-48 h-64 object-contain rounded'
            alt={volume.title}
          />
          <div className='flex-1'>
            <h1 className='text-3xl font-bold mb-2'>{volume.title}</h1>
            <p className='text-gray-700 mb-1'>
              by {volume.authors?.join(", ") || book.author || "Unknown"}
            </p>
            <p className='text-gray-500 mb-2'>
              Published: {volume.publishedDate || "N/A"}
            </p>
            <p className='text-sm text-gray-700 pb-1.5'>
              Genre: {volume.categories?.join(", ") || book.genre || "Unknown"}
            </p>
            {isAuthenticated && (
              <div className='flex gap-2 mb-4'>
                <Button
                  color={isAddedToList ? "red" : "blue"}
                  onClick={
                    isAddedToList ? handleRemoveFromList : handleAddToMyList
                  }
                >
                  {isAddedToList ? "Remove from My List ❌" : "Add to My List"}
                </Button>
              </div>
            )}
            <p className='text-sm text-gray-600 mb-4'>
              {parse(book.volumeInfo?.description)}
            </p>
            <p className='text-sm text-yellow-500'>
              Average Rating:{" "}
              {book.averageRating
                ? "★".repeat(Math.round(book.averageRating)) +
                  "☆".repeat(5 - Math.round(book.averageRating))
                : "No rating"}
            </p>
          </div>
        </div>
        <hr className='my-6' />
        <h2 className='text-xl font-semibold mb-2'>Comments & Ratings</h2>
        {book.comments?.length > 0 ? (
          <ul className='mb-4 space-y-2'>
            {book.comments.map((c, index) => (
              <li
                key={index}
                className='bg-blue-50 p-2 rounded border border-blue-100'
              >
                <strong>{c.username}:</strong> {c.comment}
              </li>
            ))}
          </ul>
        ) : (
          <p className='text-sm text-gray-500 mb-4'>No comments yet</p>
        )}
        {isAuthenticated ? (
          <form onSubmit={handleAddCommentAndRating} className='space-y-4'>
            <div>
              <label className='block mb-1 font-medium'>
                Your Rating (1-5)
              </label>
              <input
                type='number'
                min={1}
                max={5}
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className='w-20 border rounded px-2 py-1'
              />
            </div>
            <div>
              <label className='block mb-1 font-medium'>Your Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className='w-full border rounded p-2'
                placeholder='Share your thoughts about this book...'
              ></textarea>
            </div>
            <button
              type='submit'
              className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
            >
              Submit
            </button>
          </form>
        ) : (
          <p className='text-sm text-center text-gray-500 mt-4'>
            Log in to leave a rating or comment
          </p>
        )}
      </div>
    </>
  );
}
