# Feature 11: Admin Login

**Category:** Admin Panel  
**Access:** Admin staff only (Editor, Super Admin)  
**Priority:** Core

---

## Overview

Separate authentication system for admin staff with password-based login and role display.

---

## Functionality

### Authentication

- **Login Credentials:**
  - Mobile number (required)
  - Password (required)

- **Validation:**
  - Valid phone format
  - Valid password format
  - Check account status (active/locked/suspended)

### On Successful Login

1. Verify mobile and password against admin user database
2. Check user role and permissions
3. Create admin session with JWT token
4. Display role label on entry:
   - "Senior Admin" (Super Admin)
   - "Editorial Team" (Editor)
   - Custom role names as configured
5. Store session in browser (secure cookie)
6. Redirect to admin dashboard
7. Log successful login (timestamp, IP, user agent)

### On Failed Login

- Show error message: "Invalid mobile or password"
- Increment failed attempt counter
- Lock account after 5 failed attempts (15-minute lockout)
- Log failed attempt
- Send security alert email on suspicious activity

---

## Session Management

- **Token Expiration:**
  - 24-hour default session timeout
  - Optional: Shorter timeout (e.g., 4 hours) for security

- **Session Storage:**
  - HttpOnly cookie for automatic inclusion in requests
  - CSRF token for form submissions
  - Session ID for server-side tracking

- **Session Timeout:**
  - Warn user 5 minutes before timeout
  - Auto-logout on timeout
  - Option to extend session (optional)

---

## Role-Based Access

Admin dashboard content varies by role:

| Feature | Editor | Super Admin |
|---------|--------|------------|
| View Articles | ✓ | ✓ |
| Create/Edit Articles | ✓ | ✓ |
| View SEO Settings | ✓ | ✓ |
| Edit SEO Settings | ✓ | ✓ |
| View Messages | ✓ | ✓ |
| Manage Users | ✗ | ✓ |
| Manage Roles | ✗ | ✓ |

---

## Implementation Requirements

- Secure password storage (bcrypt/Argon2)
- HTTPS only
- CSRF protection
- Rate limiting on login attempts
- Session timeout
- Audit logging
- Email alerts for security events
- Account lockout mechanism

---

## UI Components

- Login form (mobile + password)
- Password show/hide toggle
- Submit button
- "Forgot Password?" link
- Login error messages
- Remember me checkbox (optional)
- Loading spinner
- Failed attempt counter (optional, for security)
- Account locked notice (if applicable)

---

## Technical Stack

- React/TypeScript frontend
- Backend: .NET API
- Authentication: JWT tokens
- Session: Server-side + secure cookies
- Password hashing: bcrypt or Argon2

---

## Database Requirements

### Admin Users Table
- `admin_id` (PK, UUID)
- `mobile_number` (unique)
- `full_name` (string)
- `password_hash` (hashed password)
- `role_id` (FK to Roles table)
- `specialization` (string, optional)
- `active` (boolean, default: true)
- `failed_login_attempts` (integer, default: 0)
- `account_locked` (boolean, default: false)
- `account_locked_until` (timestamp, nullable)
- `last_login` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID, FK)

### Admin Login Audit Log
- `log_id` (PK, UUID)
- `admin_id` (FK)
- `login_type` (string)
- `success` (boolean)
- `ip_address` (string)
- `user_agent` (string)
- `created_at` (timestamp)

---

## API Endpoints

- `POST /admin/auth/login`
  - Request: `{ mobile_number, password }`
  - Response: `{ token, admin, role, expires_in }`
  - Rate limit: 5 per IP per minute

- `POST /admin/auth/logout`
  - Invalidate session
  - Response: `{ message: "Logged out successfully" }`

- `GET /admin/auth/profile`
  - Get current admin user info
  - Response: Admin profile object

- `POST /admin/auth/change-password`
  - Request: `{ current_password, new_password }`
  - Response: `{ message: "Password changed" }`

- `POST /admin/auth/forgot-password`
  - Request: `{ mobile_number }`
  - Response: `{ message: "Reset link sent" }`

---

## Security Considerations

- Validate all inputs
- Prevent SQL injection
- Prevent XSS attacks
- Rate limit login attempts
- CSRF protection
- Secure password transmission (HTTPS)
- Audit logging of all access
- Session fixation prevention
- Suspicious activity alerts

---

## Email Templates

### Login Confirmation (Optional)
```
Subject: Your recent login to OncoNet Admin

Hi [Admin Name],

Your account was accessed on [DATE] from [LOCATION/IP]

If this wasn't you, please change your password immediately.
```

### Security Alert
```
Subject: ⚠️ Suspicious Activity on Your Account

Hi [Admin Name],

Multiple failed login attempts were detected on your account.
Your account has been locked for security.

Click here to reset your password: [LINK]
```

---

## Two-Factor Authentication (Future Enhancement)

Optional second factor:
- TOTP app (Google Authenticator, Authy)
- SMS code
- Email code
