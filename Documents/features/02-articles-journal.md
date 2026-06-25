# Feature 2: Articles & Journal

**Category:** Public Website  
**Access:** Public (no login required)  
**Priority:** Core

---

## Overview

A comprehensive content library covering cancer health topics with advanced search and filtering capabilities.

---

## Functionality

### List View
- Browsable list of all published articles
- Each article shows:
  - Cover image/thumbnail
  - Title
  - Summary
  - Author name
  - Reading time estimate
- Only published articles visible to public (drafts hidden)

### Detail View
- Full article content with rich text formatting
- Author information
- Publication date
- Related articles suggestions
- Share to social media buttons

### Search
- Full-text search by keyword
- Real-time search results
- Highlighted matching terms

### Filtering
- Filter by category:
  - Prevention
  - Self-Check
  - Treatment
  - Lifestyle
  - General

---

## Data Fields per Article

- Title (required)
- Summary (required)
- Content (required, rich text/HTML)
- Category (required)
- Cover image (required)
- Author name (required)
- Reading time (auto-calculated or manual)
- Publication status (draft/published)
- SEO fields:
  - Title tag (max 60 chars)
  - Meta description (max 160 chars)
  - Keywords (comma-separated)
  - OG image (for social sharing)
- Created date
- Updated date

---

## Implementation Requirements

- Full-text search database indexing
- Category filtering with UI toggles
- Article detail page with back navigation
- Image optimization (thumbnails and full display)
- Pagination for large lists
- SEO metadata rendering in page head
- Lazy loading for images
- Responsive design for mobile

---

## UI Components

- Article list grid/card layout
- Search bar
- Category filter buttons
- Article detail page
- Reading time indicator
- Share buttons
- Pagination controls

---

## Technical Stack

- React/TypeScript frontend
- Tailwind CSS for styling
- .NET backend for article management
- Database: SQL Server/PostgreSQL

---

## Database Requirements

### Articles Table
- `article_id` (PK)
- `title`
- `summary`
- `content` (rich text)
- `category` (enum)
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

### Indexes
- `category` (for filtering)
- `published` (for filtering)
- Full-text index on `title` and `content` (for search)

---

## API Endpoints

- `GET /articles` - List all published articles with pagination
- `GET /articles/:id` - Get single article detail
- `GET /articles/search?q=keyword` - Search articles
- `GET /articles?category=prevention` - Filter by category

---

## SEO Metadata

- Dynamic titles and descriptions per article
- Structured data markup (Schema.org)
- Open Graph tags for social sharing
- Canonical URLs
