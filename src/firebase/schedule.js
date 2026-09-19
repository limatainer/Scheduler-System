import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { projectFirestore } from './config';

// Booked times are mirrored into the `slots` collection so the booking calendar
// can tell which times are taken without reading anyone else's appointment.
// A slot document carries only the booker's uid - never a name, message or
// date field - because every signed-in user can read this collection.
// Its id is the ISO timestamp, written from a Date on booking and rebuilt from
// the stored Timestamp on delete; both paths must produce the same string.
const slotId = (date) => date.toISOString();

const toDate = (value) => (value instanceof Date ? value : value.toDate());

// Reserve the slot BEFORE writing the appointment. If the appointment write
// then fails we are left with a slot nobody booked - a time shown as busy -
// which is the safe direction to fail. The reverse order allows a double
// booking.
// ponytail: two separate writes, not a transaction. Move both into a
// writeBatch if orphaned slots ever turn up in practice.
export const bookSlot = (date, uid) =>
  setDoc(doc(projectFirestore, 'slots', slotId(date)), { uid });

export const getBusySlots = async () => {
  const snapshot = await getDocs(collection(projectFirestore, 'slots'));
  return snapshot.docs.map((slot) => new Date(slot.id));
};

// Takes the id alone so no caller has to remember to free the slot as well.
// Costs one read to recover the appointment's date.
export const deleteSchedule = async (id) => {
  const ref = doc(projectFirestore, 'schedule', id);
  const snapshot = await getDoc(ref);
  const date = snapshot.data()?.date;

  await deleteDoc(ref);

  if (date) {
    await deleteDoc(doc(projectFirestore, 'slots', slotId(toDate(date))));
  }
};
