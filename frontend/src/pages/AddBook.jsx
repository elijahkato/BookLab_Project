import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0); // default to 1
  const [tags, setTags] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/books/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          author,
          description,
          rating,
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Book added successfully!");
        navigate("/my-books");
      } else {
        setError(data.error || "Error saving book");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className='p-4 max-w-xl mx-auto mt-16'>
      <h1 className='text-2xl font-bold mb-4'>Add Book Recommendation</h1>

      {error && <div className='text-red-500 mb-2'>{error}</div>}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          className='w-full border p-2'
          placeholder='Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className='w-full border p-2'
          placeholder='Author'
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />

        <textarea
          className='w-full border p-2'
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type='number'
          min={1}
          max={5}
          className='w-full border p-2'
          placeholder='Your Rating (1-5)'
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          required
        />

        <input
          className='w-full border p-2'
          placeholder='Tags (comma-separated)'
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <button
          className='bg-blue-500 text-white px-4 py-2 rounded'
          type='submit'
        >
          Save Book
        </button>
      </form>
    </div>
  );
}
