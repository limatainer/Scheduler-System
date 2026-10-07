import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

export default function Modal({ title, onClose, children, size = 'max-w-lg' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current.open) ref.current.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={`m-auto w-[calc(100%-2rem)] ${size} rounded-lg border border-gray-200 bg-white p-0 text-gray-900 backdrop:bg-gray-950/60 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100`}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="button-ghost px-1.5"
          aria-label="Close"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
