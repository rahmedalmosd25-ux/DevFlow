# Cloudinary Setup Guide

This application uses Cloudinary to store and manage event images.

## Required Environment Variables

Add the following environment variables to your `.env` file in the `Backend` directory:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Getting Cloudinary Credentials

1. **Sign up for Cloudinary** (if you don't have an account):
   - Go to https://cloudinary.com/users/register/free
   - Create a free account (includes 25GB storage and 25GB bandwidth)

2. **Get your credentials**:
   - Log in to your Cloudinary dashboard
   - Go to Dashboard → Account Details
   - Copy the following values:
     - **Cloud Name**: Found in the "Account Details" section
     - **API Key**: Found in the "Account Details" section
     - **API Secret**: Click "Reveal" to show your API secret

3. **Add to `.env` file**:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
   ```

## Features

- **Automatic Image Optimization**: Images are automatically optimized for web delivery
- **Format Conversion**: Images are converted to WebP when supported by the browser
- **Size Limiting**: Images are resized to a maximum of 1200x800 pixels
- **Organized Storage**: All event images are stored in the `events` folder in Cloudinary
- **Secure URLs**: All images are served over HTTPS

## Image Upload Limits

- **File Size**: Maximum 5MB per image
- **File Types**: PNG, JPG, JPEG, GIF, WebP
- **Dimensions**: Automatically optimized to max 1200x800px

## API Endpoint

- **POST** `/api/upload` - Upload an image to Cloudinary
  - Requires authentication
  - Accepts multipart/form-data with `image` field
  - Returns the Cloudinary secure URL

## Usage in Frontend

The frontend automatically uploads images to Cloudinary when:
- Creating a new event
- Editing an existing event

Users can:
- Drag and drop images
- Click to select images
- Preview images before uploading
- Remove/change images

