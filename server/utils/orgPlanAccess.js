export const getOrgPlanDurationDays = (planName) => {
  const durations = {
    '1months': 30,
    '3months': 90,
    '6months': 180
  };

  return durations[planName] || 0;
};

export const mapOrgPlanToUserType = (planName) => {
  const normalizedPlan = (planName || '').toLowerCase();

  const mapping = {
    free: 'free',
    monthly: 'monthly',
    yearly: 'yearly',
    forever: 'forever',
    '1months': 'monthly',
    '3months': 'yearly',
    '6months': 'yearly'
  };

  return mapping[normalizedPlan] || 'free';
};

export const getUserAccessFromOrgPlan = (planName, startDate = new Date()) => {
  const type = mapOrgPlanToUserType(planName);

  if (type === 'free') {
    return {
      type,
      subscriptionStart: null,
      subscriptionEnd: null
    };
  }

  if (type === 'forever') {
    return {
      type,
      subscriptionStart: startDate,
      subscriptionEnd: null
    };
  }

  const durationDays = getOrgPlanDurationDays(planName);
  const subscriptionStart = startDate;
  const subscriptionEnd = new Date(subscriptionStart);
  subscriptionEnd.setDate(subscriptionEnd.getDate() + durationDays);

  return {
    type,
    subscriptionStart,
    subscriptionEnd
  };
};
