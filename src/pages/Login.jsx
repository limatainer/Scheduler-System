import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { PageSEO } from '../components/ui/SEO';
import { getAuthErrorMessage } from '../utils/errorUtils';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/homeuser');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/homeuser');
    } catch (err) {
      console.error('Login error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageSEO
        title="Sign in to Scheduler"
        description="Sign in to your Scheduler account to manage your appointments"
      />

      <div className="mx-auto flex w-full max-w-sm flex-col justify-center py-16 md:py-24">
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 text-2xl text-gray-900 dark:text-white">Sign in</h1>
        <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
          Use the email you signed up with.
        </p>

        {error && (
          <div className="alert alert-danger mt-5">
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                className="field pl-9"
                placeholder="name@example.com"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className="relative">
              <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="field pl-9 pr-9"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:hover:text-gray-200"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <FiEyeOff className="h-4 w-4" />
                ) : (
                  <FiEye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="button w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 border-t border-gray-200 pt-5 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
          No account?{' '}
          <Link
            to="/signup"
            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            Create one
          </Link>
        </p>
      </div>
    </>
  );
};

export default Login;
