const raw = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const API_BASE_URL = raw.replace(/\/$/, '');
export const API_ROOT = `${API_BASE_URL}/api`;
