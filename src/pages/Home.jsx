import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { PageSEO } from '../components/ui/SEO';
import { useReviews } from '../hooks/useReviews';
import Review from '../components/Review';
import { getServicesArray } from '../data/servicesData';

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

const STATS = [
  { value: '120k+', label: 'Appointments booked' },
  { value: '4.9', label: 'Average rating' },
  { value: '3 min', label: 'Average booking time' },
];

const STEPS = [
  {
    title: 'Choose a service',
    description: 'Four service lines, each with its own availability.',
  },
  {
    title: 'Pick a slot',
    description: 'Live 30-minute slots. Taken times are greyed out.',
  },
  {
    title: 'Confirm',
    description: 'The request lands in your Requests list instantly.',
  },
];

const Home = () => {
  const { reviews, isPending, error } = useReviews();
  const services = getServicesArray();

  return (
    <>
      <PageSEO
        title="Scheduler - Book Your Service Appointments"
        description="Schedule and manage appointments for health, style, barber, and exercise services with our easy-to-use platform."
      />

      <section className="border-b border-gray-200 py-16 md:py-24 dark:border-gray-800">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Appointment scheduling</p>
          <h1 className="mt-3 text-4xl leading-display text-gray-900 md:text-5xl dark:text-white">
            Book services without the back-and-forth.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
            Pick a date, pick a slot, send the request. Everything you have
            booked stays in one list you control.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <Link to="/signup" className="button">
              Get started
              <FiArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/services" className="button-outline">
              Browse services
            </Link>
          </div>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 sm:grid-cols-3 dark:border-gray-800 dark:bg-gray-800"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white px-5 py-4 dark:bg-gray-900"
            >
              <div className="font-display text-2xl font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="border-b border-gray-200 py-14 dark:border-gray-800">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Services</p>
            <h2 className="mt-2 text-2xl text-gray-900 dark:text-white">
              Four lines, one calendar
            </h2>
          </div>
          <Link
            to="/services"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-500 sm:inline-flex dark:text-primary-400"
          >
            View all
            <FiArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-800 dark:bg-gray-800">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.id} delay={index * 0.05}>
                <Link
                  to={`/services/${service.title.toLowerCase()}`}
                  className="group flex h-full flex-col bg-white p-5 transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  <Icon
                    className="h-5 w-5 text-primary-600 dark:text-primary-400"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {service.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400">
                    Learn more
                    <FiArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="border-b border-gray-200 py-14 dark:border-gray-800">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-2 mb-8 text-2xl text-gray-900 dark:text-white">
          Three steps, no phone calls
        </h2>

        <ol className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-4 py-5 md:items-center"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 font-mono text-xs font-semibold text-gray-600 md:mt-0 dark:bg-gray-800 dark:text-gray-400">
                {index + 1}
              </span>
              <div className="md:flex md:flex-1 md:items-baseline md:gap-6">
                <h3 className="text-base font-semibold text-gray-900 md:w-56 md:shrink-0 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 md:mt-0 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
              <FiCheck
                className="ml-auto hidden h-4 w-4 text-gray-300 md:block dark:text-gray-700"
                aria-hidden="true"
              />
            </li>
          ))}
        </ol>
      </section>

      <section className="border-b border-gray-200 py-14 dark:border-gray-800">
        <p className="eyebrow">Reviews</p>
        <h2 className="mt-2 text-2xl text-gray-900 dark:text-white">
          What people say
        </h2>

        {isPending && (
          <p className="py-8 text-sm text-gray-500 dark:text-gray-400">
            Loading reviews...
          </p>
        )}
        {error && (
          <p className="py-8 text-sm text-accent-600 dark:text-accent-400">
            {error}
          </p>
        )}
        {reviews && <Review reviews={reviews} />}
      </section>

      <section className="py-14">
        <div className="surface flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <h2 className="text-xl text-gray-900 dark:text-white">
              Ready to book?
            </h2>
            <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
              Create an account and schedule your first appointment in minutes.
            </p>
          </div>
          <Link to="/signup" className="button shrink-0">
            Create account
            <FiArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
