import OrganizationLanding from '../models/OrganizationLanding.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';

/**
 * Get Organization Landing Page Config by Slug (Public)
 */
export const getOrgLandingBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const landing = await OrganizationLanding.findOne({ slug: slug.toLowerCase() })
            .populate('organization', 'name logo email contactNumber address');
        
        if (!landing) {
            return res.status(404).json({ success: false, message: 'Organization landing page not found' });
        }

        // Fetch live stats to provide as fallback if needed
        const studentCount = await User.countDocuments({ organization: landing.organization._id, role: 'student' });
        const placedCount = await User.countDocuments({
            organization: landing.organization._id,
            role: 'student',
            'studentDetails.isPlacementClosed': true
        });

        const landingData = landing.toObject();
        
        // Use live stats if manual ones are 0
        if (!landingData.statistics.studentsCount) landingData.statistics.studentsCount = studentCount;
        if (!landingData.statistics.placementsCount) landingData.statistics.placementsCount = placedCount;

        res.json({ success: true, landing: landingData });
    } catch (error) {
        console.error('getOrgLandingBySlug error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get Organization Landing Page Config for Org Admin (Private)
 */
export const getOrgLandingConfig = async (req, res) => {
    try {
        const { organizationId } = req.query;
        console.log('[DEBUG] Fetching Config for OrgId:', organizationId);

        if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
            console.warn('[WARN] Fetch failed: Invalid organizationId');
            return res.status(400).json({ success: false, message: 'Invalid Organization ID' });
        }

        let landing = await OrganizationLanding.findOne({ organization: organizationId });
        
        if (!landing) {
            console.log('[INFO] No existing landing page found. Creating new for org:', organizationId);
            const org = await Organization.findById(organizationId);
            if (!org) {
                console.warn('[WARN] Organization not found in DB:', organizationId);
                return res.status(404).json({ success: false, message: 'Organization not found' });
            }

            const baseSlug = org.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            let slug = baseSlug;
            let count = 1;
            while (await OrganizationLanding.findOne({ slug })) {
                slug = `${baseSlug}-${count}`;
                count++;
            }

            landing = new OrganizationLanding({
                organization: organizationId,
                slug: slug,
                heroTitle: `Welcome to ${org.name}`,
                heroSubtitle: 'Unlock your potential with our world-class learning platform.'
            });
            await landing.save();
        }

        res.json({ success: true, landing });
    } catch (error) {
        console.error('getOrgLandingConfig error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Update Organization Landing Page Config
 */
export const updateOrgLandingConfig = async (req, res) => {
    try {
    const { organizationId, ...updates } = req.body;
    console.log('[DEBUG] Update Config Body:', JSON.stringify(req.body));
    
    if (!organizationId) {
        console.warn('[WARN] Update failed: Organization ID missing in body');
        return res.status(400).json({ success: false, message: 'Organization ID is required' });
    }

        // Handle slug uniqueness if updated
        if (updates.slug) {
            updates.slug = updates.slug.toLowerCase().trim();
            const existing = await OrganizationLanding.findOne({ 
                slug: updates.slug, 
                organization: { $ne: organizationId } 
            });
            if (existing) {
                return res.status(400).json({ success: false, message: 'URL Slug is already in use by another organization' });
            }
        }

        const landing = await OrganizationLanding.findOneAndUpdate(
            { organization: organizationId },
            { $set: updates },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: 'Landing page updated successfully', landing });
    } catch (error) {
        console.error('updateOrgLandingConfig error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
