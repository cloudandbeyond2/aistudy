/**
 * PLAN LIMITS CONFIGURATION
 * Central source of truth for all subscription plan restrictions.
 */
export const PLAN_LIMITS = {
    free: {
        maxCourses: 1,
        maxSubtopics: 5,
        allowVideo: false,
        allowMultiLang: false,
        durationDays: 7
    },
    monthly: {
        maxCourses: 20,
        maxSubtopics: 10,
        allowVideo: true,
        allowMultiLang: false,
        durationDays: 30
    },
    yearly: {
        maxCourses: Infinity,
        maxSubtopics: 10,
        allowVideo: true,
        allowMultiLang: true,
        durationDays: 365
    },
    forever: {
        maxCourses: Infinity,
        maxSubtopics: 10,
        allowVideo: true,
        allowMultiLang: true,
        durationDays: Infinity
    }
};

/**
 * Get the plan limits for a given plan type.
 * Falls back to free plan limits if type is unrecognized.
 */
export const getPlanLimits = (type) => {
    return PLAN_LIMITS[type] || PLAN_LIMITS.free;
};

/**
 * Check if a user's subscription is currently active/valid.
 * - 'forever' plans never expire.
 * - Others expire when subscriptionEnd < now.
 */
export const isPlanActive = (type, subscriptionEnd) => {
    if (type === 'forever') return true;
    if (!subscriptionEnd) return false;
    return new Date(subscriptionEnd) > new Date();
};
