import Admin from '../models/Admin.js';

export const getPolicies = async () => {
  return Admin.find({});
};
