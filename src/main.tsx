import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App'; // Assuming App.tsx is the main component containing headers/footers etc.
import VendorDashboardPage from './pages/VendorDashboardPage'; // Import VendorDashboardPage
import VendorRegistrationPage from './pages/VendorRegistrationPage'; // Import the new registration page

// Mocking fetch for service tests, if needed globally
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn();
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<App />} /> {/* Assuming App is the root/homepage */}
          <Route path="/register-vendor" element={<VendorRegistrationPage />} />

          {/* Protected/specific routes */}
          <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />

          {/* Add other routes here */}
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}
