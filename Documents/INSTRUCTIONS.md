# OncoNet System — Feature Implementation Guide

**Project:** OncoNet  
**Version:** 1.0  
**Last Updated:** June 14, 2026

---

## Project Identity

**Mission:** Create the largest digital ecosystem to increase awareness, accurate diagnosis, and proper guidance for cancer patients.

**Slogan:** "همراه شما در مسیر آگاهی و درمان"  
*(With you on the path of awareness and treatment)*

**Vision:** Become the most credible digital reference in the field of health and cancer diseases.

**Core Values:**
- Scientific credibility
- Transparency
- Patient empathy
- Digital innovation
- Easy access to information

**Approach:** Data-driven (not just content-driven)

**Executive Team:**
- Project Manager: Salman
- Content Manager: Ali
- Medical Doctor: (To be assigned)
- Digital Manager: Salman
- Growth & Growth Hacking: Ali

**Ownership:** 50% Salman, 50% Ali

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Feature Inventory](#feature-inventory)
3. [Public Website Features](#public-website-features)
4. [User Account Features](#user-account-features)
5. [Admin Panel Features](#admin-panel-features)
6. [User Roles & Access Control](#user-roles--access-control)
7. [Technical Implementation Notes](#technical-implementation-notes)
8. [Database Requirements](#database-requirements)

---

## System Overview

The OncoNet System is a comprehensive digital ecosystem designed to increase cancer awareness, enable accurate diagnosis, and provide proper patient guidance. The platform serves three main audiences:

- **Public Visitors**: Access educational content, risk assessments, and health resources without registration
- **Registered Users**: Track personal health data, maintain health profiles, and receive personalized guidance
- **Admin Staff**: Manage content, educational resources, user communications, and platform insights

**Digital Assets:**
- Dedicated website
- Social media integration
- Comprehensive knowledge base
- Patient Q&A bank
- Data analysis system

### Key Statistics
- **Total Features**: 17
- **Public Pages**: 5
- **User Account Features**: 5
- **Admin Features**: 7
- **User Roles**: 4 (Public Visitor + 3 registered roles)

---

## Feature Inventory

| Feature ID | Feature Name | Category | Status |
|---|---|---|---|
| 1 | Home Page | Public | Core |
| 2 | Articles & Journal | Public | Core |
| 3 | Breast Cancer Risk Calculator | Public | Core |
| 4 | About Page | Public | Core |
| 5 | Contact Form | Public | Core |
| 6 | Login / Register with OTP | User Account | Core |
| 7 | Login with Password | User Account | Core |
| 8 | Health Profile | User Account | Core |
| 9 | Self-Check Log | User Account | Core |
| 10 | Monthly Self-Check Reminder | User Account | Core |
| 11 | Admin Login | Admin | Core |
| 12 | Articles Management | Admin | Core |
| 13 | Page SEO Settings | Admin | Core |
| 14 | Messages Inbox | Admin | Core |
| 15 | User Management | Admin | Super Admin Only |
| 16 | Role & Permissions Management | Admin | Super Admin Only |
| 17 | In-Panel Notifications | Admin | Core |

---

## Public Website Features

### Feature 1: Home Page
**Purpose**: Main landing page introducing the platform  
**Access**: Public (no login required)  
**Components**:
- Hero section with branding
- Quick navigation links
- Call-to-action buttons to Articles, Self-Check, and Contact
- Responsive navigation bar

**Implementation Requirements**:
- Mobile-responsive design
- Fast loading time (optimize images)
- SEO-friendly structure
- Link to all other public features

---

### Feature 2: Articles & Journal
**Purpose**: Educational content library on breast health topics  
**Access**: Public (no login required)  
**Functionality**:
- Display list of all published articles
- Show cover image, title, summary, author, and reading time
- Full article detail view with rich text content
- **Search**: Filter articles by keyword
- **Filter by Category**: Prevention, Self-Check, Treatment, Lifestyle, General
- Only published articles visible to public (drafts hidden)

**Data Fields per Article**:
- Title
- Summary
- Content (rich text/HTML)
- Category
- Cover image
- Author name
- Reading time (estimated)
- Publication status (draft/published)
- SEO fields (title tag, meta description, keywords, OG image)

**Implementation Requirements**:
- Full-text search capability
- Category filtering with UI toggles
- Article detail page with back navigation
- Image optimization for thumbnails and full display
- SEO metadata rendering in page head

---

### Feature 3: Breast Cancer Risk Calculator (Gail Model)
**Purpose**: Interactive multi-step form for breast cancer risk estimation  
**Access**: Public (no login required)  
**Algorithm**: Gail Model

**Step 1 - User Input**:
- Current age (numeric)
- Age at first menstrual period (numeric)
- Age at first live birth (numeric, optional)
- Family history: relatives with breast cancer (yes/no + relationship type)
- Number of past breast biopsies (numeric)

**Step 2 - Results Display**:
- Risk score (calculated percentage)
- Risk level category (Low / Moderate / High)
- Personalized recommendation based on risk level
- Reset button to recalculate with new values

**Implementation Requirements**:
- Client-side or server-side calculation (Gail Model algorithm)
- Form validation for all inputs
- Clear result presentation with color coding
- Recommendation messaging based on risk tier
- Printable results option (optional)

---

### Feature 4: About Page
**Purpose**: Information about the platform, mission, and team  
**Access**: Public (no login required)  
**Content**:
- Platform mission statement
- Team information
- Organization background
- Contact information for inquiries

**Implementation Requirements**:
- Static or CMS-managed content
- Image gallery support
- Team member profiles
- SEO optimized

---

### Feature 5: Contact Form
**Purpose**: Allow public visitors to send messages to platform team  
**Access**: Public (no login required)  
**Form Fields**:
- Full name (required, text)
- Mobile number (required, phone format)
- Subject (required, text)
- Message body (required, textarea)

**Validation**:
- All fields required
- Mobile number format validation
- Message length limits (min 10, max 1000 characters)

**On Submit**:
- Display success confirmation message
- Store message in database
- Route to Admin Inbox (Feature 14)
- Send confirmation email (optional)
- Clear form on success

**Implementation Requirements**:
- Client-side and server-side validation
- CSRF protection
- Rate limiting to prevent spam
- Email notification to admin
- Database storage of messages

---

## User Account Features

### Feature 6: Login / Register with OTP
**Purpose**: Mobile-based authentication with one-time passcode  
**Access**: Registered users + new user registration  
**Flow**:

1. **User Enters Mobile Number**
   - Field validation for valid phone format
   - Check if mobile exists (for login) or create new user

2. **OTP Generation & Delivery**
   - Generate 5-digit random code
   - Send via SMS
   - Store OTP with 2-minute expiration
   - 60-second cooldown before requesting new code

3. **OTP Input**
   - 5-box input field
   - Auto-advances to next box on digit entry
   - Auto-submits when all 5 digits entered
   - Show remaining time to expiration
   - Resend button after cooldown

4. **Authentication**
   - Verify OTP and expire it immediately after use
   - Create session token
   - Redirect to user dashboard

**Security Requirements**:
- Rate limit OTP requests (max 3 per phone number per hour)
- OTP valid for 2 minutes only
- 60-second cooldown between requests
- Log all authentication attempts
- Invalid OTP limit (max 5 attempts)

---

### Feature 7: Login with Password
**Purpose**: Alternative login method for users with password set  
**Access**: Registered users who have set a password  
**Flow**:
- Enter mobile number
- Enter password
- Toggle between OTP and password login on same screen
- Forgot password recovery option (optional)

**Implementation Requirements**:
- Password hashing (bcrypt, Argon2, etc.)
- Session management
- Remember me option (optional)
- Password strength requirements

---

### Feature 8: Health Profile
**Purpose**: Personal health record stored server-side  
**Access**: Authenticated users only  
**Data Fields**:
- Full name (text)
- Mobile number (phone)
- Year of birth (numeric)
- Date of last menstrual period (date)
- Family history of breast cancer (dropdown: none / mother / sister / aunt / other relatives)
- Risk factors flag (yes/no)

**Synchronization**:
- Accessible across devices
- Real-time updates
- Server-side persistence

**Implementation Requirements**:
- Profile edit form with validation
- Data encryption for sensitive fields
- Last modified timestamp
- Database schema for user profiles

---

### Feature 9: Self-Check Log
**Purpose**: Record monthly breast self-examination results  
**Access**: Authenticated users only  
**Data Entry**:
- Log date (auto-populated with today, editable)
- Result: **Normal** or **Noticeable Change** (radio/toggle)
- Symptoms (multi-select checkboxes): lump, swelling, skin change, discharge, etc.
- Free-text notes (textarea)

**History View**:
- Chronological list of all past logs
- Show date, result, and quick symptoms preview
- Click to expand and view full details
- Edit/delete existing logs

**Implementation Requirements**:
- Form validation
- Date picker component
- Multi-select UI for symptoms
- History filtering and sorting
- Data export option (optional)

---

### Feature 10: Monthly Self-Check Reminder
**Purpose**: Set reminder to perform monthly breast self-examination  
**Access**: Authenticated users only  
**Functionality**:
- Toggle reminder on/off
- Choose reminder day of month (1–31)
- Option to receive reminder via SMS, email, or in-app notification

**Implementation Requirements**:
- Reminder scheduling system
- Database storage of reminder preferences
- Notification delivery service (email/SMS)
- Cron job or scheduled task runner

---

## Admin Panel Features

### Feature 11: Admin Login
**Purpose**: Authenticate admin staff into management panel  
**Access**: Admin staff only (Editor, Super Admin)  
**Authentication Method**: Mobile + Password  
**On Login Success**:
- Display role label: "Senior Admin", "Editorial Team", or "Super Admin"
- Store session in browser/server
- Redirect to admin dashboard

**Implementation Requirements**:
- Separate authentication from user login
- Role-based access control
- Admin session timeout (30 minutes)
- Login audit logging

---

### Feature 12: Articles Management
**Purpose**: Create, edit, and publish articles  
**Access**: Admin only (Editorial Team, Super Admin)  
**List View**:
- Display all articles (published + drafts)
- Show title, author, status, last modified date
- Search and filter options

**Create/Edit Article**:
- Title (required, text)
- Summary (required, textarea)
- Content (required, rich text editor with formatting options)
- Category (required, dropdown): Prevention, Self-Check, Treatment, Lifestyle, General
- Cover image (required, image upload with preview)
- Author (required, text or user selector)
- Reading time (auto-calculated or manual input)
- SEO Fields:
  - Title tag (max 60 chars)
  - Meta description (max 160 chars)
  - Keywords (comma-separated)
  - OG image (for social sharing)
- Publish/Unpublish toggle
- Preview before publishing
- Save as draft
- Delete with confirmation

**Implementation Requirements**:
- Rich text editor (e.g., TinyMCE, Quill, Draft.js)
- Image upload with validation and optimization
- Auto-save drafts
- Revision history (optional)
- Publish scheduling (optional)

---

### Feature 13: Page SEO Settings
**Purpose**: Manage SEO metadata for public pages  
**Access**: Admin only (Editorial Team, Super Admin)  
**Pages Covered**:
- Home
- Articles
- Self-Check
- About
- Contact

**SEO Fields per Page**:
- Meta title (max 60 chars, displayed in browser tab)
- Meta description (max 160 chars, displayed in search results)
- Keywords (comma-separated list)
- Canonical URL (to prevent duplicate content)
- OG title (Open Graph for social sharing)
- OG description (Open Graph for social sharing)
- Sitemap priority (0.0–1.0)

**Implementation Requirements**:
- Form with character counters
- Preview of how page appears in search results
- Bulk SEO editing (optional)
- SEO score indicator (optional)

---

### Feature 14: Messages Inbox
**Purpose**: View and manage contact form submissions  
**Access**: Admin only (Editorial Team, Super Admin)  
**List View**:
- Sender name
- Subject
- Date submitted
- Read/unread status
- Mark as read/unread
- Delete with confirmation

**Message Detail View**:
- Full sender information: name, mobile number
- Subject
- Message body
- Timestamp
- Reply button (if email service configured)

**Implementation Requirements**:
- Database storage of messages
- Pagination for large message lists
- Search functionality
- Message status tracking

---

### Feature 15: User Management *(Super Admin Only)*
**Purpose**: Manage admin staff accounts  
**Access**: Super Admin only  
**List View**:
- Name, mobile number, role, type, date added
- Search and sort
- Edit and delete buttons

**Add New Staff**:
- Full name (required)
- Mobile number (required, unique)
- Role (required, dropdown)
- Specialization (text)
- Password (required, with strength indicator)
- Permissions (multi-select, based on role)
- Send welcome email (optional)

**Edit User**:
- Update any field
- Reset password option
- Change role
- Modify permissions

**Delete User**:
- Confirmation dialog
- Option to archive instead of delete
- Audit log entry

**Implementation Requirements**:
- User database schema
- Role-based permission assignment
- Password reset functionality
- Audit logging

---

### Feature 16: Role & Permissions Management *(Super Admin Only)*
**Purpose**: Define custom roles and control permissions  
**Access**: Super Admin only  
**List View**:
- Role name
- Description
- Number of users with role
- Edit and delete buttons (for non-system roles)

**Create Role**:
- Internal name (unique identifier)
- Display name (user-friendly name)
- Description
- Select allowed actions (checkboxes):
  - View articles
  - Create articles
  - Edit articles
  - Delete articles
  - View SEO settings
  - Edit SEO settings
  - View inbox
  - Delete messages
  - Manage users
  - Manage roles

**Edit Role**:
- Modify any field
- Update permissions
- Cannot edit system roles (Editor, Super Admin)

**Delete Role**:
- Only non-system roles can be deleted
- Reassign users to another role first
- Confirmation required

**System Roles** (built-in):
- **Editor**: Can manage articles and view inbox
- **Super Admin**: Full access to all features

**Implementation Requirements**:
- Role-permission mapping in database
- Permission checking middleware
- Audit logging of role changes

---

### Feature 17: In-Panel Notifications
**Purpose**: Provide instant feedback for admin actions  
**Access**: Admin panel only  
**Notification Types**:
- **Success** (green): Action completed successfully
- **Error** (red): Action failed with error message
- **Info** (blue): General information (optional)
- **Warning** (orange): Important notices (optional)

**Display Behavior**:
- Toast notification (top-right or center of screen)
- Auto-dismiss after 3-5 seconds
- Click to manually dismiss
- Stack multiple notifications

**Implementation Requirements**:
- Toast notification component/library
- Consistent styling across admin panel
- Show validation errors
- Show server error messages

---

## User Roles & Access Control

| Role | Login Method | Access | Permissions |
|---|---|---|---|
| **Public Visitor** | None | Home, Articles, Calculator, About, Contact | Read-only public content |
| **Site User** | OTP or Password (mobile) | Public pages + Profile, Self-Check Log, Reminder | Read/write personal data |
| **Editor** | Password (mobile) | Articles, SEO, Inbox | Manage articles, SEO, view messages |
| **Super Admin** | Password (mobile) | Everything | Full system access |

### Access Control Implementation
- Implement middleware for route protection
- Check user role and permissions on backend
- Hide UI elements based on role on frontend
- Log unauthorized access attempts
- Session timeout after inactivity

---

## Technical Implementation Notes

### Frontend Stack
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **State Management**: (Redux/Context API)
- **UI Components**: Tailwind CSS
- **Rich Text Editor**: TinyMCE or similar
- **Date Picker**: React Calendar or similar
- **HTTP Client**: Axios or Fetch API

### Backend Stack
- **Framework**: .NET 8 (C#)
- **Database**: SQL Server or PostgreSQL
- **Authentication**: JWT or Session-based
- **OTP Service**: Twilio or similar SMS provider
- **Email Service**: SendGrid or similar
- **Caching**: Redis (optional)

### Key Architectural Considerations
1. **Security**:
   - Implement HTTPS/TLS
   - CSRF protection on forms
   - Input validation and sanitization
   - Rate limiting on sensitive endpoints
   - Secure password hashing

2. **Performance**:
   - Database indexing on frequently queried fields
   - Image optimization and CDN
   - Caching strategies
   - Pagination for large datasets

3. **Scalability**:
   - Horizontal scaling capability
   - Database replication
   - Load balancing
   - Async job processing

4. **Monitoring**:
   - Error logging and reporting
   - Performance monitoring
   - User activity logging
   - Health checks

---

## Database Requirements

### Core Tables

#### Users
- `user_id` (PK)
- `mobile_number` (unique)
- `full_name`
- `password_hash`
- `role_id` (FK)
- `year_of_birth`
- `created_at`
- `updated_at`

#### User Health Profiles
- `profile_id` (PK)
- `user_id` (FK)
- `date_of_last_period`
- `family_history`
- `risk_factors`
- `updated_at`

#### Self-Check Logs
- `log_id` (PK)
- `user_id` (FK)
- `log_date`
- `result` (Normal/Noticeable Change)
- `symptoms` (JSON array)
- `notes`
- `created_at`

#### Articles
- `article_id` (PK)
- `title`
- `summary`
- `content`
- `category`
- `cover_image_url`
- `author`
- `reading_time`
- `published` (boolean)
- `seo_title`
- `seo_description`
- `seo_keywords`
- `og_image_url`
- `created_at`
- `updated_at`

#### Page SEO Settings
- `page_seo_id` (PK)
- `page_name`
- `meta_title`
- `meta_description`
- `keywords`
- `canonical_url`
- `og_title`
- `og_description`
- `sitemap_priority`
- `updated_at`

#### Contact Messages
- `message_id` (PK)
- `sender_name`
- `sender_mobile`
- `subject`
- `body`
- `read` (boolean)
- `created_at`

#### Admin Users
- `admin_id` (PK)
- `mobile_number` (unique)
- `full_name`
- `password_hash`
- `role_id` (FK)
- `specialization`
- `created_at`
- `updated_at`

#### Roles
- `role_id` (PK)
- `name` (unique)
- `display_name`
- `description`
- `is_system_role` (boolean)
- `created_at`

#### Role Permissions
- `permission_id` (PK)
- `role_id` (FK)
- `action` (permission name)

#### OTP Codes
- `otp_id` (PK)
- `mobile_number`
- `code`
- `expires_at`
- `attempts`
- `created_at`

#### Audit Log
- `log_id` (PK)
- `user_id` (FK)
- `Growth Hacking Strategy (Phases)

### Phase 1: Acquisition
**Goal:** Drive awareness and user acquisition

**Tactics:**
- SEO optimization for cancer health keywords
- Active Instagram engagement and community building
- Partnerships with doctors and healthcare professionals
- Collaboration with health media outlets
- Press releases and healthcare publication features

### Phase 2: Activation
**Goal:** Convert visitors to active users

**Tactics:**
- Risk assessment/testing tools
- User question submission and engagement
- Download practical guides and resources
- Health profile creation
- First self-check log entry

### Phase 3: Retention
**Goal:** Keep users engaged long-term

**Tactics:**
- Monthly newsletter with health insights
- Monthly specialist magazine distribution
- Active Q&A responses and engagement
- Targeted recommendations and referrals
- Personalized health reminders
- Community engagement through social media

---

## action`
- `resource_type`
- `resource_id`
- `timestamp`

---

## Deployment & Maintenance

### Pre-Launch Checklist
- [ ] All features tested in staging environment
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Documentation complete
- [ ] Team training completed

### Ongoing Maintenance
- Daily monitoring and error tracking
- Weekly backup verification
- Monthly security updates
- Quarterly performance review
- User feedback collection and analysis

---

## Support & Documentation

For questions or issues during implementation, refer to:
- Feature specifications above
- API documentation (generated after backend implementation)
- Frontend component library
- Database schema diagram
- Deployment guide

---

**End of Document**
