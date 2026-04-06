import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaChartLine, FaClock, FaEnvelope, FaFileUpload, FaFolderOpen, FaPaperPlane } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { serviceOptions } from '../data/portfolioData';
import { formatDateTime, getRemainingTime, getServiceLabel, getStatusMeta } from '../utils/requestStatus';

const MAX_DOCUMENT_SIZE_BYTES = 3 * 1024 * 1024;
const AUTO_REFRESH_INTERVAL_MS = 15000;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    requests: 0,
    messages: 0,
  });
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceType: serviceOptions[0]?.id || 'website',
    budget: '',
    timeline: '',
    message: '',
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((current) => ({
      ...current,
      name: current.name || user.fullname || '',
      email: current.email || user.email || '',
    }));
  }, [user]);

  const requestSummary = useMemo(() => {
    return requests.reduce(
      (summary, request) => {
        summary.total += 1;
        summary[request.status] = (summary[request.status] || 0) + 1;
        return summary;
      },
      {
        total: 0,
        received: 0,
        in_progress: 0,
        completed: 0,
        rejected: 0,
      }
    );
  }, [requests]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchRequests = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoadingRequests(true);
      }

      const response = await api.get('/dashboard/requests');
      setRequests(response.data.requests || []);
      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      if (!silent) {
        setLoadingRequests(false);
      }
    }
  }, []);

  const refreshDashboard = useCallback(async ({ silent = false } = {}) => {
    await Promise.all([
      fetchStats(),
      fetchRequests({ silent }),
    ]);
  }, [fetchRequests, fetchStats]);

  useEffect(() => {
    refreshDashboard();

    const intervalId = window.setInterval(() => {
      refreshDashboard({ silent: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    const handleWindowFocus = () => {
      refreshDashboard({ silent: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshDashboard({ silent: true });
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshDashboard]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedDocument(null);
      return;
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      setStatus({
        type: 'error',
        message: 'Document must be 3MB or smaller.',
      });
      event.target.value = '';
      return;
    }

    setSelectedDocument(file);
    setStatus({
      type: 'success',
      message: `Document "${file.name}" is attached and ready to send.`,
    });
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const content = result.includes(',') ? result.split(',')[1] : result;
        resolve(content);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read document'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      let documentPayload = null;

      if (selectedDocument) {
        const content = await readFileAsBase64(selectedDocument);
        documentPayload = {
          name: selectedDocument.name,
          type: selectedDocument.type || 'application/octet-stream',
          size: selectedDocument.size,
          content,
        };
      }

      const response = await api.post('/requests', {
        ...formData,
        document: documentPayload,
      });

      const createdRequest = response.data.request;
      setRequests((current) => [createdRequest, ...current]);
      setStats((current) => ({
        ...current,
        requests: current.requests + 1,
      }));
      setLastSyncedAt(new Date().toISOString());
      setFormData((current) => ({
        ...current,
        phone: '',
        company: '',
        budget: '',
        timeline: '',
        message: '',
      }));
      setSelectedDocument(null);
      setStatus({
        type: 'success',
        message: 'Your request has been submitted and marked as received.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to submit request.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="customer-dashboard-page">
      <div className="customer-dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Customer workspace</p>
          <h1>Welcome back, {user?.fullname}.</h1>
          <p>Upload your document, send a new request, and follow progress from one place.</p>
        </div>
      </div>

      <div className="customer-dashboard-shell">
        <section className="dashboard-stat-grid">
          <article className="dashboard-stat-card">
            <FaFolderOpen className="dashboard-stat-icon" />
            <div>
              <h3>{stats.projects}</h3>
              <p>Projects</p>
            </div>
          </article>
          <article className="dashboard-stat-card">
            <FaEnvelope className="dashboard-stat-icon" />
            <div>
              <h3>{stats.requests}</h3>
              <p>Total requests</p>
            </div>
          </article>
          <article className="dashboard-stat-card">
            <FaChartLine className="dashboard-stat-icon" />
            <div>
              <h3>{requestSummary.in_progress}</h3>
              <p>Currently in progress</p>
            </div>
          </article>
        </section>

        <div className="customer-dashboard-layout">
          <section className="request-form-panel">
            <div className="panel-heading">
              <p className="dashboard-eyebrow">New service request</p>
              <h2>Send the work you need</h2>
              <p>Attach a supporting document if you have one so the work can start faster.</p>
            </div>

            <form className="dashboard-request-form" onSubmit={handleSubmit}>
              <div className="dashboard-form-grid">
                <label className="dashboard-field">
                  <span>Name</span>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </label>
                <label className="dashboard-field">
                  <span>Email</span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </label>
                <label className="dashboard-field">
                  <span>Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Example: 0626992627"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="dashboard-field">
                  <span>Company / brand</span>
                  <input
                    type="text"
                    name="company"
                    placeholder="Optional"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </label>
                <label className="dashboard-field">
                  <span>Service needed</span>
                  <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
                    {serviceOptions.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="dashboard-field">
                  <span>Timeline</span>
                  <input
                    type="text"
                    name="timeline"
                    placeholder="Example: 3 days or 2 weeks"
                    value={formData.timeline}
                    onChange={handleChange}
                  />
                </label>
                <label className="dashboard-field">
                  <span>Budget</span>
                  <input
                    type="text"
                    name="budget"
                    placeholder="Optional budget range"
                    value={formData.budget}
                    onChange={handleChange}
                  />
                </label>
                <label className="dashboard-field dashboard-field-full">
                  <span>Supporting document</span>
                  <div className="document-picker">
                    <FaFileUpload />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                    />
                  </div>
                  <small>
                    Accepted: PDF, DOC, DOCX, JPG, PNG. Maximum size 3MB.
                    {selectedDocument ? ` Selected: ${selectedDocument.name}` : ''}
                  </small>
                </label>
              </div>

              <label className="dashboard-field">
                <span>Request details</span>
                <textarea
                  name="message"
                  rows="6"
                  placeholder="Describe the service or application support you need."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </label>

              {status.message && <div className={`dashboard-status-message ${status.type}`}>{status.message}</div>}

              <button type="submit" className="dashboard-submit-button" disabled={submitting}>
                <FaPaperPlane /> {submitting ? 'Sending request...' : 'Send request'}
              </button>
            </form>
          </section>

          <aside className="request-tracker-panel">
            <div className="panel-heading">
              <p className="dashboard-eyebrow">Tracking</p>
              <h2>Your service requests</h2>
              <p>
                See when a request has been received, moved into work, or completed.
                {lastSyncedAt ? ` Last synced: ${formatDateTime(lastSyncedAt)}.` : ''}
              </p>
            </div>

            <div className="tracker-summary-grid">
              <div className="tracker-summary-card">
                <strong>{requestSummary.received}</strong>
                <span>Received</span>
              </div>
              <div className="tracker-summary-card">
                <strong>{requestSummary.in_progress}</strong>
                <span>In progress</span>
              </div>
              <div className="tracker-summary-card">
                <strong>{requestSummary.completed}</strong>
                <span>Completed</span>
              </div>
            </div>

            <div className="request-tracker-list">
              {loadingRequests ? (
                <p className="empty-state">Loading your requests...</p>
              ) : requests.length === 0 ? (
                <p className="empty-state">No requests yet. Your submitted requests will appear here.</p>
              ) : (
                requests.map((request) => {
                  const statusMeta = getStatusMeta(request.status);
                  const remainingTime = getRemainingTime(request.dueDate);

                  return (
                    <article className="tracker-card" key={request.id}>
                      <div className="tracker-card-top">
                        <div>
                          <h3>{getServiceLabel(request.serviceType)}</h3>
                          <p>{statusMeta.description}</p>
                        </div>
                        <span className={`dashboard-status-badge ${request.status}`}>{statusMeta.label}</span>
                      </div>

                      <div className="tracker-metadata">
                        <span>Submitted: {formatDateTime(request.created_at)}</span>
                        <span className={`remaining-pill ${remainingTime.tone}`}>
                          <FaClock /> {remainingTime.label}
                        </span>
                      </div>

                      <p className="tracker-message">{request.message}</p>

                      <div className="tracker-progress">
                        <strong>Progress note</strong>
                        <p>{request.progressNote || 'Waiting for the admin to start this request.'}</p>
                      </div>

                      <div className="tracker-footer">
                        <span>Deadline: {formatDateTime(request.dueDate)}</span>
                        {request.document?.url && (
                          <a href={request.document.url} download={request.document.name}>
                            Download {request.document.name}
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .customer-dashboard-page {
          min-height: 100vh;
          padding-top: 88px;
          background:
            radial-gradient(circle at top left, rgba(177, 215, 255, 0.28), transparent 30%),
            linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(238, 245, 252, 0.9));
          color: #20304a;
        }
        .customer-dashboard-header {
          max-width: 1280px;
          margin: 0 auto;
          padding: 3.5rem 2rem 1rem;
        }
        .dashboard-eyebrow {
          margin: 0 0 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.78rem;
          color: #54718f;
        }
        .customer-dashboard-header h1 {
          margin: 0 0 0.75rem;
          font-size: clamp(2rem, 4vw, 3rem);
        }
        .customer-dashboard-header p {
          max-width: 720px;
          color: #5f7188;
        }
        .customer-dashboard-shell {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem 2rem 4rem;
        }
        .dashboard-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.75rem;
        }
        .dashboard-stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.3rem 1.4rem;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(130, 165, 205, 0.22);
          box-shadow: 0 18px 45px rgba(48, 76, 112, 0.09);
        }
        .dashboard-stat-icon {
          width: 46px;
          height: 46px;
          padding: 0.9rem;
          border-radius: 14px;
          background: linear-gradient(135deg, #d6ebff, #eef6ff);
          color: #3a628d;
        }
        .dashboard-stat-card h3 {
          margin: 0;
          font-size: 1.8rem;
        }
        .dashboard-stat-card p {
          margin: 0.2rem 0 0;
          color: #61758f;
        }
        .customer-dashboard-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.9fr);
          gap: 1.5rem;
          align-items: start;
        }
        .request-form-panel,
        .request-tracker-panel {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(130, 165, 205, 0.22);
          border-radius: 28px;
          box-shadow: 0 20px 50px rgba(48, 76, 112, 0.1);
          padding: 1.6rem;
        }
        .panel-heading h2 {
          margin: 0 0 0.65rem;
          font-size: 1.45rem;
        }
        .panel-heading p:last-child {
          margin: 0;
          color: #607289;
        }
        .dashboard-request-form {
          margin-top: 1.5rem;
        }
        .dashboard-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .dashboard-field {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          margin-bottom: 1rem;
        }
        .dashboard-field-full {
          grid-column: 1 / -1;
        }
        .dashboard-field span {
          font-weight: 600;
          color: #30435e;
        }
        .dashboard-field input,
        .dashboard-field select,
        .dashboard-field textarea {
          width: 100%;
          border: 1px solid rgba(128, 164, 204, 0.28);
          border-radius: 16px;
          background: #f9fbff;
          padding: 0.95rem 1rem;
          color: #20304a;
        }
        .dashboard-field input:focus,
        .dashboard-field select:focus,
        .dashboard-field textarea:focus {
          outline: none;
          border-color: #71a5da;
          box-shadow: 0 0 0 4px rgba(113, 165, 218, 0.12);
        }
        .document-picker {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border: 1px dashed rgba(90, 126, 165, 0.32);
          background: rgba(240, 247, 255, 0.78);
          padding: 1rem;
          border-radius: 16px;
          color: #466789;
        }
        .document-picker input {
          border: none;
          padding: 0;
          background: transparent;
          box-shadow: none;
        }
        .dashboard-field small {
          color: #667b94;
        }
        .dashboard-status-message {
          padding: 0.95rem 1rem;
          border-radius: 16px;
          margin-bottom: 1rem;
        }
        .dashboard-status-message.success {
          background: rgba(228, 246, 233, 0.92);
          color: #236243;
        }
        .dashboard-status-message.error {
          background: rgba(251, 232, 232, 0.92);
          color: #8d3f3f;
        }
        .dashboard-submit-button {
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg, #7bb1ea, #5c82d6);
          color: #fff;
          padding: 0.95rem 1.35rem;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 600;
          cursor: pointer;
        }
        .dashboard-submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .tracker-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.8rem;
          margin: 1.4rem 0;
        }
        .tracker-summary-card {
          border-radius: 18px;
          padding: 1rem;
          background: linear-gradient(180deg, #f7fbff, #edf4fc);
          border: 1px solid rgba(130, 165, 205, 0.18);
          text-align: center;
        }
        .tracker-summary-card strong {
          display: block;
          font-size: 1.4rem;
          margin-bottom: 0.3rem;
        }
        .tracker-summary-card span {
          color: #627791;
          font-size: 0.9rem;
        }
        .request-tracker-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 980px;
          overflow: auto;
          padding-right: 0.2rem;
        }
        .tracker-card {
          border-radius: 22px;
          background: linear-gradient(180deg, rgba(247, 250, 255, 0.96), rgba(240, 246, 253, 0.92));
          border: 1px solid rgba(130, 165, 205, 0.2);
          padding: 1.2rem;
        }
        .tracker-card-top {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: start;
        }
        .tracker-card-top h3 {
          margin: 0 0 0.35rem;
        }
        .tracker-card-top p {
          margin: 0;
          color: #61758e;
          font-size: 0.95rem;
        }
        .dashboard-status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 0.45rem 0.8rem;
          font-size: 0.78rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .dashboard-status-badge.received {
          background: rgba(255, 202, 89, 0.2);
          color: #8a6413;
        }
        .dashboard-status-badge.in_progress {
          background: rgba(101, 154, 255, 0.16);
          color: #2f5fad;
        }
        .dashboard-status-badge.completed {
          background: rgba(89, 191, 125, 0.16);
          color: #1c7040;
        }
        .dashboard-status-badge.rejected {
          background: rgba(225, 94, 94, 0.15);
          color: #963939;
        }
        .tracker-metadata,
        .tracker-footer {
          display: flex;
          justify-content: space-between;
          gap: 0.8rem;
          flex-wrap: wrap;
          margin-top: 0.95rem;
          color: #667a92;
          font-size: 0.9rem;
        }
        .remaining-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: 999px;
          padding: 0.32rem 0.75rem;
          font-weight: 600;
        }
        .remaining-pill.positive {
          background: rgba(89, 191, 125, 0.16);
          color: #1c7040;
        }
        .remaining-pill.warning {
          background: rgba(255, 202, 89, 0.18);
          color: #8a6413;
        }
        .remaining-pill.danger {
          background: rgba(225, 94, 94, 0.15);
          color: #963939;
        }
        .remaining-pill.neutral {
          background: rgba(109, 130, 156, 0.12);
          color: #536a84;
        }
        .tracker-message {
          margin: 1rem 0 0;
          line-height: 1.6;
          color: #33465f;
        }
        .tracker-progress {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(130, 165, 205, 0.18);
        }
        .tracker-progress strong {
          display: block;
          margin-bottom: 0.35rem;
        }
        .tracker-progress p {
          margin: 0;
          color: #607289;
          line-height: 1.6;
        }
        .tracker-footer a {
          color: #2d5fa7;
          text-decoration: none;
          font-weight: 600;
        }
        .empty-state {
          margin: 0;
          padding: 2rem 1rem;
          text-align: center;
          color: #667a92;
        }
        @media (max-width: 1024px) {
          .customer-dashboard-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 720px) {
          .customer-dashboard-header,
          .customer-dashboard-shell {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .dashboard-form-grid,
          .tracker-summary-grid {
            grid-template-columns: 1fr;
          }
          .tracker-card-top,
          .tracker-metadata,
          .tracker-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
