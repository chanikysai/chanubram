import React, { Suspense, lazy } from 'react';
import './App.css'; // Assuming basic CSS
import './styles.css'; // Import shared styles
import { Routes, Route, Link, useNavigate } from 'react-router-dom'; // Import necessary components
// Import LoadingSpinner component
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load page components
const HomePage = lazy(() => import('./pages/HomePage'));
const VendorRegistrationPage = lazy(() => import('./pages/VendorRegistrationPage'));
const VendorDashboardPage = lazy(() => import('./pages/VendorDashboardPage'));
const VendorPayoutsPage = lazy(() => import('./pages/VendorPayoutsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage')); // Assuming a general registration page exists

function App() {
  const navigate = useNavigate();

  // Mock navigation for demonstration
  const handleRegisterClick = () => {
    navigate('/register-vendor');
  };

  // Example of checking auth state for conditional rendering (e.g., showing login vs dashboard)
  // In a real app, this would come from a context or state management
  const isLoggedIn = false; // Hardcoded for example
  // Assume isAdmin is also derived from auth state and is false for now
  const isAdmin = false; // Hardcoded for example

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chanubram</h1>
        <nav>
          <Link to="/" style={{ margin: '0 10px' }}>Home</Link>
          {!isLoggedIn && <Link to="/login" style={{ margin: '0 10px' }}>Login</Link>}
          {!isLoggedIn && <Link to="/register" style={{ margin: '0 10px' }}>Register</Link>}
          {isLoggedIn && <Link to="/vendor/dashboard" style={{ margin: '0 10px' }}>Vendor Dashboard</Link>}
          {/* Add link to Admin Payouts page, conditionally if user is admin */}
          {isAdmin && <Link to="/admin/payouts" style={{ margin: '0 10px' }}>Admin Payouts</Link>}
        </nav>
      </header>

      <main style={{ padding: '20px' }}>
        {/* Define routes here, wrapped in Suspense */}
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<LoadingSpinner />}>
              <HomePage />
            </Suspense>
          } />
          <Route path="/register-vendor" element={
            <Suspense fallback={<LoadingSpinner />}>
              <VendorRegistrationPage />
            </Suspense>
          } />
          <Route path="/vendor/dashboard" element={
            <Suspense fallback={<LoadingSpinner />}>
              <VendorDashboardPage />
            </Suspense>
          } />
          <Route path="/admin/payouts" element={
            <Suspense fallback={<LoadingSpinner />}>
              <VendorPayoutsPage />
            </Suspense>
          } />
          {/* Add other routes for login and general registration */}
          <Route path="/login" element={
            <Suspense fallback={<LoadingSpinner />}>
              <LoginPage />
            </Suspense>
          } />
          <Route path="/register" element={
            <Suspense fallback={<LoadingSpinner />}>
              <RegisterPage />
            </Suspense>
          } />
        </Routes>
      </main>

      <footer>
        <p>© 2026 Chanubram. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
