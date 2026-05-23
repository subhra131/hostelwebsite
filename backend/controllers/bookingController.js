const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Hostel = require('../models/Hostel');
const User = require('../models/User');

// Get student bookings
exports.getStudentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user.id })
      .populate('hostel')
      .populate('student', 'name email phone');

    const doubleBookingConditions = bookings
      .filter((booking) => booking.roomType === 'Double Bed' && booking.roomNumber != null)
      .map((booking) => ({
        hostel: booking.hostel._id,
        roomType: 'Double Bed',
        roomNumber: booking.roomNumber,
        status: { $in: ['pending', 'approved'] },
        student: { $ne: req.user.id },
      }));

    if (doubleBookingConditions.length > 0) {
      const roommateBookings = await Booking.find({ $or: doubleBookingConditions }).populate(
        'student',
        'name phone'
      );

      const roommateMap = {};
      roommateBookings.forEach((roommate) => {
        const key = `${roommate.hostel.toString()}_${roommate.roomNumber}`;
        if (!roommateMap[key]) {
          roommateMap[key] = {
            name: roommate.student.name,
            phone: roommate.student.phone,
          };
        }
      });

      bookings.forEach((booking) => {
        if (booking.roomType === 'Double Bed' && booking.roomNumber != null) {
          const key = `${booking.hostel._id.toString()}_${booking.roomNumber}`;
          if (roommateMap[key]) {
            booking.roommate = roommateMap[key];
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get owner booking requests (join via hostel.owner so it matches JWT user id reliably)
exports.getOwnerBookings = async (req, res) => {
  try {
    let ownerId;
    try {
      ownerId = new mongoose.Types.ObjectId(req.user.id);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: Hostel.collection.name,
          localField: 'hostel',
          foreignField: '_id',
          as: 'hostelDocs',
        },
      },
      { $unwind: '$hostelDocs' },
      { $match: { 'hostelDocs.owner': ownerId } },
      {
        $lookup: {
          from: User.collection.name,
          localField: 'student',
          foreignField: '_id',
          as: 'studentDocs',
        },
      },
      { $unwind: '$studentDocs' },
      {
        $addFields: {
          hostel: '$hostelDocs',
          student: {
            _id: '$studentDocs._id',
            name: '$studentDocs.name',
            email: '$studentDocs.email',
            phone: '$studentDocs.phone',
          },
        },
      },
      {
        $project: {
          hostelDocs: 0,
          studentDocs: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve or reject booking (Owner only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id).populate('hostel');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is the hostel owner
    const hostel = await Hostel.findById(booking.hostel._id);
    if (hostel.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    if (status === 'rejected') {
      booking.rejectionReason = rejectionReason;
    }
    booking.updatedAt = Date.now();

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel booking (Student only)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is the student who made the booking
    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Only pending bookings can be cancelled
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending bookings can be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
