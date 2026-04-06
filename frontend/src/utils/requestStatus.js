import { serviceOptions } from '../data/portfolioData';

const STATUS_META = {
  received: {
    label: 'Received',
    description: 'Your request has been received and is waiting for work to begin.',
  },
  in_progress: {
    label: 'In Progress',
    description: 'Work has started and the request is being handled now.',
  },
  completed: {
    label: 'Completed',
    description: 'This request has been completed.',
  },
  rejected: {
    label: 'Rejected',
    description: 'This request needs changes before it can continue.',
  },
};

export const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.received;

export const getServiceLabel = (serviceType) => {
  return serviceOptions.find((service) => service.id === serviceType)?.title || serviceType;
};

export const formatDateTime = (value) => {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return date.toLocaleString();
};

export const formatDateInputValue = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

export const getRemainingTime = (dueDate) => {
  if (!dueDate) {
    return {
      label: 'No deadline',
      tone: 'neutral',
    };
  }

  const end = new Date(dueDate);

  if (Number.isNaN(end.getTime())) {
    return {
      label: 'No deadline',
      tone: 'neutral',
    };
  }

  const diffMs = end.getTime() - Date.now();

  if (diffMs <= 0) {
    const overdueHours = Math.abs(diffMs) / (1000 * 60 * 60);

    if (overdueHours < 24) {
      return {
        label: `Overdue by ${Math.max(1, Math.round(overdueHours))}h`,
        tone: 'danger',
      };
    }

    return {
      label: `Overdue by ${Math.max(1, Math.round(overdueHours / 24))}d`,
      tone: 'danger',
    };
  }

  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return {
      label: `${Math.max(1, Math.round(diffHours))}h left`,
      tone: diffHours < 6 ? 'warning' : 'positive',
    };
  }

  const diffDays = diffHours / 24;

  return {
    label: `${Math.max(1, Math.round(diffDays))}d left`,
    tone: diffDays <= 2 ? 'warning' : 'positive',
  };
};
