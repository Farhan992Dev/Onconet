# Feature 17: In-Panel Notifications

**Category:** Admin Panel  
**Access:** All admin staff  
**Priority:** Core

---

## Overview

Instant visual feedback for admin actions through toast notifications. Provides success, error, and informational messages after every admin operation.

---

## Notification Types

### Success (Green)
- Action completed successfully
- Icon: Checkmark
- Background: Green (#10b981 or similar)
- Text: White
- Examples:
  - "Article published successfully"
  - "User added to system"
  - "Settings saved"

### Error (Red)
- Action failed or error occurred
- Icon: X or exclamation mark
- Background: Red (#ef4444 or similar)
- Text: White
- Examples:
  - "Failed to save article"
  - "Mobile number already exists"
  - "Invalid input provided"

### Info (Blue)
- General information or confirmation
- Icon: Info (i) icon
- Background: Blue (#3b82f6 or similar)
- Text: White
- Examples:
  - "Loading data..."
  - "Please wait while processing"

### Warning (Orange) [Optional]
- Important notice or warning
- Icon: Warning triangle
- Background: Orange (#f59e0b or similar)
- Text: White
- Examples:
  - "This action cannot be undone"
  - "Article scheduled for future date"

---

## Display Behavior

### Position
- Top-right corner of screen
- Alternative positions: Top-center, bottom-right (configurable)
- Respects safe area on mobile

### Size & Layout
- Width: 300-400px (responsive)
- Min height: 50px (with text + icon)
- Padding: 16px
- Border radius: 4-8px
- Box shadow: Subtle elevation

### Duration
- Auto-dismiss after 3-5 seconds
- User can manually dismiss by clicking X
- Longer for warnings (5-7 seconds)
- Persistent for errors (until dismissed or 10 seconds)

### Stacking
- Multiple notifications stack vertically
- Most recent at top
- Max 3 notifications visible (older ones hidden)
- Show count indicator if more notifications queued

---

## Content

### Message Format
- **Title** (bold, optional)
- **Description** (regular text)
- **Action Link** (optional, secondary action)

Examples:
```
✓ Article saved
Article "Breast Cancer Prevention" saved as draft

✓ Success
Article published! View it now →

✗ Error
Failed to upload image - File too large (max 5MB)

ℹ Info
Loading articles... Please wait

⚠ Warning
This action will delete 5 articles permanently
```

---

## Functionality

### Dismissal
- Click X button to close immediately
- Click anywhere outside notification (optional)
- Auto-dismiss timer
- Escape key (optional)

### Actions
- Optional secondary action link/button
- Examples:
  - "View published article"
  - "Retry upload"
  - "Undo" (if applicable)

### Accessibility
- ARIA labels for screen readers
- Role: "alert" for error/warning
- Focus management on click
- Keyboard accessible

---

## Implementation Requirements

- Toast notification component
- Notification queue/context management
- Consistent styling across all admin screens
- Mobile-responsive
- Accessibility compliance (WCAG)
- Performance optimized (no memory leaks)
- TypeScript types for notifications

---

## UI Components

- Toast notification component
- Notification container
- Icons for each type
- Dismiss button (X)
- Progress bar (time remaining)
- Action link/button

---

## Technical Stack

- React/TypeScript frontend
- React Context or state management for queue
- Toast library: react-toastify, sonner, or custom
- Tailwind CSS for styling
- Icon library: React Icons or similar

---

## API Integration

Every API call shows notification:

```typescript
// Example flow
POST /admin/articles
  ↓ Loading (show spinner)
  ↓ Success: "Article saved"
  ↓ or Error: "Failed to save: [reason]"
```

---

## Example Notifications

### Article Management
- "Article created successfully"
- "Article updated successfully"
- "Article published successfully"
- "Article unpublished"
- "Article deleted"
- "Failed to create article - Title is required"

### SEO Management
- "SEO settings saved"
- "Meta description too long (max 160 chars)"
- "Failed to update - Invalid canonical URL"

### User Management
- "Staff member added successfully"
- "Staff member updated"
- "Password reset sent to {email}"
- "User deleted successfully"
- "Mobile number already in use"

### Messages
- "Message marked as read"
- "Reply sent successfully"
- "Message deleted"
- "Failed to send reply - Please try again"

### Role Management
- "Role created successfully"
- "Role deleted - 0 users affected"
- "Role deleted - Reassign 2 users first"
- "Permissions updated"

---

## Configuration

Notification settings:

```typescript
interface ToastConfig {
  position: 'top-right' | 'top-center' | 'bottom-right'
  duration: number // milliseconds
  showCloseButton: boolean
  autoClose: boolean
  maxNotifications: number // max visible
  transition: 'fadeInOut' | 'slideInOut'
}
```

---

## Error Message Guidelines

- Be specific and helpful
- Include what went wrong
- Suggest next steps when possible
- Avoid technical jargon

**Good:** "Failed to upload image - File too large (max 5MB)"  
**Bad:** "Error 400"

**Good:** "Mobile number already exists in system"  
**Bad:** "Validation failed"

---

## State Persistence

- Do NOT persist notifications to localStorage
- Clear all notifications on page reload
- Clear notifications on navigation (optional)
- Keep notification history in memory only

---

## Analytics (Optional)

Track:
- Most common error messages
- Success rate per action
- User interaction with notifications

---

## Keyboard Shortcuts (Optional)

- `Escape`: Close topmost notification
- `Ctrl+Z`: Undo last action (if applicable)

---

## Color Reference

| Type | Color | Hex |
|------|-------|-----|
| Success | Green | #10b981 |
| Error | Red | #ef4444 |
| Info | Blue | #3b82f6 |
| Warning | Orange | #f59e0b |

---

## Component Example (React)

```typescript
interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title?: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
  dismissible?: boolean
}

// Usage
showNotification({
  type: 'success',
  title: 'Success',
  message: 'Article published successfully',
  action: {
    label: 'View',
    onClick: () => router.push(`/articles/${articleId}`)
  }
})
```
