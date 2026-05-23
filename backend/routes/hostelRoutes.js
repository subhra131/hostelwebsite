const express = require('express');
const {
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  deleteHostel,
  getOwnerHostels,
  uploadHostelPhoto,
  deleteHostelPhoto,
  getPendingHostels,
  approveHostel,
  rejectHostel,
  getAvailableRooms,
} = require('../controllers/hostelController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

// Public routes
router.get('/', getHostels);
// Must be before "/:id" or Express treats "owner" / "admin" as an id
router.get('/owner/my-hostels', protect, authorize('owner'), getOwnerHostels);
router.get('/admin/pending', protect, authorize('admin'), getPendingHostels);
router.get('/rooms/available', getAvailableRooms);
router.put('/admin/:id/approve', protect, authorize('admin'), approveHostel);
router.put('/admin/:id/reject', protect, authorize('admin'), rejectHostel);
router.get('/:id', optionalAuth, getHostelById);

// Protected routes
router.post('/', protect, authorize('owner'), createHostel);
router.put('/:id', protect, authorize('owner'), updateHostel);
router.delete('/:id', protect, authorize('owner'), deleteHostel);

// Photo routes
router.post('/:id/photos', protect, authorize('owner'), upload.single('photo'), uploadHostelPhoto);
router.delete('/:id/photos', protect, authorize('owner'), deleteHostelPhoto);

module.exports = router;
