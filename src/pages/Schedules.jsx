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
import { FiAlertCircle, FiCalendar, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { PageSEO } from '../components/ui/SEO';
import SchedulesView from '../components/SchedulesView';
import { isDone } from '../utils/schedule';

const userID = import.meta.env.VITE_USER_ID;

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
];

export default function Schedules() {
  const { user } = useAuthContext();
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const isAdmin = user?.uid === userID;

  useEffect(() => {
    if (!user?.uid) return;

    const base = collection(projectFirestore, 'schedule');
    const query = isAdmin ? base : fsQuery(base, where('uid', '==', user.uid));

    const unsub = onSnapshot(
      query,
      (snapshot) => {
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
    if (!data) return { all: 0, pending: 0, completed: 0 };
    const completed = data.filter(isDone).length;
    return {
      all: data.length,
      pending: data.length - completed,
      completed,
    };
  }, [data]);

  return (
    <>
      <PageSEO
        title="Schedules - Manage Your Appointments"
        description="View and manage your appointment requests and schedules"
      />

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{isAdmin ? 'All users' : 'Your account'}</p>
          <h1 className="mt-2 text-2xl text-gray-900 dark:text-white">
            Requests
          </h1>
          <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
            {counts.all} total
            <span className="mx-1.5 text-gray-300 dark:text-gray-700">·</span>
            {counts.pending} pending
            <span className="mx-1.5 text-gray-300 dark:text-gray-700">·</span>
            {counts.completed} completed
          </p>
        </div>

        <Link to="/request" className="button shrink-0">
          <FiPlus className="h-4 w-4" aria-hidden="true" />
          New request
        </Link>
      </header>

      <div className="mb-5 inline-flex rounded-md border border-gray-200 bg-white p-0.5 dark:border-gray-800 dark:bg-gray-900">
        {FILTERS.map((filter) => (
          <button
            type="button"
            key={filter.id}
            onClick={() => setFilterStatus(filter.id)}
            className={`h-7 rounded px-3 text-xs font-medium transition-colors ${
              filterStatus === filter.id
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            {filter.label}
            <span className="ml-1.5 opacity-60">{counts[filter.id]}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger mb-5">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isPending && (
        <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {[1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="animate-pulse bg-white p-4 dark:bg-gray-900"
            >
              <div className="h-3 w-40 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-2.5 h-3 w-64 rounded bg-gray-100 dark:bg-gray-800/60" />
            </div>
          ))}
        </div>
      )}

      {filteredData &&
        (filteredData.length === 0 ? (
          <div className="surface flex flex-col items-center px-6 py-14 text-center">
            <FiCalendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
              No {filterStatus === 'all' ? '' : filterStatus} requests
            </h2>
            <p className="mt-1 mb-5 text-sm text-gray-500 dark:text-gray-400">
              Book an appointment and it will show up here.
            </p>
            <Link to="/request" className="button">
              Book an appointment
            </Link>
          </div>
        ) : (
          <SchedulesView schedules={filteredData} />
        ))}

      <div className="mt-10">
        <Assistance />
      </div>
    </>
  );
}
