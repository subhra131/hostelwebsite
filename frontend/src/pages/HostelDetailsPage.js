import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import AdvanceCheckoutOverlay from '../components/AdvanceCheckoutOverlay';
import './HostelDetailsPage.css';

const HostelDetailsPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [message, setMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [checkoutPhase, setCheckoutPhase] = useState(null);
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [checkoutPaymentRef, setCheckoutPaymentRef] = useState('');
  const [savedToWishlist, setSavedToWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistActionLoading, setWishlistActionLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState('');
  const [mainImage, setMainImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [canRate, setCanRate] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [rateStars, setRateStars] = useState(5);
  const [rateComment, setRateComment] = useState('');
  const [rateLoading, setRateLoading] = useState(false);
  const [rateMessage, setRateMessage] = useState('');
  useEffect(() => {
    fetchHostel();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!user || user.role !== 'student') {
        setSavedToWishlist(false);
        setWishlistLoading(false);
        return;
      }
      setWishlistLoading(true);
      try {
        const { data } = await api.get('/users/wishlist');
        const isSaved = (data.wishlist || []).some((item) => item._id === id);
        setSavedToWishlist(isSaved);
        setWishlistError('');
      } catch (err) {
        setWishlistError('Unable to load wishlist status.');
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlistStatus();
  }, [user, id]);

  const fetchHostel = async () => {
    try {
      const response = await api.get(`/hostels/${id}`);
      setHostel(response.data.hostel);
      if (response.data.hostel.roomTypes.length > 0) {
        setSelectedRoomType(response.data.hostel.roomTypes[0].type);
      }
    } catch (err) {
      setError('Failed to load hostel details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/hostel/${id}`);
      setReviews(response.data.reviews || []);
      setCanRate(!!response.data.canRate);
      const mr = response.data.myReview || null;
      setMyReview(mr);
      if (mr) {
        setRateStars(mr.rating);
        setRateComment(mr.comment || '');
      } else {
        setRateStars(5);
        setRateComment('');
      }
      setRateMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const closeCheckout = () => {
    setCheckoutPhase(null);
    setCheckoutOrder(null);
    setCheckoutPaymentRef('');
  };

  const startAdvanceCheckout = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to book a hostel');
      return;
    }

    if (user.role !== 'student') {
      alert('Only students can book hostels');
      return;
    }

    setCheckoutPaymentRef('');
    setCheckoutPhase('loading');
    try {
      const { data } = await api.post('/payments/booking-order', {
        hostelId: id,
        roomType: selectedRoomType,
        message,
        forceMock: true,
      });
      setCheckoutOrder(data);
      setCheckoutPhase('form');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start payment');
      setCheckoutPhase(null);
      setCheckoutOrder(null);
    }
  };

  const handleCheckoutVerified = (data) => {
    setCheckoutPaymentRef(data.booking?.razorpayPaymentId || '');
    setCheckoutPhase('success');
    setBookingSuccess(true);
    setMessage('');
    setTimeout(() => setBookingSuccess(false), 6000);
  };

  const handleToggleWishlist = async () => {
    if (!user || user.role !== 'student') {
      alert('Only students can save hostels to wishlist.');
      return;
    }

    setWishlistActionLoading(true);
    try {
      if (savedToWishlist) {
        await api.delete(`/users/wishlist/${id}`);
        setSavedToWishlist(false);
        alert('Hostel removed from wishlist.');
      } else {
        await api.post(`/users/wishlist/${id}`);
        setSavedToWishlist(true);
        alert('Hostel added to wishlist.');
      }
      setWishlistError('');
    } catch (err) {
      setWishlistError(err.response?.data?.message || 'Unable to update wishlist.');
    } finally {
      setWishlistActionLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'student') {
      alert('Only students can submit ratings');
      return;
    }
    if (!canRate) {
      alert('You can rate this hostel after the owner approves your booking.');
      return;
    }
    setRateLoading(true);
    setRateMessage('');
    try {
      await api.post('/reviews', {
        hostelId: id,
        rating: rateStars,
        comment: rateComment.trim(),
      });
      setRateMessage('Thanks! Your rating was saved.');
      await fetchHostel();
      await fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save rating');
    } finally {
      setRateLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading hostel details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!hostel) return <div className="error">Hostel not found</div>;

  const selectedRoom = hostel.roomTypes.find((r) => r.type === selectedRoomType);
  const advanceRupees = selectedRoom ? Math.min(1000, selectedRoom.pricePerMonth) : 0;
  const balanceAtHostel = selectedRoom ? Math.max(0, selectedRoom.pricePerMonth - advanceRupees) : 0;

  return (
    <div className="hostel-details-page">
      <div className="details-container">
        <div className="images-section">
          {hostel.images && hostel.images.length > 0 ? (
            <>
              <div className="main-image">
                <img
                  src={`http://localhost:5000${hostel.images[mainImage]}`}
                  alt={`${hostel.name} - ${mainImage + 1}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                  }}
                />
              </div>
              {hostel.images.length > 1 && (
                <div className="thumbnail-gallery">
                  {hostel.images.map((image, idx) => (
                    <img
                      key={idx}
                      src={`http://localhost:5000${image}`}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`thumbnail ${idx === mainImage ? 'active' : ''}`}
                      onClick={() => setMainImage(idx)}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-image">No Images Available</div>
          )}
        </div>

        <div className="info-section">
          <h1>{hostel.name}</h1>
          <p className="location">📍 {hostel.location}</p>
          <div className="rating">
            <span>
              ⭐{' '}
              {hostel.reviews > 0
                ? `${Number(hostel.rating).toFixed(1)} (${hostel.reviews} ${
                    hostel.reviews === 1 ? 'review' : 'reviews'
                  })`
                : 'No ratings yet'}
            </span>
          </div>

          <div className="amenities">
            <h3>Amenities</h3>
            <div className="amenity-list">
              {hostel.amenities.map((amenity, idx) => (
                <span key={idx} className="amenity">
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="description">
            <h3>About</h3>
            <p>{hostel.description}</p>
          </div>

          <div className="owner-info">
            <h3>Owner Details</h3>
            <p>Name: {hostel.owner.name}</p>
            <p>Email: {hostel.owner.email}</p>
            <p>Phone: {hostel.owner.phone || 'N/A'}</p>
          </div>
        </div>

        <div className="booking-section">
          <div className="booking-card">
            <h3>Book Now</h3>

            {bookingSuccess && (
              <div className="success-message">
                ✓ Advance received — booking request sent! Pay the remaining balance when you arrive at the hostel.
              </div>
            )}

            <p className="payment-explainer">
              Pay <strong>₹{advanceRupees}</strong> now to confirm your request — you&apos;ll enter card details on the
              next screen. The rest (<strong>₹{balanceAtHostel}</strong> for this month&apos;s rent) is paid at the
              hostel when you visit.
            </p>

            <form onSubmit={startAdvanceCheckout}>
              <div className="form-group">
                <label>Room Type</label>
                <select value={selectedRoomType} onChange={(e) => setSelectedRoomType(e.target.value)}>
                  {hostel.roomTypes.map((room) => (
                    <option key={room.type} value={room.type}>
                      {room.type} - ₹{room.pricePerMonth}/month
                    </option>
                  ))}
                </select>
              </div>

              {selectedRoom && (
                <div className="room-info">
                  <p>Available: {selectedRoom.availableRooms} rooms</p>
                  <p className="price">₹{selectedRoom.pricePerMonth}/month</p>
                </div>
              )}

              <div className="form-group">
                <label>Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the owner something about yourself..."
                  rows="4"
                />
              </div>

              {user?.role === 'student' && (
                <button
                  type="button"
                  className="btn-wishlist"
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading || wishlistActionLoading}
                >
                  {wishlistLoading
                    ? 'Loading…'
                    : savedToWishlist
                    ? 'Remove from wishlist'
                    : 'Save to wishlist'}
                </button>
              )}
              {wishlistError && <div className="error">{wishlistError}</div>}

              <button
                type="submit"
                className="btn-book"
                disabled={checkoutPhase === 'loading' || !user || bookingSuccess}
              >
                {checkoutPhase === 'loading'
                  ? 'Opening checkout…'
                  : bookingSuccess
                  ? 'Request sent successfully'
                  : user
                  ? `Pay ₹${advanceRupees} advance & request booking`
                  : 'Login to Book'}
              </button>
            </form>
            {bookingSuccess && (
              <div className="booking-success-message">
                Your booking request was sent successfully. The owner has been notified.
              </div>
            )}
          </div>
        </div>
      </div>

      <AdvanceCheckoutOverlay
        open={checkoutPhase !== null}
        phase={checkoutPhase}
        hostelName={hostel.name}
        order={checkoutOrder}
        user={user}
        paymentRef={checkoutPaymentRef}
        onClose={closeCheckout}
        onVerified={handleCheckoutVerified}
      />

      <section className="reviews-section" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading">Ratings &amp; reviews</h2>

        {user?.role === 'student' && (
          <div className="rate-card">
            <h3>{myReview ? 'Update your rating' : 'Rate this hostel'}</h3>
            {!canRate && (
              <p className="rate-hint">
                You can rate this hostel after the owner approves at least one of your bookings here.
              </p>
            )}
            {canRate && (
              <form onSubmit={handleSubmitRating} className="rate-form">
                <div className="star-row" role="group" aria-label="Star rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`star-btn ${n <= rateStars ? 'active' : ''}`}
                      onClick={() => setRateStars(n)}
                      aria-label={`${n} star${n === 1 ? '' : 's'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-label">{rateStars} / 5</span>
                </div>
                <div className="form-group">
                  <label htmlFor="rate-comment">Comment (optional)</label>
                  <textarea
                    id="rate-comment"
                    value={rateComment}
                    onChange={(e) => setRateComment(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Share your experience…"
                  />
                </div>
                {rateMessage && <p className="rate-success">{rateMessage}</p>}
                <button type="submit" className="btn-rate" disabled={rateLoading}>
                  {rateLoading ? 'Saving…' : myReview ? 'Update rating' : 'Submit rating'}
                </button>
              </form>
            )}
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="reviews-empty">No written reviews yet. Be the first once your stay is approved.</p>
        ) : (
          <ul className="review-list">
            {reviews.map((rev) => (
              <li key={rev.id} className="review-item">
                <div className="review-meta">
                  <span className="review-name">{rev.studentName}</span>
                  <span className="review-stars" aria-label={`${rev.rating} out of 5`}>
                    {'★'.repeat(rev.rating)}
                    <span className="review-stars-dim">{'★'.repeat(5 - rev.rating)}</span>
                  </span>
                </div>
                {rev.comment ? <p className="review-comment">{rev.comment}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default HostelDetailsPage;
