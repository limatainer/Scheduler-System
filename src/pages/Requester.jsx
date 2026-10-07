import { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { projectFirestore } from '../firebase/config';
import { bookSlot, getBusySlots } from '../firebase/schedule';
import { useNavigate } from 'react-router-dom';
import {
  FiCalendar,
  FiClock,
  FiInfo,
  FiArrowLeft,
  FiArrowRight,
  FiMessageSquare,
} from 'react-icons/fi';
import { PageSEO } from '../components/ui/SEO';
import { useNotification } from '../context/NotificationContext';

const fullDate = (date) =>
  date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const clockTime = (date) =>
  date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function Requester() {
  // Hooks
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  // State variables
  const [currentStep, setCurrentStep] = useState(1); // 1: Date selection, 2: Time selection, 3: Confirmation
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [message, setMessage] = useState('');
  const [busySlots, setBusySlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const isPastDay = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Fetch busy time slots from Firestore
  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);

      try {
        setBusySlots(await getBusySlots());
      } catch (error) {
        console.error('Error fetching schedule:', error);
        showError('Failed to load schedule data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [showError]);

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  // Generate calendar days for current month view
  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, month, i + 1),
    );
  }, [currentMonth]);

  // Time slot generation
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots = [];
    const workingHours = {
      start: 7, // 7 AM (matching your original constraints)
      end: 20, // 8 PM (matching your original constraints)
      interval: 30, // 30 min slots
    };

    // Create slots for the selected date
    const { start, end, interval } = workingHours;

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        // Create time slot
        const timeSlot = new Date(selectedDate);
        timeSlot.setHours(hour, minute, 0, 0);

        // Skip times in the past
        const now = new Date();
        if (timeSlot < now) continue;

        // Check if slot is busy
        const isBusy = busySlots.some(
          (busySlot) =>
            busySlot.getFullYear() === timeSlot.getFullYear() &&
            busySlot.getMonth() === timeSlot.getMonth() &&
            busySlot.getDate() === timeSlot.getDate() &&
            busySlot.getHours() === timeSlot.getHours() &&
            busySlot.getMinutes() === timeSlot.getMinutes(),
        );

        slots.push({
          time: timeSlot,
          isBusy,
        });
      }
    }

    return slots;
  }, [selectedDate, busySlots]);

  // Check if a date has any available slots
  const hasAvailableSlots = (date) => {
    // Don't allow past dates
    if (isPastDay(date)) return false;

    // Count busy slots for this date
    const busySlotsForDate = busySlots.filter((slot) => isSameDay(slot, date));

    // Each day has (end - start) * (60 / interval) slots
    // For example: (20 - 7) * (60 / 30) = 13 * 2 = 26 slots
    const totalSlots = (20 - 7) * (60 / 30);

    // If all slots are busy, the date is unavailable
    return busySlotsForDate.length < totalSlots;
  };

  // Event handlers
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setCurrentStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setCurrentStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTime) {
      showError('Please select a time for your appointment.');
      return;
    }

    if (!message.trim()) {
      showError('Please enter a message with your request.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    let reserved = false;

    try {
      // Reserve the time first - see bookSlot for why the order matters.
      await bookSlot(selectedTime, user.uid);
      reserved = true;

      await addDoc(collection(projectFirestore, 'schedule'), {
        uid: user.uid,
        name: user.displayName,
        message,
        date: selectedTime,
        createdAt: new Date(),
      });

      // Provide feedback to the user upon successful submission
      showSuccess(
        `Your appointment has been scheduled for ${fullDate(
          selectedTime,
        )} at ${clockTime(selectedTime)}.`,
      );

      // Clear form fields
      setMessage('');
      setSelectedTime(null);

      // Navigate to schedule list
      navigate('/schedule');
    } catch (error) {
      if (!reserved && error.code === 'permission-denied') {
        showError('That time was just booked. Please pick another.');
        setSelectedTime(null);
        setCurrentStep(2);
        setBusySlots(await getBusySlots().catch(() => busySlots));
        return;
      }
      console.error('Error submitting request:', error);
      setSubmitError(error.message);
      showError('Something went wrong! Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const steps = [
    { id: 1, label: 'Date' },
    { id: 2, label: 'Time' },
    { id: 3, label: 'Confirm' },
  ];

  const renderDateSelection = () => (
    <div className="p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {currentMonth.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="button-ghost px-1.5"
            aria-label="Previous month"
          >
            <FiArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="button-ghost px-1.5"
            aria-label="Next month"
          >
            <FiArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div
            key={day}
            className="pb-1 text-center text-2xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-600"
          >
            {day.slice(0, 1)}
          </div>
        ))}

        {monthDays.map((date) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const available = hasAvailableSlots(date);
          const past = isPastDay(date);
          const today = isToday(date);
          const disabled = !available || past;

          return (
            <button
              type="button"
              key={date.toISOString()}
              style={
                date.getDate() === 1
                  ? { gridColumnStart: date.getDay() + 1 }
                  : undefined
              }
              onClick={() => available && handleDateSelect(date)}
              disabled={disabled}
              className={`relative flex h-9 items-center justify-center rounded-md text-sm tabular-nums transition-colors ${
                isSelected
                  ? 'bg-primary-600 font-medium text-white'
                  : disabled
                    ? 'cursor-not-allowed text-gray-300 dark:text-gray-700'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {date.getDate()}
              {today && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary-600 dark:bg-primary-400" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 flex items-start gap-2 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <FiInfo className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Greyed dates are fully booked or in the past.
      </p>
    </div>
  );

  const renderTimeSelection = () => (
    <div className="p-4 md:p-5">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="button-ghost -ml-2.5"
        >
          <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <h2 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
          {fullDate(selectedDate)}
        </h2>
      </div>

      {availableTimeSlots.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {availableTimeSlots.map((slot) => (
            <button
              type="button"
              key={slot.time.toISOString()}
              onClick={() => !slot.isBusy && handleTimeSelect(slot.time)}
              disabled={slot.isBusy}
              className={`h-9 rounded-md border text-sm tabular-nums transition-colors ${
                slot.isBusy
                  ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300 line-through dark:border-gray-800 dark:bg-gray-950 dark:text-gray-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-500 hover:text-primary-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-500 dark:hover:text-primary-400'
              }`}
            >
              {clockTime(slot.time)}
            </button>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <FiClock
            className="mx-auto h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            No slots left on this date.
          </p>
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="button-outline mt-4"
          >
            Pick another date
          </button>
        </div>
      )}
    </div>
  );

  const renderConfirmation = () => (
    <div className="p-4 md:p-5">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="button-ghost -ml-2.5"
        >
          <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
      </div>

      <dl className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800">
        <div className="bg-white px-4 py-3 dark:bg-gray-900">
          <dt className="field-label">
            <FiCalendar className="mr-1 inline h-3 w-3" aria-hidden="true" />
            Date
          </dt>
          <dd className="text-sm font-medium text-gray-900 dark:text-white">
            {fullDate(selectedDate)}
          </dd>
        </div>
        <div className="bg-white px-4 py-3 dark:bg-gray-900">
          <dt className="field-label">
            <FiClock className="mr-1 inline h-3 w-3" aria-hidden="true" />
            Time
          </dt>
          <dd className="text-sm font-medium tabular-nums text-gray-900 dark:text-white">
            {clockTime(selectedTime)}
          </dd>
        </div>
      </dl>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="field-label">
            <FiMessageSquare
              className="mr-1 inline h-3 w-3"
              aria-hidden="true"
            />
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            className="field-area"
            placeholder="Share any details about your appointment..."
            required
          />
        </div>

        {submitError && <p className="alert alert-danger">{submitError}</p>}

        <button type="submit" className="button w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Confirm appointment'}
        </button>
      </form>
    </div>
  );

  return (
    <>
      <PageSEO
        title="Request Appointment - Scheduler"
        description="Schedule a new appointment by selecting from available dates and times."
      />

      <header className="mb-6">
        <p className="eyebrow">Booking</p>
        <h1 className="mt-2 text-2xl text-gray-900 dark:text-white">
          Schedule an appointment
        </h1>
        <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
          Slots run every 30 minutes between 7:00 and 20:00.
        </p>
      </header>

      <div className="mx-auto max-w-3xl">
        <div className="surface overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-medium ${
                  currentStep === step.id
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded text-2xs ${
                    currentStep >= step.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                  }`}
                >
                  {step.id}
                </span>
                {step.label}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600 dark:border-gray-800 dark:border-t-primary-400" />
            </div>
          ) : (
            <>
              {currentStep === 1 && renderDateSelection()}
              {currentStep === 2 && renderTimeSelection()}
              {currentStep === 3 && renderConfirmation()}
            </>
          )}
        </div>
      </div>
    </>
  );
}
