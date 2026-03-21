import '../config/env.js';
import connectDB from '../config/db.js';
import Organization from '../models/Organization.js';
import OrganizationPlan from '../models/OrganizationPlan.js';
import User from '../models/User.js';
import { getUserAccessFromOrgPlan } from '../utils/orgPlanAccess.js';

const syncOrgAdminPlanTypes = async () => {
  await connectDB();

  const organizations = await Organization.find({}).select('_id plan name');
  let updatedUsers = 0;

  for (const organization of organizations) {
    const orgPlan = await OrganizationPlan.findOne({ organization: organization._id, isActive: true })
      .sort({ startDate: -1 })
      .select('planName startDate endDate');

    const effectivePlan = orgPlan?.planName || organization.plan || 'free';
    const userAccess = getUserAccessFromOrgPlan(effectivePlan, orgPlan?.startDate || new Date());

    const result = await User.updateMany(
      {
        organization: organization._id,
        role: { $in: ['org_admin', 'dept_admin'] }
      },
      {
        $set: {
          type: userAccess.type,
          subscriptionStart: orgPlan?.startDate || userAccess.subscriptionStart,
          subscriptionEnd: orgPlan?.endDate || userAccess.subscriptionEnd
        }
      }
    );

    updatedUsers += result.modifiedCount || 0;
    console.log(
      `Synced ${organization.name}: plan=${effectivePlan}, type=${userAccess.type}, updated=${result.modifiedCount || 0}`
    );
  }

  console.log(`Done. Total updated users: ${updatedUsers}`);
  process.exit(0);
};

syncOrgAdminPlanTypes().catch((error) => {
  console.error('Failed to sync organization admin plan types:', error);
  process.exit(1);
});
