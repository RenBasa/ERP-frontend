import { getAccessToken, getActions } from '../store/auth-store';

const { setAccessToken, setUserInformation } = getActions();

const decodeJwtPayload = (token: string): { exp?: number } | null => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const isTokenValid = (token: string | undefined | null): boolean => {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
};

const isLoggedIn = () => {
  const accessToken = getAccessToken() || localStorage.getItem('access_token');
  return isTokenValid(accessToken);
};

const logoutAuth = () => {
  setAccessToken(undefined);
  setUserInformation(undefined);
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_first_name');
  localStorage.removeItem('user_last_name');
  localStorage.removeItem('user_role');
};

export { isLoggedIn, logoutAuth, isTokenValid };
