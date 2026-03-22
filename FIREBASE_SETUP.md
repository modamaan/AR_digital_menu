# Firebase Setup Guide

This guide will help you set up Firebase authentication for your Coowik application.

## Prerequisites

- A Google account
- Access to the [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "Coowik")
4. (Optional) Enable Google Analytics for your project
5. Click "Create project"

## Step 2: Enable Google Authentication

1. In your Firebase project, go to **Build** → **Authentication**
2. Click "Get started" if this is your first time
3. Go to the **Sign-in method** tab
4. Click on **Google** in the list of providers
5. Toggle the **Enable** switch
6. Select a support email from the dropdown
7. Click **Save**

## Step 3: Get Firebase Configuration

### Client-Side Configuration

1. In the Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Select **Project settings**
3. Scroll down to "Your apps" section
4. Click the **Web** icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "Coowik Web")
6. Copy the `firebaseConfig` object values

You'll need these values for your `.env.local` file:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

### Server-Side Configuration (Firebase Admin SDK)

1. In the Firebase Console, go to **Project settings** → **Service accounts**
2. Click **Generate new private key**
3. Click **Generate key** to download the JSON file
4. Open the downloaded JSON file

You'll need these values from the JSON file:

- `project_id`
- `client_email`
- `private_key`

## Step 4: Configure Environment Variables

Create or update your `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=your_database_url

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important Notes:**

- The `FIREBASE_ADMIN_PRIVATE_KEY` should be wrapped in double quotes
- Make sure to replace all placeholder values with your actual Firebase credentials
- Never commit your `.env.local` file to version control

## Step 5: Update Database Schema

Run the following command to push the updated schema to your database:

```bash
npm run db:push
```

This will update the `users` table to use `firebase_uid` instead of `clerk_id`.

## Step 6: Test Authentication

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/sign-up`
3. Click "Sign up with Google"
4. Complete the Google OAuth flow
5. Verify you're redirected to the plans page

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"

This error occurs when your domain is not authorized in Firebase:

1. Go to Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add `localhost` for development
3. Add your production domain when deploying

### "Failed to create session"

Check that:

- Your Firebase Admin SDK credentials are correct in `.env.local`
- The `FIREBASE_ADMIN_PRIVATE_KEY` is properly formatted with `\n` for line breaks
- You've enabled Google authentication in the Firebase Console

### Database Connection Issues

Ensure your `DATABASE_URL` is correct and the database is accessible.

## Next Steps

- Deploy your application
- Add your production domain to Firebase authorized domains
- Set up Firebase security rules if needed
- Monitor authentication in the Firebase Console
