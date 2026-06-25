# Feature 7: Login with Password

**Category:** User Account  
**Access:** Registered users who have set a password  
**Priority:** Core

---

## Overview

Alternative login method for users who have created a password on their account. Allows switching between OTP and password login methods.

---

## Functionality

### Login Form
- Mobile number input (required)
- Password input (required)
- Toggle between OTP and Password login on same screen
- "Forgot Password?" link
- "Remember Me" checkbox (optional)
- Submit button

### Authentication Flow
1. User enters mobile number and password
2. Validate inputs on client side
3. Send to backend for verification
4. Backend:
   - Check if mobile exists
   - Verify password hash
   - Check account status (active/locked/suspended)
   - Create session token
5. On success: Create session and redirect to dashboard
6. On failure: Show error message and increment failed login counter

---

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

---

## Security Requirements

- **Password Storage:**
  - Hash passwords using bcrypt with salt
  - Never store plain text passwords
  - Use strong hashing algorithm

- **Failed Login Attempts:**
  - Log each failed attempt
  - Lock account after 5 failed attempts
  - 15-minute lockout period
  - Send alert email on suspicious activity

- **Session Management:**
  - JWT with 24-hour expiration
  - Secure HttpOnly cookies
  - CSRF protection

- **Audit Logging:**
  - Log successful logins
  - Log failed login attempts
  - Log IP address and user agent
  - Track login locations (optional)

---

## Password Recovery

- "Forgot Password?" link
- Enter mobile number
- Receive OTP via SMS
- Set new password with requirements validation
- Confirmation email sent

---

## UI Components

- Mobile number input field
- Password input field
- Toggle button to switch between OTP/Password
- "Forgot Password?" link
- "Remember Me" checkbox
- Submit button
- Show/Hide password toggle (eye icon)
- Error messages
- Loading spinner
- Success/error toasts

---

## Technical Stack

- React/TypeScript frontend
- Formik or React Hook Form for form management
- Backend: .NET API
- Password hashing: bcrypt or Argon2
- Session: JWT

---

## Database Requirements

### Users Table (additions)
- `user_id` (PK)
- `mobile_number` (unique)
- `password_hash` (hashed password)
- `failed_login_attempts` (integer, default: 0)
- `account_locked` (boolean, default: false)
- `account_locked_until` (timestamp, nullable)
- `last_login` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Login Audit Log
- `log_id` (PK)
- `user_id` (FK)
- `login_type` (enum: password, otp)
- `success` (boolean)
- `ip_address` (string)
- `user_agent` (string)
- `created_at` (timestamp)

---

## API Endpoints

- `POST /auth/login`
  - Request: `{ mobile_number, password }`
  - Response: `{ token, user, expires_in }`
  - Rate limit: 5 per IP per minute

- `POST /auth/forgot-password`
  - Request: `{ mobile_number }`
  - Response: `{ message: "OTP sent to reset password" }`

- `POST /auth/reset-password`
  - Request: `{ mobile_number, otp, new_password }`
  - Response: `{ message: "Password reset successful" }`

---

## Error Messages

- "Invalid mobile number or password"
- "Account is locked. Try again in 15 minutes"
- "Account does not exist"
- "Please enter a valid password"
- "Password must contain uppercase, lowercase, number, and special character"

---

## Email Templates

### Suspicious Login Alert
- Alert user of login from new location
- Show IP address and device
- Option to report if unauthorized

### Password Reset Confirmation
- Confirmation that password was changed
- Timestamp of change
- Instructions to report if unauthorized
