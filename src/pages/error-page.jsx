import { useRouteError, Link } from 'react-router-dom';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <FiAlertTriangle
          className="h-5 w-5 text-danger-600 dark:text-danger-400"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-2xl text-gray-900 dark:text-white">
          Something broke
        </h1>
        <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
          The page could not be loaded.
        </p>

        <div className="mt-5 rounded-md border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <p className="field-label mb-1">Details</p>
          <p className="font-mono text-xs text-gray-700 dark:text-gray-300">
            {error.statusText || error.message || 'Unknown error'}
          </p>
          {error.stack && import.meta.env.DEV && (
            <pre className="mt-2 overflow-auto rounded bg-gray-50 p-2 font-mono text-2xs leading-relaxed text-gray-500 dark:bg-gray-950 dark:text-gray-500">
              {error.stack.split('\n').slice(0, 3).join('\n')}
            </pre>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <Link to="/" className="button">
            <FiHome className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="button-outline"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
