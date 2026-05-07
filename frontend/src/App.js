import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import HostelDetailsPage from './pages/HostelDetailsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DummyPaymentPage from './pages/DummyPaymentPage';
import WishlistPage from './pages/WishlistPage';
import './App.css';

const ProtectedRoute = ({ element, requiredRole, allowedRoles }) => {
  const { user, initializing } = useContext(AuthContext);

  if (initializing) {
    return (
      <div className="app-loading" style={{ padding: '2rem', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const roles = allowedRoles ?? (requiredRole ? [requiredRole] : null);
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return element;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/hostel/:id" element={<HostelDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/student-dashboard"
              element={<ProtectedRoute element={<StudentDashboard />} requiredRole="student" />}
            />
            <Route
              path="/wishlist"
              element={<ProtectedRoute element={<WishlistPage />} requiredRole="student" />}
            />
            <Route
              path="/owner-dashboard"
              element={<ProtectedRoute element={<OwnerDashboard />} requiredRole="owner" />}
            />
            <Route
              path="/admin-dashboard"
              element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />}
            />
            <Route path="/dummy-payment" element={<ProtectedRoute element={<DummyPaymentPage />} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
