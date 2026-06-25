# Feature 10: Monthly Self-Check Reminder

**Category:** User Account  
**Access:** Authenticated users only  
**Priority:** Core

---

## Overview

Users can set a monthly reminder to perform breast self-examination. Reminders can be delivered via SMS, email, or in-app notifications.

---

## Functionality

### Reminder Settings

- **Toggle Reminder** (on/off)
  - Default: Off
  - User can enable/disable anytime

- **Reminder Day of Month** (dropdown/number input)
  - Options: 1-31
  - User selects their preferred day
  - If selected day doesn't exist in month (e.g., Feb 30), reminder triggers on last day of month

- **Reminder Type** (multi-select)
  - Email notification
  - SMS notification
  - In-app notification
  - User can select multiple types

- **Reminder Time** (time picker, optional)
  - Default: 9:00 AM
  - User can set preferred time

---

### Reminder Behavior

- **Automatic Triggering:**
  - System checks each month on selected day at selected time
  - Sends reminder via selected channels

- **Persistence:**
  - Reminder settings saved in user's health profile
  - Remain active across sessions
  - Persist until user disables

- **Notifications Sent:**
  - SMS: "Time for your monthly self-check. Log your results in OncoNet."
  - Email: Reminder email with link to self-check form
  - In-app: Pop-up or badge notification

- **Do Not Disturb:**
  - User can snooze reminder for 24 hours
  - Option to skip this month's reminder
  - Reschedule reminder date (optional)

---

## Implementation Requirements

- Reminder preference form
- Scheduling system (cron job or scheduled task)
- Email service integration
- SMS service integration
- In-app notification system
- Timezone support
- Reliability: Handle reminder failures and retries

---

## UI Components

- Settings form with toggle
- Day of month selector
- Time picker
- Reminder type checkboxes
- Notification preview
- Save/Cancel buttons
- Test reminder button (send sample)
- Reminder history/log
- Enable/disable quick toggle

---

## Technical Stack

- React/TypeScript frontend
- Backend: .NET API
- Scheduler: Hangfire, Quartz.NET, or similar
- Email service: SendGrid, Mailgun
- SMS service: Twilio, Kavenegar
- Database: SQL Server/PostgreSQL

---

## Database Requirements

### User Reminders Table
- `reminder_id` (PK, UUID)
- `user_id` (FK)
- `enabled` (boolean, default: false)
- `reminder_day` (integer, 1-31)
- `reminder_time` (time)
- `reminder_type` (JSON array: email, sms, in_app)
- `timezone` (string, default: user's timezone)
- `last_sent_date` (date, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Reminder Log Table
- `log_id` (PK, UUID)
- `reminder_id` (FK)
- `user_id` (FK)
- `sent_date` (timestamp)
- `sent_to` (JSON: email, phone, etc.)
- `status` (enum: sent, failed, bounced)
- `delivery_status` (JSON with status per channel)
- `retry_count` (integer)

### Indexes
- `user_id` (for user lookup)
- `enabled` (for finding active reminders)
- `reminder_day` (for scheduling)

---

## API Endpoints

- `GET /reminder/settings`
  - Get user's reminder settings
  - Response: Reminder settings object

- `PUT /reminder/settings`
  - Update reminder settings
  - Request: Updated settings
  - Response: Updated settings object

- `POST /reminder/test`
  - Send test reminder notification
  - Response: Confirmation message

- `GET /reminder/history`
  - Get reminder delivery history
  - Response: List of sent reminders

---

## Scheduler Configuration

### Cron Job / Scheduled Task
```
Every day at configured times:
1. Query all reminders where enabled=true
2. Check if today matches reminder_day
3. If match found, send reminder via configured channels
4. Log reminder delivery
5. Retry failed deliveries up to 3 times
```

---

## Email Template

**Subject:** "Time for Your Monthly Breast Self-Check"

**Body:**
```
Hi [User Name],

It's time for your monthly breast self-examination. 
Taking just a few minutes each month can help you detect changes early.

[BUTTON: Log My Self-Check]

Remember to check both breasts and note any changes you find.

Have questions? Check out our self-check guide: [LINK]

Best regards,
OncoNet Team
```

---

## SMS Template

```
OncoNet: It's time for your monthly breast self-check. 
Log your results: [SHORT_LINK]
```

---

## In-App Notification

```
{
  "title": "Monthly Self-Check Reminder",
  "message": "It's time to perform your monthly breast self-examination",
  "action_url": "/self-check/new",
  "action_text": "Log Now"
}
```

---

## User Preferences

- Allow user to change reminder settings anytime
- Allow temporary disabling (snooze for 1, 3, or 6 months)
- Allow changing reminder day/time
- Option to receive reminders on multiple days/times
- Opt-out entirely with one-click unsubscribe

---

## Delivery Tracking

- Track delivery success per channel
- Log failed deliveries
- Implement retry logic for failed deliveries
- Alert admin if consistent delivery failures

---

## Privacy & Compliance

- Honor do-not-disturb times
- Comply with SMS/Email regulations
- Respect user timezone for reminder time
- Provide easy unsubscribe option
