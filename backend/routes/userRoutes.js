const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/userController');

const router = express.Router();

router.get('/wishlist', protect, authorize('student'), getWishlist);
router.post('/wishlist/:hostelId', protect, authorize('student'), addToWishlist);
router.delete('/wishlist/:hostelId', protect, authorize('student'), removeFromWishlist);

module.exports = router;
