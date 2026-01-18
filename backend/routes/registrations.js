import express from 'express';
import {
  register,
  getRegistrations,
  checkIn,
  getAnalytics,
  deleteRegistration,
  sendMassEmail
} from '../controllers/registrationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);

// Protected routes
router.get('/:eventId', authenticateToken, getRegistrations);
router.post('/checkin', authenticateToken, checkIn);
router.get('/:eventId/analytics', authenticateToken, getAnalytics);
router.delete('/:registrationId',authenticateToken, deleteRegistration)
router.post('/:eventId/mass-email', authenticateToken, sendMassEmail);

export default router;