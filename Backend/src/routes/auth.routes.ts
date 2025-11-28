import { Router } from 'express';
import { signUp, login, logout, updateProfile } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/signup', signUp);
router.post('/login', login);

// Protected routes (requires authentication)
router.post('/logout', authenticateToken, logout);
router.put('/profile', authenticateToken, updateProfile);

export default router;

