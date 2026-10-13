import axios from 'axios';
import { toast } from 'react-toastify';
import { getActions } from '../store/auth-store';
import { getStoredToken, getTokenUserId, logoutAuth } from '../utils/auth-util';

const backend = import.meta.env.VITE_BACKEND_URL;

const AxiosERPInstance = axios.create({
  baseURL: backend,
});

const tokenFromHeader = (header: unknown) =>
  typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : undefined;

AxiosERPInstance.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

AxiosERPInstance.interceptors.response.use(
  (response) => {
    const refreshedToken = response.headers['x-refreshed-token'];
    const sentToken = tokenFromHeader(response.config.headers?.Authorization);
    const currentToken = getStoredToken();
    // Only accept a renewal of the session that is still current. A request
    // sent before someone else logged in on this device would otherwise
    // overwrite their token with the previous user's.
    if (
      refreshedToken &&
      sentToken &&
      sentToken === currentToken &&
      getTokenUserId(refreshedToken) === getTokenUserId(currentToken)
    ) {
      getActions().setAccessToken(refreshedToken);
      localStorage.setItem('access_token', refreshedToken);
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      // A 401 for a token that has already been replaced (a newer login, or
      // a request from a stale tab) must not log out the current user.
      const sentToken = tokenFromHeader(error.config?.headers?.Authorization);
      if (!sentToken || sentToken === getStoredToken()) {
        logoutAuth();
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);

export { AxiosERPInstance };
