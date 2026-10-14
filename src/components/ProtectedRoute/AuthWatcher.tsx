import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyAuth } from '../../services/auth.service';

const AuthWatcher = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only navigates. The session itself is cleared in exactly one place, the
    // axios 401 handler, which first checks the rejected token is still the
    // current one. Clearing it here too would wipe a newer login (another tab
    // reacting to a session change fires this event as well).
    const handleUnauthorized = () => {
      navigate('/login', { replace: true });
    };

    // The result is deliberately ignored: a real 401 is handled by the axios
    // interceptor, while a network error or 5xx (no signal, Render waking up
    // or redeploying) says nothing about the session and must not log out.
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await verifyAuth();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    const intervalId = setInterval(checkAuth, 1000 * 60 * 20); // 20 minutes

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      clearInterval(intervalId);
    };
  }, [navigate]);

  return null;
};

export default AuthWatcher;
