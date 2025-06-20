import { Card, Button } from "flowbite-react";

function BookCard({ book }) {
  // Truncate description to 100 characters
  const truncatedDescription =
    book.description.length > 100
      ? `${book.description.slice(0, 100)}...`
      : book.description;

  // Render rating as stars (e.g., 4.5 => ★★★★☆)
  const renderRating = (rating) => {
    if (rating === "No rating") return rating;
    const stars = Math.round(rating);
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };

  return (
    <Card className='max-w-sm mx-auto'>
      <img
        src={book.thumbnail}
        alt={`${book.title} cover`}
        className='w-full h-48 object-cover mb-4 rounded-lg'
      />
      <h5 className='text-xl font-semibold tracking-tight text-gray-900 dark:text-white truncate'>
        {book.title}
      </h5>
      <p className='text-sm text-gray-700 dark:text-gray-400'>
        by {book.author}
      </p>
      <p className='text-sm text-yellow-500'>
        Rating: {renderRating(book.rating)}
      </p>
      <p className='text-sm text-gray-600 dark:text-gray-400'>
        Published: {book.publishedDate}
      </p>
      <p className='text-sm text-gray-700 dark:text-gray-400 mb-2'>
        {truncatedDescription}
      </p>
      <Button
        color='blue'
        className='mt-2'
        onClick={() => alert(`View details for ${book.title}`)}
      >
        View Details
      </Button>
    </Card>
  );
}

export default BookCard;
