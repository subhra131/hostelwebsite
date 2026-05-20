const express = require('express');
const {
  applyForOwnerVerification,
  verifyOwner,
  getOwnerStatus,
  getAllOwners,
  deleteOwner,
} = require('../controllers/ownerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply for owner verification
router.post('/apply', protect, authorize('owner'), applyForOwnerVerification);

// Get owner verification status
router.get('/status', protect, getOwnerStatus);

// Verify owner (admin only)
router.put('/verify/:userId', protect, authorize('admin'), verifyOwner);

// Get all owners (admin only)
router.get('/admin/owners', protect, authorize('admin'), getAllOwners);

// Remove owner (admin only)
router.delete('/admin/owners/:ownerId', protect, authorize('admin'), deleteOwner);

module.exports = router;
