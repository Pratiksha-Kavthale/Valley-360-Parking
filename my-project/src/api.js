import axios from 'axios';

const API_BASE_URL = "http://localhost:8080"
//import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const PUBLIC_ENDPOINTS = [
  '/User/Login',
  '/Admin/Login',
  '/Admin/Register',
  '/admin/login',
  '/User/Register',
  '/api/users',
  '/reviews/parking',
  '/reviews/average',
  '/contact/send',
];

const getRequestPath = (requestUrl = '') => {
  if (!requestUrl) {
    return '';
  }

  try {
    return new URL(requestUrl, API_BASE_URL).pathname;
  } catch {
    return requestUrl.toString();
  }
};

api.interceptors.request.use(
  (config) => {
    const requestPath = getRequestPath((config.url || '').toString());
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) => requestPath.startsWith(endpoint));
    const token = sessionStorage.getItem('jwtToken') || localStorage.getItem('token');

    if (!sessionStorage.getItem('jwtToken') && token) {
      sessionStorage.setItem('jwtToken', token);
    }

    if (!isPublicEndpoint && !token) {
      return Promise.reject(new Error(`User not authenticated for ${requestPath || 'request'}`));
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestPath = getRequestPath(error?.config?.url);
    
    // Check if this is a login endpoint - don't redirect on login failures
    const isLoginEndpoint = PUBLIC_ENDPOINTS.some((endpoint) => 
      endpoint.toLowerCase().includes('login') && requestPath.toLowerCase().includes('login')
    );

    if (!error?.response) {
      console.error(`Network error while calling ${requestPath || API_BASE_URL}. Check backend URL, CORS, and server logs.`, error.message);
      return Promise.reject(error);
    }

    if ((status === 401 || status === 403) && !isLoginEndpoint) {
      console.error(`Authentication error on ${requestPath || 'request'}.`, error?.response?.data || error.message);
      sessionStorage.clear();
      localStorage.removeItem('token');
      if (window.location.pathname !== '/Login') {
        window.location.href = '/Login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
