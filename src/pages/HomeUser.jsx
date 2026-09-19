import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageSEO } from '../components/ui/SEO';
import { useReviews } from '../hooks/useReviews';
import Review from '../components/Review';
import ReviewForm from '../components/ReviewForm';
import Modal from '../components/ui/Modal';
import {
  FiCalendar,
  FiChevronRight,
  FiPlusCircle,
  FiStar,
} from 'react-icons/fi';
import { useAuthContext } from '../hooks/useAuthContext';

const rowClass =
  'flex w-full items-center gap-3.5 bg-white px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800';

export default function HomeUser() {
  const { user } = useAuthContext();
  const { reviews, isPending, error } = useReviews();
  const [reviewOpen, setReviewOpen] = useState(false);

  const hasReviewed = !!reviews?.some((review) => review.userId === user?.uid);

  const actions = [
    {
      to: '/schedule',
      icon: FiCalendar,
      title: 'Your requests',
      subtitle: 'Review, complete or cancel what you have booked',
    },
    {
      to: '/request',
      icon: FiPlusCircle,
      title: 'Book an appointment',
      subtitle: 'Pick a date and a 30-minute slot',
    },
  ];

  return (
    <>
      <PageSEO
        title="Dashboard - Scheduler"
        description="Manage your appointments and schedules"
      />

      <header className="mb-8">
        <p className="eyebrow">Dashboard</p>
        <h1 className="mt-2 text-2xl text-gray-900 dark:text-white">
          Welcome back, {user.displayName}
        </h1>
        <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
          Everything you have booked lives in one place.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.to} to={action.to} className={rowClass}>
              <Icon
                className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  {action.title}
                </span>
                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                  {action.subtitle}
                </span>
              </span>
              <FiChevronRight
                className="h-4 w-4 shrink-0 text-gray-400"
                aria-hidden="true"
              />
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setReviewOpen(true)}
          className={rowClass}
        >
          <FiStar
            className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-gray-900 dark:text-white">
              Leave a review
            </span>
            <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
              {hasReviewed
                ? 'You already reviewed us — thank you'
                : 'Tell others how it went'}
            </span>
          </span>
          {hasReviewed && <span className="chip chip-success">Done</span>}
          <FiChevronRight
            className="h-4 w-4 shrink-0 text-gray-400"
            aria-hidden="true"
          />
        </button>
      </div>

      <section className="mt-12">
        <p className="eyebrow">Reviews</p>
        <h2 className="mt-2 text-xl text-gray-900 dark:text-white">
          From the community
        </h2>

        {isPending && (
          <p className="py-8 text-sm text-gray-500 dark:text-gray-400">
            Loading...
          </p>
        )}
        {error && (
          <p className="py-8 text-sm text-accent-600 dark:text-accent-400">
            {error}
          </p>
        )}
        {reviews && <Review reviews={reviews} />}
      </section>

      {reviewOpen && (
        <Modal title="Leave a review" onClose={() => setReviewOpen(false)}>
          {hasReviewed ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You have already submitted a review. Contact support if you want
              to update it.
            </p>
          ) : (
            <ReviewForm user={user} onClose={() => setReviewOpen(false)} />
          )}
        </Modal>
      )}
    </>
  );
}
