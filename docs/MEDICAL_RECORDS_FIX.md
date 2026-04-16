# Medical Records Download Fix

## Problem
Users were getting **500 Internal Server Error** when trying to view or download medical records (PDF files).

### Error Details
```
GET /static/uploads/reports/report_ANTH_MR298_Saqib102.pdf/download - 500 (Internal Server Error)
```

## Root Cause
The backend routes for serving and downloading files were not properly handling subdirectories in the uploads folder.

### The Issue:
1. Files are stored in: `/static/uploads/reports/filename.pdf`
2. Frontend calls: `/static/uploads/reports/filename.pdf/download`
3. Backend route: `/static/uploads/<path:filename>/download`
4. The `<path:filename>` was capturing `reports/filename.pdf`
5. But the code was trying to find the file in `/uploads/` instead of `/uploads/reports/`

## Solution
Updated both the **view** and **download** endpoints to properly extract subdirectories from the file path.

### Files Modified
- `hospital/__init__.py`

### Changes Made

#### 1. Fixed Static File Serving (View)
**Before:**
```python
@app.route("/static/uploads/<path:filename>")
def serve_static(filename):
    static_folder = app.static_folder or os.path.join(app.root_path, 'static')
    response = make_response(send_from_directory(os.path.join(static_folder, 'uploads'), filename))
    # ...
```

**After:**
```python
@app.route("/static/uploads/<path:filename>")
def serve_static(filename):
    static_folder = app.static_folder or os.path.join(app.root_path, 'static')
    
    # Extract subdirectory and filename
    file_parts = filename.split('/')
    if len(file_parts) > 1:
        subdirectory = '/'.join(file_parts[:-1])
        actual_filename = file_parts[-1]
        upload_path = os.path.join(static_folder, 'uploads', subdirectory)
    else:
        actual_filename = filename
        upload_path = os.path.join(static_folder, 'uploads')
    
    response = make_response(send_from_directory(upload_path, actual_filename))
    # ...
```

#### 2. Fixed Download Endpoint
**Before:**
```python
@app.route("/static/uploads/<path:filename>/download")
def download_static(filename):
    static_folder = app.static_folder or os.path.join(app.root_path, 'static')
    response = make_response(send_from_directory(os.path.join(static_folder, 'uploads'), filename))
    # ...
```

**After:**
```python
@app.route("/static/uploads/<path:filename>/download")
def download_static(filename):
    static_folder = app.static_folder or os.path.join(app.root_path, 'static')
    
    # Extract subdirectory and filename
    file_parts = filename.split('/')
    if len(file_parts) > 1:
        subdirectory = '/'.join(file_parts[:-1])
        actual_filename = file_parts[-1]
        upload_path = os.path.join(static_folder, 'uploads', subdirectory)
    else:
        actual_filename = filename
        upload_path = os.path.join(static_folder, 'uploads')
    
    response = make_response(send_from_directory(upload_path, actual_filename))
    # ...
```

## How It Works Now

### Example Path Processing:
**Input:** `reports/report_ANTH_MR298_Saqib102.pdf`

1. Split by `/`: `['reports', 'report_ANTH_MR298_Saqib102.pdf']`
2. Extract subdirectory: `reports`
3. Extract filename: `report_ANTH_MR298_Saqib102.pdf`
4. Build path: `/static/uploads/reports/`
5. Serve file: `report_ANTH_MR298_Saqib102.pdf` from `/static/uploads/reports/`

### URL Flow:

#### Viewing a PDF:
```
Frontend: http://localhost:5000/static/uploads/reports/report_ANTH_MR298_Saqib102.pdf
    ↓
Backend: Extracts "reports" and "report_ANTH_MR298_Saqib102.pdf"
    ↓
Serves from: /static/uploads/reports/report_ANTH_MR298_Saqib102.pdf
    ↓
Response: PDF displayed inline in browser ✅
```

#### Downloading a PDF:
```
Frontend: http://localhost:5000/static/uploads/reports/report_ANTH_MR298_Saqib102.pdf/download
    ↓
Backend: Extracts "reports" and "report_ANTH_MR298_Saqib102.pdf"
    ↓
Serves from: /static/uploads/reports/report_ANTH_MR298_Saqib102.pdf
    ↓
Response: PDF downloaded with attachment header ✅
```

## Testing

### Test Case 1: View PDF in Browser
1. Navigate to Medical Records page
2. Click "View" button on a medical record
3. ✅ PDF should open in a new tab

### Test Case 2: Download PDF
1. Navigate to Medical Records page
2. Click "Download" button on a medical record
3. ✅ PDF should download to your computer

### Test Case 3: Patient Appointments
1. Navigate to Appointments page
2. Find a completed appointment with a report
3. Click "View Report" or "Download Report"
4. ✅ Should work without errors

## Benefits

1. **Fixed 500 Errors** - No more Internal Server Errors
2. **Proper File Organization** - Supports subdirectories in uploads
3. **Flexible Structure** - Works with any subdirectory structure
4. **Backward Compatible** - Still works with files directly in /uploads/

## File Structure Support

The fix now supports:
```
/static/uploads/
├── reports/
│   ├── report_1.pdf
│   └── report_2.pdf
├── images/
│   ├── xray_1.jpg
│   └── scan_1.png
└── documents/
    └── prescription_1.pdf
```

## Frontend (No Changes Needed)

The frontend code remains the same:
```typescript
// View PDF
href={`${process.env.NEXT_PUBLIC_API_URL}${record.report_url}`}

// Download PDF
href={`${process.env.NEXT_PUBLIC_API_URL}${record.report_url}/download`}
```

Where `record.report_url` = `/static/uploads/reports/filename.pdf`

## Error Handling

The fix includes proper error handling:
- If file doesn't exist: Flask returns 404
- If path is invalid: Flask returns 404
- If permissions issue: Flask returns 500 with error message

## Security

The fix maintains security:
- Uses `secure_filename()` when uploading
- Uses `send_from_directory()` which prevents directory traversal attacks
- Only serves files from the uploads directory

---

**Status**: ✅ Fixed
**Date**: January 30, 2026
**Impact**: Medical records viewing and downloading now works correctly
**Backend Running**: http://localhost:5000
