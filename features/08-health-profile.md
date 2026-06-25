# Feature 8: Health Profile

**Category:** User Account  
**Access:** Authenticated users only  
**Priority:** Core

---

## Overview

Personal health record stored server-side and accessible across all devices. Users can update their health information and have it automatically synced.

---

## Functionality

### Profile Data

Users can view and edit the following information:

- **Full Name** (text, optional)
  - Initially blank, user fills during profile setup
  - Editable anytime

- **Mobile Number** (phone, read-only)
  - Auto-populated from login
  - Cannot be changed (for security)

- **Year of Birth** (numeric, required)
  - Validation: Valid year between 1920 and current year
  - Used for age calculations

- **Date of Last Menstrual Period** (date, optional)
  - Can be updated monthly or as needed
  - Null/blank if not applicable

- **Family History of Breast Cancer** (dropdown, required)
  - Options: None / Mother / Sister / Aunt / Other Relatives
  - Can select multiple if applicable

- **Risk Factors Flag** (yes/no toggle, required)
  - Indicates if user has any known risk factors
  - Linked to risk calculator results

---

## Profile Features

### View Profile
- Display current profile information
- Read-only display of unchangeable fields
- Last modified date/time shown
- Profile completion percentage (optional)

### Edit Profile
- Form with all editable fields
- Validation for each field
- Save button
- Cancel button (discard changes)
- Success message on save
- Show last modified timestamp

### Sync Across Devices
- Real-time server-side persistence
- Auto-load profile on each login
- Changes immediately available on all devices
- No offline mode (requires network)

---

## Implementation Requirements

- Form validation for all fields
- Data encryption for sensitive fields
- Automatic timestamp on updates
- Profile completion tracking
- Audit logging of profile changes
- Mobile-responsive form layout
- Clear form sections

---

## UI Components

- Profile header with user avatar/initials
- Profile sections (personal info, health info)
- Edit button to toggle edit mode
- Form fields with labels and placeholders
- Dropdown selects for family history
- Date picker for menstrual period
- Save/Cancel buttons
- Success/error messages
- Last updated timestamp
- Loading spinner during save

---

## Technical Stack

- React/TypeScript frontend
- Formik or React Hook Form for form management
- Tailwind CSS for styling
- Backend: .NET API
- Database: SQL Server/PostgreSQL

---

## Database Requirements

### User Health Profiles Table
- `profile_id` (PK, UUID)
- `user_id` (FK, unique)
- `full_name` (string, nullable)
- `year_of_birth` (integer)
- `date_of_last_period` (date, nullable)
- `family_history` (string or JSON array)
  - Options: none, mother, sister, aunt, other
- `risk_factors` (boolean, default: false)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `updated_by_user` (UUID, nullable, for audit)

### Profile Change Audit Log
- `log_id` (PK)
- `user_id` (FK)
- `field_changed` (string)
- `old_value` (string)
- `new_value` (string)
- `changed_at` (timestamp)

### Indexes
- `user_id` (for quick lookup)
- `updated_at` (for sorting)

---

## API Endpoints

- `GET /profile`
  - Get user's current profile
  - Response: Profile object

- `PUT /profile`
  - Update user's profile
  - Request: Profile fields to update
  - Response: Updated profile object

- `GET /profile/history`
  - Get profile change history (optional)
  - Response: List of profile changes

---

## Validation Rules

- Full name: 2-100 characters, letters and spaces
- Year of birth: 1920-current year
- Family history: Required, single or multiple selections
- Risk factors: Required boolean
- Date of last period: Valid date, optional

---

## Security Considerations

- Validate and sanitize all inputs
- Encrypt sensitive health data at rest
- Use HTTPS for all data transmission
- Authenticate all API calls
- Log all profile access (optional, for privacy compliance)
- Comply with health data privacy regulations (GDPR, HIPAA if applicable)

---

## Privacy Notice

Display privacy notice:
- How data is stored and protected
- Who can access the data
- User's right to delete account and data
- Link to privacy policy
