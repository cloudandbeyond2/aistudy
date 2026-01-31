export const addOneMonthSafe = (date) => {
  const d = new Date(date);

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  // move to 1st of next month
  const nextMonth = new Date(year, month + 1, 1);

  // last day of next month
  const lastDayOfNextMonth = new Date(
    nextMonth.getFullYear(),
    nextMonth.getMonth() + 1,
    0
  ).getDate();

  // set date safely
  nextMonth.setDate(Math.min(day, lastDayOfNextMonth));

  return nextMonth;
};
