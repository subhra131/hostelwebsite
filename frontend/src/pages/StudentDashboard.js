import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/student/my-bookings');
      setBookings(response.data.bookings);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/bookings/${bookingId}`);
        setBookings(bookings.filter((b) => b._id !== bookingId));
        alert('Booking cancelled successfully');
      } catch (err) {
        alert('Failed to cancel booking');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'approved':
        return '#27ae60';
      case 'rejected':
        return '#e74c3c';
      case 'cancelled':
        return '#95a5a6';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Bookings</h1>
        <p>Welcome, {user?.name}!</p>
      </div>

      {loading && <div className="loading">Loading your bookings...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && bookings.length === 0 && (
        <div className="no-bookings">
          <p>You haven't made any bookings yet.</p>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.hostel.name}</h3>
                <span className="status" style={{ backgroundColor: getStatusColor(booking.status) }}>
                  {booking.status.toUpperCase()}
                </span>
              </div>
              <div className="booking-details">
                <p>
                  <strong>Location:</strong> {booking.hostel.location}
                </p>
                <p>
                  <strong>Room Type:</strong> {booking.roomType}
                </p>
                <p>
                  <strong>Monthly rent:</strong> ₹{booking.price}/month
                </p>
                {booking.advancePaidRupees != null && booking.advancePaidRupees > 0 && (
                  <>
                    <p>
                      <strong>Advance paid (online):</strong> ₹{booking.advancePaidRupees}
                    </p>
                    <p>
                      <strong>Due at hostel:</strong> ₹{booking.balanceDueAtHostelRupees} (pay when you visit)
                    </p>
                  </>
                )}
                <p>
                  <strong>Booked Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}
                </p>
                {booking.roomNumber != null && (
                  <p>
                    <strong>Room Number:</strong> {booking.roomNumber}
                  </p>
                )}
                {booking.roomType === 'Double Bed' && booking.roommate && (
                  <p>
                    <strong>Roommate:</strong> {booking.roommate.name} ({booking.roommate.phone || 'N/A'})
                  </p>
                )}
                {booking.message && (
                  <p>
                    <strong>Your Message:</strong> {booking.message}
                  </p>
                )}
                {booking.status === 'rejected' && booking.rejectionReason && (
                  <p className="rejection-reason">
                    <strong>Rejection Reason:</strong> {booking.rejectionReason}
                  </p>
                )}
              </div>
              {booking.status === 'pending' && (
                <button
                  className="btn-cancel"
                  onClick={() => handleCancelBooking(booking._id)}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
