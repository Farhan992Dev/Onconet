# Feature 9: Self-Check Log

**Category:** User Account  
**Access:** Authenticated users only  
**Priority:** Core

---

## Overview

Users record their monthly breast self-examination results with detailed symptom tracking and notes. Maintains complete history for pattern recognition and follow-up.

---

## Functionality

### Create Self-Check Log

Users can log a self-examination with the following data:

- **Log Date** (date, required)
  - Auto-populated with today's date
  - Editable to allow backdating
  - Validation: Cannot be future date

- **Examination Result** (radio/toggle, required)
  - **Normal**: No abnormalities detected
  - **Noticeable Change**: Detected something unusual

- **Symptoms** (multi-select checkboxes, optional if "Normal", required if "Noticeable Change")
  - Options:
    - Lump or mass
    - Swelling or thickness
    - Skin changes (dimpling, redness, etc.)
    - Nipple discharge
    - Nipple inversion
    - Skin texture changes
    - Warmth or heat
    - Pain or tenderness
    - Other (specify in notes)

- **Free-Text Notes** (textarea, optional)
  - Allow detailed description of findings
  - 0-500 character limit
  - Auto-save as user types

- **Breast Side** (selection, optional)
  - Left / Right / Both
  - Helpful for tracking specific areas

---

### History View

- Chronological list of all past logs
- Show date, result (Normal/Change), and quick symptoms preview
- Click to expand and view full details
- Sort by date (newest first, oldest first)
- Filter by result type (All / Normal / Changes)
- Search by date range
- Edit/delete existing logs

### Log Details View

- Full display of:
  - Examination date
  - Result status
  - All symptoms selected
  - Full notes
  - Created/last modified timestamps
- Edit button
- Delete button with confirmation
- Print button
- Share to doctor (send via email)

---

## Implementation Requirements

- Form validation
- Date picker component
- Multi-select UI for symptoms
- History filtering and sorting
- Real-time auto-save for notes
- Mobile-responsive design
- Search functionality
- Data persistence
- Audit logging of changes

---

## UI Components

- New log form (multi-step or single-page)
- Result toggle (Normal / Change)
- Symptom checkboxes with descriptions
- Notes textarea with character counter
- History list with expandable items
- Edit modal/form
- Delete confirmation dialog
- Print preview
- Export button

---

## Technical Stack

- React/TypeScript frontend
- Formik or React Hook Form for form management
- Tailwind CSS for styling
- Backend: .NET API
- Database: SQL Server/PostgreSQL

---

## Database Requirements

### Self-Check Logs Table
- `log_id` (PK, UUID)
- `user_id` (FK)
- `log_date` (date)
- `result` (enum: normal, noticeable_change)
- `breast_side` (enum: left, right, both, nullable)
- `symptoms` (JSON array or string list)
  - Stores selected symptom names
- `notes` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by_ip` (string, optional for audit)

### Indexes
- `user_id` (for user lookup)
- `log_date` (for sorting/filtering)
- `result` (for filtering)

---

## API Endpoints

- `POST /self-check/log`
  - Create new self-check log
  - Request: Log data
  - Response: Created log object

- `GET /self-check/history`
  - Get all logs for user
  - Query params: limit, offset, sort, filter
  - Response: Paginated list of logs

- `GET /self-check/log/:id`
  - Get single log detail
  - Response: Log object

- `PUT /self-check/log/:id`
  - Update existing log
  - Request: Updated fields
  - Response: Updated log object

- `DELETE /self-check/log/:id`
  - Delete a log (soft delete recommended)
  - Response: Success message

- `GET /self-check/export`
  - Export logs as PDF or CSV (optional)
  - Query params: date_from, date_to, format
  - Response: File download

---

## Symptoms Reference

Display helpful descriptions:
- **Lump or mass**: A distinct growth or hardened area
- **Swelling or thickness**: Generalized puffiness or thickening
- **Skin changes**: Dimpling, redness, or appearance changes
- **Nipple discharge**: Fluid leaking from nipple
- **Nipple inversion**: Nipple turning inward
- **Skin texture**: Orange peel appearance or other texture changes
- **Warmth or heat**: Localized warmth to touch
- **Pain or tenderness**: Discomfort with or without pressure

---

## Recommendations

If "Noticeable Change" selected:
- Display: "Please consult with a healthcare professional"
- Link to nearby doctors or clinics (optional)
- Link to relevant articles about symptoms
- Option to schedule appointment through platform (future feature)

---

## Privacy & Security

- Store logs encrypted
- Access logs only to authenticated user
- Log all access for audit
- Comply with health data privacy regulations
- Allow user to export/download their data
- Allow user to delete all logs

---

## Analytics

Track:
- Frequency of self-checks
- Symptom patterns over time
- Normal vs. abnormal findings ratio
- User engagement metrics
