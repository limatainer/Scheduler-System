import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { FiArrowRight, FiCalendar, FiClock, FiStar } from 'react-icons/fi';
import { PageSEO } from '../components/ui/SEO';
import { useReviews } from '../hooks/useReviews';
import Review from '../components/Review';
import { getServicesArray } from '../data/servicesData';

// Shared spring used for the natural, fluid feel
const SPRING = { type: 'spring', stiffness: 90, damping: 18 };

// Static page background - sits fixed behind all content
const PageBackground = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
  />
);

// Animated gradient text used in headlines
const GradientText = ({ children, className = '' }) => (
  <span
    className={`bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent dark:from-primary-300 dark:via-secondary-300 dark:to-accent-300 ${className}`}
  >
    {children}
  </span>
);

const ServiceCard = ({ icon: Icon, title, description, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotateX: -12 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ...SPRING }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="group relative flex flex-col items-center rounded-2xl border border-white/40 bg-white/60 p-7 text-center shadow-xl backdrop-blur-xl transition-shadow hover:shadow-2xl dark:border-white/10 dark:bg-white/5"
    >
      <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br from-primary-500/0 via-secondary-500/0 to-accent-500/0 opacity-0 transition-opacity duration-500 group-hover:from-primary-500/20 group-hover:to-accent-500/20 group-hover:opacity-100" />
      <motion.div
        initial={{ scale: 0.8 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{
          delay: index * 0.12 + 0.2,
          type: 'spring',
          stiffness: 200,
        }}
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30"
      >
        <Icon className="h-8 w-8" aria-hidden="true" />
      </motion.div>
      <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
      <Link
        to={`/services/${title.toLowerCase()}`}
        className="mt-4 inline-flex items-center font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
      >
        Learn more
        <FiArrowRight
          className="ml-1 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
};

const Home = () => {
  const { reviews: reviewsData, isPending, error } = useReviews();
  const prefersReduced = useReducedMotion();

  // Hero scroll-linked parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(
    heroProgress,
    [0, 1],
    [0, prefersReduced ? 0 : 160],
  );
  const heroOpacity = useTransform(
    heroProgress,
    [0, 0.7],
    [1, prefersReduced ? 1 : 0],
  );
  const heroScale = useTransform(
    heroProgress,
    [0, 1],
    [1, prefersReduced ? 1 : 1.08],
  );

  // "How it works" connecting line that draws with scroll
  const stepsRef = useRef(null);
  const { scrollYProgress: stepsProgress } = useScroll({
    target: stepsRef,
    offset: ['start 75%', 'end 50%'],
  });
  const lineScale = useTransform(stepsProgress, [0, 1], [0, 1]);

  const services = getServicesArray();

  const stats = [
    { icon: FiCalendar, value: '120k+', label: 'Appointments booked' },
    { icon: FiStar, value: '4.9', label: 'Average rating' },
    { icon: FiClock, value: '3 min', label: 'Average booking time' },
  ];

  const steps = [
    {
      step: '1',
      title: 'Choose a Service',
      description:
        'Browse through our services and select the one that meets your needs',
    },
    {
      step: '2',
      title: 'Select a Time',
      description: 'Pick a convenient date and time from the available slots',
    },
    {
      step: '3',
      title: 'Confirm Booking',
      description: 'Complete your booking and receive instant confirmation',
    },
  ];

  return (
    <>
      <PageSEO
        title="Scheduler - Book Your Service Appointments"
        description="Schedule and manage appointments for health, style, barber, and exercise services with our easy-to-use platform."
      />

      <PageBackground />

      <div className="container relative mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative mb-32 grid min-h-[78vh] grid-cols-1 items-center gap-16 pt-8 md:grid-cols-2"
        >
          <div className="flex flex-col justify-center">
            <motion.span
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary-200 bg-white/70 px-4 py-1.5 text-sm font-semibold text-primary-700 shadow-sm backdrop-blur dark:border-primary-700/60 dark:bg-white/5 dark:text-primary-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
              </span>
              Simplify Your Scheduling
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ...SPRING }}
              className="mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 dark:text-white md:text-6xl lg:text-7xl"
            >
              Book Services <GradientText>Effortlessly</GradientText>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-9 max-w-xl text-xl leading-relaxed text-gray-600 dark:text-gray-300"
            >
              Save time and reduce stress with our intuitive appointment
              scheduling platform. Book professionals in just a few clicks.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING}
              >
                <Link
                  to="/signup"
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 px-7 py-3.5 font-semibold text-white shadow-xl shadow-primary-500/30 transition-all hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:from-primary-500 dark:to-secondary-500 dark:focus:ring-primary-800"
                >
                  Get Started
                  <FiArrowRight className="ml-2" aria-hidden="true" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING}
              >
                <Link
                  to="/services"
                  className="inline-flex items-center rounded-xl border border-gray-300 bg-white/70 px-7 py-3.5 font-semibold text-gray-700 backdrop-blur transition-all hover:bg-white focus:outline-none focus:ring-4 focus:ring-primary-300 dark:border-gray-600 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10 dark:focus:ring-primary-800"
                >
                  Browse Services
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Floating glass stat cards */}
          <div className="relative hidden md:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ...SPRING }}
              className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 blur-2xl" />
              <div className="absolute inset-6 rounded-full border border-dashed border-primary-300/50 dark:border-primary-500/30" />
              <motion.div
                className="absolute h-24 w-24 rounded-full bg-primary-200/40 blur-xl dark:bg-primary-500/30"
                animate={prefersReduced ? undefined : { rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                style={{ top: '8%', left: '12%' }}
              />
              {stats.map((s, i) => {
                const positions = [
                  'top-2 left-0',
                  'bottom-10 right-0',
                  'bottom-0 left-10',
                ];
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.4 + i * 0.15,
                      ...SPRING,
                    }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className={`absolute ${positions[i]} flex w-44 items-center gap-3 rounded-2xl border border-white/50 bg-white/70 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/10`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                      <s.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {s.value}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {s.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Scroll cue */}
          {!prefersReduced && (
            <motion.div
              className="absolute bottom-2 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-gray-400/60 p-1 dark:border-gray-500/60">
                <div className="h-2 w-1 rounded-full bg-gray-400 dark:bg-gray-500" />
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* Services Section */}
        <section className="mb-32">
          <div className="mb-14 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl"
            >
              Our <GradientText>Services</GradientText>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300"
            >
              Choose from our wide range of professional services designed to
              meet your needs
            </motion.p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                index={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section ref={stepsRef} className="relative mb-32">
          <div className="mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl"
            >
              How It <GradientText>Works</GradientText>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300"
            >
              Book your appointment in three simple steps
            </motion.p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            {/* connecting line drawn by scroll */}
            <div className="absolute left-1/2 top-6 hidden h-[calc(100%-3rem)] w-1 -translate-x-1/2 rounded-full bg-gray-200 dark:bg-gray-700 md:block">
              <motion.div
                className="h-full w-full origin-top rounded-full bg-gradient-to-b from-primary-500 via-secondary-500 to-accent-500"
                style={{ scaleY: prefersReduced ? 1 : lineScale }}
              />
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {steps.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: index * 0.12, ...SPRING }}
                  className="group relative flex flex-col items-center text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 6 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-2xl font-bold text-white shadow-xl shadow-primary-500/30"
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Real Reviews Section using your existing Review component */}
        <section className="mb-32">
          <div className="mb-14 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl"
            >
              What Our Users <GradientText>Say</GradientText>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300"
            >
              Read real feedback from our community
            </motion.p>
          </div>

          {isPending && (
            <div className="p-4 m-4 text-center text-primary-600 dark:text-primary-400">
              Loading reviews...
            </div>
          )}
          {error && (
            <div className="p-4 m-4 text-center text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {reviewsData && <Review reviews={reviewsData} />}
        </section>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ...SPRING }}
          className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 p-10 text-center shadow-2xl dark:border-white/10 md:p-16"
        >
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={
              prefersReduced
                ? undefined
                : {
                    background: [
                      'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25) 0%, transparent 40%)',
                      'radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25) 0%, transparent 40%)',
                      'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25) 0%, transparent 40%)',
                    ],
                  }
            }
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 text-3xl font-bold text-white md:text-5xl"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-9 max-w-2xl text-xl text-white/90"
            >
              Join thousands of satisfied users who have simplified their
              scheduling process
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING}
            >
              <Link
                to="/signup"
                className="inline-flex items-center rounded-xl bg-white px-7 py-3.5 font-semibold text-primary-700 shadow-xl transition-all hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-white/50"
              >
                Create Your Account
                <FiArrowRight className="ml-2" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Home;
