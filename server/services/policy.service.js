
// import Policy from '../models/Policy.js';

// /**
//  * Fetch policy content (single document)
//  */
// export const getPolicies = async () => {
//   let policy = await Policy.findOne();

//   if (!policy) {
//     policy = await Policy.create({});
//   }

//   return policy;
// };

// /**
//  * Save / Update policy content
//  */
// export const savePolicies = async (data) => {
//   let policy = await Policy.findOne();

//   if (!policy) {
//     policy = new Policy(data);
//   } else {
//     Object.assign(policy, data);
//   }

//   await policy.save();
//   return policy;
// };
import Policy from '../models/Policy.js';

/**
 * Fetch policy content
 */
export const getPolicies = async () => {
  let policy = await Policy.findOne().select('-billing -__v');

  if (!policy) {
    policy = await Policy.create({});
  }

  return policy;
};

/**
 * Save / Update policy content
 */
export const savePolicies = async (data) => {

  delete data.billing;   // prevent saving old billing field

  let policy = await Policy.findOne();

  if (!policy) {
    policy = new Policy(data);
  } else {
    Object.assign(policy, data);
  }

  await policy.save();
  return policy;
};