// import Admin from '../models/Admin.js';

// export const getPolicies = async () => {
//   return Admin.find({});
// };

import Policy from '../models/Admin.js';

/**
 * Fetch policy content (single document)
 */
export const getPolicies = async () => {
  return await Policy.find().limit(1);
};

/**
 * Save / Update policy content from Admin panel
 */
export const savePolicies = async (data) => {
  return await Policy.findOneAndUpdate(
    {},              // always target the single policy document
    data,            // privacy, terms, cookies, etc.
    { upsert: true, new: true }
  );
};
