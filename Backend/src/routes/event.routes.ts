import { Router } from 'express';
import { 
  getPublishedEvents, 
  createEvent, 
  getUserEvents, 
  getEventById,
  getEventTickets,
  updateEvent, 
  deleteEvent 
} from '../controllers/event.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public route - get all published events
router.get('/published', getPublishedEvents);

// Public route - get event tickets (attendees) - must be before /:id route
router.get('/:id/tickets', getEventTickets);

// Protected routes - require authentication
router.post('/', authenticateToken, createEvent);
router.get('/user', authenticateToken, getUserEvents);
router.get('/:id', authenticateToken, getEventById);
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

export default router;

