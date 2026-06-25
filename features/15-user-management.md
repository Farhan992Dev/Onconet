# Feature 15: User Management

**Category:** Admin Panel  
**Access:** Super Admin only  
**Priority:** Core

---

## Overview

Manage admin staff accounts. Super Admin can add, edit, and remove staff members with different roles and permissions.

---

## Functionality

### Admin User List View

Display all admin/staff users:
- Name
- Mobile number
- Role (Editor, Super Admin, Custom)
- Specialization (if applicable)
- Date added/created
- Last login date
- Active/inactive status
- Edit button
- Delete button
- Status toggle (enable/disable)

**Features:**
- Search by name or mobile
- Filter by role
- Filter by active/inactive
- Sort by date added, name, role
- Pagination
- Bulk actions (activate/deactivate, delete)
- Add new staff button

---

### Add New Staff

Form with following fields:

**Basic Information:**
- **Full Name** (required, text, 2-100 chars)
- **Mobile Number** (required, unique, phone format)
- **Specialization** (optional, text)
  - e.g., "Oncologist", "Medical Writer", "Content Manager"

**Authentication:**
- **Password** (required, auto-generated or manual)
  - Requirements: Min 8 chars, uppercase, lowercase, number, special char
  - Show password strength meter
  - Generate secure random password option

**Role Assignment:**
- **Role** (required, dropdown)
  - Options: Editor, Custom roles (if any created)
  - Show role description and permissions

**Permissions:**
- **Specific Permissions** (if not using fixed roles)
  - Checkboxes for:
    - View articles
    - Create articles
    - Edit articles
    - Delete articles
    - View SEO settings
    - Edit SEO settings
    - View messages
    - Delete messages
    - (Super Admin only):
      - Manage users
      - Manage roles

**Account Options:**
- **Send welcome email** (checkbox, default: true)
- **Activate immediately** (checkbox, default: true)
- **Set expiration date** (optional, for temporary staff)

---

### Edit User

- Update any field except mobile (read-only for security)
- Change role
- Modify permissions
- Reset password option
- Temporarily disable account
- Change specialization
- Update name

---

### Delete User

- Confirmation dialog warning of data loss
- Option to archive instead of delete (soft delete)
- Reassign user's articles to another author (optional)
- Log all deletions

---

### Reset Password

- Manually send password reset link to staff
- Or generate temporary password
- Staff must change on first login (optional)

---

## Implementation Requirements

- User list with filtering/searching
- Add/edit forms with validation
- Password strength indicator
- Role assignment UI
- Permission checkboxes
- Delete confirmation
- Pagination
- Mobile-responsive forms
- Audit logging of all changes

---

## UI Components

- Staff list table
- Search and filter bar
- Add staff button
- Edit modal/form
- Delete confirmation dialog
- Password reset modal
- Permission checkboxes
- Role selector
- Status toggle
- Last login display
- Date created display

---

## Technical Stack

- React/TypeScript frontend
- Tailwind CSS for styling
- Backend: .NET API
- Database: SQL Server/PostgreSQL
- Password generation: UUID-based or bcrypt

---

## Database Requirements

### Admin Users Table (See Feature 11)
- `admin_id` (PK, UUID)
- `mobile_number` (unique)
- `full_name` (string)
- `password_hash` (hashed)
- `role_id` (FK)
- `specialization` (string, nullable)
- `active` (boolean, default: true)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID, FK)
- `updated_by` (UUID, FK)
- `last_login` (timestamp, nullable)
- `expiration_date` (timestamp, nullable)

### Admin User Audit Log
- `log_id` (PK, UUID)
- `admin_id` (FK, nullable)
- `action` (enum: created, updated, deleted, login)
- `modified_by` (UUID, FK)
- `changes` (JSON, what was changed)
- `timestamp` (timestamp)

---

## API Endpoints

- `GET /admin/staff`
  - List all admin users
  - Query params: page, limit, role, active, sort
  - Response: Paginated staff list

- `POST /admin/staff`
  - Create new staff member
  - Request: Staff data
  - Response: Created staff object

- `GET /admin/staff/:id`
  - Get staff member details
  - Response: Staff object

- `PUT /admin/staff/:id`
  - Update staff member
  - Request: Updated fields
  - Response: Updated staff object

- `DELETE /admin/staff/:id`
  - Delete staff member
  - Response: Success message

- `POST /admin/staff/:id/reset-password`
  - Send password reset or generate temporary password
  - Response: Confirmation message

- `PUT /admin/staff/:id/activate`
  - Activate disabled staff account
  - Response: Updated staff

- `PUT /admin/staff/:id/deactivate`
  - Disable staff account
  - Response: Updated staff

---

## Validation Rules

- Full name: 2-100 characters, letters and spaces
- Mobile: Valid phone format
- Password: Min 8 chars, uppercase, lowercase, number, special
- Role: Valid enum value
- Email: Valid email format (if storing)

---

## Security Considerations

- Only Super Admin can manage staff
- Audit all staff changes
- Prevent self-deletion of Super Admin
- Reset password should not reveal actual password
- Temporary passwords expire after 24 hours
- Archive instead of hard delete when possible

---

## Email Templates

### Welcome Email
```
Subject: Welcome to OncoNet Admin Panel

Hi {staff_name},

Your account has been created. 

Login: {admin_login_url}
Mobile: {mobile_number}
Temporary Password: {temp_password}

Please change your password after first login.

Questions? Contact: {support_email}
```

### Password Reset
```
Subject: Password Reset Request

Hi {staff_name},

Click here to reset your password: {reset_link}

Link expires in 24 hours.

If you didn't request this, ignore this email.
```

---

## Permissions Matrix

| Permission | Editor | Super Admin |
|---|---|---|
| View articles | ✓ | ✓ |
| Create articles | ✓ | ✓ |
| Edit articles | ✓ | ✓ |
| Delete articles | ✓ | ✓ |
| View SEO | ✓ | ✓ |
| Edit SEO | ✓ | ✓ |
| View messages | ✓ | ✓ |
| Manage staff | ✗ | ✓ |
| Manage roles | ✗ | ✓ |
