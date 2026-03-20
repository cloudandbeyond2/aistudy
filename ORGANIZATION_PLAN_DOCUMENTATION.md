# Organization Plan Management

## Overview
This feature allows administrators to assign subscription plans to organizations with flexible pricing and student slot management.

## Available Plans

### Duration Options
- **1 Month** - Short-term subscription
- **3 Months** - Quarterly subscription  
- **6 Months** - Semi-annual subscription

### Pricing Structure
- **Default AI Course Slots**: 20 slots (fixed)
- **Additional Request Slots**: Customizable per organization
- **Student Slot Price**: ₹1000 per slot (customizable in future)
- **Total Price Calculation**: (20 + additionalSlots) × studentSlotPrice

### Example
If an organization selects:
- Plan: 3 Months
- Additional Slots: 10
- Price per Slot: ₹1000

**Calculation:**
- Total Slots = 20 (default) + 10 (additional) = 30 slots
- Total Price = 30 × ₹1000 = ₹30,000

---

## Backend Implementation

### 1. Database Model: `OrganizationPlan`
**Location**: `server/models/OrganizationPlan.js`

**Fields**:
- `organization` (ObjectId) - Reference to Organization
- `planName` (String) - '1months', '3months', or '6months'
- `aiCourseSlots` (Number) - Default 20
- `additionalRequestSlots` (Number) - Custom amount
- `studentSlotPrice` (Number) - Default ₹1000
- `totalStudentSlots` (Number) - Auto-calculated (20 + additional)
- `totalPrice` (Number) - Auto-calculated (totalSlots × price)
- `startDate` (Date) - Plan start date
- `endDate` (Date) - Auto-calculated based on plan duration
- `features` - AI creation, manual creation, career placement toggles
- `isActive` (Boolean) - Active/inactive status

**Auto-Calculation**: Plan end date is automatically calculated based on plan duration.

### 2. API Endpoints

#### Create/Update Organization Plan
```
POST /api/admin/org-plan/create
Body: {
  organizationId: string,
  planName: '1months' | '3months' | '6months',
  additionalRequestSlots: number,
  studentSlotPrice: number
}
```

#### Get Organization Plan
```
GET /api/admin/org-plan?organizationId=<id>
Response: { plan: OrganizationPlan | null }
```

#### Get All Organization Plans
```
GET /api/admin/org-plans
Response: { plans: OrganizationPlan[], totalCount: number }
```

#### Update Plan Features
```
PUT /api/admin/org-plan/:organizationId/features
Body: {
  features: {
    allowAICreation: boolean,
    allowManualCreation: boolean,
    allowCareerPlacement: boolean
  }
}
```

#### Deactivate Organization Plan
```
DELETE /api/admin/org-plan/:organizationId
```

---

## Frontend Implementation

### Admin Component: `AdminOrgPlan`
**Location**: `frontend/src/pages/admin/AdminOrgPlan.tsx`

**Features**:
- Search organizations by name or email
- View organization details and current plan status
- Assign/edit plans for each organization
- Real-time price calculation
- Visual feedback for total slots and pricing
- Plan feature configuration
- Form validation

**UI Sections**:
1. **Organization Search** - Find organizations
2. **Organization Cards** - Display org info with current plan
3. **Plan Assignment Dialog** - Configure plan details
4. **Price Calculator** - Shows real-time calculations
5. **Status Indicators** - Active features status

---

## Routes

### Admin Routes
```
POST   /api/admin/org-plan/create          - Create/Update plan
GET    /api/admin/org-plan                 - Get specific org plan
GET    /api/admin/org-plans                - Get all plans
PUT    /api/admin/org-plan/:organizationId/features - Update features
DELETE /api/admin/org-plan/:organizationId - Deactivate plan
```

**Route File**: `server/routes/org.routes.js`

---

## Navigation

### Admin Sidebar
Added "Organization Plans" menu item under Organization management section in AdminLayout.

- **Icon**: Tag (lucide-react)
- **Path**: `/admin/org-plans`
- **Label**: "Organization Plans"

---

## How to Use

### As Admin:
1. Navigate to → Admin Panel → Organization Plans
2. Search for an organization
3. Click "Assign Plan" or "Edit Plan" on the organization card
4. Configure plan details:
   - Select duration (1/3/6 months)
   - Add additional request slots (if any)
   - Set price per student slot (optional)
5. Review calculated pricing
6. Click "Assign Plan" to save

### Plan Details:
The system will:
- Calculate total slots (20 + additional)
- Calculate total price (slots × price per slot)
- Auto-calculate plan end date based on duration
- Update organization plan field
- Activate plan for the organization

---

## Integration Points

### Organization Model
The existing `Organization.plan` field is used to store the selected plan duration and links to the OrganizationPlan document.

### Student Slot Management
Organizations can manage student slot allocations through their plan configuration.

---

## Future Enhancements

1. **Customizable Student Price**: Currently set to ₹1000, can be made fully customizable
2. **Plan Renewal**: Automatic or manual plan renewal workflows
3. **Plan Analytics**: Dashboard showing plan usage and statistics
4. **Multi-Currency Support**: Add support for different currencies
5. **Plan Templates**: Pre-defined plan templates for common scenarios
6. **Bulk Operations**: Assign plans to multiple organizations at once
7. **Payment Integration**: Automated billing based on plan

---

## File Structure

```
Backend:
├── server/
│   ├── models/
│   │   └── OrganizationPlan.js (NEW)
│   ├── controllers/
│   │   └── org.controller.js (UPDATED - added 5 new functions)
│   └── routes/
│       └── org.routes.js (UPDATED - added 5 routes)

Frontend:
├── src/
│   ├── pages/admin/
│   │   └── AdminOrgPlan.tsx (NEW)
│   ├── App.tsx (UPDATED - added route and import)
│   └── components/layouts/
│       └── AdminLayout.tsx (UPDATED - added menu item)
```

---

## Code Summary

### New Backend Functions (in org.controller.js):
1. `createOrgPlan()` - Create/update organization plan
2. `getOrgPlan()` - Get plan for specific organization
3. `getAllOrgPlans()` - Get all active plans
4. `updateOrgPlanFeatures()` - Update plan features
5. `deleteOrgPlan()` - Deactivate plan helper function `getPlanDuration()` - Get plan duration in days

### Database Middleware:
- Auto-calculation of `totalStudentSlots`
- Auto-calculation of `totalPrice`
- Auto-calculation of `endDate` based on plan duration

---

## Testing

### Test API Calls:
```bash
# Create/Update Plan
curl -X POST http://localhost:5000/api/admin/org-plan/create \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"...", "planName":"3months", "additionalRequestSlots":5}'

# Get Plan
curl http://localhost:5000/api/admin/org-plan?organizationId=...

# Get All Plans
curl http://localhost:5000/api/admin/org-plans

# Update Features
curl -X PUT http://localhost:5000/api/admin/org-plan/123/features \
  -H "Content-Type: application/json" \
  -d '{"features":{"allowAICreation":true}}'
```

---

## Notes

- Plans are automatically calculated and stored in the database
- Organization plan field is updated when a plan is assigned
- Plans are marked as inactive when deleted (soft delete)
- All date calculations are done server-side for accuracy
- UI provides real-time price calculations for better UX
