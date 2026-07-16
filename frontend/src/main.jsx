import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { InventoryProvider } from './context/InventoryContext.jsx';
import { DonationProvider } from './context/DonationContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <InventoryProvider>
            <DonationProvider>
              <App />
            </DonationProvider>
          </InventoryProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
