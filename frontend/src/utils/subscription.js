import { addMonths, addYears, format } from 'date-fns';
import { MonthType, YearType } from '@/constants';

export const getJoinDate = (user) => {
  return user.subscription?.date || user.date;
};

export const getExpiryDate = (user) => {
  if (!user.subscription?.date) return 'N/A';

  const start = new Date(user.subscription.date);

  if (user.type === MonthType) {
    return format(addMonths(start, 1), 'PPP');
  }

  if (user.type === YearType) {
    return format(addYears(start, 1), 'PPP');
  }

  if (user.type === 'forever') {
    return 'Never';
  }

  return 'N/A';
};
