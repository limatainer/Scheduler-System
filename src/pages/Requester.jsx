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

    try {
      // Reserve the time first - see bookSlot for why the order matters.
      await bookSlot(selectedTime, user.uid);

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
      console.error('Error submitting request:', error);
      setSubmitError(error.message);
      showError('Something went wrong! Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Weekday headers for calendar
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Different views based on current step
  const renderDateSelection = () => (
    <div className="p-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label="Previous month"
        >
          <FiArrowLeft />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentMonth.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label="Next month"
        >
          <FiArrowRight />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}

        {monthDays.map((date) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const available = hasAvailableSlots(date);
          const past = isPastDay(date);
          const today = isToday(date);

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
              disabled={!available || past}
              className={`
                relative p-2 w-full rounded-md transition-colors
                ${
                  isSelected
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : ''
                }
                ${
                  today && !isSelected
                    ? 'border border-primary-400 dark:border-primary-600'
                    : ''
                }
                ${
                  past
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : ''
                }
                ${
                  !past && available
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    : ''
                }
                ${
                  !available && !past
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : ''
                }
              `}
            >
              <div className="text-sm">{date.getDate()}</div>
              {today && (
                <div className="text-xs mt-1 text-primary-600 dark:text-primary-400">
                  Today
                </div>
              )}
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 dark:bg-primary-600"></div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <p className="flex items-center">
          <FiInfo className="mr-2" /> Select a date to view available time
          slots. Gray dates are either unavailable or in the past.
        </p>
      </div>
    </div>
  );

  const renderTimeSelection = () => (
    <div className="p-6">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="text-primary-600 dark:text-primary-400 flex items-center text-sm"
        >
          <FiArrowLeft className="mr-1" /> Back to calendar
        </button>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
          Select a time on {fullDate(selectedDate)}
        </h2>
      </div>

      {availableTimeSlots.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {availableTimeSlots.map((slot) => (
            <button
              type="button"
              key={slot.time.toISOString()}
              onClick={() => !slot.isBusy && handleTimeSelect(slot.time)}
              disabled={slot.isBusy}
              className={`
                p-3 text-center rounded-lg transition-colors
                ${
                  slot.isBusy
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                    : 'bg-white border border-gray-200 hover:border-primary-500 hover:text-primary-600 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-primary-500 dark:text-gray-300 dark:hover:text-primary-400'
                }
              `}
            >
              {clockTime(slot.time)}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiClock className="mx-auto text-4xl text-gray-400 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No available time slots for this date.
          </p>
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="mt-4 text-primary-600 dark:text-primary-400 underline"
          >
            Select another date
          </button>
        </div>
      )}
    </div>
  );

  const renderConfirmation = () => (
    <div className="p-6">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="text-primary-600 dark:text-primary-400 flex items-center text-sm"
        >
          <FiArrowLeft className="mr-1" /> Back to time selection
        </button>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
          Confirm your appointment
        </h2>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
          Appointment details
        </h3>
        <div className="flex items-start mb-3">
          <FiCalendar className="text-primary-600 dark:text-primary-400 mt-1 mr-3" />
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-200">
              Date
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {fullDate(selectedDate)}
            </div>
          </div>
        </div>
        <div className="flex items-start">
          <FiClock className="text-primary-600 dark:text-primary-400 mt-1 mr-3" />
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-200">
              Time
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {clockTime(selectedTime)}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Send a personalized message:
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <FiMessageSquare className="text-gray-400" />
            </div>
            <textarea
              id="message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="block w-full pl-10 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
              placeholder="Please share any details about your appointment..."
              required
            />
          </div>
        </div>

        {isSubmitting && (
          <div className="text-primary-600 dark:text-primary-400">
            Submitting request...
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-600 dark:text-red-400">
            {submitError}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <>
      <PageSEO
        title="Request Appointment - Scheduler"
        description="Schedule a new appointment by selecting from available dates and times."
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 dark:bg-primary-700 p-6 text-white">
            <h1 className="text-2xl font-bold flex items-center">
              <FiCalendar className="mr-2" /> Schedule Your Appointment
            </h1>
            <p className="mt-1 opacity-80 text-sm">
              Select a date and time that works for you
            </p>
          </div>

          {/* Progress indicator */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex">
              <div
                className={`flex-1 py-3 px-4 text-center border-b-2 text-sm font-medium ${
                  currentStep >= 1
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500'
                }`}
              >
                1. Select Date
              </div>
              <div
                className={`flex-1 py-3 px-4 text-center border-b-2 text-sm font-medium ${
                  currentStep >= 2
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500'
                }`}
              >
                2. Select Time
              </div>
              <div
                className={`flex-1 py-3 px-4 text-center border-b-2 text-sm font-medium ${
                  currentStep >= 3
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500'
                }`}
              >
                3. Confirm
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
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
