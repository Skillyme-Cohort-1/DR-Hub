import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './app/pages/HomePage';
import { LoginPage } from './app/pages/LoginPage';
import { RegisterPage } from './app/pages/RegisterPage';
import { BookingPage } from './app/pages/BookingPage';
import { ClientDashboard } from './app/pages/ClientDashboardPage';

// Simple protected route
function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  return isLoggedIn ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking" element={<BookingPage />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ClientDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}