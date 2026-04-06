import axios from 'axios';

const backendHostname = process.env.REACT_APP_BACKEND_HOSTNAME?.trim();

const API_URL = process.env.REACT_APP_API_URL?.trim()
  || (backendHostname ? `https://${backendHostname}/api` : '')
  || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
