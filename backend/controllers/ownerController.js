const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Booking = require('../models/Booking');
const BookingOrder = require('../models/BookingOrder');

// Apply for owner verification
exports.applyForOwnerVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'owner') {
      return res.status(400).json({ success: false, message: 'Only owners can apply for verification' });
    }

    if (user.ownerAppliedAt) {
      return res.status(400).json({ success: false, message: 'You have already applied for verification' });
    }

    user.ownerAppliedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'You have applied for owner verification. Please wait for admin approval.',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify owner (Admin function - simplified, no admin panel)
exports.verifyOwner = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isOwnerVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Owner verified successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all registered hostel owners (admin only)
exports.getAllOwners = async (req, res) => {
  try {
    const owners = await User.find({ role: 'owner' }).select(
      'name email phone isOwnerVerified ownerAppliedAt createdAt'
    );

    res.status(200).json({ success: true, owners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete an owner and their related hostels/bookings (admin only)
exports.deleteOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await User.findOne({ _id: ownerId, role: 'owner' });
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    const hostels = await Hostel.find({ owner: owner._id }).select('_id');
    const hostelIds = hostels.map((hostel) => hostel._id);

    if (hostelIds.length > 0) {
      await Booking.deleteMany({ hostel: { $in: hostelIds } });
      await BookingOrder.deleteMany({ hostel: { $in: hostelIds } });
      await Hostel.deleteMany({ owner: owner._id });
    }

    await User.deleteOne({ _id: owner._id });

    res.status(200).json({ success: true, message: 'Owner removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get owner application status
exports.getOwnerStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      isOwnerVerified: user.isOwnerVerified,
      ownerAppliedAt: user.ownerAppliedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
