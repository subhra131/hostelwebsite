import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, initializing } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏨 StudentHostel
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {initializing ? (
            <span className="nav-user" style={{ opacity: 0.7 }}>
              Loading session...
            </span>
          ) : user ? (
            <>
              {user.role === 'student' && (
                <>
                  <Link to="/student-dashboard" className="nav-link">
                    My Bookings
                  </Link>
                  <Link to="/wishlist" className="nav-link">
                    Wishlist
                  </Link>
                </>
              )}
              {user.role === 'owner' && (
                <Link to="/owner-dashboard" className="nav-link">
                  Manage Hostels
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin-dashboard" className="nav-link">
                  Approve hostels
                </Link>
              )}
              <div className="nav-user">
                <span>{user.name}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="nav-link btn-signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
