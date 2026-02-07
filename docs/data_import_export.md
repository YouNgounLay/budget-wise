# Data Import/Export Feature Documentation

## Implementation Date
February 8, 2026

## Feature Overview
A data import/export functionality that allows users to export their budget data as Excel spreadsheets (primary format for non-technical users) or JSON files, and import data from previously exported files.

## Requirements
- Export button allows users to export data as Excel spreadsheet (.xlsx)
- Option to export as JSON format (.json)
- Import function allows users to import data based on the export structure
- Data validation on import to ensure integrity
- Warning before import as it replaces existing data

## Implementation Details

### Files Created

#### 1. `app/services/exportService.ts`
- `gatherExportData()` - Collects all accounts and chains from storage
- `exportToJSON()` - Exports all data as a formatted JSON file
- `exportToExcel()` - Exports data as an Excel workbook with multiple sheets:
  - **Metadata** - App name, version, export date, counts
  - **Accounts** - All account data with proper column widths
  - **Chains** - All chain data
  - **Chain Accounts** - Relationship table linking chains to accounts

#### 2. `app/services/importService.ts`
- `validateAccount()` - Validates individual account structure
- `validateChain()` - Validates individual chain structure
- `validateExportData()` - Validates the entire export data structure
- `importFromJSON(file)` - Parses and imports JSON file
- `importFromExcel(file)` - Parses and imports Excel file
- `importFromFile(file)` - Auto-detects file type and imports

#### 3. `app/components/shared/DataImportExportModal.tsx`
- Modal component with two tabs: Export and Import
- Export tab with format selection (Excel/JSON) and download button
- Import tab with drag-and-drop file upload zone
- Validation feedback and error display
- Warning about data replacement

### Files Modified

#### 1. `app/services/index.ts`
- Added exports for `exportService` and `importService`

#### 2. `app/components/shared/index.ts`
- Added export for `DataImportExportModal`

#### 3. `app/components/layout/Header.tsx`
- Added Data Management icon button
- Integrated `DataImportExportModal` component
- Added `onDataChange` callback for parent components

### Dependencies Added
- `xlsx` (v0.18.5) - SheetJS library for Excel file handling

## Architecture

### Export Flow
1. User clicks the data management icon in header
2. Modal opens with Export tab active
3. User selects format (Excel or JSON)
4. User clicks Export button
5. Data is gathered from localStorage
6. File is generated and downloaded

### Import Flow
1. User clicks the data management icon in header
2. User switches to Import tab
3. User drags/drops or selects a file
4. File is parsed and validated
5. If valid, data is saved to localStorage
6. Page reloads to reflect new data

### Excel File Structure

| Sheet | Columns |
|-------|---------|
| Metadata | Property, Value |
| Accounts | ID, Name, Description, Amount, Icon, Color, Custom Color, Created At, Updated At |
| Chains | ID, Name, Description, Default Limit, Overflow Account ID, Created At, Updated At |
| Chain Accounts | Chain ID, Chain Name, Account ID, Limit |

### JSON File Structure
```json
{
  "metadata": {
    "appName": "BudgetWise",
    "version": "1.0",
    "exportDate": "2026-02-08T...",
    "accountCount": 5,
    "chainCount": 2
  },
  "accounts": [...],
  "chains": [...]
}
```

## Usage

### Exporting Data
1. Click the folder icon in the header
2. Select "Excel" or "JSON" format
3. Click "Export as Excel" or "Export as JSON"
4. File downloads automatically

### Importing Data
1. Click the folder icon in the header
2. Switch to the "Import" tab
3. Drag and drop a file or click to browse
4. Review validation results
5. Click "Import Data" to confirm
6. Page reloads with imported data

## Validation Rules

### Account Validation
- Must have a valid string ID
- Must have a valid string name
- Must have a numeric amount
- Must have a valid icon type
- Must have a valid color type

### Chain Validation
- Must have a valid string ID
- Must have a valid string name
- Must have an accounts array

## Error Handling
- Invalid file format shows error message
- Validation errors are listed (max 5 shown)
- Parse errors display the error message
- Import failure does not affect existing data

## Testing Checklist
- [x] Export data as Excel works
- [x] Export data as JSON works
- [x] Excel file has correct structure with 4 sheets
- [x] JSON file has correct structure
- [x] Import from Excel works
- [x] Import from JSON works
- [x] Validation errors are shown for invalid files
- [x] Warning displayed before import
- [x] Page reloads after successful import
- [x] Drag and drop file upload works
- [x] Click to browse file upload works
