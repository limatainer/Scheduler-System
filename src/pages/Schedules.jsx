import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query as fsQuery,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { projectFirestore } from '../firebase/config';
import { useAuthContext } from '../hooks/useAuthContext';
import Assistance from '../components/Assistance';
import {
  FiCalendar,
  FiFilter,
  FiPlus,
  FiClock,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { PageSEO } from '../components/ui/SEO';
import SchedulesView from '../components/SchedulesView';
import { isDone } from '../utils/schedule';

const userID = import.meta.env.VITE_USER_ID;

export default function Schedules() {
  const { user } = useAuthContext();
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const isAdmin = user?.uid === userID;

  // Fetch schedules collection from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const base = collection(projectFirestore, 'schedule');
    const query = isAdmin ? base : fsQuery(base, where('uid', '==', user.uid));

    const unsub = onSnapshot(
      query,
      (snapshot) => {
        // Empty is not an error - the empty state below handles it.
        setData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setIsPending(false);
      },
      (err) => {
        setError(err.message);
        setIsPending(false);
      },
    );

    return () => unsub();
  }, [isAdmin, user?.uid]);

  const filteredData = useMemo(() => {
    if (!data) return null;
    if (filterStatus === 'all') return data;
    return data.filter((schedule) =>
      filterStatus === 'completed' ? isDone(schedule) : !isDone(schedule),
    );
  }, [data, filterStatus]);

  const counts = useMemo(() => {
    if (!data) return { total: 0, pending: 0, completed: 0 };
    const completed = data.filter(isDone).length;
    return {
      total: data.length,
      pending: data.length - completed,
      completed,
    };
  }, [data]);

  // Loading state UI
  if (isPending) {
    return (
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mb-6"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mb-8"></div>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageSEO
        title="Schedules - Manage Your Appointments"
        description="View and manage your appointment requests and schedules"
      />

      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FiCalendar className="text-primary-600 dark:text-primary-400" />
                <span>Manage Requests</span>
              </h1>

              <Link to="/request" className="button flex items-center gap-2">
                <FiPlus />
                <span>New Request</span>
              </Link>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {isAdmin
                ? 'View and manage all appointment requests from users.'
                : 'Track and manage your scheduled appointments.'}
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Requests
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {counts.total}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    <FiCalendar size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pending
                    </p>
                    <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {counts.pending}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <FiClock size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Completed
                    </p>
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {counts.completed}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <FiCheck size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiFilter />
                <span>Filter:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-primary-600 text-white dark:bg-primary-500'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Requests ({counts.total})
                </button>

                <button
                  type="button"
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === 'pending'
                      ? 'bg-amber-500 text-white dark:bg-amber-600'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Pending ({counts.pending})
                </button>

                <button
                  type="button"
                  onClick={() => setFilterStatus('completed')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === 'completed'
                      ? 'bg-green-500 text-white dark:bg-green-600'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Completed ({counts.completed})
                </button>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg mb-8">
              <div className="flex">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                <span className="ml-3">{error}</span>
              </div>
            </div>
          )}

          {/* Request list */}
          {filteredData &&
            (filteredData.length === 0 ? (
              <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <FiCalendar className="mx-auto text-5xl text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No requests found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {filterStatus === 'all'
                    ? "You don't have any scheduled appointments yet."
                    : filterStatus === 'pending'
                      ? "You don't have any pending appointments."
                      : "You don't have any completed appointments."}
                </p>
                <Link to="/request" className="button">
                  Schedule an Appointment
                </Link>
              </div>
            ) : (
              <SchedulesView schedules={filteredData} />
            ))}

          {/* Assistance Section */}
          <div className="mt-12">
            <Assistance />
          </div>
        </div>
      </div>
    </>
  );
}
