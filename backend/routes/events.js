import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  getEventBySlug,
  updateEvent,
  deleteEvent,
  addStakeholderGroup,
  updateStakeholderGroup,
  toggleStakeholderForm,
  deleteStakeholderGroup
} from '../controllers/eventController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/public/:slug', getEventBySlug);

// Protected routes - Event management
router.post('/', authenticateToken, createEvent);
router.get('/', authenticateToken, getEvents);

//  Get event by slug (protected)
router.get('/slug/:slug', authenticateToken, getEventById);

// Keep ID-based routes for backward compatibility
router.get('/:id', authenticateToken, getEventById);
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

// Protected routes - Stakeholder group management (using ID for operations)
router.post('/:id/groups', authenticateToken, addStakeholderGroup);
router.put('/:id/groups/:groupId', authenticateToken, updateStakeholderGroup);
router.patch('/:id/groups/:groupId/toggle', authenticateToken, toggleStakeholderForm);
router.delete('/:id/groups/:groupId', authenticateToken, deleteStakeholderGroup);

export default router;