const mongoose = require('mongoose');

const bookingOrderSchema = new mongoose.Schema(
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
      required: true,
    },
    roomNumber: {
      type: Number,
    },
    checkInDate: { type: Date },
    checkOutDate: { type: Date },
    message: { type: String, default: '' },
    monthlyRent: { type: Number, required: true },
    advanceAmount: { type: Number, required: true },
    balanceDueAtHostel: { type: Number, required: true },
    amountPaise: { type: Number, required: true },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    isMockOrder: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['created', 'paid', 'expired', 'failed'],
      default: 'created',
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

bookingOrderSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('BookingOrder', bookingOrderSchema);
