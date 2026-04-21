const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const formatDateLabel = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getCurrentWeekDates = (baseDate = new Date()) => {
  const weekStart = new Date(baseDate);
  const dayIndex = weekStart.getDay();
  const daysFromMonday = dayIndex === 0 ? 6 : dayIndex - 1;

  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - daysFromMonday);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return {
      day: dayNames[date.getDay()],
      value: formatDateValue(date),
      label: formatDateLabel(date),
    };
  });
};

export const getWeekDateByDay = (weekDates, day) =>
  weekDates.find((item) => item.day === day);
