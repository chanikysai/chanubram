import React from 'react';
import './App.css'; // Assuming basic CSS
import './styles.css'; // Import shared styles
import { Routes, Route, Link, useNavigate } from 'react-router-dom'; // Import necessary components
import VendorRegistrationPage from './pages/VendorRegistrationPage'; // Import the vendor registration page
import VendorDashboardPage from './pages/VendorDashboardPage'; // Import the vendor dashboard page
import VendorPayoutsPage from './pages/VendorPayoutsPage'; // Import the Vendor Payouts Page

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
        {/* Define routes here */}
        <Routes>
          <Route path="/" element={
            <div>
              <h2>Welcome to Chanubram</h2>
              <p>Your platform for connecting with vendors and products.</p>
              <button onClick={handleRegisterClick}>Become a Vendor</button>
              {/* Add more content for the home page */}
            </div>
          } />
          <Route path="/register-vendor" element={<VendorRegistrationPage />} />
          <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
          {/* Add the route for Vendor Payouts Page */}
          <Route path="/admin/payouts" element={<VendorPayoutsPage />} />
          {/* Add other routes like /login, /register, /products, etc. */}
        </Routes>
      </main>

      <footer>
        <p>© 2026 Chanubram. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
