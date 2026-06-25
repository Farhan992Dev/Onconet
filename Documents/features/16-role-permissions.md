# Feature 16: Role & Permissions Management

**Category:** Admin Panel  
**Access:** Super Admin only  
**Priority:** Core

---

## Overview

Define custom roles and control exactly which staff members can perform which actions. System comes with built-in roles but Super Admin can create custom roles with granular permissions.

---

## Functionality

### System Roles (Built-in)

Cannot be deleted or fully customized:

**1. Editor**
- View articles
- Create articles
- Edit articles
- Delete articles
- View page SEO
- Edit page SEO
- View messages
- Reply to messages

**2. Super Admin**
- All permissions (unrestricted access)

---

### Custom Roles

Super Admin can create unlimited custom roles.

---

### Role List View

Display all roles:
- Role name (display name)
- Internal name (identifier)
- Description
- Number of users with role
- System role badge (if built-in)
- Edit button
- Delete button (grayed out for system roles)

**Features:**
- Search by role name
- Filter by system/custom
- Pagination
- Create new role button

---

### Create Role

Form with following fields:

**Basic Information:**
- **Internal Name** (required, unique)
  - Used for database/API references
  - Format: lowercase_with_underscores
  - Example: "content_manager"

- **Display Name** (required, unique)
  - User-friendly name shown in UI
  - Example: "Content Manager"

- **Description** (optional, 0-300 chars)
  - What this role is for
  - Permissions summary

**Permissions:**
- **Selectable Permissions** (checkboxes)
  - Article Management:
    - [ ] View articles
    - [ ] Create articles
    - [ ] Edit articles
    - [ ] Delete articles
  - SEO Management:
    - [ ] View page SEO
    - [ ] Edit page SEO
  - Message Management:
    - [ ] View messages
    - [ ] Delete messages
    - [ ] Reply to messages
  - User Management (Super Admin):
    - [ ] View staff
    - [ ] Add staff
    - [ ] Edit staff
    - [ ] Delete staff
  - Role Management (Super Admin):
    - [ ] View roles
    - [ ] Create roles
    - [ ] Edit roles
    - [ ] Delete roles

---

### Edit Role

- Update display name
- Update description
- Modify permissions
- Cannot edit system roles (Editor, Super Admin)
- Warning: Changes apply to all users with this role immediately

---

### Delete Role

- Only non-system roles can be deleted
- Check if users assigned to this role
- If users exist:
  - Show list of affected users
  - Require reassignment before deletion
- Confirmation dialog
- Soft delete recommended (keep in history)

---

## Implementation Requirements

- Role form with permission checkboxes
- Permission grouping/categorization
- Prevent deletion of roles with assigned users
- Prevent self-deletion of Super Admin role
- Real-time permission updates
- Pagination
- Search/filter
- Audit logging of role changes

---

## UI Components

- Role list table
- Role creation form with tabs
- Permission checkboxes grouped by category
- Role description textarea
- Edit/delete buttons
- Delete confirmation dialog
- "Users with this role" warning
- Affected users list modal

---

## Technical Stack

- React/TypeScript frontend
- Tailwind CSS for styling
- Backend: .NET API
- Database: SQL Server/PostgreSQL

---

## Database Requirements

### Roles Table
- `role_id` (PK, UUID)
- `name` (string, unique)
  - Internal identifier, lowercase_snake_case
- `display_name` (string, unique)
  - User-friendly name
- `description` (string, nullable)
- `is_system_role` (boolean, default: false)
  - Cannot be edited/deleted if true
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID, FK)
- `updated_by` (UUID, FK)

### Role Permissions Table
- `permission_id` (PK, UUID)
- `role_id` (FK)
- `action` (string)
  - Format: namespace:action (e.g., "articles:create")
- `created_at` (timestamp)

### Sample Permissions
```
articles:view
articles:create
articles:edit
articles:delete
seo:view
seo:edit
messages:view
messages:delete
messages:reply
staff:view
staff:create
staff:edit
staff:delete
roles:view
roles:create
roles:edit
roles:delete
```

### Indexes
- `name` (unique, for lookup)
- `is_system_role` (for filtering)

---

## API Endpoints

- `GET /admin/roles`
  - List all roles
  - Query params: page, limit, system_only
  - Response: Paginated role list

- `POST /admin/roles`
  - Create new role
  - Request: Role data with permissions
  - Response: Created role object

- `GET /admin/roles/:id`
  - Get role details with permissions
  - Response: Role object with permissions array

- `PUT /admin/roles/:id`
  - Update role (not system roles)
  - Request: Updated fields
  - Response: Updated role object

- `DELETE /admin/roles/:id`
  - Delete role (only non-system)
  - Check for assigned users first
  - Response: Success or error message

- `GET /admin/roles/:id/users`
  - Get all users assigned to this role
  - Response: List of user objects

- `GET /admin/permissions`
  - Get all available permissions in system
  - Response: Categorized permissions list

---

## Permission Hierarchy

Permissions are organized hierarchically:

```
staff:*           (all staff-related permissions)
  staff:view
  staff:create
  staff:edit
  staff:delete

articles:*        (all article-related permissions)
  articles:view
  articles:create
  articles:edit
  articles:delete

seo:*            (all SEO-related permissions)
  seo:view
  seo:edit

messages:*       (all message-related permissions)
  messages:view
  messages:delete
  messages:reply

roles:*          (all role-related permissions)
  roles:view
  roles:create
  roles:edit
  roles:delete
```

---

## Permission Checking

Backend middleware checks permissions:
1. Get user's role
2. Get all permissions for that role
3. Check if required permission in list
4. Allow or deny action

---

## Role Templates (Future)

Pre-defined role templates for quick setup:
- Content Manager: Can manage articles and SEO
- Support Staff: Can view and reply to messages
- Editor-in-Chief: All article permissions
- Moderator: Limited message management

---

## Audit Logging

Track all role changes:
- Role created
- Role updated (which fields)
- Role deleted (soft delete)
- Permission added/removed
- User assigned/removed from role
- Who made the change
- When it happened

---

## Validation Rules

- Internal name: Lowercase, underscores, alphanumeric, 3-50 chars
- Display name: 3-100 characters
- Description: 0-300 characters
- Must have at least one permission
- Cannot delete if users assigned

---

## Security Considerations

- Prevent privilege escalation
- Cannot grant permissions Super Admin doesn't have
- Audit all role changes
- Cache permissions for performance
- Validate permissions on backend (never trust client)
- Prevent deletion of roles with active users
