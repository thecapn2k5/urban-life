# Architecture Outline: Secure Local PWA Note-Taking App

This document outlines the chosen architecture for the offline-first, secure note-taking Progressive Web Application (PWA).

## Core Requirements
1. **Cross-platform (iOS and Android)** without App Store reviews.
2. **Offline capabilities** (Local-first data storage).
3. **Local App Lock**: A login/PIN system to encrypt the app locally. No cloud sync or SSO needed.
4. **Data Export/Import**: Ability to export a note/record as a JSON file via email, which a recipient can then import.

## Selected Architecture: React + Encrypted Dexie.js

This architecture provides the most robust and standard way to build a secure offline web application, balancing security with ease of development.

### 1. Frontend: React (via Vite)
*   **Why:** React is the industry standard for component-driven UI. Building it via Vite provides an incredibly fast development environment and optimized production builds.
*   **PWA Integration:** We will use the `vite-plugin-pwa` to automatically generate the Web App Manifest (for home screen installation) and the Service Worker. The Service Worker will cache the application shell (HTML, CSS, JS) so the app loads instantly, even without an internet connection.

### 2. Offline Data Engine: IndexedDB via Dexie.js
*   **Why:** `IndexedDB` is the browser's native database, capable of storing large amounts of structured data. It has no strict size limits (unlike `localStorage`).
*   **Dexie.js:** A minimalist wrapper for `IndexedDB` that makes reading, writing, and querying data much easier.
*   **Encryption:** We will use `dexie-encrypted` (or a similar Web Crypto implementation) to encrypt the fields within the database. 

### 3. Local Authentication & App Lock
*   **Setup:** On first launch, the user creates a PIN or Password. This password is used to derive a strong encryption key using the Web Crypto API.
*   **Lock Screen:** On subsequent launches, the app presents a lock screen. The user must enter their PIN to unlock the derived key and decrypt the Dexie database.
*   **Security:** This provides true data encryption. If the device's storage is inspected maliciously, the notes remain unintelligible ciphertext.

### 4. Data Export & Import
*   **Export:** 
    1. User selects a note or set of notes.
    2. The app fetches the decrypted data from memory.
    3. Converts it to a JSON formatted string/file.
    4. Triggers the native `navigator.share()` API (Web Share API). This opens the native iOS/Android share sheet to email, message, or AirDrop the JSON file.
*   **Import:**
    1. A simple "Import Note" button in the app opens a file picker.
    2. The user selects the received JSON file.
    3. The app parses the JSON and inserts the new records into their encrypted Dexie database.

## Infrastructure
*   **Hosting:** Since the app is entirely client-side (no backend database or server logic), the static files can be hosted for free on a CDN like GitHub Pages, Vercel, or Netlify.
*   **Ongoing Costs:** $0/month.
