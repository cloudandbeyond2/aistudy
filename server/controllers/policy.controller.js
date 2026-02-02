// import { getPolicies } from '../services/policy.service.js';

// export const fetchPolicies = async (req, res) => {
//   try {
//     const policies = await getPolicies();
//     res.json(policies);
//   } catch (error) {
//     console.error('Error fetching policies:', error);
//     res.status(500).json({ success: false });
//   }
// };

import { getPolicies, savePolicies } from '../services/policy.service.js';

export const fetchPolicies = async (req, res) => {
  try {
    const policies = await getPolicies();
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
};

export const updatePolicies = async (req, res) => {
  try {
    const updated = await savePolicies(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update policies' });
  }
};
