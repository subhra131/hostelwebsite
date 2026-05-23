import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import PhotoUpload from '../components/PhotoUpload';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('bookings');
  const [hostels, setHostels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    city: '',
    area: '',
    pricePerMonth: '',
    roomTypes: [],
    amenities: [],
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'hostels') {
      fetchHostels();
    }
  }, [activeTab]);

  const fetchHostels = async () => {
    try {
      const response = await api.get('/hostels/owner/my-hostels');
      setHostels(response.data.hostels);
    } catch (err) {
      setError('Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/owner/requests');
      setBookings(response.data.bookings);
    } catch (err) {
      setError('Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}`, { status: 'approved' });
      fetchBookings();
      alert('Booking approved!');
    } catch (err) {
      alert('Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await api.put(`/bookings/${bookingId}`, {
          status: 'rejected',
          rejectionReason: reason,
        });
        fetchBookings();
        alert('Booking rejected!');
      } catch (err) {
        alert('Failed to reject booking');
      }
    }
  };

  const handleAddHostel = async (e) => {
    e.preventDefault();
    try {
      const hostelData = {
        ...form,
        roomTypes: [
          {
            type: 'Single Bed',
            pricePerMonth: form.pricePerMonth,
            availableRooms: 5,
            totalRooms: 5,
          },
          {
            type: 'Double Bed',
            pricePerMonth: parseInt(form.pricePerMonth) + 2000,
            availableRooms: 3,
            totalRooms: 3,
          },
          {
            type: 'Triple Sharing',
            pricePerMonth: parseInt(form.pricePerMonth) - 1000,
            availableRooms: 2,
            totalRooms: 2,
          },
        ],
        amenities: ['WiFi', 'Food', 'AC'],
      };

      await api.post('/hostels', hostelData);
      setForm({
        name: '',
        description: '',
        location: '',
        city: '',
        area: '',
        pricePerMonth: '',
        roomTypes: [],
        amenities: [],
      });
      setShowForm(false);
      fetchHostels();
      alert('Hostel submitted. Students will see it in search after an administrator approves it.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add hostel');
    }
  };

  const handleDeletePhoto = async (hostelId, imageUrl) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await api.delete(`/hostels/${hostelId}/photos`, {
          data: { imageUrl },
        });
        fetchHostels();
        alert('Photo deleted successfully!');
      } catch (err) {
        alert('Failed to delete photo');
      }
    }
  };

  const handlePhotoUploadSuccess = (updatedHostel) => {
    setHostels(hostels.map((h) => (h._id === updatedHostel._id ? updatedHostel : h)));
  };

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <h1>Owner Dashboard</h1>
        <p>Welcome, {user?.name}!</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📋 Booking Requests
        </button>
        <button
          className={`tab-btn ${activeTab === 'hostels' ? 'active' : ''}`}
          onClick={() => setActiveTab('hostels')}
        >
          🏨 My Hostels
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {activeTab === 'bookings' && !loading && (
        <div className="tab-content">
          {bookings.length === 0 ? (
            <div className="no-data">No booking requests yet</div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking._id} className="request-card">
                  <div className="request-header">
                    <div>
                      <h3>{booking.hostel.name}</h3>
                      <p className="student-info">
                        Student: {booking.student.name} ({booking.student.email})
                      </p>
                    </div>
                    <span
                      className="status"
                      style={{
                        backgroundColor:
                          booking.status === 'pending'
                            ? '#f39c12'
                            : booking.status === 'approved'
                            ? '#27ae60'
                            : '#e74c3c',
                      }}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="request-details">
                    <p>
                      <strong>Room Type:</strong> {booking.roomType}
                    </p>
                    {booking.roomNumber != null && (
                      <p>
                        <strong>Room Number:</strong> {booking.roomNumber}
                      </p>
                    )}
                    <p>
                      <strong>Monthly rent:</strong> ₹{booking.price}/month
                    </p>
                    {booking.advancePaidRupees != null && booking.advancePaidRupees > 0 && (
                      <>
                        <p>
                          <strong>Student paid advance:</strong> ₹{booking.advancePaidRupees} ({booking.paymentMode})
                        </p>
                        <p>
                          <strong>Collect at hostel:</strong> ₹{booking.balanceDueAtHostelRupees}
                        </p>
                      </>
                    )}
                    <p>
                      <strong>Student Phone:</strong> {booking.student.phone || 'N/A'}
                    </p>
                    {booking.message && (
                      <p>
                        <strong>Message:</strong> {booking.message}
                      </p>
                    )}
                  </div>
                  {booking.status === 'pending' && (
                    <div className="request-actions">
                      <button
                        className="btn-approve"
                        onClick={() => handleApproveBooking(booking._id)}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleRejectBooking(booking._id)}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'hostels' && !loading && (
        <div className="tab-content">
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add New Hostel'}
          </button>

          {showForm && (
            <form onSubmit={handleAddHostel} className="add-hostel-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Hostel Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Area</label>
                  <input
                    type="text"
                    required
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Price Per Month (for Single Bed)</label>
                <input
                  type="number"
                  required
                  value={form.pricePerMonth}
                  onChange={(e) => setForm({ ...form, pricePerMonth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  required
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-submit">
                Add Hostel
              </button>
            </form>
          )}

          {hostels.length === 0 ? (
            <div className="no-data">No hostels added yet</div>
          ) : (
            <div className="hostels-list">
              {hostels.map((hostel) => (
                <div key={hostel._id} className="hostel-item">
                  <h3>
                    {hostel.name}
                    <span
                      className={`approval-badge ${hostel.approvalStatus || 'approved'}`}
                      title="Listing visibility"
                    >
                      {(hostel.approvalStatus === 'pending' && 'Awaiting admin approval') ||
                        (hostel.approvalStatus === 'rejected' && 'Rejected by admin') ||
                        (!hostel.approvalStatus || hostel.approvalStatus === 'approved'
                          ? 'Live for students'
                          : hostel.approvalStatus)}
                    </span>
                  </h3>
                  <p>
                    <strong>Location:</strong> {hostel.location}
                  </p>
                  <p>
                    <strong>City:</strong> {hostel.city}
                  </p>
                  <p>
                    <strong>Base Price:</strong> ₹{hostel.pricePerMonth}/month
                  </p>
                  <p>
                    <strong>Description:</strong> {hostel.description.substring(0, 100)}...
                  </p>

                  {/* Photo Gallery */}
                  {hostel.images && hostel.images.length > 0 && (
                    <div className="photo-gallery">
                      {hostel.images.map((image, idx) => (
                        <div key={idx} className="photo-item">
                          <img
                            src={`http://localhost:5000${image}`}
                            alt={`${hostel.name} - ${idx + 1}`}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                          <button
                            className="delete-btn"
                            onClick={() => handleDeletePhoto(hostel._id, image)}
                            title="Delete photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Photo Upload */}
                  <PhotoUpload
                    hostelId={hostel._id}
                    onPhotoUploadSuccess={handlePhotoUploadSuccess}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
