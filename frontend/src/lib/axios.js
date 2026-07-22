import axios from 'axios';

const api = axios.create({
  baseURL:'http://localhost:8500/api/v1',
  withCredentials: true,
});

// ==========================================
// Request interceptor to attach access token
// from localStorage as Bearer token
// Backend accepts both cookies AND
// Authorization: Bearer <token> headers
// This is needed because cookies with
// secure:true won't work over HTTP
// ==========================================
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('saveplate_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
      } catch {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// Response interceptor to handle 401 errors
// and automatically refresh the access token
// ==========================================
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried and not a refresh/login request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/users/login') &&
      !originalRequest.url.includes('/users/refreshToken') &&
      !originalRequest.url.includes('/users/register')
    ) {
      // If logout endpoint also fails with 401, just clean up locally
      if (originalRequest.url.includes('/users/logout')) {
        localStorage.removeItem('saveplate_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      const storedUser = localStorage.getItem('saveplate_user');
      if (!storedUser) {
        return Promise.reject(error);
      }

      let parsedUser = null;
      try {
        parsedUser = JSON.parse(storedUser);
      } catch {
        localStorage.removeItem('saveplate_user');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          'http://localhost:8500/api/v1/users/refreshToken',
          parsedUser.refreshToken
            ? { refreshToken: parsedUser.refreshToken }
            : {},
          { withCredentials: true }
        );

        const newAccessToken = data.data?.accessToken;
        const newRefreshToken = data.data?.refreshToken;

        if (newAccessToken) {
          parsedUser.accessToken = newAccessToken;
          if (newRefreshToken) {
            parsedUser.refreshToken = newRefreshToken;
          }
          localStorage.setItem('saveplate_user', JSON.stringify(parsedUser));

          // Update the failed request's authorization header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        }

        // No new token — force logout
        processQueue(error);
        localStorage.removeItem('saveplate_user');
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem('saveplate_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
