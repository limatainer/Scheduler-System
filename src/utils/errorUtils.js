/**
 * Error handling utilities for consistent error handling across the application
 */

// Map Firebase auth error codes to user-friendly messages.
// Accepts either a code string or the raw error object (v8 wraps the real
// reason inside auth/internal-error's message JSON, e.g. INVALID_LOGIN_CREDENTIALS).
export const getAuthErrorMessage = (errorOrCode) => {
  const errorCode =
    typeof errorOrCode === 'string' ? errorOrCode : errorOrCode?.code;

  // ponytail: Firebase v8 surfaces auth/internal-error with the true reason
  // embedded in the message JSON (INVALID_LOGIN_CREDENTIALS, etc.). Unwrap it
  // so users get the real message instead of a black box. Ceiling: only the
  // first quoted reason is extracted; nested detail strings are ignored.
  if (errorCode === 'auth/internal-error' && typeof errorOrCode === 'object') {
    const match = /"message"\s*:\s*"([^"]+)"/.exec(errorOrCode.message || '');
    if (match) {
      const reason = match[1].toUpperCase();
      const reasonMap = {
        INVALID_LOGIN_CREDENTIALS: 'The email or password is incorrect.',
        INVALID_EMAIL: 'Invalid email address format.',
        EMAIL_NOT_FOUND: 'No account found with this email address.',
        INVALID_PASSWORD: 'Incorrect password. Please try again.',
        WEAK_PASSWORD: 'Password is too weak. Please use a stronger password.',
        TOO_MANY_ATTEMPTS_TRY_LATER:
          'Too many unsuccessful login attempts. Please try again later.',
        USER_DISABLED: 'This account has been disabled.',
      };
      if (reasonMap[reason]) return reasonMap[reason];
    }
  }

  const errorMessages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password':
      'Password is too weak. Please use a stronger password.',
    'auth/invalid-email': 'Invalid email address format.',
    'auth/account-exists-with-different-credential':
      'An account already exists with the same email but different sign-in credentials.',
    'auth/invalid-credential': 'The authentication credential is invalid.',
    'auth/operation-not-allowed': 'This operation is not allowed.',
    'auth/requires-recent-login':
      'Please sign in again to complete this action.',
    'auth/too-many-requests':
      'Too many unsuccessful login attempts. Please try again later.',
    'auth/network-request-failed':
      'Network error. Please check your internet connection.',
    'auth/popup-closed-by-user':
      'Sign-in popup was closed before completing the sign-in.',
    'auth/cancelled-popup-request': 'Sign-in popup request was cancelled.',
    'auth/popup-blocked': 'Sign-in popup was blocked by the browser.',
    'auth/unauthorized-domain':
      'This domain is not authorized for OAuth operations.',
    'auth/invalid-action-code':
      'The action code is invalid. This can happen if the code is malformed, expired, or has already been used.',
    'auth/invalid-login-credentials': 'The email or password is incorrect.',
    'auth/missing-password': 'Please enter your password.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/invalid-api-key':
      'Firebase API key is invalid. Check your VITE_FIREBASE_* env variables and restart the dev server.',
    'auth/api-key-not-valid':
      'Firebase API key is not valid. Check your VITE_FIREBASE_* env variables and restart the dev server.',
    'auth/app-deleted':
      'The Firebase app instance was deleted. Restart the application.',
    'auth/app-not-authorized':
      'The Firebase app is not authorized. Check your Firebase project configuration.',
    'auth/configuration-not-found':
      'Firebase configuration is missing. Check your environment variables.',
  };

  if (errorMessages[errorCode]) return errorMessages[errorCode];

  // ponytail: surface the raw code instead of a silent generic fallback so unmapped errors are diagnosable; codes are non-sensitive
  logError(new Error(`Unmapped auth error code: ${errorCode}`), {
    method: 'getAuthErrorMessage',
  });
  return `An unexpected authentication error occurred (${errorCode || 'unknown'}). Please try again.`;
};

// Log errors to analytics or monitoring service
export const logError = (error, context = {}) => {
  console.error('Error:', error, 'Context:', context);

  // Here you would integrate with error monitoring services like Sentry
  // Example: Sentry.captureException(error, { extra: context });
};
