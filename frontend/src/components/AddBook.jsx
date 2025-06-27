// src/pages/AddBook.jsx
import { useState } from "react";

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      author,
      description,
      rating: Number(rating),
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    };

    const res = await fetch("/api/books/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Book added successfully!`);
      setTitle("");
      setAuthor("");
      setDescription("");
      setRating(0);
      setTags("");
    } else {
      alert(`Error: ${data.error}`);
    }
  };

  return (
    <div className='max-w-xl mx-auto p-4'>
      <h1 className='text-2xl font-semibold mb-4'>Add Book Recommendation</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block mb-1'>Title*</label>
          <input
            className='w-full border p-2'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className='block mb-1'>Author*</label>
          <input
            className='w-full border p-2'
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>
        <div>
          <label className='block mb-1'>Description</label>
          <textarea
            className='w-full border p-2'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className='block mb-1'>Your Rating (1–5)</label>
          <input
            type='number'
            min={1}
            max={5}
            className='w-full border p-2'
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>
        <div>
          <label className='block mb-1'>Tags (comma-separated)</label>
          <input
            className='w-full border p-2'
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder='e.g. fiction, mystery'
          />
        </div>
        <button
          className='bg-blue-500 text-white px-4 py-2 rounded'
          type='submit'
        >
          Add Book
        </button>
      </form>
    </div>
  );
}
