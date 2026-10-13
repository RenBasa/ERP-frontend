import axios, { isAxiosError } from 'axios';
import { toast } from 'react-toastify';
import { AxiosERPInstance } from '../Lib/axiosInstance.config';

const backend = import.meta.env.VITE_BACKEND_URL;
// TODO: Move to simple ts file, change async func to react query and add jwtAuthCheck func
export const login = async (username: string, password: string): Promise<loginResponse | void> => {
  try {
    const response = await axios.post(`${backend}/auth/login`, { username: username, password: password });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      toast.error('Usuario o contraseña incorrectos.');
    } else {
      // No response or a 5xx: the server is down or still waking up, not a
      // bad password.
      toast.error('No se pudo conectar con el servidor. Intenta de nuevo en un momento.');
    }
  }
};

export const verifyAuth = async (): Promise<boolean> => {
  try {
    const response = await AxiosERPInstance.get(`/auth`);
    return response.status === 200 || response.status === 201 || response.status === 204;
  } catch (error) {
    return false;
  }
};
