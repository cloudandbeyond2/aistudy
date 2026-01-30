import { getPolicies } from '../services/policy.service.js';

export const fetchPolicies = async (req, res) => {
  try {
    const policies = await getPolicies();
    res.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ success: false });
  }
};
