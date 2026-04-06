import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaBell,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaEnvelope,
  FaFolderOpen,
  FaPlus,
  FaTrash,
  FaUsers,
} from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  formatDateInputValue,
  formatDateTime,
  getRemainingTime,
  getServiceLabel,
  getStatusMeta,
} from '../utils/requestStatus';

const DEFAULT_FORM_STATE = {
  status: 'received',
  progressNote: '',
  dueDate: '',
};

const DEFAULT_PROJECT_FORM = {
  title: '',
  slug: '',
  category: '',
  featured: false,
  image_url: '',
  short_description: '',
  description: '',
  challenge: '',
  solution: '',
  impact: '',
  tech_stack: '',
  live_demo: '',
  github_link: '',
};

const REQUEST_POLL_INTERVAL_MS = 15000;
const REQUEST_NOTIFICATIONS_STORAGE_KEY = 'portfolio-admin-seen-request-ids';
const MAX_ADMIN_NOTIFICATIONS = 6;
const MAX_PROJECT_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

const readStoredSeenRequestIds = () => {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const rawValue = window.localStorage.getItem(REQUEST_NOTIFICATIONS_STORAGE_KEY);
    const parsedValue = JSON.parse(rawValue || '[]');
    return new Set(Array.isArray(parsedValue) ? parsedValue.map(String) : []);
  } catch (error) {
    return new Set();
  }
};

const writeStoredSeenRequestIds = (idSet) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(REQUEST_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(idSet)));
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeAdminView, setActiveAdminView] = useState('requests');
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    requests: 0,
    messages: 0,
  });
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [requestForm, setRequestForm] = useState(DEFAULT_FORM_STATE);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState(DEFAULT_PROJECT_FORM);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectFeedback, setProjectFeedback] = useState({ type: '', message: '' });
  const [projectImageName, setProjectImageName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [lastRequestSyncAt, setLastRequestSyncAt] = useState(null);
  const knownRequestIdsRef = useRef(new Set());
  const requestsInitializedRef = useRef(false);

  const selectedRequest = useMemo(() => {
    return requests.find((request) => request.id === selectedRequestId) || null;
  }, [requests, selectedRequestId]);

  const selectedProject = useMemo(() => {
    return projects.find((project) => String(project.id) === String(selectedProjectId)) || null;
  }, [projects, selectedProjectId]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchRequests = useCallback(async ({ silent = false, markAllAsSeen = false } = {}) => {
    try {
      const response = await api.get('/admin/requests');
      const nextRequests = response.data.requests || [];
      const nextRequestIds = new Set(nextRequests.map((request) => String(request.id)));
      const storedSeenRequestIds = readStoredSeenRequestIds();

      setRequests(nextRequests);
      setSelectedRequestId((current) => current || nextRequests[0]?.id || null);
      setLastRequestSyncAt(new Date().toISOString());

      if (!requestsInitializedRef.current || markAllAsSeen) {
        const mergedSeenIds = new Set([...storedSeenRequestIds, ...nextRequestIds]);
        writeStoredSeenRequestIds(mergedSeenIds);
        knownRequestIdsRef.current = nextRequestIds;
        requestsInitializedRef.current = true;
        return;
      }

      const newIncomingRequests = nextRequests.filter((request) => {
        const requestId = String(request.id);
        return !knownRequestIdsRef.current.has(requestId) && !storedSeenRequestIds.has(requestId);
      });

      if (newIncomingRequests.length > 0) {
        setNotifications((current) => [
          ...newIncomingRequests.map((request) => ({
            id: request.id,
            title: `${request.name} requested ${getServiceLabel(request.serviceType)}`,
            createdAt: request.created_at,
          })),
          ...current,
        ].slice(0, MAX_ADMIN_NOTIFICATIONS));
        setUnreadNotificationCount((current) => current + newIncomingRequests.length);
      }

      knownRequestIdsRef.current = nextRequestIds;
      requestsInitializedRef.current = true;

      if (!silent) {
        setFeedback((current) => current);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/admin/projects');
      const nextProjects = response.data.projects || [];
      setProjects(nextProjects);
      setSelectedProjectId((current) => current || nextProjects[0]?.id || null);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchProjects();
    fetchRequests({ markAllAsSeen: true });

    const intervalId = window.setInterval(() => {
      fetchRequests({ silent: true });
    }, REQUEST_POLL_INTERVAL_MS);

    const handleWindowFocus = () => {
      fetchRequests({ silent: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRequests({ silent: true });
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchProjects, fetchRequests, fetchStats]);

  useEffect(() => {
    if (!selectedRequest) {
      setRequestForm(DEFAULT_FORM_STATE);
      return;
    }

    setRequestForm({
      status: selectedRequest.status || 'received',
      progressNote: selectedRequest.progressNote || '',
      dueDate: formatDateInputValue(selectedRequest.dueDate),
    });
  }, [selectedRequest]);

  useEffect(() => {
    if (!selectedProject) {
      setProjectForm(DEFAULT_PROJECT_FORM);
      setProjectImageName('');
      return;
    }

    setProjectForm({
      title: selectedProject.title || '',
      slug: selectedProject.slug || '',
      category: selectedProject.category || '',
      featured: Boolean(selectedProject.featured),
      image_url: selectedProject.image_url || '',
      short_description: selectedProject.short_description || '',
      description: selectedProject.description || '',
      challenge: selectedProject.challenge || '',
      solution: selectedProject.solution || '',
      impact: selectedProject.impact || '',
      tech_stack: Array.isArray(selectedProject.tech_stack) ? selectedProject.tech_stack.join(', ') : '',
      live_demo: selectedProject.live_demo || '',
      github_link: selectedProject.github_link || '',
    });
    setProjectImageName('');
  }, [selectedProject]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setRequestForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProjectChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProjectForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(typeof reader.result === 'string' ? reader.result : '');
      };

      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleProjectImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_PROJECT_IMAGE_SIZE_BYTES) {
      setProjectFeedback({
        type: 'error',
        message: 'Project image must be 4MB or smaller.',
      });
      event.target.value = '';
      return;
    }

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      setProjectForm((current) => ({
        ...current,
        image_url: imageDataUrl,
      }));
      setProjectImageName(file.name);
      setProjectFeedback({
        type: 'success',
        message: `Image "${file.name}" is ready to be saved with the project.`,
      });
    } catch (error) {
      setProjectFeedback({
        type: 'error',
        message: error.message || 'Failed to load selected image.',
      });
    } finally {
      event.target.value = '';
    }
  };

  const markNotificationsAsRead = () => {
    const seenIds = new Set([
      ...readStoredSeenRequestIds(),
      ...notifications.map((notification) => String(notification.id)),
      ...requests.map((request) => String(request.id)),
    ]);

    writeStoredSeenRequestIds(seenIds);
    setUnreadNotificationCount(0);
  };

  const handleSave = async () => {
    if (!selectedRequest) {
      return;
    }

    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await api.put(`/admin/requests/${selectedRequest.id}`, {
        status: requestForm.status,
        progressNote: requestForm.progressNote,
        dueDate: requestForm.dueDate || null,
      });

      const updatedRequest = response.data.request;

      setRequests((current) =>
        current.map((request) => (request.id === updatedRequest.id ? updatedRequest : request))
      );
      setFeedback({
        type: 'success',
        message: 'Request workflow updated successfully.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update request.',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetProjectForm = () => {
    setSelectedProjectId(null);
    setProjectForm(DEFAULT_PROJECT_FORM);
    setProjectFeedback({ type: '', message: '' });
    setProjectImageName('');
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    setProjectSaving(true);
    setProjectFeedback({ type: '', message: '' });

    const payload = {
      ...projectForm,
      tech_stack: projectForm.tech_stack,
    };

    try {
      if (selectedProject) {
        const response = await api.put(`/admin/projects/${selectedProject.id}`, payload);
        const updatedProject = response.data.project;
        setProjects((current) =>
          current.map((project) => (project.id === updatedProject.id ? updatedProject : project))
        );
        setSelectedProjectId(updatedProject.id);
        setProjectFeedback({
          type: 'success',
          message: 'Project updated successfully.',
        });
      } else {
        const response = await api.post('/admin/projects', payload);
        const createdProject = response.data.project;
        setProjects((current) => [createdProject, ...current]);
        setSelectedProjectId(createdProject.id);
        setProjectFeedback({
          type: 'success',
          message: 'Project created successfully.',
        });
      }

      fetchStats();
      setActiveAdminView('projects');
    } catch (error) {
      setProjectFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Failed to save project.',
      });
    } finally {
      setProjectSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) {
      return;
    }

    const confirmed = window.confirm(`Delete project "${selectedProject.title}"?`);

    if (!confirmed) {
      return;
    }

    setProjectSaving(true);
    setProjectFeedback({ type: '', message: '' });

    try {
      await api.delete(`/admin/projects/${selectedProject.id}`);
      const remainingProjects = projects.filter((project) => project.id !== selectedProject.id);
      setProjects(remainingProjects);
      setSelectedProjectId(remainingProjects[0]?.id || null);
      setProjectImageName('');
      setProjectFeedback({
        type: 'success',
        message: 'Project deleted successfully.',
      });
      fetchStats();
    } catch (error) {
      setProjectFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete project.',
      });
    } finally {
      setProjectSaving(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="unauthorized">
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-workspace-page">
      <div className="admin-dashboard-layout">
        <aside className="admin-app-sidebar">
          <div className="admin-app-brand">
            <div className="admin-brand-mark">DG</div>
            <div>
              <strong>DeveloperGinger</strong>
              <span>Admin Workspace</span>
            </div>
          </div>

          <div className="admin-app-menu-label">Menu</div>

          <button
            type="button"
            className={`admin-app-menu-item ${activeAdminView === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveAdminView('requests')}
          >
            <span className="admin-app-menu-main">
              <FaEnvelope />
              Requests
            </span>
            <span className="admin-app-menu-meta">
              <strong>{stats.requests}</strong>
              <FaChevronRight />
            </span>
          </button>

          <button
            type="button"
            className={`admin-app-menu-item ${activeAdminView === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveAdminView('projects')}
          >
            <span className="admin-app-menu-main">
              <FaFolderOpen />
              Projects
            </span>
            <span className="admin-app-menu-meta">
              <strong>{stats.projects}</strong>
              <FaChevronRight />
            </span>
          </button>

          <button
            type="button"
            className="admin-app-menu-item"
            onClick={() => {
              resetProjectForm();
              setActiveAdminView('projects');
            }}
          >
            <span className="admin-app-menu-main">
              <FaPlus />
              Add Project
            </span>
            <span className="admin-app-menu-meta">
              <FaChevronRight />
            </span>
          </button>

          <button type="button" className="admin-app-menu-item" onClick={markNotificationsAsRead}>
            <span className="admin-app-menu-main">
              <FaBell />
              Notifications
            </span>
            <span className="admin-app-menu-meta">
              <strong>{unreadNotificationCount}</strong>
              <FaChevronRight />
            </span>
          </button>
        </aside>

        <div className="admin-main-panel">
          <div className="admin-workspace-header">
            <div>
              <p className="admin-eyebrow">Admin workspace</p>
              <h1>Service requests management</h1>
              <p>Track incoming jobs, update their progress, and monitor how much time is left.</p>
            </div>
          </div>

          <div className="admin-workspace-shell">
            <section className="admin-stat-grid">
              <article className="admin-stat-card">
                <FaUsers className="admin-stat-icon" />
                <div>
                  <h3>{stats.users}</h3>
                  <p>Users</p>
                </div>
              </article>
              <article className="admin-stat-card">
                <FaFolderOpen className="admin-stat-icon" />
                <div>
                  <h3>{stats.projects}</h3>
                  <p>Projects</p>
                </div>
              </article>
              <article className="admin-stat-card">
                <FaEnvelope className="admin-stat-icon" />
                <div>
                  <h3>{stats.requests}</h3>
                  <p>Requests</p>
                </div>
              </article>
            </section>

            <section className="admin-notification-panel">
              <div className="admin-notification-header">
                <div className="admin-notification-title">
                  <div className="admin-notification-icon-wrap">
                    <FaBell />
                    {unreadNotificationCount > 0 && (
                      <span className="admin-notification-badge">{unreadNotificationCount}</span>
                    )}
                  </div>
                  <div>
                    <h2>New request notifications</h2>
                    <p>
                      Admin will know immediately when new work is requested.
                      {lastRequestSyncAt ? ` Last synced: ${formatDateTime(lastRequestSyncAt)}.` : ''}
                    </p>
                  </div>
                </div>
                <button type="button" className="admin-mark-read-button" onClick={markNotificationsAsRead}>
                  Mark all as read
                </button>
              </div>

              <div className="admin-notification-list">
                {notifications.length === 0 ? (
                  <p className="admin-empty-state">No new request notifications right now.</p>
                ) : (
                  notifications.map((notification) => (
                    <article className="admin-notification-item" key={notification.id}>
                      <strong>{notification.title}</strong>
                      <span>{formatDateTime(notification.createdAt)}</span>
                    </article>
                  ))
                )}
              </div>
            </section>

            {activeAdminView === 'requests' && (
              <div className="admin-workspace-layout">
                <aside className="admin-request-sidebar">
                  <div className="sidebar-heading">
                    <h2>Requests sidebar</h2>
                    <p>Choose a request to see full details and update its workflow.</p>
                  </div>

                  <div className="admin-request-list">
                    {requests.length === 0 ? (
                      <p className="admin-empty-state">Hakuna requests bado.</p>
                    ) : (
                      requests.map((request) => {
                        const statusMeta = getStatusMeta(request.status);
                        const remainingTime = getRemainingTime(request.dueDate);
                        const isActive = selectedRequestId === request.id;

                        return (
                          <article
                            key={request.id}
                            className={`admin-request-list-item ${isActive ? 'active' : ''}`}
                          >
                            <button
                              type="button"
                              className="admin-request-card-trigger"
                              onClick={() => {
                                setSelectedRequestId((current) => (current === request.id ? null : request.id));
                                setFeedback({ type: '', message: '' });
                              }}
                            >
                              <div className="admin-request-list-top">
                                <strong>{request.name}</strong>
                                <span className={`admin-status-badge ${request.status}`}>{statusMeta.label}</span>
                              </div>
                              <span>{request.email}</span>
                              <span>{request.phone}</span>
                              <span>{getServiceLabel(request.serviceType)}</span>
                              <span className={`remaining-chip ${remainingTime.tone}`}>
                                <FaClock /> {remainingTime.label}
                              </span>
                            </button>

                            {isActive && (
                              <div className="admin-request-card-body">
                                <div className="admin-request-card-grid">
                                  <div>
                                    <strong>Requester</strong>
                                    <p>{request.name}</p>
                                  </div>
                                  <div>
                                    <strong>Service</strong>
                                    <p>{getServiceLabel(request.serviceType)}</p>
                                  </div>
                                  <div>
                                    <strong>Email</strong>
                                    <p>{request.email}</p>
                                  </div>
                                  <div>
                                    <strong>Phone</strong>
                                    <p>{request.phone}</p>
                                  </div>
                                </div>
                                <div className="admin-request-card-message">
                                  <strong>Alichorequest</strong>
                                  <p>{request.message}</p>
                                </div>
                              </div>
                            )}
                          </article>
                        );
                      })
                    )}
                  </div>
                </aside>

                <section className="admin-request-detail">
                  {selectedRequest ? (
                    <>
                      <div className="detail-heading">
                        <div>
                          <p className="admin-eyebrow">Selected request</p>
                          <h2>{getServiceLabel(selectedRequest.serviceType)}</h2>
                        </div>
                        <span className={`admin-status-badge ${selectedRequest.status}`}>
                          {getStatusMeta(selectedRequest.status).label}
                        </span>
                      </div>

                      <div className="admin-detail-grid">
                        <article className="admin-detail-card">
                          <strong>Client</strong>
                          <p>{selectedRequest.name}</p>
                        </article>
                        <article className="admin-detail-card">
                          <strong>Email</strong>
                          <p>{selectedRequest.email}</p>
                        </article>
                        <article className="admin-detail-card">
                          <strong>Phone</strong>
                          <p>{selectedRequest.phone}</p>
                        </article>
                        <article className="admin-detail-card">
                          <strong>Submitted</strong>
                          <p>{formatDateTime(selectedRequest.created_at)}</p>
                        </article>
                        <article className="admin-detail-card">
                          <strong>Deadline</strong>
                          <p>{formatDateTime(selectedRequest.dueDate)}</p>
                        </article>
                        <article className="admin-detail-card">
                          <strong>Last updated</strong>
                          <p>{formatDateTime(selectedRequest.updatedAt)}</p>
                        </article>
                      </div>

                      <div className="admin-message-card">
                        <strong>Client message</strong>
                        <p>{selectedRequest.message}</p>
                      </div>

                      <div className="admin-message-card">
                        <strong>Request context</strong>
                        <p>Company: {selectedRequest.company || 'Not provided'}</p>
                        <p>Budget: {selectedRequest.budget || 'Not provided'}</p>
                        <p>Timeline: {selectedRequest.timeline || 'Not provided'}</p>
                        {selectedRequest.document?.url ? (
                          <a href={selectedRequest.document.url} download={selectedRequest.document.name}>
                            Download document: {selectedRequest.document.name}
                          </a>
                        ) : (
                          <p>No document uploaded.</p>
                        )}
                      </div>

                      <div className="workflow-panel">
                        <div className="workflow-heading">
                          <h3>Update workflow</h3>
                          <p>Set the current stage, progress note, and final deadline.</p>
                        </div>

                        <div className="workflow-grid">
                          <label className="workflow-field">
                            <span>Status</span>
                            <select name="status" value={requestForm.status} onChange={handleFormChange}>
                              <option value="received">Received</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </label>
                          <label className="workflow-field">
                            <span>Due date</span>
                            <input type="date" name="dueDate" value={requestForm.dueDate} onChange={handleFormChange} />
                          </label>
                        </div>

                        <label className="workflow-field">
                          <span>Progress note</span>
                          <textarea
                            name="progressNote"
                            rows="5"
                            placeholder="Example: Waiting for review, document verified, or work started."
                            value={requestForm.progressNote}
                            onChange={handleFormChange}
                          />
                        </label>

                        {feedback.message && <div className={`workflow-feedback ${feedback.type}`}>{feedback.message}</div>}

                        <button type="button" className="workflow-save-button" onClick={handleSave} disabled={saving}>
                          <FaCheckCircle /> {saving ? 'Saving changes...' : 'Save workflow'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="admin-empty-detail">
                      <h2>No request selected</h2>
                      <p>Select a request from the sidebar to inspect and update it.</p>
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeAdminView === 'projects' && (
              <section className="project-manager-section">
                <div className="project-manager-header">
                  <div>
                    <p className="admin-eyebrow">Projects manager</p>
                    <h2>Create, edit, and delete projects</h2>
                    <p>Anything you save here updates the public projects list and the projects count card.</p>
                  </div>
                  <button type="button" className="project-new-button" onClick={resetProjectForm}>
                    <FaPlus /> New project
                  </button>
                </div>

                <div className="project-manager-layout">
                  <aside className="project-list-panel">
                    <h3>Saved projects</h3>
                    <div className="project-list">
                      {projects.length === 0 ? (
                        <p className="admin-empty-state">No projects saved yet.</p>
                      ) : (
                        projects.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            className={`project-list-item ${String(selectedProjectId) === String(project.id) ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setProjectFeedback({ type: '', message: '' });
                            }}
                          >
                            <strong>{project.title}</strong>
                            <span>{project.category || 'Uncategorized'}</span>
                            <span>{project.slug}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </aside>

                  <section className="project-form-panel">
                    <form onSubmit={handleProjectSubmit}>
                      <div className="project-form-grid">
                        <label className="workflow-field">
                          <span>Title</span>
                          <input name="title" value={projectForm.title} onChange={handleProjectChange} required />
                        </label>
                        <label className="workflow-field">
                          <span>Slug</span>
                          <input name="slug" value={projectForm.slug} onChange={handleProjectChange} />
                        </label>
                        <label className="workflow-field">
                          <span>Category</span>
                          <input name="category" value={projectForm.category} onChange={handleProjectChange} />
                        </label>
                        <label className="workflow-field">
                          <span>Image upload</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                            onChange={handleProjectImageChange}
                          />
                          <small className="project-field-help">
                            Upload JPG, PNG, WEBP, or GIF up to 4MB.
                            {projectImageName ? ` Selected: ${projectImageName}.` : ' '}
                            This uploaded image is the one that will appear on the homepage section
                            `Proof that the work goes beyond a landing page` when the project is marked as featured.
                          </small>
                        </label>
                        <label className="workflow-field project-checkbox-field">
                          <span>Featured project</span>
                          <input
                            type="checkbox"
                            name="featured"
                            checked={projectForm.featured}
                            onChange={handleProjectChange}
                          />
                        </label>
                        <label className="workflow-field">
                          <span>Tech stack</span>
                          <input
                            name="tech_stack"
                            value={projectForm.tech_stack}
                            onChange={handleProjectChange}
                            placeholder="React, Node.js, PostgreSQL"
                          />
                        </label>
                        <label className="workflow-field project-field-full">
                          <span>Image preview</span>
                          <div className="project-image-preview-shell">
                            {projectForm.image_url ? (
                              <img
                                src={projectForm.image_url}
                                alt={projectForm.title || 'Project preview'}
                                className="project-image-preview"
                              />
                            ) : (
                              <p className="project-image-placeholder">
                                Uploaded project image will preview here and be used in the featured projects section on the homepage.
                              </p>
                            )}
                          </div>
                        </label>
                        <label className="workflow-field project-field-full">
                          <span>Short description</span>
                          <textarea
                            name="short_description"
                            rows="3"
                            value={projectForm.short_description}
                            onChange={handleProjectChange}
                          />
                        </label>
                        <label className="workflow-field project-field-full">
                          <span>Description</span>
                          <textarea
                            name="description"
                            rows="4"
                            value={projectForm.description}
                            onChange={handleProjectChange}
                            required
                          />
                        </label>
                        <label className="workflow-field project-field-full">
                          <span>Challenge</span>
                          <textarea
                            name="challenge"
                            rows="3"
                            value={projectForm.challenge}
                            onChange={handleProjectChange}
                          />
                        </label>
                        <label className="workflow-field project-field-full">
                          <span>Solution</span>
                          <textarea
                            name="solution"
                            rows="3"
                            value={projectForm.solution}
                            onChange={handleProjectChange}
                          />
                        </label>
                        <label className="workflow-field project-field-full">
                          <span>Impact</span>
                          <textarea
                            name="impact"
                            rows="3"
                            value={projectForm.impact}
                            onChange={handleProjectChange}
                          />
                        </label>
                        <label className="workflow-field">
                          <span>Live demo URL</span>
                          <input name="live_demo" value={projectForm.live_demo} onChange={handleProjectChange} />
                        </label>
                        <label className="workflow-field">
                          <span>GitHub URL</span>
                          <input name="github_link" value={projectForm.github_link} onChange={handleProjectChange} />
                        </label>
                      </div>

                      {projectFeedback.message && (
                        <div className={`workflow-feedback ${projectFeedback.type}`}>{projectFeedback.message}</div>
                      )}

                      <div className="project-form-actions">
                        <button type="submit" className="workflow-save-button" disabled={projectSaving}>
                          <FaCheckCircle /> {projectSaving ? 'Saving project...' : selectedProject ? 'Update project' : 'Create project'}
                        </button>
                        {selectedProject && (
                          <button
                            type="button"
                            className="project-delete-button"
                            onClick={handleDeleteProject}
                            disabled={projectSaving}
                          >
                            <FaTrash /> Delete project
                          </button>
                        )}
                      </div>
                    </form>
                  </section>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .admin-workspace-page {
          min-height: 100vh;
          padding-top: 88px;
          background:
            radial-gradient(circle at top left, rgba(190, 230, 255, 0.24), transparent 28%),
            linear-gradient(180deg, #f6faff, #edf4fb);
          color: #21314c;
        }
        .admin-dashboard-layout {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          min-height: calc(100vh - 88px);
        }
        .admin-app-sidebar {
          position: sticky;
          top: 88px;
          height: calc(100vh - 88px);
          background: linear-gradient(180deg, #2b3246, #293146 42%, #242c3d);
          color: #dce6f6;
          padding: 1.1rem 1rem;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }
        .admin-app-brand {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding-bottom: 1.15rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .admin-brand-mark {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #4d7dff, #79a7ff);
          color: #fff;
          font-weight: 800;
        }
        .admin-app-brand strong {
          display: block;
          color: #fff;
        }
        .admin-app-brand span {
          display: block;
          margin-top: 0.2rem;
          color: rgba(220, 230, 246, 0.74);
          font-size: 0.9rem;
        }
        .admin-app-menu-label {
          margin: 1.35rem 0 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.76rem;
          color: rgba(220, 230, 246, 0.45);
        }
        .admin-app-menu-item {
          width: 100%;
          border: none;
          background: transparent;
          color: #dce6f6;
          padding: 0.9rem 0.8rem;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          text-align: left;
          margin-bottom: 0.35rem;
        }
        .admin-app-menu-item:hover,
        .admin-app-menu-item.active {
          background: rgba(255, 255, 255, 0.09);
          color: #fff;
        }
        .admin-app-menu-main,
        .admin-app-menu-meta {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
        }
        .admin-app-menu-main {
          font-weight: 600;
        }
        .admin-app-menu-meta strong {
          color: #9bb8ff;
        }
        .admin-main-panel {
          min-width: 0;
        }
        .admin-workspace-header {
          padding: 3.5rem 2rem 1rem;
        }
        .admin-eyebrow {
          margin: 0 0 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.78rem;
          color: #5d7490;
        }
        .admin-workspace-header h1 {
          margin: 0 0 0.8rem;
          font-size: clamp(2rem, 3vw, 2.8rem);
        }
        .admin-workspace-header p {
          max-width: 720px;
          color: #60728b;
        }
        .admin-workspace-shell {
          padding: 1rem 2rem 4rem;
        }
        .admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .admin-stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.35rem;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(130, 165, 205, 0.2);
          box-shadow: 0 18px 46px rgba(52, 82, 118, 0.08);
        }
        .admin-stat-icon {
          width: 46px;
          height: 46px;
          padding: 0.85rem;
          border-radius: 14px;
          background: linear-gradient(135deg, #d9ebff, #eef6ff);
          color: #3d6591;
        }
        .admin-stat-card h3 {
          margin: 0;
          font-size: 1.75rem;
        }
        .admin-stat-card p {
          margin: 0.2rem 0 0;
          color: #62758e;
        }
        .admin-notification-panel {
          margin-bottom: 1.4rem;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(130, 165, 205, 0.2);
          border-radius: 28px;
          box-shadow: 0 22px 52px rgba(52, 82, 118, 0.09);
          padding: 1.3rem 1.4rem;
        }
        .admin-notification-header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: start;
        }
        .admin-notification-title {
          display: flex;
          gap: 1rem;
          align-items: start;
        }
        .admin-notification-icon-wrap {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #d9ebff, #eef6ff);
          color: #315785;
          flex-shrink: 0;
        }
        .admin-notification-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 24px;
          height: 24px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 0.35rem;
          background: #d84848;
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .admin-notification-title h2 {
          margin: 0 0 0.35rem;
        }
        .admin-notification-title p {
          margin: 0;
          color: #62758e;
          line-height: 1.6;
        }
        .admin-mark-read-button {
          border: none;
          background: rgba(217, 235, 255, 0.9);
          color: #315785;
          border-radius: 999px;
          padding: 0.85rem 1rem;
          font-weight: 600;
          cursor: pointer;
        }
        .admin-notification-list {
          margin-top: 1rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.85rem;
        }
        .admin-notification-item {
          border-radius: 18px;
          background: linear-gradient(180deg, #f9fbff, #edf4fc);
          border: 1px solid rgba(130, 165, 205, 0.18);
          padding: 0.95rem 1rem;
        }
        .admin-notification-item strong {
          display: block;
          margin-bottom: 0.35rem;
          color: #243550;
          word-break: break-word;
        }
        .admin-notification-item span {
          color: #62758e;
          font-size: 0.92rem;
        }
        .admin-workspace-layout {
          display: grid;
          grid-template-columns: minmax(360px, 430px) minmax(0, 1fr);
          gap: 1.4rem;
          align-items: start;
        }
        .admin-request-sidebar,
        .admin-request-detail,
        .project-manager-section {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(130, 165, 205, 0.2);
          border-radius: 28px;
          box-shadow: 0 22px 52px rgba(52, 82, 118, 0.09);
          padding: 1.4rem;
        }
        .sidebar-heading h2,
        .detail-heading h2 {
          margin: 0 0 0.55rem;
        }
        .sidebar-heading p,
        .workflow-heading p {
          margin: 0;
          color: #62758e;
        }
        .admin-request-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          margin-top: 1.25rem;
          max-height: 980px;
          overflow: auto;
        }
        .admin-request-list-item {
          border: 1px solid rgba(130, 165, 205, 0.16);
          border-radius: 20px;
          background: linear-gradient(180deg, #f9fbff, #edf4fc);
          transition: transform 0.2s ease, border-color 0.2s ease;
          overflow: hidden;
        }
        .admin-request-list-item:hover,
        .admin-request-list-item.active {
          transform: translateY(-1px);
          border-color: rgba(83, 124, 174, 0.38);
          box-shadow: 0 12px 28px rgba(55, 88, 128, 0.12);
        }
        .admin-request-card-trigger {
          width: 100%;
          text-align: left;
          border: none;
          background: transparent;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          color: #344a65;
          cursor: pointer;
        }
        .admin-request-list-top {
          display: flex;
          justify-content: space-between;
          gap: 0.8rem;
          align-items: start;
        }
        .admin-request-list-top strong {
          color: #243550;
          line-height: 1.45;
          word-break: break-word;
        }
        .admin-request-card-trigger span {
          line-height: 1.5;
          word-break: break-word;
        }
        .admin-status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.38rem 0.78rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .admin-status-badge.received {
          background: rgba(255, 202, 89, 0.2);
          color: #8a6413;
        }
        .admin-status-badge.in_progress {
          background: rgba(101, 154, 255, 0.16);
          color: #2f5fad;
        }
        .admin-status-badge.completed {
          background: rgba(89, 191, 125, 0.16);
          color: #1c7040;
        }
        .admin-status-badge.rejected {
          background: rgba(225, 94, 94, 0.15);
          color: #963939;
        }
        .remaining-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          width: fit-content;
          margin-top: 0.35rem;
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .remaining-chip.positive {
          background: rgba(89, 191, 125, 0.16);
          color: #1c7040;
        }
        .remaining-chip.warning {
          background: rgba(255, 202, 89, 0.18);
          color: #8a6413;
        }
        .remaining-chip.danger {
          background: rgba(225, 94, 94, 0.15);
          color: #963939;
        }
        .remaining-chip.neutral {
          background: rgba(109, 130, 156, 0.12);
          color: #536a84;
        }
        .admin-request-card-body {
          border-top: 1px solid rgba(130, 165, 205, 0.18);
          padding: 0 1rem 1rem;
        }
        .admin-request-card-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.9rem;
          margin-top: 1rem;
        }
        .admin-request-card-grid strong,
        .admin-request-card-message strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #243550;
        }
        .admin-request-card-grid p,
        .admin-request-card-message p {
          margin: 0;
          color: #5f728a;
          line-height: 1.55;
          word-break: break-word;
        }
        .admin-request-card-message {
          margin-top: 1rem;
          padding: 0.9rem 1rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(130, 165, 205, 0.18);
        }
        .detail-heading {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: start;
        }
        .admin-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin: 1.35rem 0;
        }
        .admin-detail-card,
        .admin-message-card,
        .workflow-panel,
        .project-list-panel,
        .project-form-panel {
          border-radius: 22px;
          background: linear-gradient(180deg, #f9fbff, #edf4fc);
          border: 1px solid rgba(130, 165, 205, 0.18);
          padding: 1rem 1.1rem;
        }
        .admin-detail-card strong,
        .admin-message-card strong {
          display: block;
          margin-bottom: 0.35rem;
        }
        .admin-detail-card p,
        .admin-message-card p {
          margin: 0;
          color: #5f728a;
          line-height: 1.6;
          word-break: break-word;
        }
        .admin-message-card {
          margin-bottom: 1rem;
        }
        .admin-message-card a {
          display: inline-block;
          margin-top: 0.65rem;
          color: #2e60a8;
          font-weight: 600;
          text-decoration: none;
        }
        .workflow-heading h3 {
          margin: 0 0 0.35rem;
        }
        .workflow-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .workflow-field {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          margin-top: 1rem;
        }
        .workflow-field span {
          font-weight: 600;
          color: #30435e;
        }
        .workflow-field input,
        .workflow-field select,
        .workflow-field textarea {
          width: 100%;
          border: 1px solid rgba(128, 164, 204, 0.28);
          border-radius: 16px;
          background: #fff;
          padding: 0.9rem 1rem;
          color: #20304a;
        }
        .workflow-field input:focus,
        .workflow-field select:focus,
        .workflow-field textarea:focus {
          outline: none;
          border-color: #71a5da;
          box-shadow: 0 0 0 4px rgba(113, 165, 218, 0.12);
        }
        .workflow-feedback {
          margin-top: 1rem;
          padding: 0.9rem 1rem;
          border-radius: 16px;
        }
        .workflow-feedback.success {
          background: rgba(228, 246, 233, 0.92);
          color: #236243;
        }
        .workflow-feedback.error {
          background: rgba(251, 232, 232, 0.92);
          color: #8d3f3f;
        }
        .workflow-save-button,
        .project-new-button,
        .project-delete-button {
          border: none;
          border-radius: 999px;
          padding: 0.95rem 1.2rem;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-weight: 600;
          cursor: pointer;
        }
        .workflow-save-button {
          margin-top: 1rem;
          background: linear-gradient(135deg, #7bb1ea, #5c82d6);
          color: #fff;
        }
        .workflow-save-button:disabled,
        .project-delete-button:disabled,
        .project-new-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .admin-empty-state,
        .admin-empty-detail {
          margin: 0;
          padding: 2rem 1rem;
          text-align: center;
          color: #61758f;
        }
        .project-manager-header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: start;
        }
        .project-manager-header h2 {
          margin: 0 0 0.45rem;
        }
        .project-manager-header p:last-child {
          margin: 0;
          color: #62758e;
        }
        .project-new-button {
          background: linear-gradient(135deg, #d9ebff, #eef6ff);
          color: #30517a;
        }
        .project-manager-layout {
          margin-top: 1.25rem;
          display: grid;
          grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
          gap: 1.25rem;
        }
        .project-list-panel h3 {
          margin: 0 0 1rem;
        }
        .project-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          max-height: 720px;
          overflow: auto;
        }
        .project-list-item {
          border: 1px solid rgba(130, 165, 205, 0.16);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.86);
          padding: 0.95rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          text-align: left;
          color: #344a65;
          cursor: pointer;
        }
        .project-list-item.active {
          border-color: rgba(83, 124, 174, 0.38);
          box-shadow: 0 12px 28px rgba(55, 88, 128, 0.12);
        }
        .project-list-item strong,
        .project-list-item span {
          word-break: break-word;
        }
        .project-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }
        .project-field-full {
          grid-column: 1 / -1;
        }
        .project-checkbox-field {
          justify-content: end;
        }
        .project-checkbox-field input {
          width: 22px;
          height: 22px;
          align-self: start;
        }
        .project-field-help {
          color: #62758e;
          line-height: 1.5;
        }
        .project-image-preview-shell {
          min-height: 240px;
          border-radius: 18px;
          border: 1px solid rgba(130, 165, 205, 0.18);
          background: linear-gradient(180deg, #f9fbff, #edf4fc);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 0.8rem;
        }
        .project-image-preview {
          width: 100%;
          max-height: 340px;
          object-fit: contain;
          border-radius: 14px;
        }
        .project-image-placeholder {
          margin: 0;
          color: #62758e;
          text-align: center;
          line-height: 1.6;
        }
        .project-form-actions {
          display: flex;
          gap: 0.9rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        .project-delete-button {
          background: rgba(225, 94, 94, 0.12);
          color: #963939;
        }
        @media (max-width: 1080px) {
          .admin-dashboard-layout,
          .admin-workspace-layout,
          .project-manager-layout {
            grid-template-columns: 1fr;
          }
          .admin-app-sidebar {
            position: static;
            height: auto;
          }
        }
        @media (max-width: 720px) {
          .admin-workspace-header,
          .admin-workspace-shell {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .project-form-grid,
          .admin-request-card-grid,
          .workflow-grid,
          .admin-detail-grid,
          .admin-notification-list {
            grid-template-columns: 1fr;
          }
          .detail-heading,
          .admin-notification-header,
          .admin-notification-title,
          .project-manager-header,
          .admin-request-list-top {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
