---
description: Restore landing page from previous-design-backup
---

## Restore Landing Page Design

This workflow restores the landing page to the backed-up version called "previous-design-backup".

The backup is stored at:
`frontend/components/landing/landing-page.bak.tsx`

### Steps

1. Run the restore command to copy the backup over the current file:

```powershell
Copy-Item `
  "c:\Users\HP\OneDrive\Desktop\PROJECTS\AI SMART Health MANAGEMENT SYSTEM\frontend\components\landing\landing-page.bak.tsx" `
  "c:\Users\HP\OneDrive\Desktop\PROJECTS\AI SMART Health MANAGEMENT SYSTEM\frontend\components\landing\landing-page.tsx" `
  -Force
```

2. The Next.js dev server will hot-reload automatically. Refresh your browser to verify the restore.

> **Note:** The backup (`landing-page.bak.tsx`) is never deleted, so you can restore multiple times.
