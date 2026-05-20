import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('hostels');
  const [hostels, setHostels] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [error, setError] = useState('');
  const [ownersError, setOwnersError] = useState('');

  const fetchPending = async () => {
    try {
      const response = await api.get('/hostels/admin/pending');
      setHostels(response.data.hostels || []);
    } catch (err) {
      setError('Failed to load pending hostels');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await api.get('/owner/admin/owners');
      setOwners(response.data.owners || []);
    } catch (err) {
      setOwnersError('Failed to load owners');
    } finally {
      setOwnersLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    fetchOwners();
  }, []);

  const handleApprove = async (hostelId) => {
    try {
      await api.put(`/hostels/admin/${hostelId}/approve`);
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (hostelId) => {
    if (!window.confirm('Reject this hostel? The owner will see it as rejected.')) return;
    try {
      await api.put(`/hostels/admin/${hostelId}/reject`);
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleRemoveOwner = async (ownerId) => {
    if (!window.confirm('Remove this owner and all their hostels? This cannot be undone.')) return;
    try {
      await api.delete(`/owner/admin/owners/${ownerId}`);
      fetchOwners();
      alert('Owner removed successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove owner');
    }
  };

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name}. Manage hostel approvals and registered owners from one place.</p>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'hostels' ? 'active' : ''}`}
          onClick={() => setActiveTab('hostels')}
        >
          Pending Hostels
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'owners' ? 'active' : ''}`}
          onClick={() => setActiveTab('owners')}
        >
          Hostel Owners
        </button>
      </div>

      {activeTab === 'hostels' && (
        <div className="tab-content">
          {loading && <div className="loading">Loading pending hostels...</div>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && (
            <>
              {hostels.length === 0 ? (
                <div className="no-data">No hostels waiting for approval</div>
              ) : (
                <div className="bookings-list">
                  {hostels.map((hostel) => (
                    <div key={hostel._id} className="request-card">
                      <div className="request-header">
                        <div>
                          <h3>{hostel.name}</h3>
                          <p className="student-info">
                            Owner: {hostel.owner?.name} ({hostel.owner?.email})
                            {hostel.owner?.phone ? ` · ${hostel.owner.phone}` : ''}
                          </p>
                        </div>
                        <span className="status">PENDING</span>
                      </div>
                      <div className="request-details">
                        <p>
                          <strong>City:</strong> {hostel.city} · <strong>Area:</strong> {hostel.area || '—'}
                        </p>
                        <p>
                          <strong>Location:</strong> {hostel.location}
                        </p>
                        <p>
                          <strong>From:</strong> ₹{hostel.pricePerMonth}/month
                        </p>
                        <p>
                          <strong>Description:</strong> {hostel.description?.slice(0, 200)}
                          {hostel.description?.length > 200 ? '…' : ''}
                        </p>
                      </div>
                      <div className="request-actions">
                        <button type="button" className="btn-approve" onClick={() => handleApprove(hostel._id)}>
                          Approve for students
                        </button>
                        <button type="button" className="btn-reject" onClick={() => handleReject(hostel._id)}>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'owners' && (
        <div className="tab-content">
          {ownersLoading && <div className="loading">Loading owners...</div>}
          {ownersError && <div className="error">{ownersError}</div>}

          {!ownersLoading && !ownersError && (
            <>
              {owners.length === 0 ? (
                <div className="no-data">No registered hostel owners found</div>
              ) : (
                <div className="owners-table-wrapper">
                  <table className="owners-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {owners.map((owner) => (
                        <tr key={owner._id}>
                          <td>{owner.name}</td>
                          <td>{owner.email}</td>
                          <td>{owner.phone || 'N/A'}</td>
                          <td>{new Date(owner.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-reject"
                              onClick={() => handleRemoveOwner(owner._id)}
                            >
                              Remove Owner
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
