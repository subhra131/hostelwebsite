const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },
    roomType: {
      type: String,
      enum: ['Single Bed', 'Double Bed', 'Triple Sharing'],
      required: true,
    },
    roomNumber: {
      type: Number,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    checkInDate: {
      type: Date,
    },
    checkOutDate: {
      type: Date,
    },
    message: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    advancePaidRupees: {
      type: Number,
    },
    balanceDueAtHostelRupees: {
      type: Number,
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    paymentMode: {
      type: String,
      enum: ['none', 'mock', 'razorpay'],
      default: 'none',
    },
    paymentCapturedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for quick queries
bookingSchema.index({ student: 1 });
bookingSchema.index({ hostel: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
