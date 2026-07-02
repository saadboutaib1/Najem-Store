import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { StoreDataProvider } from './context/StoreDataContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { registerServiceWorker } from './features/pwa/registerServiceWorker.js';
import './styles/global.css';
import './styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <ToastProvider>
        <StoreDataProvider>
          <CartProvider>
            <BrowserRouter>
              <AdminAuthProvider>
                <App />
              </AdminAuthProvider>
            </BrowserRouter>
          </CartProvider>
        </StoreDataProvider>
      </ToastProvider>
    </LanguageProvider>
  </React.StrictMode>
);

registerServiceWorker();
