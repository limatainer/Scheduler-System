import { createContext, useReducer, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile,
} from 'firebase/auth';
import { projectAuth } from '../firebase/config';
import { logError } from '../utils/errorUtils';

export const AuthContext = createContext();

const toUser = (user) =>
  user && {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      projectAuth,
      (user) => dispatch({ type: 'LOGIN', payload: toUser(user) || null }),
      (error) => {
        logError(error, { method: 'onAuthStateChanged' });
        dispatch({ type: 'LOGOUT' });
      },
    );

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(
        projectAuth,
        email,
        password,
      );

      if (!res?.user) {
        throw new Error('Could not complete login');
      }

      const userData = toUser(res.user);
      dispatch({ type: 'LOGIN', payload: userData });

      return userData;
    } catch (error) {
      logError(error, { method: 'login', email });
      throw error;
    }
  };

  const signup = async (email, password, displayName) => {
    const res = await createUserWithEmailAndPassword(
      projectAuth,
      email,
      password,
    );

    if (!res?.user) {
      throw new Error('Could not complete signup');
    }

    await updateAuthProfile(res.user, { displayName });

    const userData = { ...toUser(res.user), displayName };
    dispatch({ type: 'LOGIN', payload: userData });

    return userData;
  };

  const logout = async () => {
    await signOut(projectAuth);
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
