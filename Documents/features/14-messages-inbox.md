# Feature 14: Messages Inbox

**Category:** Admin Panel  
**Access:** Admin staff (Editor, Super Admin)  
**Priority:** Core

---

## Overview

Central inbox for all contact form submissions from public visitors. Staff can read, manage, and respond to messages.

---

## Functionality

### Message List View

- Display all messages from contact form (Feature 5)
- Show per message:
  - Sender name
  - Subject (truncated if long)
  - First message preview (truncated)
  - Submission date
  - Read/unread status (icon)
  - Sender mobile number (hidden until clicked, for privacy)

**Features:**
- Mark as read/unread
- Click to view full message
- Search messages by sender name or subject
- Filter by status (All / Read / Unread)
- Sort by date (newest/oldest)
- Delete button (with confirmation)
- Bulk actions (mark read/unread, delete multiple)
- Pagination (20-50 messages per page)
- Total message count
- Unread message count badge

---

### Message Detail View

Display full message information:

- **Sender Information:**
  - Full name
  - Mobile number (phone link)
  - Message submission date and time

- **Message Content:**
  - Subject
  - Full message body

- **Message Actions:**
  - Reply button (opens reply form or links to email)
  - Forward button (to other staff)
  - Mark as read/unread toggle
  - Delete button (with confirmation)
  - Archive button (optional)
  - Flag/star for follow-up (optional)

---

### Reply to Message

- **Reply Options:**
  - Send SMS to sender (if SMS service available)
  - Send email to sender
  - In-app message (if user is registered)

- **Reply Form:**
  - Subject line (auto-populated "Re: [original subject]")
  - Message body (textarea)
  - Message preview
  - Send button

- **Email Template:**
  - Reply message in professional format
  - OncoNet branding
  - Contact info
  - Signature from responding staff member

---

## Implementation Requirements

- Message list with filtering/searching
- Detail view with full message
- Reply functionality
- Read/unread status tracking
- Delete with confirmation
- Pagination
- Mobile-responsive design
- Date/time formatting
- Privacy: Hide full mobile number initially

---

## UI Components

- Message list table/cards
- Search and filter bar
- Unread badge
- Read/unread status indicator
- Delete confirmation dialog
- Message detail view
- Reply form modal
- Timestamp display
- Mobile number display with obfuscation

---

## Technical Stack

- React/TypeScript frontend
- Tailwind CSS for styling
- Backend: .NET API
- Email service: SendGrid, Mailgun
- SMS service: Twilio, Kavenegar (optional)
- Database: SQL Server/PostgreSQL

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
- `responded_by` (UUID, FK to admin users, nullable)
- `responded_at` (timestamp, nullable)
- `response_message` (text, nullable)
- `archived` (boolean, default: false)
- `flagged` (boolean, default: false)
- `created_at` (timestamp)
- `ip_address` (string, optional)

### Message Replies Table (Optional)
- `reply_id` (PK, UUID)
- `message_id` (FK)
- `reply_type` (enum: email, sms, in_app)
- `replied_by` (UUID, FK to admin users)
- `reply_body` (text)
- `reply_status` (enum: draft, sent, failed)
- `created_at` (timestamp)
- `sent_at` (timestamp, nullable)

### Indexes
- `read` (for filtering)
- `responded` (for filtering)
- `created_at` (for sorting)
- `sender_mobile` (for search)

---

## API Endpoints

- `GET /admin/messages`
  - List all messages with pagination/filtering
  - Query params: page, limit, status (read/unread), sort
  - Response: Paginated message list

- `GET /admin/messages/:id`
  - Get single message detail
  - Response: Full message object

- `PUT /admin/messages/:id/read`
  - Mark message as read
  - Response: Updated message

- `PUT /admin/messages/:id/unread`
  - Mark message as unread
  - Response: Updated message

- `DELETE /admin/messages/:id`
  - Delete message
  - Response: Success message

- `POST /admin/messages/:id/reply`
  - Send reply to sender
  - Request: `{ reply_type, body }`
  - Response: Reply confirmation

- `PUT /admin/messages/:id/flag`
  - Flag message for follow-up
  - Response: Updated message

- `DELETE /admin/messages` (bulk)
  - Delete multiple messages
  - Request: `{ message_ids: [...] }`
  - Response: Success message

---

## Email Reply Template

```
Subject: Re: {original_subject}

Hi {sender_name},

Thank you for reaching out to OncoNet.

{reply_body}

If you have any further questions, please don't hesitate to contact us.

Best regards,
{staff_name}
OncoNet Team
```

---

## SMS Reply Template

```
OncoNet: {reply_body}

For more info: {website_url}
```

---

## Status Indicators

- **Unread** (blue dot): New messages
- **Read** (gray dot): Read but not responded
- **Responded** (green checkmark): Reply sent
- **Flagged** (red star): Marked for follow-up

---

## Analytics

Track:
- Total messages received
- Average response time
- Messages by source/referrer
- Common subjects/topics
- Unresolved message count
- Response rate

---

## Privacy & Security

- Hide full phone numbers by default (show ***-***-1234)
- Validate sender phone number format
- Sanitize message content (prevent XSS)
- Store messages encrypted
- Audit log of message views/replies
- Only accessible to authorized staff
- Comply with privacy regulations

---

## Notifications

For admins:
- Real-time notification of new message (optional)
- Email notification of new message (optional)
- Daily digest of unresolved messages
