const DEFAULT_TURNAROUND_DAYS = 7;
const MAX_DOCUMENT_SIZE_BYTES = 3 * 1024 * 1024;
const ALLOWED_REQUEST_STATUSES = ['received', 'in_progress', 'completed', 'rejected'];

const normalizeRequestStatus = (status) => {
  if (status === 'pending') {
    return 'received';
  }

  if (status === 'approved') {
    return 'completed';
  }

  if (ALLOWED_REQUEST_STATUSES.includes(status)) {
    return status;
  }

  return 'received';
};

const inferDueDate = (timeline, baseDate = new Date()) => {
  const fallback = new Date(baseDate);
  fallback.setDate(fallback.getDate() + DEFAULT_TURNAROUND_DAYS);

  if (!timeline || typeof timeline !== 'string') {
    return fallback;
  }

  const match = timeline.trim().match(/(\d+)\s*(hour|hours|day|days|week|weeks|month|months)/i);

  if (!match) {
    return fallback;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const dueDate = new Date(baseDate);

  if (unit.startsWith('hour')) {
    dueDate.setHours(dueDate.getHours() + amount);
    return dueDate;
  }

  if (unit.startsWith('day')) {
    dueDate.setDate(dueDate.getDate() + amount);
    return dueDate;
  }

  if (unit.startsWith('week')) {
    dueDate.setDate(dueDate.getDate() + amount * 7);
    return dueDate;
  }

  dueDate.setMonth(dueDate.getMonth() + amount);
  return dueDate;
};

const sanitizeDocument = (document) => {
  if (!document || typeof document !== 'object') {
    return {
      name: '',
      type: '',
      content: '',
      size: 0,
    };
  }

  const name = typeof document.name === 'string' ? document.name.trim() : '';
  const type = typeof document.type === 'string' ? document.type.trim() : '';
  const content = typeof document.content === 'string' ? document.content.trim() : '';
  const size = Number.isFinite(Number(document.size)) ? Number(document.size) : 0;

  if (!name || !content) {
    return {
      name: '',
      type: '',
      content: '',
      size: 0,
    };
  }

  if (size > MAX_DOCUMENT_SIZE_BYTES) {
    const error = new Error('Document must be 3MB or smaller');
    error.statusCode = 400;
    throw error;
  }

  return {
    name,
    type,
    content,
    size,
  };
};

module.exports = {
  ALLOWED_REQUEST_STATUSES,
  DEFAULT_TURNAROUND_DAYS,
  inferDueDate,
  normalizeRequestStatus,
  sanitizeDocument,
};
