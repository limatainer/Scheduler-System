import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { projectFirestore } from '../firebase/config';

export const useReviews = () => {
  const [reviews, setReviews] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(projectFirestore, 'reviews'),
      (snapshot) => {
        setReviews(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setError(null);
        setIsPending(false);
      },
      (err) => {
        setError(err.message);
        setIsPending(false);
      },
    );

    return () => unsub();
  }, []);

  return { reviews, isPending, error };
};
