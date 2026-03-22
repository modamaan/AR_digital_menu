# ImageKit.io Setup Guide

## Required Environment Variables

Add these to your `.env.local` file:

```env
# ImageKit.io Configuration
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

## How to Get Your ImageKit Credentials

1. Go to [ImageKit.io Dashboard](https://imagekit.io/dashboard)
2. Sign up or log in
3. Navigate to **Developer Options** → **API Keys**
4. Copy your:
   - **Public Key** → `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
   - **Private Key** → `IMAGEKIT_PRIVATE_KEY`
   - **URL Endpoint** → `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`

## Features

- ✅ Client-side image upload
- ✅ Automatic image optimization
- ✅ CDN delivery
- ✅ Up to 4 images per product
- ✅ Image validation (size, type)
