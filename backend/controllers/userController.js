const mongoose = require('mongoose');
const User = require('../models/User');
const Hostel = require('../models/Hostel');

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      select: 'name location description amenities pricePerMonth images rating',
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, wishlist: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { hostelId } = req.params;

    if (!mongoose.isValidObjectId(hostelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hostel ID' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.wishlist.includes(hostelId)) {
      return res.status(400).json({ success: false, message: 'Hostel is already in your wishlist' });
    }

    user.wishlist.push(hostelId);
    await user.save();

    res.status(200).json({ success: true, message: 'Hostel added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { hostelId } = req.params;

    if (!mongoose.isValidObjectId(hostelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hostel ID' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const index = user.wishlist.findIndex((id) => id.toString() === hostelId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Hostel not found in wishlist' });
    }

    user.wishlist.splice(index, 1);
    await user.save();

    res.status(200).json({ success: true, message: 'Hostel removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
