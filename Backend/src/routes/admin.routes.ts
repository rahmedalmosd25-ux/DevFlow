import { Router } from 'express';
import { getAllUsers, getAllEvents } from '../controllers/admin.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Admin routes
router.get('/users', getAllUsers);
router.get('/events', getAllEvents);

export default router;

