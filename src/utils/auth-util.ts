import { getActions } from '../store/auth-store';

const { setAccessToken, setUserInformation } = getActions();

const AUTH_KEYS = ['access_token', 'user_first_name', 'user_last_name', 'user_role'];

const decodeJwtPayload = (token: string): { id?: number; exp?: number } | null => {
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

// localStorage is the single source of truth for the session. It is shared by
// every tab (and the home-screen shortcut) on the device, so reading it on
// every request means a tab left open in the background can never keep
// sending an older user's token after someone else logs in.
const getStoredToken = () => localStorage.getItem('access_token') || undefined;

const getTokenUserId = (token: string | undefined | null) => (token ? decodeJwtPayload(token)?.id : undefined);

// Only checks that a well-formed token exists. Expiry is left to the backend
// (a 401 logs the user out): comparing `exp` against the device clock kicked
// people straight back to /login on tablets whose date was set wrong.
const isLoggedIn = () => {
  const token = getStoredToken();
  return !!token && !!decodeJwtPayload(token);
};

// Copy whatever is in localStorage into the in-memory store. Called on start
// up and whenever another tab changes the session.
const syncAuthFromStorage = () => {
  const token = getStoredToken();
  setAccessToken(token);
  setUserInformation(
    token
      ? {
          firstName: localStorage.getItem('user_first_name') || undefined,
          lastName: localStorage.getItem('user_last_name') || undefined,
          role: localStorage.getItem('user_role') || undefined,
        }
      : { firstName: undefined, lastName: undefined, role: undefined },
  );
};

const logoutAuth = () => {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
  setAccessToken(undefined);
  setUserInformation({ firstName: undefined, lastName: undefined, role: undefined });
};

export { isLoggedIn, logoutAuth, isTokenValid, getStoredToken, getTokenUserId, syncAuthFromStorage };
