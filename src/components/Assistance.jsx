import { useState } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiLifeBuoy,
  FiMail,
  FiPhone,
} from 'react-icons/fi';
import { useNotification } from '../context/NotificationContext';
import { useAuthContext } from '../hooks/useAuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { projectFirestore } from '../firebase/config';

export default function Assistance() {
  const [activeTab, setActiveTab] = useState('contact');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { showSuccess, showError } = useNotification();
  const { user } = useAuthContext();

  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Add to 'faq' collection in Firebase
      await addDoc(collection(projectFirestore, 'faq'), {
        name: user.displayName,
        email: user.email,
        message,
        uid: user.uid,
        createdAt: new Date(),
      });

      showSuccess("Your message has been sent! We'll get back to you soon.");

      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      showError('Failed to send message. Please try again.');
    }
  };

  // FAQ data
  const faqs = [
    {
      question: 'How do I cancel my appointment?',
      answer:
        'You can cancel an appointment by navigating to your schedules page, finding the appointment you wish to cancel, and clicking the delete icon.',
    },
    {
      question: 'Can I reschedule my appointment?',
      answer:
        "To reschedule, you'll need to cancel your current appointment and create a new one with your preferred date and time.",
    },
    {
      question: 'How far in advance can I book?',
      answer:
        'You can book appointments up to 3 months in advance, subject to availability.',
    },
    {
      question: 'What happens if I miss my appointment?',
      answer:
        "If you miss your appointment without prior cancellation, it will be marked as 'Missed'. Please contact support if you need to discuss special circumstances.",
    },
  ];

  return (
    <section className="surface overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
      >
        <span className="flex items-center gap-2.5">
          <FiLifeBuoy className="h-4 w-4 text-gray-400" aria-hidden="true" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Support
          </span>
        </span>
        {isCollapsed ? (
          <FiChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <FiChevronUp className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {!isCollapsed && (
        <div className="border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-4 border-b border-gray-200 px-4 dark:border-gray-800">
            {[
              { id: 'contact', label: 'Contact' },
              { id: 'faq', label: 'FAQs' },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px border-b-2 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-gray-900 dark:border-primary-400 dark:text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'contact' && (
            <div className="grid gap-6 p-4 md:grid-cols-[1fr_260px] md:p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="support-message" className="field-label">
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    className="field-area"
                    placeholder="How can we help?"
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">
                    Sent as {user.displayName} ({user.email})
                  </p>
                </div>

                <button type="submit" className="button">
                  Send message
                </button>
              </form>

              <dl className="space-y-3 text-sm md:border-l md:border-gray-200 md:pl-6 dark:md:border-gray-800">
                <div className="flex items-start gap-2.5">
                  <FiMail
                    className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="field-label mb-0.5">Email</dt>
                    <dd>
                      <a
                        href="mailto:support@scheduler.com"
                        className="text-primary-600 hover:underline dark:text-primary-400"
                      >
                        support@scheduler.com
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <FiPhone
                    className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="field-label mb-0.5">Phone</dt>
                    <dd className="text-gray-700 dark:text-gray-300">
                      <a href="tel:+1234567890" className="hover:underline">
                        +1 (234) 567-890
                      </a>
                      <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-500">
                        Mon-Fri, 9am-5pm EST
                      </span>
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {faqs.map((faq) => (
                <div key={faq.question} className="px-4 py-3.5 md:px-5">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              ))}

              <div className="px-4 py-3.5 text-sm text-gray-500 md:px-5 dark:text-gray-400">
                Still stuck?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                >
                  Send us a message
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
