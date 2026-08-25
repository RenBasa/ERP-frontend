import axios from 'axios';
import { toast } from 'react-toastify';
import { getAccessToken, getActions } from '../store/auth-store';
import { logoutAuth } from '../utils/auth-util';

const backend = import.meta.env.VITE_BACKEND_URL;

const AxiosERPInstance = axios.create({
  baseURL: backend,
});

AxiosERPInstance.interceptors.request.use((config) => {
  const token = getAccessToken() || localStorage.getItem('access_token') || undefined;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

AxiosERPInstance.interceptors.response.use(
  (response) => {
    const refreshedToken = response.headers['x-refreshed-token'];
    if (refreshedToken) {
      getActions().setAccessToken(refreshedToken);
      localStorage.setItem('access_token', refreshedToken);
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      logoutAuth();
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export { AxiosERPInstance };
