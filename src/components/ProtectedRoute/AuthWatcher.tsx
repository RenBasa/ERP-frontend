import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyAuth } from '../../services/auth.service';
import { logoutAuth } from '../../utils/auth-util';

const AuthWatcher = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      logoutAuth();
      navigate('/login', { replace: true });
    };

    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const ok = await verifyAuth();
      if (!ok) {
        handleUnauthorized();
      }
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
