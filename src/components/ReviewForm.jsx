import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { collection, addDoc } from 'firebase/firestore';
import { projectFirestore } from '../firebase/config';
import { useNotification } from '../context/NotificationContext';

const ReviewForm = ({ user, onClose }) => {
  const { showSuccess, showError } = useNotification();
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      showError('Please enter a review message');
      return;
    }

    if (rating === 0) {
      showError('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the review data
      const reviewData = {
        name: user.displayName,
        message: message.trim(),
        star: rating,
        createdAt: new Date(),
        userId: user.uid,
        photoURL: user.photoURL || null,
      };

      // Add to Firestore
      await addDoc(collection(projectFirestore, 'reviews'), reviewData);

      // Show success message
      showSuccess('Your review has been submitted. Thank you!');

      // Reset form and close
      setMessage('');
      setRating(0);
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      showError('Failed to submit your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <span className="field-label">Rating</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
              aria-pressed={rating === value}
            >
              <FaStar
                className={`h-5 w-5 transition-colors ${
                  value <= (hover || rating)
                    ? 'text-star'
                    : 'text-gray-300 dark:text-gray-700'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {rating > 0 ? `${rating} of 5` : 'Click to rate'}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="review-message" className="field-label">
          Your review
        </label>
        <textarea
          id="review-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your experience..."
          rows="4"
          className="field-area"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="button-outline">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="button">
          {isSubmitting ? 'Submitting...' : 'Submit review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
