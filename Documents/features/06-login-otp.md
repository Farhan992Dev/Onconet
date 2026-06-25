# Feature 6: Login / Register with OTP

**Category:** User Account  
**Access:** Registered users + new user registration  
**Priority:** Core

---

## Overview

Mobile-based authentication with one-time passcode (OTP). New users are auto-registered on first successful OTP verification.

---

## Authentication Flow

### Step 1: Enter Mobile Number
- User enters mobile number
- Field validation:
  - Valid phone format (must include country code or local format)
  - Min 10 digits, max 15 digits
- Check if mobile exists in database
- If new mobile: Auto-create user account on successful OTP verification

### Step 2: OTP Generation & Delivery
- Generate 5-digit random code (00000-99999)
- Send via SMS to user's phone
- Store OTP in database with:
  - 2-minute expiration time
  - Associated phone number
  - Attempt counter (reset after use or expiration)
- Implement 60-second cooldown before allowing new OTP request
- Show countdown timer to user

### Step 3: OTP Input
- Display 5-box input field
- Auto-advance to next box on digit entry
- Auto-submit form when all 5 digits entered
- Show remaining time to expiration (countdown)
- Display "Resend OTP" button (enabled after 60-second cooldown)
- Show attempt counter (max 5 attempts)

### Step 4: Authentication
- Verify OTP against stored code
- Check expiration time
- Invalidate OTP immediately after successful verification
- Create session token/JWT
- Redirect to user dashboard
- Store session in browser/server

---

## Security Requirements

- **Rate Limiting:**
  - Max 3 OTP requests per phone number per hour
  - Max 5 OTP verification attempts per code
  - 60-second cooldown between requests

- **OTP Expiration:**
  - Valid for 2 minutes only
  - Invalid OTP attempts logged
  - Lock account after 5 failed attempts (15-minute cooldown)

- **Session Management:**
  - JWT or session token with 24-hour expiration
  - Secure cookie with HttpOnly flag
  - CSRF token for form submission

- **Audit Logging:**
  - Log all OTP requests
  - Log all authentication attempts (success/failure)
  - Log IP address and user agent

---

## UI Components

- Mobile number input field
- OTP input box (5 individual boxes)
- Timer display (shows remaining time)
- Resend button
- Attempt counter
- Error messages
- Loading spinner during verification
- Success/failure toasts

---

## Technical Stack

- React/TypeScript frontend
- Formik or React Hook Form for form management
- OTP SMS service: Twilio, Kavenegar, or similar
- Backend: .NET API
- Session: JWT or server-side sessions

---

## Database Requirements

### OTP Codes Table
- `otp_id` (PK, UUID)
- `mobile_number` (string)
- `code` (string, 5 digits)
- `expires_at` (timestamp)
- `attempts` (integer, default: 0)
- `max_attempts` (integer, default: 5)
- `verified` (boolean, default: false)
- `created_at` (timestamp)

### Users Table (auto-created on first OTP verification)
- `user_id` (PK, UUID)
- `mobile_number` (unique, string)
- `full_name` (nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `last_login` (timestamp)
- `account_locked` (boolean, default: false)

### Audit Log Table
- `log_id` (PK)
- `mobile_number` (string)
- `action` (enum: otp_requested, otp_verified, otp_failed)
- `ip_address` (string)
- `user_agent` (string)
- `created_at` (timestamp)

### Indexes
- `mobile_number` on OTP table (for lookup)
- `expires_at` on OTP table (for cleanup)
- `mobile_number` on Users table (for login)

---

## API Endpoints

- `POST /auth/otp/request`
  - Request: `{ mobile_number }`
  - Response: `{ message: "OTP sent", expires_in: 120 }`
  - Rate limit: 3 per phone per hour

- `POST /auth/otp/verify`
  - Request: `{ mobile_number, code }`
  - Response: `{ token, user, expires_in }`
  - Rate limit: 5 attempts per OTP

- `GET /auth/otp/status`
  - Check if OTP is still valid

---

## SMS Template

```
Your OncoNet verification code is: [CODE]
Valid for 2 minutes. Do not share with anyone.
```

---

## Error Messages

- "Invalid phone number format"
- "OTP already sent. Please wait before requesting a new one"
- "OTP expired. Please request a new code"
- "Invalid OTP code"
- "Too many failed attempts. Please try again later"
- "Account temporarily locked. Please try again in 15 minutes"

---

## Success Message

"Welcome to OncoNet! Your account has been created. Redirecting to your profile..."
