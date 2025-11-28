import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// Protected route - upload image
router.post('/', authenticateToken, upload.single('image'), uploadImage);

export default router;

