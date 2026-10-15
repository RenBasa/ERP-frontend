import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App/App';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { syncAuthFromStorage } from './utils/auth-util';

syncAuthFromStorage();
// Keep every tab on the device on the same session: when another tab logs
// in or out, this tab picks it up instead of carrying on as the old user.
window.addEventListener('storage', (event) => {
  if (event.key === null || event.key === 'access_token' || event.key.startsWith('user_')) {
    syncAuthFromStorage();
    if (!localStorage.getItem('access_token')) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
  }
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <ToastContainer
          position="bottom-left"
          autoClose={2000}
          hideProgressBar={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          rtl={false}
        />
        <QueryClientProvider client={queryClient}>
          {/* The rest of your application */}
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
