import { Request, Response } from 'express';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
      return;
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImageToCloudinary(req.file);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl,
      },
    });
  } catch (error: any) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image',
    });
  }
};

