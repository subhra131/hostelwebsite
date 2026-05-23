const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const BookingOrder = require('../models/BookingOrder');
const QuickPayOrder = require('../models/QuickPayOrder');
const Booking = require('../models/Booking');
const Hostel = require('../models/Hostel');
const { hostelIsPubliclyVisible } = require('../utils/hostelVisibility');

const ADVANCE_RUPEES = parseInt(process.env.BOOKING_ADVANCE_RUPEES || '1000', 10);
const QUICK_PAY_RUPEES = parseInt(process.env.QUICK_PAY_DUMMY_RUPEES || '1000', 10);

function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

function hasRazorpayKeys() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  return !!(id && secret && String(id).trim() && String(secret).trim());
}

const SINGLE_ROOM_RANGE = { start: 1, end: 15 };
const DOUBLE_ROOM_RANGE = { start: 25, end: 50 };
const ROOM_STATUS_ACTIVE = ['pending', 'approved'];
const ORDER_STATUS_ACTIVE = 'created';

function getRoomRange(roomType, totalRooms) {
  if (roomType === 'Single Bed') {
    const maxRooms = Number.isInteger(totalRooms) && totalRooms > 0 ? Math.min(totalRooms, 15) : 15;
    return { start: 1, end: maxRooms };
  }

  if (roomType === 'Double Bed') {
    const maxRooms = Number.isInteger(totalRooms) && totalRooms > 0 ? Math.min(totalRooms, 26) : 26;
    return { start: 25, end: 24 + maxRooms };
  }

  return null;
}

async function selectRoomNumber(hostelId, roomType, totalRooms) {
  const range = getRoomRange(roomType, totalRooms);
  if (!range) {
    return undefined;
  }

  const now = new Date();
  const bookingFilter = {
    hostel: hostelId,
    roomType,
    status: { $in: ROOM_STATUS_ACTIVE },
    roomNumber: { $gte: range.start, $lte: range.end },
  };
  const ordersFilter = {
    hostel: hostelId,
    roomType,
    status: ORDER_STATUS_ACTIVE,
    expiresAt: { $gt: now },
    roomNumber: { $gte: range.start, $lte: range.end },
  };

  const bookings = await Booking.find(bookingFilter).select('roomNumber');
  const orders = await BookingOrder.find(ordersFilter).select('roomNumber');

  const occupancy = {};
  const markRoom = (roomNumber) => {
    if (!roomNumber || typeof roomNumber !== 'number') return;
    if (roomNumber < range.start || roomNumber > range.end) return;
    occupancy[roomNumber] = (occupancy[roomNumber] || 0) + 1;
  };

  bookings.forEach((booking) => markRoom(booking.roomNumber));
  orders.forEach((order) => markRoom(order.roomNumber));

  const availableRooms = [];
  for (let roomNumber = range.start; roomNumber <= range.end; roomNumber += 1) {
    const count = occupancy[roomNumber] || 0;
    const maxOccupancy = roomType === 'Double Bed' ? 2 : 1;
    if (count < maxOccupancy) {
      availableRooms.push({ roomNumber, count });
    }
  }

  if (roomType === 'Double Bed') {
    const sharedRoom = availableRooms.find((room) => room.count === 1);
    if (sharedRoom) {
      return sharedRoom.roomNumber;
    }
  }

  return availableRooms.length > 0 ? availableRooms[0].roomNumber : null;
}

/**
 * POST /api/payments/booking-order
 * Creates a Razorpay order (or mock order if keys are not configured).
 */
exports.createBookingOrder = async (req, res) => {
  try {
    const { hostelId, roomType, checkInDate, checkOutDate, message, forceMock } = req.body;

    if (!hostelId || !roomType) {
      return res.status(400).json({ success: false, message: 'Please provide hostel and room type' });
    }

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hostel id' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    if (!hostelIsPubliclyVisible(hostel)) {
      return res.status(403).json({
        success: false,
        message: 'This hostel is not available for booking until an administrator approves it.',
      });
    }

    const room = hostel.roomTypes.find((r) => r.type === roomType);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }

    const monthlyRent = room.pricePerMonth;
    const roomNumber = await selectRoomNumber(hostel._id, roomType, room.totalRooms);
    if (roomNumber === null) {
      return res.status(400).json({
        success: false,
        message: 'No rooms are available for this room type right now. Please choose a different room type or try later.',
      });
    }

    const advanceAmount = Math.min(ADVANCE_RUPEES, monthlyRent);
    const balanceDueAtHostel = Math.max(0, monthlyRent - advanceAmount);
    const amountPaise = rupeesToPaise(advanceAmount);

    const useRealRazorpay = hasRazorpayKeys() && forceMock !== true;
    let razorpayOrderId;
    const isMockOrder = !useRealRazorpay;

    if (useRealRazorpay) {
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const rzOrder = await rzp.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `hb_${Date.now()}`,
        notes: {
          hostelId: String(hostelId),
          studentId: String(req.user.id),
        },
      });
      razorpayOrderId = rzOrder.id;
    } else {
      razorpayOrderId = `order_mock_${crypto.randomBytes(16).toString('hex')}`;
    }

    const order = await BookingOrder.create({
      student: req.user.id,
      hostel: hostelId,
      roomType,
      roomNumber,
      checkInDate: checkInDate || undefined,
      checkOutDate: checkOutDate || undefined,
      message: message != null ? String(message).slice(0, 2000) : '',
      monthlyRent,
      advanceAmount,
      balanceDueAtHostel,
      amountPaise,
      razorpayOrderId,
      isMockOrder,
      status: 'created',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      orderId: order.razorpayOrderId,
      amount: order.amountPaise,
      currency: 'INR',
      keyId: useRealRazorpay ? process.env.RAZORPAY_KEY_ID : null,
      isMock: isMockOrder,
      displayAmountRupees: advanceAmount,
      balanceDueAtHostel,
      monthlyRent,
      roomNumber,
      note: isMockOrder
        ? 'Razorpay keys not set — using demo checkout. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env for live payments.'
        : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/payments/booking-verify
 * Confirms payment and creates the booking.
 */
exports.verifyBookingPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, mockConfirm } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Missing order id' });
    }

    const order = await BookingOrder.findOne({
      razorpayOrderId: razorpay_order_id,
      student: req.user.id,
      status: 'created',
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or already used' });
    }

    if (order.expiresAt < new Date()) {
      order.status = 'expired';
      await order.save();
      return res.status(400).json({ success: false, message: 'Payment session expired. Start again.' });
    }

    let paymentId;
    let paymentMode;

    if (order.isMockOrder) {
      if (mockConfirm !== true) {
        return res.status(400).json({
          success: false,
          message: 'Complete the demo checkout to confirm (mockConfirm: true).',
        });
      }
      paymentId = `pay_mock_${crypto.randomBytes(10).toString('hex')}`;
      paymentMode = 'mock';
    } else {
      if (!hasRazorpayKeys()) {
        return res.status(500).json({ success: false, message: 'Razorpay is not configured' });
      }
      if (!razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Missing payment id or signature' });
      }
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = hmac.digest('hex');
      if (digest !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
      paymentId = razorpay_payment_id;
      paymentMode = 'razorpay';
    }

    const hostelStill = await Hostel.findById(order.hostel);
    if (!hostelStill || !hostelIsPubliclyVisible(hostelStill)) {
      return res.status(400).json({
        success: false,
        message: 'This hostel is no longer available for booking.',
      });
    }

    const booking = await Booking.create({
      student: order.student,
      hostel: order.hostel,
      roomType: order.roomType,
      roomNumber: order.roomNumber,
      price: order.monthlyRent,
      checkInDate: order.checkInDate,
      checkOutDate: order.checkOutDate,
      message: order.message,
      status: 'pending',
      advancePaidRupees: order.advanceAmount,
      balanceDueAtHostelRupees: order.balanceDueAtHostel,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: paymentId,
      paymentMode,
      paymentCapturedAt: new Date(),
    });

    order.status = 'paid';
    await order.save();

    const populated = await Booking.findById(booking._id).populate('hostel').populate('student', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Advance received. Your booking request was sent to the owner.',
      booking: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/payments/quick-order
 * Fixed-amount dummy / test payment (default ₹1000). Does not create a booking.
 */
exports.createQuickPayOrder = async (req, res) => {
  try {
    const forceMock = req.body && req.body.forceMock === true;
    const amountRupees = QUICK_PAY_RUPEES;
    const amountPaise = rupeesToPaise(amountRupees);

    const useRealRazorpay = hasRazorpayKeys() && !forceMock;
    let razorpayOrderId;
    const isMockOrder = !useRealRazorpay;

    if (useRealRazorpay) {
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const rzOrder = await rzp.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `qp_${Date.now()}`,
        notes: {
          type: 'quick_pay_dummy',
          userId: String(req.user.id),
        },
      });
      razorpayOrderId = rzOrder.id;
    } else {
      razorpayOrderId = `order_mock_${crypto.randomBytes(16).toString('hex')}`;
    }

    await QuickPayOrder.create({
      user: req.user.id,
      amountRupees,
      amountPaise,
      razorpayOrderId,
      isMockOrder,
      status: 'created',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      orderId: razorpayOrderId,
      amount: amountPaise,
      currency: 'INR',
      keyId: useRealRazorpay ? process.env.RAZORPAY_KEY_ID : null,
      isMock: isMockOrder,
      displayAmountRupees: amountRupees,
      note: isMockOrder
        ? 'Razorpay keys not set — demo checkout only.'
        : 'Use Razorpay test cards in Test mode.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/payments/quick-verify
 * Confirms the quick-pay order only (no booking).
 */
exports.verifyQuickPayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, mockConfirm } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Missing order id' });
    }

    const order = await QuickPayOrder.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user.id,
      status: 'created',
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or already used' });
    }

    if (order.expiresAt < new Date()) {
      order.status = 'expired';
      await order.save();
      return res.status(400).json({ success: false, message: 'Payment session expired. Start again.' });
    }

    let paymentId;
    let paymentMode;

    if (order.isMockOrder) {
      if (mockConfirm !== true) {
        return res.status(400).json({
          success: false,
          message: 'Complete the demo checkout (mockConfirm: true).',
        });
      }
      paymentId = `pay_mock_${crypto.randomBytes(10).toString('hex')}`;
      paymentMode = 'mock';
    } else {
      if (!hasRazorpayKeys()) {
        return res.status(500).json({ success: false, message: 'Razorpay is not configured' });
      }
      if (!razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Missing payment id or signature' });
      }
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      if (hmac.digest('hex') !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
      paymentId = razorpay_payment_id;
      paymentMode = 'razorpay';
    }

    order.status = 'paid';
    order.razorpayPaymentId = paymentId;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Payment of ₹${order.amountRupees} recorded successfully (dummy page — no booking).`,
      paymentMode,
      paymentId,
      amountRupees: order.amountRupees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
