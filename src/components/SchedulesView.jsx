import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { projectFirestore } from '../firebase/config';
import { deleteSchedule } from '../firebase/schedule';
import { CiTrash } from 'react-icons/ci';
import {
  FiCheck,
  FiClock,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
} from 'react-icons/fi';
import Modal from './ui/Modal';
import { useNotification } from '../context/NotificationContext';
import { isDone, mostRecent, scheduleDate, toMillis } from '../utils/schedule';

const COMPLETED = {
  status: 'Completed',
  icon: <FiCheck className="h-3 w-3" />,
  color: 'chip-success',
};

const PENDING = {
  status: 'Pending',
  icon: <FiClock className="h-3 w-3" />,
  color: 'chip-warning',
};

const rowDate = (schedule) =>
  scheduleDate(schedule).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const fullDate = (schedule) =>
  scheduleDate(schedule).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function SchedulesView({ schedules }) {
  const { showSuccess, showError } = useNotification();
  const [selected, setSelected] = useState(null);

  const newest = mostRecent(schedules);

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this request? This cannot be undone.')) return;

    try {
      await deleteSchedule(id);
      setSelected(null);
      showSuccess('Request has been deleted.');
    } catch (error) {
      console.error('Error deleting request:', error);
      showError('Failed to delete the request. Please try again.');
    }
  };

  const toggleCompleted = async (schedule) => {
    const completed = !schedule.completed;

    try {
      await updateDoc(doc(projectFirestore, 'schedule', schedule.id), {
        completed,
      });

      showSuccess(
        completed
          ? 'Appointment marked as completed.'
          : 'Appointment marked as pending.',
      );

      if (selected && selected.id === schedule.id) {
        setSelected({ ...selected, completed });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status. Please try again.');
    }
  };

  const getStatus = (schedule) => (isDone(schedule) ? COMPLETED : PENDING);
  const isPast = (schedule) => scheduleDate(schedule) < new Date();

  return (
    <>
      <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
        {schedules.map((schedule) => {
          const { status, icon, color } = getStatus(schedule);

          return (
            <li
              key={schedule.id}
              className="group flex items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/60"
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  isDone(schedule) ? 'bg-success-500' : 'bg-warning-500'
                }`}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {schedule.name}
                  </span>
                  {schedule.id === newest.id && (
                    <span className="chip chip-info">New</span>
                  )}
                </div>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {schedule.message}
                </p>
              </div>

              <span className="hidden shrink-0 text-xs tabular-nums text-gray-500 sm:block dark:text-gray-400">
                {rowDate(schedule)}
              </span>

              <span className={`chip hidden shrink-0 md:inline-flex ${color}`}>
                {icon}
                {status}
              </span>

              <div className="flex shrink-0 items-center gap-0.5">
                {isPast(schedule) && (
                  <button
                    type="button"
                    onClick={() => toggleCompleted(schedule)}
                    className="button-ghost px-1.5"
                    title={
                      schedule.completed
                        ? 'Mark as pending'
                        : 'Mark as completed'
                    }
                  >
                    {schedule.completed ? (
                      <FiToggleRight className="h-4 w-4 text-success-500" />
                    ) : (
                      <FiToggleLeft className="h-4 w-4 text-warning-500" />
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelected(schedule)}
                  className="button-ghost px-1.5"
                  title="View details"
                >
                  <FiEye className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteRequest(schedule.id)}
                  className="button-ghost px-1.5 hover:text-danger-600 dark:hover:text-danger-400"
                  title="Delete request"
                >
                  <CiTrash className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {selected && (
        <Modal title="Request details" onClose={() => setSelected(null)}>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="field-label">Requester</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {selected.name}
              </dd>
            </div>

            <div>
              <dt className="field-label">Date and time</dt>
              <dd className="text-gray-900 dark:text-gray-100">
                {fullDate(selected)}
              </dd>
            </div>

            <div>
              <dt className="field-label">Status</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <span className={`chip ${getStatus(selected).color}`}>
                  {getStatus(selected).icon}
                  {getStatus(selected).status}
                </span>
                {isPast(selected) ? (
                  <button
                    type="button"
                    onClick={() => toggleCompleted(selected)}
                    className="button-ghost"
                  >
                    {selected.completed ? (
                      <FiToggleRight className="h-4 w-4 text-success-500" />
                    ) : (
                      <FiToggleLeft className="h-4 w-4 text-warning-500" />
                    )}
                    {selected.completed
                      ? 'Mark as pending'
                      : 'Mark as completed'}
                  </button>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Appointment is in the future
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="field-label">Message</dt>
              <dd className="rounded-md border border-gray-200 bg-gray-50 p-3 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                {selected.message}
              </dd>
            </div>

            <div>
              <dt className="field-label">Created</dt>
              <dd className="text-gray-500 dark:text-gray-400">
                {new Date(toMillis(selected.createdAt)).toLocaleString()}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="button-outline"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => deleteRequest(selected.id)}
              className="button-accent"
            >
              Delete request
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
