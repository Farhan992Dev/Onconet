# OncoNet Features Documentation

Complete feature specifications for the OncoNet digital health platform.

---

## Public Website Features (1-5)

| # | Feature | File | Access | Category |
|---|---------|------|--------|----------|
| 1 | Home Page | [01-home-page.md](01-home-page.md) | Public | Landing page |
| 2 | Articles & Journal | [02-articles-journal.md](02-articles-journal.md) | Public | Content library |
| 3 | Breast Cancer Risk Calculator | [03-risk-calculator.md](03-risk-calculator.md) | Public | Risk assessment |
| 4 | About Page | [04-about-page.md](04-about-page.md) | Public | Information |
| 5 | Contact Form | [05-contact-form.md](05-contact-form.md) | Public | Communication |

---

## User Account Features (6-10)

| # | Feature | File | Access | Category |
|---|---------|------|--------|----------|
| 6 | Login / Register with OTP | [06-login-otp.md](06-login-otp.md) | Users | Authentication |
| 7 | Login with Password | [07-login-password.md](07-login-password.md) | Users | Authentication |
| 8 | Health Profile | [08-health-profile.md](08-health-profile.md) | Users | Personal data |
| 9 | Self-Check Log | [09-self-check-log.md](09-self-check-log.md) | Users | Health tracking |
| 10 | Monthly Self-Check Reminder | [10-self-check-reminder.md](10-self-check-reminder.md) | Users | Notifications |

---

## Admin Panel Features (11-17)

| # | Feature | File | Access | Category |
|---|---------|------|--------|----------|
| 11 | Admin Login | [11-admin-login.md](11-admin-login.md) | Admins | Authentication |
| 12 | Articles Management | [12-articles-management.md](12-articles-management.md) | Admins | Content |
| 13 | Page SEO Settings | [13-page-seo-settings.md](13-page-seo-settings.md) | Admins | SEO |
| 14 | Messages Inbox | [14-messages-inbox.md](14-messages-inbox.md) | Admins | Communications |
| 15 | User Management | [15-user-management.md](15-user-management.md) | Super Admin | Staff management |
| 16 | Role & Permissions | [16-role-permissions.md](16-role-permissions.md) | Super Admin | Access control |
| 17 | In-Panel Notifications | [17-in-panel-notifications.md](17-in-panel-notifications.md) | Admins | Feedback |

---

## Feature Summary

| Category | Count |
|----------|-------|
| **Total Features** | 17 |
| Public Pages | 5 |
| User Account Features | 5 |
| Admin Features | 7 |
| User Roles | 3 (+ public visitor) |

---

## How to Use These Documents

Each feature file contains:
- **Overview**: Brief description of the feature
- **Functionality**: Detailed feature behavior and user interactions
- **Implementation Requirements**: Technical requirements and considerations
- **UI Components**: List of UI elements needed
- **Technical Stack**: Recommended technologies
- **Database Requirements**: Schema and tables needed
- **API Endpoints**: REST endpoints to implement
- **Security Considerations**: Security best practices
- **Validation Rules**: Input validation requirements
- **Additional Information**: Feature-specific details (templates, examples, etc.)

---

## Development Order (Recommended)

### Phase 1: Core Authentication & Setup
1. Feature 6: Login / Register with OTP
2. Feature 7: Login with Password
3. Feature 11: Admin Login

### Phase 2: Public Website
4. Feature 1: Home Page
5. Feature 4: About Page
6. Feature 2: Articles & Journal
7. Feature 5: Contact Form
8. Feature 3: Risk Calculator

### Phase 3: Admin Panel
9. Feature 12: Articles Management
10. Feature 13: Page SEO Settings
11. Feature 14: Messages Inbox
12. Feature 16: Role & Permissions Management
13. Feature 15: User Management
14. Feature 17: In-Panel Notifications

### Phase 4: User Features
15. Feature 8: Health Profile
16. Feature 9: Self-Check Log
17. Feature 10: Monthly Self-Check Reminder

---

## File Naming Convention

```
[NUMBER]-[FEATURE-NAME].md

Examples:
01-home-page.md
06-login-otp.md
12-articles-management.md
```

---

## Quick Reference

### Public URLs
- `/` - Home Page
- `/articles` - Articles & Journal
- `/calculator` - Risk Calculator
- `/about` - About Page
- `/contact` - Contact Form

### User Routes (Authenticated)
- `/profile` - Health Profile
- `/self-check` - Self-Check Log
- `/reminder` - Reminder Settings
- `/logout` - Logout

### Admin Routes (Authenticated)
- `/admin` - Admin Dashboard
- `/admin/articles` - Articles Management
- `/admin/seo` - SEO Settings
- `/admin/messages` - Messages Inbox
- `/admin/staff` - User Management (Super Admin)
- `/admin/roles` - Role Management (Super Admin)

---

## Technology Stack Overview

**Frontend:**
- React with TypeScript
- Tailwind CSS
- Vite build tool
- Form management: Formik or React Hook Form
- Rich text editor: TinyMCE or Quill

**Backend:**
- .NET 8 Framework (C#)
- ASP.NET Core
- SQL Server or PostgreSQL
- JWT authentication

**Services:**
- Email: SendGrid or Mailgun
- SMS: Twilio or Kavenegar
- File storage: AWS S3 or Azure Blob
- Scheduler: Hangfire or Quartz.NET

---

## Notes

- All features are responsive and mobile-friendly
- All forms include comprehensive validation
- Security is built-in to each feature
- Audit logging recommended for all admin actions
- HTTPS/TLS required for all endpoints
- GDPR/privacy compliance considered throughout

---

**Last Updated:** June 14, 2026  
**Project:** OncoNet  
**Version:** 1.0
