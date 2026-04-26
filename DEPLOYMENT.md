# 🚀 Deploying VNotes to Render

This guide will walk you through the process of hosting **VNotes** on Render using the automated blueprint configuration.

## Prerequisites
- A GitHub account with the VNotes repository pushed.
- A [Render](https://render.com) account (Free tier is sufficient).

## Step 1: Push Changes to GitHub
Ensure all recent architecture changes and the `render.yaml` file are pushed to your GitHub repository:
```bash
git add .
git commit -m "chore: prepare for render deployment and refactor architecture"
git push origin main
```

## Step 2: Connect to Render
1. Log in to your **Render Dashboard**.
2. Click the **New +** button and select **Blueprint**.
3. Connect your GitHub account if you haven't already.
4. Select the **VNotes** repository.

## Step 3: Deployment Configuration
Render will automatically detect the `render.yaml` file and configure the service:
- **Service Type:** Static Site
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

Click **Apply** to start the build process.

## Step 4: Access Your App
Once the build is complete (usually takes 1-2 minutes), Render will provide a unique URL (e.g., `vnotes-xxxx.onrender.com`).

---

## 🛠 Architecture Notes
- **Context API:** The app now uses a centralized `NotesContext` for state management. This ensures that any component can access notes or the terminal without complex prop-drilling.
- **SPA Routing:** The `public/_redirects` file is included to handle client-side routing, preventing 404 errors when refreshing the page on sub-routes.
- **Persistence:** VNotes continues to use `LocalStorage` for data persistence, making it a fully functional serverless application.

## 💡 Pro Tip
You can enable **Automatic Deploys** in the Render settings so that every time you push to `main`, your website updates automatically.
