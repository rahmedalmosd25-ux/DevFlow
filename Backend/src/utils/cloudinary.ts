import { v2 as cloudinary } from 'cloudinary';

// Get environment variables (dotenv should already be loaded by server.ts)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Validate Cloudinary configuration
if (!cloudName || !apiKey || !apiSecret) {
  console.warn('⚠️  Cloudinary configuration is incomplete. Image uploads will fail.');
  console.warn('Please set the following environment variables:');
  if (!cloudName) console.warn('  - CLOUDINARY_CLOUD_NAME');
  if (!apiKey) console.warn('  - CLOUDINARY_API_KEY');
  if (!apiSecret) console.warn('  - CLOUDINARY_API_SECRET');
} else {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log('✅ Cloudinary configured successfully');
}

/**
 * Upload image to Cloudinary
 */
export const uploadImageToCloudinary = async (
  file: Express.Multer.File
): Promise<string> => {
  // Check if Cloudinary is configured
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'events', // Store all event images in 'events' folder
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 800, crop: 'limit' }, // Limit size for optimization
          { quality: 'auto' }, // Auto quality optimization
          { format: 'auto' }, // Auto format (webp when supported)
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`));
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Upload failed: No result from Cloudinary'));
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

/**
 * Delete image from Cloudinary
 */
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const publicId = `events/${fileName.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    // Don't throw - deletion failure shouldn't break the flow
  }
};

/**
 * Check if URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

