import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
// CONTEXT
import { AuthContextProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
// ROUTER
import { RouterProvider } from 'react-router-dom';
import router from './routes/index';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <ThemeProvider>
        <AuthContextProvider>
          <RouterProvider router={router} />
        </AuthContextProvider>
      </ThemeProvider>
    </NotificationProvider>
  </React.StrictMode>,
);
