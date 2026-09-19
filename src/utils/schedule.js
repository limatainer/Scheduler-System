export const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  return new Date(value).getTime();
};

export const scheduleDate = (schedule) => new Date(toMillis(schedule.date));

export const isDone = (schedule) =>
  schedule.completed ?? scheduleDate(schedule) < new Date();

export const mostRecent = (schedules) =>
  schedules.reduce(
    (prev, current) =>
      toMillis(current.createdAt) > toMillis(prev.createdAt) ? current : prev,
    schedules[0],
  );
