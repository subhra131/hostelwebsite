import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './WishlistPage.css';

const WishlistPage = () => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await api.get('/users/wishlist');
        setWishlist(data.wishlist || []);
      } catch (err) {
        setError('Failed to load wishlist.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (hostelId) => {
    if (!window.confirm('Remove this hostel from your wishlist?')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/users/wishlist/${hostelId}`);
      setWishlist((prev) => prev.filter((hostel) => hostel._id !== hostelId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove from wishlist.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>Saved hostels that you can book or review later.</p>
      </div>

      {loading && <div className="loading">Loading wishlist...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && wishlist.length === 0 && (
        <div className="wishlist-empty">
          <p>Your wishlist is empty.</p>
          <Link to="/" className="btn-primary">
            Browse hostels
          </Link>
        </div>
      )}

      {!loading && wishlist.length > 0 && (
        <div className="wishlist-list">
          {wishlist.map((hostel) => (
            <div key={hostel._id} className="wishlist-card">
              <div className="wishlist-thumbnail">
                <img
                  src={hostel.images && hostel.images.length > 0 ? hostel.images[0].startsWith('http') ? hostel.images[0] : `${window.location.protocol}//${window.location.hostname}:5000${hostel.images[0]}` : 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={hostel.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
              </div>
              <div className="wishlist-details">
                <h2>{hostel.name}</h2>
                <p className="wishlist-location">{hostel.location}</p>
                <p className="wishlist-price">₹{hostel.pricePerMonth}/month</p>
                <div className="wishlist-actions">
                  <Link to={`/hostel/${hostel._id}`} className="btn-secondary">
                    View Details
                  </Link>
                  <button
                    className="btn-wishlist-remove"
                    onClick={() => handleRemove(hostel._id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
