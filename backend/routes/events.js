import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,              // ← ADD THIS
  getEventBySlug,
  updateEvent,
  deleteEvent,
  addStakeholderGroup,       // ← ADD THIS
  updateStakeholderGroup,    // ← ADD THIS
  toggleStakeholderForm,     // ← ADD THIS
  deleteStakeholderGroup     // ← ADD THIS
} from '../controllers/eventController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/public/:slug', getEventBySlug);

// Protected routes - Event management
router.post('/', authenticateToken, createEvent);
router.get('/', authenticateToken, getEvents);
router.get('/:id', authenticateToken, getEventById);           
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

// Protected routes - Stakeholder group management
router.post('/:id/groups', authenticateToken, addStakeholderGroup);                    
router.put('/:id/groups/:groupId', authenticateToken, updateStakeholderGroup);        
router.patch('/:id/groups/:groupId/toggle', authenticateToken, toggleStakeholderForm); 
router.delete('/:id/groups/:groupId', authenticateToken, deleteStakeholderGroup);      

export default router;