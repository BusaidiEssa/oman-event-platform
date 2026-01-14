import express from 'express';
import {
  createEvent,
  getEvents,
  getEventBySlug,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/public/:slug', getEventBySlug);

// Protected routes
router.post('/', authenticateToken, createEvent);
router.get('/', authenticateToken, getEvents);
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

export default router;