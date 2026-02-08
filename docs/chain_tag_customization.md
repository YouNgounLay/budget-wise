# Chain Customization and Tag System Documentation

## Overview

This document describes the chain customization features and the new tag system added to Budget-wise. These features allow users to personalize their deposit chains with colors and organize their accounts using customizable tags.

## Chain Customization

### Chain Colors

Chains now support color customization similar to accounts:

- **Predefined Colors**: Choose from the same color palette available for accounts (french-blue, yale-blue, fresh-sky, etc.)
- **Custom Colors**: Select any custom color using the color picker
- **Visual Indicator**: Chain cards display a colored banner at the top matching the selected color

### Combined Edit Modal

The chain editing experience has been streamlined:

- **Single Modal**: Chain settings and account management are now combined in one scrollable modal
- **Edit Button**: Displays "Edit" text next to the pencil icon for clarity
- **Delete Button**: Displays "Delete" text next to the trash icon for clarity
- **Manage Accounts**: Moved into the edit modal under "Manage Accounts" section
- **Scrollable Content**: Modal content scrolls if it exceeds the viewport height

## Tag System

### Creating Tags

1. Navigate to the **Tags** page from the sidebar
2. Click **+ New Tag** button
3. Enter a tag name
4. Select a color (predefined or custom)
5. Click **Save** to create the tag

### Managing Tags

- **Edit Tag**: Click the edit icon on any tag card to modify its name or color
- **Delete Tag**: Click the delete icon to remove a tag (accounts will no longer show this tag)
- **View Associated Accounts**: Each tag card shows a list of accounts using that tag

### Assigning Tags to Accounts

1. Open the account form (create new or edit existing)
2. In the **Tags** section, use the tag picker to:
   - Search for existing tags
   - Select tags to add
   - Create new tags inline
3. Remove tags by clicking the X on any selected tag badge

### Tag Display

- **Account Cards**: Tags appear as colored badges below the account name
- **Tags Page**: Shows all tags with their associated accounts in an expandable list

## Import/Export

The import/export system has been updated to include tags:

### JSON Export
```json
{
  "metadata": {
    "tagCount": 5
  },
  "accounts": [
    {
      "tagIds": ["tag-1", "tag-2"]
    }
  ],
  "chains": [
    {
      "color": "french-blue",
      "customColor": "#4a86e8"
    }
  ],
  "tags": [
    {
      "id": "tag-1",
      "name": "Essential",
      "color": "french-blue"
    }
  ]
}
```

### Excel Export

New sheets added:
- **Tags**: Contains all tag data (ID, Name, Color, Custom Color, timestamps)

Updated columns:
- **Accounts sheet**: Added "Tag IDs" column (comma-separated)
- **Chains sheet**: Added "Color" and "Custom Color" columns

### Backward Compatibility

- Importing older exports without tags works seamlessly
- Accounts get empty tagIds array by default
- Chains get 'french-blue' color by default

## Technical Implementation

### New Files

- `app/types/tag.ts` - Tag interface and DTOs
- `app/services/tagService.ts` - Tag CRUD operations
- `app/context/TagContext.tsx` - Global tag state management
- `app/components/tag/` - Tag UI components
- `app/tags/page.tsx` - Tags management page
- `app/components/chain/ChainEditModal.tsx` - Combined chain edit modal

### Modified Files

- `app/types/chain.ts` - Added color, customColor fields
- `app/types/account.ts` - Added tagIds field
- `app/services/exportService.ts` - Tags export support
- `app/services/importService.ts` - Tags import support
- `app/components/chain/ChainDisplay.tsx` - Edit/Delete text labels, color banner
- `app/components/account/AccountCard.tsx` - Tag badge display
- `app/components/account/AccountForm.tsx` - TagPicker integration

### Storage

Tags are persisted to localStorage under the key `budget-wise-tags`.
