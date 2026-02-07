# Deployment Guide for Render

## 1. Deploy the Backend (Web Service)

1.  Log in to your [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository: `gitaditya567/fruitswebsite`.
4.  Configure the service:
    *   **Name**: `fruits-backend` (or similar)
    *   **Region**: Closest to you (e.g., Singapore, Frankfurt)
    *   **Root Directory**: `backend`
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  **Environment Variables** (Click "Advanced"):
    *   Key: `MONGO_URI`
    *   Value: `mongodb+srv://fruitswebsite:fruits123@cluster0.sbcxhib.mongodb.net/dryfruits_dummy?appName=Cluster0`
    *   Key: `JWT_SECRET`
    *   Value: `supersecretkeydryfruits123` (or generate a new robust secret)
6.  Click **Create Web Service**.
7.  **IMPORTANT**: Once deployed, copy the **Service URL** (e.g., `https://fruits-backend.onrender.com`). You will need this for the frontend.

## 2. Deploy the Frontend (Static Site)

1.  Go back to Dashboard and click **New +** -> **Static Site**.
2.  Connect the same repository: `gitaditya567/fruitswebsite`.
3.  Configure the site:
    *   **Name**: `fruits-frontend`
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `dist`
4.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: Paste the Backend Service URL from Step 1 (e.g., `https://fruits-backend.onrender.com`) **without the trailing slash**.
        *   Example: `https://fruits-backend.onrender.com`
5.  Click **Create Static Site**.
6.  Your website will be live at the provided Render URL!

## Troubleshooting

*   **Images not loading**: The app is designed to auto-correct image URLs from `localhost` to the production backend URL using the `VITE_API_URL`. Ensure you set that variable correctly.
*   **Database connection**: Ensure your MongoDB Atlas IP Access List allows access from anywhere (`0.0.0.0/0`) since Render IPs change dynamically.
