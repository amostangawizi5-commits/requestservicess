const { randomUUID } = require('crypto');
const { pool } = require('../CONFIG/db');
const { inferDueDate, normalizeRequestStatus, sanitizeDocument } = require('../UTILS/requestWorkflow');

const mapRequestRow = (row) => ({
  id: row.id,
  user_id: row.user_id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  company: row.company,
  serviceType: row.service_type,
  budget: row.budget,
  timeline: row.timeline,
  message: row.message,
  status: normalizeRequestStatus(row.status),
  progressNote: row.progress_note,
  dueDate: row.due_date,
  updatedAt: row.updated_at,
  document: row.document_name
    ? {
        name: row.document_name,
        type: row.document_type || 'application/octet-stream',
        size: row.document_size || 0,
        url: row.document_data
          ? `data:${row.document_type || 'application/octet-stream'};base64,${row.document_data}`
          : '',
      }
    : null,
  created_at: row.created_at,
});

const createRequest = async (payload, user = null) => {
  const requestId = randomUUID();
  const dueDate = payload.dueDate ? new Date(payload.dueDate) : inferDueDate(payload.timeline);
  const document = sanitizeDocument(payload.document);
  const { rows } = await pool.query(
    `
      INSERT INTO service_requests (
        id,
        user_id,
        name,
        email,
        phone,
        company,
        service_type,
        budget,
        timeline,
        message,
        status,
        document_name,
        document_type,
        document_data,
        document_size,
        progress_note,
        due_date,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'received', $11, $12, $13, $14, '', $15, NOW())
      RETURNING *
    `,
    [
      requestId,
      user?.id || null,
      payload.name.trim(),
      payload.email.trim().toLowerCase(),
      payload.phone.trim(),
      (payload.company || '').trim(),
      payload.serviceType,
      (payload.budget || '').trim(),
      (payload.timeline || '').trim(),
      payload.message.trim(),
      document.name,
      document.type,
      document.content,
      document.size,
      Number.isNaN(dueDate.getTime()) ? inferDueDate(payload.timeline) : dueDate,
    ]
  );

  return mapRequestRow(rows[0]);
};

const getRequests = async ({ userId = null, limit = null } = {}) => {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }

  let query = 'SELECT * FROM service_requests';

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY updated_at DESC, created_at DESC';

  if (limit) {
    params.push(limit);
    query += ` LIMIT $${params.length}`;
  }

  const { rows } = await pool.query(query, params);
  return rows.map(mapRequestRow);
};

const getAllRequests = async () => getRequests();

const updateRequestWorkflow = async (id, updates = {}) => {
  const normalizedStatus = updates.status ? normalizeRequestStatus(updates.status) : null;
  const dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
  const { rows } = await pool.query(
    `
      UPDATE service_requests
      SET status = COALESCE($2, status),
          progress_note = COALESCE($3, progress_note),
          due_date = COALESCE($4, due_date),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      normalizedStatus,
      typeof updates.progressNote === 'string' ? updates.progressNote.trim() : null,
      dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
    ]
  );

  return rows[0] ? mapRequestRow(rows[0]) : null;
};

const countRequests = async (userId = null) => {
  const query = userId
    ? 'SELECT COUNT(*)::int AS count FROM service_requests WHERE user_id = $1'
    : 'SELECT COUNT(*)::int AS count FROM service_requests';
  const params = userId ? [userId] : [];
  const { rows } = await pool.query(query, params);

  return rows[0]?.count || 0;
};

const getRecentRequests = async ({ userId = null, limit = 5 } = {}) => {
  return getRequests({ userId, limit });
};

module.exports = {
  createRequest,
  getRequests,
  getAllRequests,
  updateRequestWorkflow,
  countRequests,
  getRecentRequests,
};
