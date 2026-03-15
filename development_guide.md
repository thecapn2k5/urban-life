# Development Guide: Secure Local PWA Note-Taking App

This guide answers common questions on how we actually build, test, and deploy a Progressive Web App (PWA).

## 1. Do I need emulators or physical devices?

**You do NOT need emulators to start.** 

Because a PWA is fundamentally a web application, **90% of the development and testing happens directly in your desktop browser** (Chrome, Safari, or Firefox).

*   **Desktop Browser DevTools:** Chrome and Safari have excellent developer tools that let you simulate mobile screen sizes, simulate being completely offline (to test the PWA capabilities and IndexedDB), and inspect the local database directly.
*   **Emulators (Optional):** Android Studio's Emulator or Xcode's iOS Simulator are useful later on to ensure the "Add to Home Screen" prompt and the standalone full-screen mode look exactly right, but they are not required to build the core logic.
*   **Physical Devices:** The best way to test the *actual* feel of the app on a phone is by using a real phone (see Testing section below).

## 2. Setting Up the Development Environment

You'll need a basic Node.js environment on your Mac.

1.  **Install Node.js:** Download it from [nodejs.org](https://nodejs.org/) or use a tool like `nvm`.
2.  **Initialize the React App:** We will use Vite to create a fast React skeleton. Run this in your project folder:
    ```bash
    npm create vite@latest urban-life -- --template react
    cd urban-life
    npm install
    ```
3.  **Start the Local Server:**
    ```bash
    npm run dev
    ```
    This will give you a local URL (e.g., `http://localhost:5173`) that you can open in your Mac's browser to see the app running live as you code.

## 3. How to Host on GitHub

For a completely serverless PWA, **GitHub Pages** is a perfect, free hosting solution.

1.  **Create a GitHub Repository:** Go to GitHub and create a new, empty repository (e.g., `urban-life`).
2.  **Push your Code:** Push your local Vite project to this GitHub repository.
3.  **Deploy using GitHub Actions:** You can set up a simple workflow file in your repository (in `.github/workflows/deploy.yml`). Every time you push code to GitHub, GitHub automatically:
    *   Builds the optimized production version of your app (`npm run build`).
    *   Publishes those static files to a public URL (e.g., `https://yourusername.github.io/urban-life/`).

## 4. How to Put Test Builds on Your Phone

There are two main ways to test on your phone:

### A. Testing the Local Dev Server (Fastest for iterations)
While running `npm run build` and `npm run preview -- --host`:
1.  Make sure your Mac and Phone are on the **same Wi-Fi network**.
2.  We have configured **mkcert** to provide real SSL certificates.
3.  Vite will output a "Network" URL (e.g., `https://192.168.1.103:4173`).
4.  Type that URL into Safari (iOS) or Chrome (Android) on your phone.

### B. Making your Phone Trust the Certificate
To avoid the "Not Private" error and enable PWA installation:

**For iOS (iPad/iPhone):**
1.  Get the `rootCA.pem` file from your Mac (run `mkcert -CAROOT` to find where it is).
2.  Send it to your iPad (AirDrop is easiest).
3.  On iPad: **Settings > General > VPN & Device Management** > Tap the profile and click **Install**.
4.  **CRITICAL STEP:** Go to **Settings > General > About > Certificate Trust Settings** and toggle the switch for `mkcert` to **ON**.

**For Android (Pixel):**
1.  Connect your Pixel via USB.
2.  On your Mac Chrome: `chrome://inspect/#devices`
3.  Click **Port forwarding...** and add `4173` -> `localhost:4173`.
4.  On Pixel Chrome: Go to **http://localhost:4173** (Insecure, but Chrome treats localhost as secure).

### C. Installing the PWA
**CRITICAL:** For the "Add to Home Screen" prompt to appear, you must have:
1.  **HTTPS enabled** (Already configured via manual certs in `vite.config.js`).
2.  **Valid Icons**: You need `pwa-192x192.png` and `pwa-512x512.png` in your `public/` folder.
3.  **Searchable/Trusted context**: Use the methods in section B.

**To Install:**
1.  Open the URL on your phone.
2.  **iOS (Safari):** Tap the **Share** icon, scroll down, and tap **"Add to Home Screen"**.
3.  **Android (Chrome):** Tap the three dots menu and select **"Add to Home screen"**.
4.  The app will now appear on your phone's home screen as a native-looking app icon.

