import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles.css'; /* Import shared styles */
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // Assuming react-router-dom is used

// Mocking fetch for service tests, if needed globally
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn();
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter> {/* Wrap App with BrowserRouter */}
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

