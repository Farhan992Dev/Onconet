# Feature 13: Page SEO Settings

**Category:** Admin Panel  
**Access:** Admin staff (Editor, Super Admin)  
**Priority:** Core

---

## Overview

Manage SEO metadata for each public page of the OncoNet website to optimize search engine visibility and social media sharing.

---

## Pages Managed

Following pages have SEO settings:
1. Home page
2. Articles page
3. Self-Check (calculator) page
4. About page
5. Contact page

---

## Functionality

### SEO Fields per Page

**Basic SEO:**
- **Meta Title** (required, max 60 chars)
  - Appears in browser tab and search results
  - Live preview showing how it looks in search results
- **Meta Description** (required, max 160 chars)
  - Summary appearing under title in search results
  - Live preview
- **Keywords** (optional, comma-separated)
  - Target keywords for SEO (max 10)

**Technical SEO:**
- **Canonical URL** (optional)
  - Prevent duplicate content issues
  - Usually same as page URL
- **Sitemap Priority** (optional, 0.0-1.0)
  - Higher = more important for crawlers
  - Default: 0.8 for main pages

**Social Media (Open Graph):**
- **OG Title** (optional, max 95 chars)
  - Title when shared on social media
  - Falls back to meta title if not set
- **OG Description** (optional, max 300 chars)
  - Description when shared on social media
  - Falls back to meta description if not set
- **OG Image** (optional, image upload)
  - Image displayed when shared on social media
  - Recommended: 1200x630px, max 5MB

---

## Implementation Requirements

- Form for each page
- Live previews of search results and social cards
- Character counters with warnings
- SEO score indicator (optional)
- Validation for all fields
- Image upload and preview
- HTTPS enforced
- Structured data support (JSON-LD)
- Mobile-responsive form layout

---

## UI Components

- Page selector/tabs
- SEO field inputs
- Character counters
- Live preview boxes:
  - Search result preview
  - Social media card preview (Facebook, Twitter)
- Save button
- Success/error messages
- SEO analysis/suggestions (optional)
- Last modified timestamp

---

## Technical Stack

- React/TypeScript frontend
- Tailwind CSS for styling
- Backend: .NET API
- Database: SQL Server/PostgreSQL

---

## Database Requirements

### Page SEO Settings Table
- `seo_id` (PK, UUID)
- `page_name` (string, unique)
  - Options: home, articles, calculator, about, contact
- `meta_title` (string, max 60)
- `meta_description` (string, max 160)
- `keywords` (string, comma-separated)
- `canonical_url` (string, nullable)
- `og_title` (string, max 95, nullable)
- `og_description` (string, max 300, nullable)
- `og_image_url` (string, nullable)
- `og_image_path` (string, nullable)
- `sitemap_priority` (decimal, 0.0-1.0)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `updated_by` (UUID, FK)

### Indexes
- `page_name` (unique, for quick lookup)

---

## API Endpoints

- `GET /admin/seo/pages`
  - Get all pages with SEO settings
  - Response: List of pages

- `GET /admin/seo/:page_name`
  - Get SEO settings for specific page
  - Response: SEO settings object

- `PUT /admin/seo/:page_name`
  - Update SEO settings for page
  - Request: Updated SEO fields
  - Response: Updated settings object

- `POST /admin/seo/:page_name/preview`
  - Generate preview of page as it appears in search results
  - Response: HTML preview or image

---

## Frontend Rendering

These meta tags are rendered in page `<head>`:

```html
<!-- Meta Tags -->
<title>{meta_title}</title>
<meta name="description" content="{meta_description}">
<meta name="keywords" content="{keywords}">
<link rel="canonical" href="{canonical_url}">

<!-- Open Graph (Social Media) -->
<meta property="og:title" content="{og_title || meta_title}">
<meta property="og:description" content="{og_description || meta_description}">
<meta property="og:image" content="{og_image_url}">
<meta property="og:url" content="{page_url}">
<meta property="og:type" content="website">

<!-- Twitter Card (Optional) -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{og_title || meta_title}">
<meta name="twitter:description" content="{og_description || meta_description}">
<meta name="twitter:image" content="{og_image_url}">
```

---

## Structured Data (JSON-LD)

Optional: Add structured data for rich snippets in search results

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OncoNet",
  "url": "https://onconet.ir",
  "logo": "https://onconet.ir/logo.png",
  "description": "Digital ecosystem for cancer awareness",
  "sameAs": [
    "https://instagram.com/onconet",
    "https://facebook.com/onconet"
  ]
}
```

---

## SEO Best Practices

Display guidelines:
- **Title:** 30-60 characters for optimal display
- **Description:** 120-160 characters for full display
- **Keywords:** Focus on 3-5 main keywords
- **Keywords:** No keyword stuffing
- **Canonical URL:** Use HTTPS
- **OG Image:** 1200x630px for best display

---

## Sitemap Integration

SEO settings feed into `/sitemap.xml`:
- Include all pages with settings
- Use `sitemap_priority` field
- Auto-update on each change

---

## Search Console Integration (Future)

Optional: Direct integration with Google Search Console
- Track search performance
- Monitor indexation
- Receive alerts

---

## Validation Rules

- Meta title: 30-60 chars recommended, max 60
- Meta description: 120-160 chars recommended, max 160
- OG title: 30-95 chars recommended
- OG description: 200-300 chars recommended
- Keywords: 3-5 main keywords, max 10 total
- Sitemap priority: Valid decimal 0.0-1.0

---

## Change Tracking

Track all SEO changes:
- Show what changed
- Show who changed it
- Show when it changed
- Allow reverting to previous version (optional)
