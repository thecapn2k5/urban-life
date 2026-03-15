# UX and Feature Specification

This document outlines the user experience, core flows, and data structure for the Secure Local PWA Note-Taking App.

## 1. Authentication (App Lock)
*   **Initial Setup:** When the user installs or opens the app for the very first time, they will be prompted to create a simple PIN (e.g., 4 or 6 digits) or a Master Password. This will act as the encryption key for the local database.
*   **Subsequent Launches:** Every time the app is opened (or brought back from the background after a certain timeout), a Lock Screen will be presented. 
*   **Biometrics (Optional Enhancement):** Because PWAs have access to the Web Authentication API (WebAuthn), we can integrate FaceID / TouchID on iOS, or Fingerprint on Android, to unlock the app instead of typing the PIN every time.

## 2. Main Member List (Home Screen)
After successfully unlocking the app, the user lands on the Home Screen.

*   **List View:** A vertical list displaying all saved members. Each list item will prominently show the member's **Name** and **Surname**. Optionally, a secondary line can show their Ministry Department.
*   **Search Bar:** Pinned to the top of the screen.
    *   **Functionality:** Performs partial/fuzzy matching in real-time as the user types.
    *   **Searchable Fields:** Name, Surname, and Ministry Department.
*   **Navigation:** A 3-dot menu (or a floating action button 'FAB') located in the top-right corner.

## 3. The 3-Dot Menu & "Add Member" Flow
Tapping the 3-dot menu reveals an **"Add new member"** option. Tapping this opens the Member Form in "Create" mode.

### The Member Form Fields:
1.  **Name** (Text input)
2.  **Surname** (Text input)
3.  **Phone Number** (Tel input)
    *   *Validation:* Must support South African format. Allows either 10 digits starting with a `0` (e.g., `082 123 4567`), or starting with the country code `+27` followed by 9 digits (e.g., `+27 82 123 4567`).
4.  **Email** (Email input)
5.  **Birthday** (Date picker)
6.  **Ministry Department** (Text input or Dropdown, depending on preference)
7.  **Notes** (Large multi-line Text Area)

*   **Saving:** A "Save" button at the bottom (or top right) to commit the new member to the encrypted local database.

## 4. Member Details (View / Edit / Delete)
*   **Viewing:** Tapping a member from the Main List opens their full Profile/Details view. This screen displays all the fields (Name, Phone, Notes, etc.) in a read-only format.
*   **Updating:** An "Edit" button (often a pencil icon) on the Details view transforms the screen back into the Member Form, allowing the user to modify any field and save the changes.
*   **Sharing:** A "Share" icon (standard iOS/Android share glyph) visible on the Details view. Tapping this packages the member's data into a JSON file and invokes the native device share sheet (email, messages, etc.).
*   **Deleting:** A "Delete" option (usually a trash can icon or an option within a specific member's 3-dot menu) allows the user to remove the member from the database. A confirmation dialog should appear ("Are you sure?") to prevent accidental deletion.

## 5. Data Structure Example (JSON Export)
When a member is shared, the generated JSON will look something like this:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John",
  "surname": "Doe",
  "phoneNumber": "+27821234567",
  "email": "john.doe@example.com",
  "birthday": "1990-05-15",
  "ministryDepartment": "Worship Team",
  "notes": "Plays acoustic guitar. Available on Sunday mornings."
}
```
