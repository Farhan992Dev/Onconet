# Feature 5: Contact Form

**Category:** Public Website  
**Access:** Public (no login required)  
**Priority:** Core

---

## Overview

Allow public visitors to send messages to the OncoNet platform team.

---

## Functionality

### Form Fields

All fields are required:
- **Full Name** (text input, required)
  - Validation: Min 2 characters, max 100 characters
  - Pattern: Letters and spaces only
- **Mobile Number** (phone input, required)
  - Validation: Valid phone format (must include country code or local format)
  - Format: Accepts + and digits only
- **Subject** (text input, required)
  - Validation: Min 5 characters, max 100 characters
- **Message Body** (textarea, required)
  - Validation: Min 10 characters, max 1000 characters
  - Character counter

---

## Form Behavior

### Client-Side Validation
- Real-time validation with error messages
- Disable submit button until all validations pass
- Show validation errors inline

### On Submit
- Display success confirmation message
- Store message in database
- Route to Admin Inbox (Feature 14)
- Send confirmation email to user
- Send notification email to admin
- Clear form on success

### Error Handling
- Display user-friendly error messages
- Log errors for debugging
- Graceful fallback if service unavailable

---

## Implementation Requirements

- Client-side and server-side validation (never trust client)
- CSRF (Cross-Site Request Forgery) protection
- Rate limiting to prevent spam:
  - Max 5 messages per IP per hour
  - Max 10 messages per mobile number per day
- Email notification system
- Database storage of messages
- Success/error feedback toasts
- Mobile-responsive form layout

---

## UI Components

- Form wrapper with proper styling
- Labeled input fields
- Character counter for textarea
- Submit button
- Clear/Reset button (optional)
- Success/error messages
- Loading state during submission
- Terms acceptance checkbox (optional)

---

## Technical Stack

- React/TypeScript frontend
- Tailwind CSS for styling
- Formik or React Hook Form for form management
- Zod or Yup for validation schema
- Email service: SendGrid, Mailgun, or similar
- Backend: .NET API

---

## Database Requirements

### Contact Messages Table
- `message_id` (PK, UUID)
- `sender_name` (string)
- `sender_mobile` (string)
- `sender_email` (string, optional)
- `subject` (string)
- `body` (text)
- `read` (boolean, default: false)
- `responded` (boolean, default: false)
- `created_at` (timestamp)
- `ip_address` (string, for rate limiting)

### Indexes
- `sender_mobile` (for rate limiting)
- `read` (for admin filtering)
- `created_at` (for sorting)

---

## API Endpoints

- `POST /contact/submit` - Submit contact form
  - Rate limit: 5 per IP per hour
  - Returns: Success/error message

---

## Email Templates

### User Confirmation Email
- Thank you message
- Confirmation that message was received
- Expected response time
- Link back to website

### Admin Notification Email
- New message notification
- Sender information
- Message preview
- Link to admin inbox

---

## Security Considerations

- Validate and sanitize all inputs
- Prevent SQL injection
- Prevent XSS attacks
- Rate limit to prevent abuse
- Hide admin email from HTML
- Use HTTPS only
- Store sensitive data securely

---

## Analytics

Track:
- Form submission rate
- Form abandonment rate
- Form submission by source/referrer
- Response time to messages (admin metrics)

---

## SEO Metadata

- Meta title: "Contact OncoNet - Get in Touch"
- Meta description: "Send a message to the OncoNet team for inquiries, feedback, or support"
