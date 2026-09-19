import { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PER_PAGE = 3;

const formatDate = (timestamp) =>
  timestamp
    ? timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'No date';

const StarRating = ({ rating }) => {
  const value = Number(rating) || 0;

  return (
    <div className="flex gap-0.5" role="img" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) =>
        star <= value ? (
          <FaStar key={star} className="h-3 w-3 text-star" />
        ) : (
          <FaRegStar
            key={star}
            className="h-3 w-3 text-gray-300 dark:text-gray-700"
          />
        ),
      )}
    </div>
  );
};

export default function Review({ reviews }) {
  const [page, setPage] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const totalPages = Math.max(1, Math.ceil(reviews.length / PER_PAGE));

  useEffect(() => {
    if (!autoplay || totalPages < 2) return;

    const interval = setInterval(
      () => setPage((current) => (current + 1) % totalPages),
      6000,
    );

    return () => clearInterval(interval);
  }, [autoplay, totalPages]);

  if (!reviews || reviews.length === 0) {
    return (
      <p className="py-8 text-sm text-gray-500 dark:text-gray-400">
        No reviews yet.
      </p>
    );
  }

  const goTo = (next) => {
    setAutoplay(false);
    setPage((next + totalPages) % totalPages);
  };

  const pageKeys = Array.from(
    { length: totalPages },
    (_, index) => reviews[index * PER_PAGE].id,
  );

  const visible = reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 md:grid-cols-3 dark:border-gray-800 dark:bg-gray-800">
        {visible.map((review) => (
          <figure
            key={review.id}
            className="flex flex-col bg-white p-5 dark:bg-gray-900"
          >
            <StarRating rating={review.star} />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {review.message || 'No review content.'}
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-2.5 border-t border-gray-100 pt-4 dark:border-gray-800">
              <img
                src={
                  review.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    review.name || 'User',
                  )}&background=random`
                }
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {review.name || 'Anonymous'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {formatDate(review.createdAt)}
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {pageKeys.map((key, index) => (
              <button
                type="button"
                key={key}
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition-all ${
                  page === index
                    ? 'w-5 bg-primary-600 dark:bg-primary-400'
                    : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              className="button-ghost px-1.5"
              aria-label="Previous reviews"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              className="button-ghost px-1.5"
              aria-label="Next reviews"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
