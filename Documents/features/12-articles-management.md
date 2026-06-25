# Feature 12: Articles Management

**Category:** Admin Panel  
**Access:** Admin staff (Editor, Super Admin)  
**Priority:** Core

---

## Overview

Comprehensive article creation, editing, publishing, and deletion system with rich text editing, SEO optimization, and content staging.

---

## Functionality

### Article List View

- Display all articles (published + drafts)
- Show per article:
  - Title
  - Author
  - Status (Published/Draft)
  - Last modified date
  - Category
  - Thumbnail image

- **Features:**
  - Search articles by title or author
  - Filter by status (All/Published/Drafts)
  - Filter by category
  - Sort by date, title, author
  - Pagination (10-50 articles per page)
  - Bulk actions (delete multiple, publish multiple)
  - Edit button per article
  - Delete button per article
  - Create new article button

---

### Create Article

Form with following fields:

**Basic Information:**
- **Title** (required, max 200 chars)
- **Summary** (required, max 500 chars)
  - Preview text shown on article list
- **Category** (required, dropdown)
  - Options: Prevention, Self-Check, Treatment, Lifestyle, General
- **Author** (required, user/staff selector)
- **Cover Image** (required, image upload)
  - Formats: JPG, PNG, WebP
  - Max size: 5MB
  - Preview shown
  - Crop/resize options

**Content:**
- **Content** (required, rich text editor)
  - Support for:
    - Headings (H1-H6)
    - Bold, italic, underline
    - Lists (ordered, unordered)
    - Links
    - Images (inline)
    - Tables
    - Code blocks
    - Blockquotes
  - WYSIWYG editor (TinyMCE, Quill, Draft.js)
  - Auto-save every 30 seconds
  - Save drafts

- **Reading Time** (auto-calculated or manual)
  - Estimate based on content length
  - Allow manual override

**SEO Fields:**
- **SEO Title** (required, max 60 chars)
  - Live preview of search result
- **SEO Meta Description** (required, max 160 chars)
  - Live preview of search result
- **Keywords** (optional, comma-separated)
- **OG Image** (optional, for social sharing)
  - Auto-use cover image if not set

**Publishing:**
- **Status** (Publish/Save as Draft)
- **Publish Date** (future scheduling optional)
- **Preview** button

---

### Edit Article

- All fields editable
- View version history (optional)
- Track changes by author
- Revert to previous version (optional)

---

### Article Actions

- **Publish** - Make live immediately or schedule
- **Unpublish** - Move to draft
- **Delete** - Remove with confirmation dialog
  - Optional: Soft delete (keep in archive)
  - Ask for reason/notes
  - Audit log entry
- **Preview** - View as public user would see
- **Duplicate** - Create copy for new article

---

## Implementation Requirements

- Rich text editor integration
- Image upload with optimization
- Auto-save functionality
- Version control/history
- WYSIWYG interface
- Validation for all fields
- Character counters
- Real-time SEO preview
- Mobile-responsive form layout
- Keyboard shortcuts for formatting

---

## UI Components

- Article list table/grid
- Search and filter bar
- Article creation form with tabs (Basic/Content/SEO)
- Rich text editor
- Image upload zone
- SEO preview boxes
- Character count indicators
- Save/Publish/Preview buttons
- Confirmation dialogs
- Toast notifications
- Loading states

---

## Technical Stack

- React/TypeScript frontend
- Tailwind CSS for styling
- Rich text editor: TinyMCE, Quill, or Draft.js
- Image optimization: Sharp or similar
- Backend: .NET API
- Database: SQL Server/PostgreSQL

---

## Database Requirements

### Articles Table
- `article_id` (PK, UUID)
- `title` (string, max 200)
- `summary` (string, max 500)
- `content` (text, rich HTML)
- `category` (enum)
- `cover_image_url` (string)
- `cover_image_path` (string, for storage)
- `author_id` (FK to admin users)
- `author_name` (string, snapshot)
- `reading_time` (integer, seconds)
- `published` (boolean, default: false)
- `publish_date` (timestamp, nullable)
- `seo_title` (string, max 60)
- `seo_description` (string, max 160)
- `seo_keywords` (string, comma-separated)
- `og_image_url` (string, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID, FK)
- `updated_by` (UUID, FK)

### Article Revisions Table (Optional)
- `revision_id` (PK, UUID)
- `article_id` (FK)
- `content` (text snapshot)
- `changed_fields` (JSON array)
- `changed_by` (UUID, FK)
- `changed_at` (timestamp)

### Indexes
- `category` (for filtering)
- `published` (for filtering)
- `publish_date` (for scheduling)
- `created_at` (for sorting)
- Full-text index on `title` and `content`

---

## API Endpoints

- `GET /admin/articles`
  - List articles with pagination/filtering
  - Query params: page, limit, status, category, sort
  - Response: Paginated article list

- `POST /admin/articles`
  - Create new article
  - Request: Article data
  - Response: Created article object

- `GET /admin/articles/:id`
  - Get single article for editing
  - Response: Article object with all fields

- `PUT /admin/articles/:id`
  - Update article
  - Request: Updated fields
  - Response: Updated article object

- `DELETE /admin/articles/:id`
  - Delete article
  - Response: Success message

- `POST /admin/articles/:id/publish`
  - Publish article
  - Response: Updated article with published=true

- `POST /admin/articles/:id/unpublish`
  - Unpublish article
  - Response: Updated article with published=false

- `POST /admin/articles/:id/preview`
  - Get article preview as public user sees it
  - Response: Rendered HTML

- `GET /admin/articles/:id/revisions`
  - Get revision history (optional)
  - Response: List of revisions

---

## Image Handling

- Upload to cloud storage (AWS S3, Azure Blob, etc.) or local storage
- Auto-optimize on upload:
  - Resize to max 2000x2000px
  - Compress (80% quality JPEG, 9% quality PNG)
  - Generate thumbnail (400x300px)
- Lazy loading on public articles
- CDN delivery for better performance

---

## Validation Rules

- Title: Required, 10-200 characters
- Summary: Required, 20-500 characters
- Content: Required, min 100 characters
- Category: Required, valid enum
- Cover image: Required, valid image format
- Reading time: Auto-calculated or 1-60 minutes
- SEO title: 30-60 characters recommended
- SEO description: 120-160 characters recommended
- Keywords: Max 10 keywords

---

## Publishing Workflow

1. **Draft**: Article being worked on, not visible
2. **Scheduled**: Set to publish at future date/time
3. **Published**: Live on website
4. **Unpublished**: Archived, not visible to public

---

## Notifications

- "Article saved as draft"
- "Article published successfully"
- "Article updated"
- "Article deleted"
- Confirmation before deleting published article
