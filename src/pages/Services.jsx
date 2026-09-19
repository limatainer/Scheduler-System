import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronUp,
  FiStar,
  FiUser,
} from 'react-icons/fi';
import { PageSEO } from '../components/ui/SEO';
import { getServicesArray, getServiceById } from '../data/servicesData';

const ServiceDetails = () => {
  const { serviceId } = useParams();
  const [activeFaq, setActiveFaq] = useState(null);

  const service = getServiceById(serviceId);

  if (!serviceId || !service) {
    return <Navigate to="/services" />;
  }

  const ServiceIcon = service.icon;

  return (
    <>
      <PageSEO
        title={`${service.title} - Scheduler`}
        description={service.description}
      />

      <div className="py-10 md:py-14">
        <Link to="/services" className="button-ghost -ml-2.5 mb-6">
          <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
          All services
        </Link>

        <header className="border-b border-gray-200 pb-10 dark:border-gray-800">
          <ServiceIcon
            className="h-5 w-5 text-primary-600 dark:text-primary-400"
            aria-hidden="true"
          />
          <h1 className="mt-4 max-w-2xl text-3xl leading-tight text-gray-900 md:text-4xl dark:text-white">
            {service.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
            {service.longDescription}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link to="/request" className="button">
              <FiCalendar className="h-4 w-4" aria-hidden="true" />
              Book this service
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              From {service.pricing[0].price}
            </span>
          </div>
        </header>

        <section className="border-b border-gray-200 py-10 dark:border-gray-800">
          <p className="eyebrow">Benefits</p>
          <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {service.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
              >
                <FiCheck
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-400"
                  aria-hidden="true"
                />
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-gray-200 py-10 dark:border-gray-800">
          <p className="eyebrow">Pricing</p>
          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th
                  scope="col"
                  className="py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-500"
                >
                  Service
                </th>
                <th
                  scope="col"
                  className="py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-500"
                >
                  Duration
                </th>
                <th
                  scope="col"
                  className="py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-500"
                >
                  Price
                </th>
                <th scope="col" className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {service.pricing.map((item) => (
                <tr key={item.name}>
                  <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="py-3 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {item.duration}
                  </td>
                  <td className="py-3 text-right tabular-nums text-gray-900 dark:text-gray-100">
                    {item.price}
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <Link
                      to="/request"
                      className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                    >
                      Book
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="border-b border-gray-200 py-10 dark:border-gray-800">
          <p className="eyebrow">Professionals</p>
          <ul className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 sm:grid-cols-3 dark:border-gray-800 dark:bg-gray-800">
            {service.professionals.map((pro) => (
              <li
                key={pro.name}
                className="flex flex-col bg-white p-4 dark:bg-gray-900"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <FiUser
                      className="h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {pro.name}
                    </div>
                    <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {pro.specialty}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <FiStar
                      className="h-3 w-3 fill-current text-star"
                      aria-hidden="true"
                    />
                    {pro.rating}
                  </span>
                  <Link
                    to="/request"
                    className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Book
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-gray-200 py-10 dark:border-gray-800">
          <p className="eyebrow">FAQs</p>
          <div className="mt-5 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {service.faqs.map((faq) => (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() =>
                    setActiveFaq(
                      activeFaq === faq.question ? null : faq.question,
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 py-3.5 text-left"
                  aria-expanded={activeFaq === faq.question}
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  {activeFaq === faq.question ? (
                    <FiChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                  ) : (
                    <FiChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                  )}
                </button>
                {activeFaq === faq.question && (
                  <p className="pb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="surface flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg text-gray-900 dark:text-white">
                Ready to book?
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Pick a date and a slot that fits your week.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link to="/request" className="button">
                Book now
              </Link>
              <Link to="/services" className="button-outline">
                Other services
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

const Services = () => {
  const { serviceId } = useParams();

  if (serviceId) {
    return <ServiceDetails />;
  }

  const allServices = getServicesArray();

  return (
    <>
      <PageSEO
        title="Our Services - Scheduler"
        description="Explore our range of professional services including health, style, barber, and exercise services."
      />

      <div className="py-10 md:py-14">
        <header className="mb-8">
          <p className="eyebrow">Catalog</p>
          <h1 className="mt-2 text-2xl text-gray-900 md:text-3xl dark:text-white">
            Services
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-gray-600 dark:text-gray-400">
            Four service lines, each with its own professionals, pricing and
            availability.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 md:grid-cols-2 dark:border-gray-800 dark:bg-gray-800">
          {allServices.map((service) => {
            const ServiceIcon = service.icon;

            return (
              <article
                key={service.id}
                className="flex flex-col bg-white p-5 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <ServiceIcon
                      className="h-4 w-4 text-primary-600 dark:text-primary-400"
                      aria-hidden="true"
                    />
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      {service.title}
                    </h2>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    from {service.pricing[0].price}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {service.description}
                </p>

                <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {service.benefits.slice(0, 4).map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                    >
                      <FiCheck
                        className="mt-0.5 h-3 w-3 shrink-0 text-primary-600 dark:text-primary-400"
                        aria-hidden="true"
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                  <Link
                    to={`/services/${service.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Details
                    <FiArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                  <Link to="/request" className="button-outline button-sm">
                    Book
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="surface mt-10 flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg text-gray-900 dark:text-white">
              Ready to book a service?
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Slots run every 30 minutes between 7:00 and 20:00.
            </p>
          </div>
          <Link to="/request" className="button shrink-0">
            <FiCalendar className="h-4 w-4" aria-hidden="true" />
            Book an appointment
          </Link>
        </div>
      </div>
    </>
  );
};

export default Services;
