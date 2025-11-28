import { Router } from 'express';
import { 
  bookTicket, 
  getUserTickets, 
  getTicketQRCode, 
  downloadTicketPDF,
  cancelTicket
} from '../controllers/ticket.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All ticket routes require authentication
router.use(authenticateToken);

// Ticket routes
router.post('/', bookTicket);
router.get('/user', getUserTickets);
router.delete('/:id', cancelTicket); // Must be before /:id/qrcode route
router.get('/:id/qrcode', getTicketQRCode);
router.get('/:id/pdf', downloadTicketPDF);

export default router;

